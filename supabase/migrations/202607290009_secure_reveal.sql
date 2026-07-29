-- Add a time-gated, revocable secure-reveal flow for digital letters.
-- Bearer capabilities and reveal-session tokens are never persisted; only
-- SHA-256 hashes reach PostgreSQL.

alter table public.letters
  add column if not exists renderer_version smallint,
  add column if not exists sealed_presentation jsonb;

update public.letters
set
  renderer_version = 1,
  sealed_presentation = jsonb_build_object(
    'title', title,
    'recipientName', recipient_name,
    'letterType', letter_type,
    'paper', paper,
    'font', font,
    'envelope', envelope,
    'note', note
  )
where content_status = 'sealed'
  and not (
    delivery_method = 'physical'
    and physical_fulfillment_mode = 'stored_original'
  )
  and sealed_presentation is null;

alter table public.letters
  add constraint letters_sealed_presentation_check
  check (
    content_status = 'draft'
    or (
      delivery_method = 'physical'
      and physical_fulfillment_mode = 'stored_original'
    )
    or (
      renderer_version is not null
      and renderer_version > 0
      and sealed_presentation is not null
      and jsonb_typeof(sealed_presentation) = 'object'
    )
  );

comment on column public.letters.renderer_version is
  'Immutable client renderer contract version captured when digital content is sealed.';
comment on column public.letters.sealed_presentation is
  'Immutable versioned presentation metadata. Private letter text remains only in encrypted_content.';

create or replace function public.capture_sealed_presentation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.content_status = 'draft'
    and new.content_status = 'sealed'
    and not (
      old.delivery_method = 'physical'
      and old.physical_fulfillment_mode = 'stored_original'
    )
  then
    new.renderer_version := 1;
    new.sealed_presentation := jsonb_build_object(
      'title', old.title,
      'recipientName', old.recipient_name,
      'letterType', old.letter_type,
      'paper', old.paper,
      'font', old.font,
      'envelope', old.envelope,
      'note', old.note
    );
  elsif old.content_status = 'sealed'
    and (
      new.renderer_version is distinct from old.renderer_version
      or new.sealed_presentation is distinct from old.sealed_presentation
    )
  then
    raise exception 'Sealed presentation is immutable' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger letters_capture_sealed_presentation
  before update on public.letters
  for each row execute function public.capture_sealed_presentation();

create table public.reveal_capabilities (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null unique
    references public.letters(id) on delete restrict,
  token_hash text not null check (token_hash ~ '^[0-9a-f]{64}$'),
  token_key_version smallint not null default 1
    check (token_key_version > 0),
  access_policy text not null default 'reusable'
    check (access_policy in ('reusable')),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint reveal_capability_expiry check (expires_at > created_at),
  unique (id, letter_id)
);

create index reveal_capabilities_active_idx
  on public.reveal_capabilities(letter_id, expires_at)
  where revoked_at is null;

