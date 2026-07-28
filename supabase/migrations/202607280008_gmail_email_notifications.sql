-- Persist one durable email-send record per notification action and expose
-- transactional worker transitions around the external email-provider call.

alter table public.delivery_attempts
  drop constraint if exists delivery_attempts_status_check;

alter table public.delivery_attempts
  add constraint delivery_attempts_status_check
  check (status in (
    'processing',
    'retrying',
    'sent',
    'delivered',
    'delayed',
    'failed',
    'bounced',
    'complained'
  ));

alter table public.delivery_attempts
  add column if not exists idempotency_key text,
  add column if not exists updated_at timestamptz
    not null default timezone('utc', now());

update public.delivery_attempts as attempt
set idempotency_key = action.idempotency_key
from public.scheduled_actions as action
where action.id = attempt.scheduled_action_id
  and attempt.idempotency_key is null;

alter table public.delivery_attempts
  alter column idempotency_key set not null;

create unique index if not exists delivery_attempts_action_unique
  on public.delivery_attempts(scheduled_action_id);

create unique index if not exists delivery_attempts_idempotency_unique
  on public.delivery_attempts(idempotency_key);

drop trigger if exists delivery_attempts_set_updated_at
  on public.delivery_attempts;
create trigger delivery_attempts_set_updated_at
  before update on public.delivery_attempts
  for each row execute function public.set_updated_at();

create or replace function public.prepare_email_notification(
  p_scheduled_action_id uuid,
  p_letter_id uuid
)
returns table (
  should_send boolean,
  attempt_id uuid,
  recipient_email text,
  recipient_name text,
  letter_title text,
  idempotency_key text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action public.scheduled_actions;
  v_letter public.letters;
  v_attempt public.delivery_attempts;
begin
  select *
  into v_action
  from public.scheduled_actions
  where id = p_scheduled_action_id
    and letter_id = p_letter_id
  for update;

  if not found or v_action.action_type <> 'send_notification' then
    raise exception 'Email notification action not found'
      using errcode = 'P0002';
  end if;

  select *
  into v_letter
  from public.letters
  where id = p_letter_id
  for update;

  if not found
    or v_letter.delivery_method <> 'digital'
    or v_letter.content_status <> 'sealed'
    or v_letter.available_at is null
    or nullif(trim(v_letter.recipient_email), '') is null
  then
    raise exception 'Available digital letter not found'
      using errcode = 'P0002';
  end if;

  select *
  into v_attempt
  from public.delivery_attempts
  where scheduled_action_id = p_scheduled_action_id
  for update;

  if found and v_attempt.status in (
    'sent',
    'delivered',
    'delayed',
    'bounced',
    'complained'
  ) then
    update public.scheduled_actions
    set
      status = 'completed',
      completed_at = coalesce(completed_at, timezone('utc', now())),
      locked_at = null,
      locked_by = null,
      next_attempt_at = null,
      last_error_code = null
    where id = p_scheduled_action_id;

    return query
    select
      false,
      v_attempt.id,
      v_letter.recipient_email,
      v_letter.recipient_name,
      v_letter.title,
      v_attempt.idempotency_key;
    return;
  end if;

  if not found then
    insert into public.delivery_attempts (
      letter_id,
      scheduled_action_id,
      provider,
      status,
      attempt_number,
      idempotency_key
    )
    values (
      p_letter_id,
      p_scheduled_action_id,
      'gmail',
      'processing',
      1,
      v_action.idempotency_key
    )
    returning * into v_attempt;
  else
    update public.delivery_attempts
    set
      status = 'retrying',
      error_message = null
    where id = v_attempt.id
    returning * into v_attempt;
  end if;

  return query
  select
    true,
    v_attempt.id,
    v_letter.recipient_email,
    v_letter.recipient_name,
    v_letter.title,
    v_attempt.idempotency_key;
end;
$$;

create or replace function public.complete_email_notification(
  p_scheduled_action_id uuid,
  p_attempt_id uuid,
  p_provider_message_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.delivery_attempts;
begin
  if nullif(trim(p_provider_message_id), '') is null then
    raise exception 'Provider message ID is required' using errcode = '22023';
  end if;

  select *
  into v_attempt
  from public.delivery_attempts
  where id = p_attempt_id
    and scheduled_action_id = p_scheduled_action_id
  for update;

  if not found then
    raise exception 'Email delivery attempt not found' using errcode = 'P0002';
  end if;

  if v_attempt.provider_message_id is not null
    and v_attempt.provider_message_id <> p_provider_message_id
  then
    raise exception 'Provider message ID does not match recorded send'
      using errcode = '23505';
  end if;

  update public.delivery_attempts
  set
    status = 'sent',
    provider_message_id = p_provider_message_id,
    error_message = null
  where id = p_attempt_id;

  update public.scheduled_actions
  set
    status = 'completed',
    completed_at = coalesce(completed_at, timezone('utc', now())),
    locked_at = null,
    locked_by = null,
    next_attempt_at = null,
    last_error_code = null
  where id = p_scheduled_action_id
    and action_type = 'send_notification';

  if not found then
    raise exception 'Email notification action not found'
      using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.fail_email_notification(
  p_scheduled_action_id uuid,
  p_attempt_id uuid,
  p_error_code text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_error_code text :=
    left(coalesce(nullif(trim(p_error_code), ''), 'EMAIL_SEND_FAILED'), 120);
begin
  update public.delivery_attempts
  set
    status = 'failed',
    error_message = v_error_code
  where id = p_attempt_id
    and scheduled_action_id = p_scheduled_action_id
    and status in ('processing', 'retrying', 'failed');

  if not found then
    raise exception 'Pending email delivery attempt not found'
      using errcode = 'P0002';
  end if;

  update public.scheduled_actions
  set
    status = 'failed',
    attempt_count = attempt_count + 1,
    next_attempt_at = timezone('utc', now()) + make_interval(
      secs => least(900, power(2, attempt_count + 1)::integer * 15)
    ),
    locked_at = null,
    locked_by = null,
    last_error_code = v_error_code
  where id = p_scheduled_action_id
    and action_type = 'send_notification'
    and status in ('queued', 'processing', 'failed');

  if not found then
    raise exception 'Queued email notification action not found'
      using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.prepare_email_notification(uuid, uuid)
  from public;
revoke all on function public.complete_email_notification(uuid, uuid, text)
  from public;
revoke all on function public.fail_email_notification(uuid, uuid, text)
  from public;

grant execute on function public.prepare_email_notification(uuid, uuid)
  to service_role;
grant execute on function public.complete_email_notification(uuid, uuid, text)
  to service_role;
grant execute on function public.fail_email_notification(uuid, uuid, text)
  to service_role;
