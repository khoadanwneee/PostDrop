-- DEMO-ONLY RELAXATION (companion to 202608051013 / 202608061014): opening
-- the reveal link re-checked delivery_at independently of available_at, so
-- even after the letter released and the email went out immediately, the
-- recipient still couldn't open it until the originally chosen delivery
-- date arrived. available_at is already the authoritative "is it released"
-- signal (set the moment complete_letter_release runs), so drop the
-- redundant delivery_at check here too. Revert together with the other two
-- demo migrations before shipping the real scheduled-delivery experience.
create or replace function public.exchange_reveal_capability(
  p_letter_id uuid,
  p_capability_hash text,
  p_session_hash text,
  p_session_expires_at timestamptz
)
returns table (
  session_id uuid,
  session_expires_at timestamptz,
  renderer_version smallint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_letter public.letters;
  v_capability public.reveal_capabilities;
  v_session public.reveal_sessions;
begin
  if p_capability_hash !~ '^[0-9a-f]{64}$'
    or p_session_hash !~ '^[0-9a-f]{64}$'
  then
    raise exception 'Reveal credential hash is invalid' using errcode = '22023';
  end if;

  select *
  into v_capability
  from public.reveal_capabilities
  where letter_id = p_letter_id
    and token_hash = p_capability_hash
  for update;

  if not found
    or v_capability.revoked_at is not null
    or v_capability.expires_at <= timezone('utc', now())
  then
    raise exception 'Reveal capability is invalid or expired'
      using errcode = 'P0002';
  end if;

  select *
  into v_letter
  from public.letters
  where id = p_letter_id
  for share;

  if not found
    or v_letter.delivery_method <> 'digital'
    or v_letter.content_status <> 'sealed'
  then
    raise exception 'Reveal capability is invalid' using errcode = 'P0002';
  end if;

  -- DEMO: delivery_at-must-have-arrived requirement dropped; available_at
  -- being set is already sufficient proof the letter was released.
  if v_letter.available_at is null then
    raise exception 'Letter is not available yet' using errcode = '22007';
  end if;

  if p_session_expires_at <= timezone('utc', now())
    or p_session_expires_at > timezone('utc', now()) + interval '1 hour'
    or p_session_expires_at > v_capability.expires_at
  then
    raise exception 'Reveal session expiry is invalid' using errcode = '22007';
  end if;

  insert into public.reveal_sessions (
    capability_id,
    letter_id,
    session_hash,
    expires_at
  )
  values (
    v_capability.id,
    p_letter_id,
    p_session_hash,
    p_session_expires_at
  )
  returning * into v_session;

  insert into public.reveal_events (
    letter_id,
    capability_id,
    session_id,
    event_type
  )
  values (
    p_letter_id,
    v_capability.id,
    v_session.id,
    'session_issued'
  );

  return query
  select
    v_session.id,
    v_session.expires_at,
    v_letter.renderer_version;
end;
$$;