create table public.reveal_sessions (
  id uuid primary key default gen_random_uuid(),
  capability_id uuid not null,
  letter_id uuid not null references public.letters(id) on delete restrict,
  session_hash text not null unique
    check (session_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  content_revealed_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint reveal_session_expiry check (expires_at > created_at),
  constraint reveal_session_capability_letter_fk
    foreign key (capability_id, letter_id)
    references public.reveal_capabilities(id, letter_id) on delete restrict,
  unique (id, letter_id)
);

create index reveal_sessions_authorization_idx
  on public.reveal_sessions(letter_id, session_hash, expires_at)
  where revoked_at is null;

create table public.reveal_events (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete restrict,
  capability_id uuid,
  session_id uuid,
  event_type text not null check (event_type in (
    'capability_created',
    'capability_revoked',
    'session_issued',
    'content_revealed',
    'attachment_accessed'
  )),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default timezone('utc', now()),
  constraint reveal_event_capability_letter_fk
    foreign key (capability_id, letter_id)
    references public.reveal_capabilities(id, letter_id) on delete restrict,
  constraint reveal_event_session_letter_fk
    foreign key (session_id, letter_id)
    references public.reveal_sessions(id, letter_id) on delete restrict
);

create index reveal_events_letter_created_idx
  on public.reveal_events(letter_id, created_at);

alter table public.reveal_capabilities enable row level security;
alter table public.reveal_sessions enable row level security;
alter table public.reveal_events enable row level security;

revoke all on table public.reveal_capabilities from anon, authenticated;
revoke all on table public.reveal_sessions from anon, authenticated;
revoke all on table public.reveal_events from anon, authenticated;
grant select, insert, update on table public.reveal_capabilities to service_role;
grant select, insert, update on table public.reveal_sessions to service_role;
grant select, insert on table public.reveal_events to service_role;

drop function if exists public.complete_letter_release(uuid, uuid);

create function public.complete_letter_release(
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

  if v_letter.delivery_at is null
    or v_letter.delivery_at > timezone('utc', now())
  then
    raise exception 'Letter cannot be released before its scheduled instant'
      using errcode = '22007';
  end if;

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

  if v_letter.available_at is null
    or v_letter.delivery_at is null
    or v_letter.delivery_at > timezone('utc', now())
  then
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

create or replace function public.authorize_reveal_session(
  p_letter_id uuid,
  p_session_hash text,
  p_event_type text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.reveal_sessions;
  v_first_reveal boolean := false;
begin
  if p_session_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Reveal session is invalid' using errcode = 'P0002';
  end if;

  if p_event_type is not null
    and p_event_type not in ('content_revealed', 'attachment_accessed')
  then
    raise exception 'Reveal event type is invalid' using errcode = '22023';
  end if;

  select session.*
  into v_session
  from public.reveal_sessions as session
  join public.reveal_capabilities as capability
    on capability.id = session.capability_id
  where session.letter_id = p_letter_id
    and session.session_hash = p_session_hash
    and session.revoked_at is null
    and session.expires_at > timezone('utc', now())
    and capability.revoked_at is null
    and capability.expires_at > timezone('utc', now())
  for update of session;

  if not found then
    raise exception 'Reveal session is invalid or expired'
      using errcode = 'P0002';
  end if;

  if p_event_type = 'content_revealed'
    and v_session.content_revealed_at is null
  then
    v_first_reveal := true;
  end if;

  update public.reveal_sessions
  set
    last_used_at = timezone('utc', now()),
    content_revealed_at = case
      when p_event_type = 'content_revealed'
        then coalesce(content_revealed_at, timezone('utc', now()))
      else content_revealed_at
    end
  where id = v_session.id;

  if p_event_type = 'attachment_accessed' or v_first_reveal then
    insert into public.reveal_events (
      letter_id,
      capability_id,
      session_id,
      event_type
    )
    values (
      p_letter_id,
      v_session.capability_id,
      v_session.id,
      p_event_type
    );
  end if;

  return v_session.id;
end;
$$;

create or replace function public.revoke_reveal_capability(
  p_letter_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_capability public.reveal_capabilities;
begin
  update public.reveal_capabilities
  set revoked_at = timezone('utc', now())
  where letter_id = p_letter_id
    and revoked_at is null
  returning * into v_capability;

  if not found then
    return false;
  end if;

  update public.reveal_sessions
  set revoked_at = timezone('utc', now())
  where capability_id = v_capability.id
    and revoked_at is null;

  insert into public.reveal_events (
    letter_id,
    capability_id,
    event_type
  )
  values (
    p_letter_id,
    v_capability.id,
    'capability_revoked'
  );

  return true;
end;
$$;

revoke all on function public.complete_letter_release(uuid, uuid, text, timestamptz)
  from public;
revoke all on function public.exchange_reveal_capability(uuid, text, text, timestamptz)
  from public;
revoke all on function public.authorize_reveal_session(uuid, text, text)
  from public;
revoke all on function public.revoke_reveal_capability(uuid)
  from public;

grant execute on function public.complete_letter_release(uuid, uuid, text, timestamptz)
  to service_role;
grant execute on function public.exchange_reveal_capability(uuid, text, text, timestamptz)
  to service_role;
grant execute on function public.authorize_reveal_session(uuid, text, text)
  to service_role;
grant execute on function public.revoke_reveal_capability(uuid)
  to service_role;
