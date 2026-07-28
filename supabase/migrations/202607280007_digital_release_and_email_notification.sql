-- Separate authoritative digital-letter release from email notification.
-- Existing deliver_email actions become release_letter actions. A successful
-- release transaction creates the email-only send_notification action.

alter table public.letters
  add column if not exists available_at timestamptz;

alter table public.scheduled_actions
  drop constraint if exists scheduled_actions_action_type_check;

update public.scheduled_actions
set
  action_type = 'release_letter',
  idempotency_key = 'release_letter:' || letter_id::text
where action_type = 'deliver_email';

alter table public.scheduled_actions
  add constraint scheduled_actions_action_type_check
  check (action_type in (
    'release_letter',
    'send_notification',
    'send_address_confirmation',
    'create_print_order'
  ));

comment on column public.letters.available_at is
  'Authoritative instant when a sealed digital letter became revealable; null before release and for physical-only letters.';

create index if not exists letters_available_idx
  on public.letters(available_at)
  where available_at is not null;

create or replace function public.complete_letter_release(
  p_scheduled_action_id uuid,
  p_letter_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action public.scheduled_actions;
  v_letter public.letters;
  v_newly_released boolean := false;
begin
  select *
  into v_action
  from public.scheduled_actions
  where id = p_scheduled_action_id
    and letter_id = p_letter_id
  for update;

  if not found or v_action.action_type <> 'release_letter' then
    raise exception 'Letter release action not found' using errcode = 'P0002';
  end if;

  select *
  into v_letter
  from public.letters
  where id = p_letter_id
  for update;

  if not found
    or v_letter.delivery_method <> 'digital'
    or v_letter.content_status <> 'sealed'
  then
    raise exception 'Digital sealed letter not found' using errcode = 'P0002';
  end if;

  if v_letter.delivery_at is null
    or v_letter.delivery_at > timezone('utc', now())
  then
    raise exception 'Letter cannot be released before its scheduled instant'
      using errcode = '22007';
  end if;

  if v_letter.available_at is null then
    update public.letters
    set available_at = timezone('utc', now())
    where id = p_letter_id;
    v_newly_released := true;
  end if;

  update public.scheduled_actions
  set
    status = 'completed',
    completed_at = coalesce(completed_at, timezone('utc', now())),
    locked_at = null,
    locked_by = null,
    next_attempt_at = null,
    last_error_code = null
  where id = p_scheduled_action_id;

  insert into public.scheduled_actions (
    letter_id,
    action_type,
    execute_at,
    idempotency_key
  )
  values (
    p_letter_id,
    'send_notification',
    timezone('utc', now()),
    'send_notification:' || p_letter_id::text
  )
  on conflict (letter_id, action_type) do nothing;

  return v_newly_released;
end;
$$;

create or replace function public.mark_scheduled_action_failed(
  p_scheduled_action_id uuid,
  p_error_code text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.scheduled_actions
  set
    status = 'failed',
    attempt_count = attempt_count + 1,
    next_attempt_at = timezone('utc', now()) + make_interval(
      secs => least(900, power(2, attempt_count + 1)::integer * 15)
    ),
    locked_at = null,
    locked_by = null,
    last_error_code = left(coalesce(p_error_code, 'PROCESSING_FAILED'), 120)
  where id = p_scheduled_action_id
    and status in ('queued', 'processing');

  if not found then
    raise exception 'Queued scheduled action not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.complete_letter_release(uuid, uuid)
  from public;
revoke all on function public.mark_scheduled_action_failed(uuid, text)
  from public;

grant execute on function public.complete_letter_release(uuid, uuid)
  to service_role;
grant execute on function public.mark_scheduled_action_failed(uuid, text)
  to service_role;
