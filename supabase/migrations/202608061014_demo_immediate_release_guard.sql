-- DEMO-ONLY RELAXATION (companion to 202608051013): that migration made
-- seal_letter_with_attachments schedule the release action immediately
-- instead of waiting for delivery_at, but complete_letter_release() still
-- independently guarded on delivery_at having arrived. That guard now
-- rejects the immediate release job every time, so the letter never gets
-- its reveal capability/email. Drop the guard here to match. Revert this
-- migration (or restore the commented-out block below) together with
-- 202608051013 before shipping the real scheduled-delivery experience.
create or replace function public.complete_letter_release(
  p_scheduled_action_id uuid,
  p_letter_id uuid,
  p_reveal_token_hash text,
  p_reveal_expires_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action public.scheduled_actions;
  v_letter public.letters;
  v_capability public.reveal_capabilities;
  v_newly_released boolean := false;
  v_capability_created boolean := false;
begin
  if p_reveal_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Reveal token hash is invalid' using errcode = '22023';
  end if;

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

  -- DEMO: delivery_at-must-have-arrived requirement dropped, mirroring
  -- the immediate-release scheduling in 202608051013.
  -- if v_letter.delivery_at is null
  --   or v_letter.delivery_at > timezone('utc', now())
  -- then
  --   raise exception 'Letter cannot be released before its scheduled instant'
  --     using errcode = '22007';
  -- end if;

  if p_reveal_expires_at <= timezone('utc', now()) then
    raise exception 'Reveal capability expiry must be in the future'
      using errcode = '22007';
  end if;

  if v_letter.available_at is null then
    update public.letters
    set available_at = timezone('utc', now())
    where id = p_letter_id;
    v_newly_released := true;
  end if;

  select *
  into v_capability
  from public.reveal_capabilities
  where letter_id = p_letter_id
  for update;

  if not found then
    insert into public.reveal_capabilities (
      letter_id,
      token_hash,
      expires_at
    )
    values (
      p_letter_id,
      p_reveal_token_hash,
      p_reveal_expires_at
    )
    returning * into v_capability;
    v_capability_created := true;
  elsif v_capability.token_hash <> p_reveal_token_hash then
    raise exception 'Reveal capability does not match its stable token'
      using errcode = 'P0001';
  end if;

  if v_capability_created then
    insert into public.reveal_events (
      letter_id,
      capability_id,
      event_type
    )
    values (
      p_letter_id,
      v_capability.id,
      'capability_created'
    );
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
