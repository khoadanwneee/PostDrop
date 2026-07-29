\set ON_ERROR_STOP on

begin;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '10000000-0000-4000-8000-000000000009',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'secure-reveal-smoke@example.com',
  crypt('not-a-real-password', gen_salt('bf')),
  timezone('utc', now()),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  timezone('utc', now()),
  timezone('utc', now())
);

insert into public.letters (
  id,
  owner_id,
  title,
  content,
  recipient_name,
  recipient_email,
  delivery_at,
  delivery_method,
  content_status,
  encrypted_content,
  content_iv,
  content_auth_tag,
  encryption_version,
  encrypted_data_key,
  data_key_iv,
  data_key_auth_tag,
  master_key_version,
  renderer_version,
  sealed_presentation,
  sealed_at
)
values (
  '20000000-0000-4000-8000-000000000009',
  '10000000-0000-4000-8000-000000000009',
  'Secure reveal smoke letter',
  null,
  'Recipient',
  'recipient@example.com',
  timezone('utc', now()) - interval '1 minute',
  'digital',
  'sealed',
  'encrypted-content',
  'content-iv',
  'content-auth-tag',
  2,
  'encrypted-data-key',
  'data-key-iv',
  'data-key-auth-tag',
  1,
  1,
  '{"title":"Secure reveal smoke letter","paper":"Ivory"}'::jsonb,
  timezone('utc', now()) - interval '2 minutes'
);

insert into public.scheduled_actions (
  id,
  letter_id,
  action_type,
  execute_at,
  status,
  idempotency_key
)
values (
  '30000000-0000-4000-8000-000000000009',
  '20000000-0000-4000-8000-000000000009',
  'release_letter',
  timezone('utc', now()) - interval '1 minute',
  'queued',
  'release_letter:20000000-0000-4000-8000-000000000009'
);

insert into public.letters (
  id,
  owner_id,
  title,
  content,
  recipient_name,
  recipient_email,
  delivery_at,
  delivery_method,
  content_status,
  encrypted_content,
  content_iv,
  content_auth_tag,
  encryption_version,
  encrypted_data_key,
  data_key_iv,
  data_key_auth_tag,
  master_key_version,
  renderer_version,
  sealed_presentation,
  sealed_at
)
values (
  '20000000-0000-4000-8000-000000000010',
  '10000000-0000-4000-8000-000000000009',
  'Future secure reveal letter',
  null,
  'Recipient',
  'recipient@example.com',
  timezone('utc', now()) + interval '1 day',
  'digital',
  'sealed',
  'encrypted-content',
  'content-iv',
  'content-auth-tag',
  2,
  'encrypted-data-key',
  'data-key-iv',
  'data-key-auth-tag',
  1,
  1,
  '{"title":"Future secure reveal letter","paper":"Ivory"}'::jsonb,
  timezone('utc', now())
);

insert into public.reveal_capabilities (
  letter_id,
  token_hash,
  expires_at
)
values (
  '20000000-0000-4000-8000-000000000010',
  repeat('c', 64),
  timezone('utc', now()) + interval '31 days'
);

set local role service_role;

do $$
declare
  v_newly_released boolean;
  v_session_id uuid;
begin
  select public.complete_letter_release(
    '30000000-0000-4000-8000-000000000009',
    '20000000-0000-4000-8000-000000000009',
    repeat('a', 64),
    timezone('utc', now()) + interval '30 days'
  )
  into v_newly_released;

  if not v_newly_released then
    raise exception 'First release was not authoritative';
  end if;

  select public.complete_letter_release(
    '30000000-0000-4000-8000-000000000009',
    '20000000-0000-4000-8000-000000000009',
    repeat('a', 64),
    timezone('utc', now()) + interval '30 days'
  )
  into v_newly_released;

  if v_newly_released then
    raise exception 'Release replay changed authoritative availability';
  end if;

  if (
    select count(*)
    from public.reveal_capabilities
    where letter_id = '20000000-0000-4000-8000-000000000009'
      and token_hash = repeat('a', 64)
  ) <> 1 then
    raise exception 'Stable reveal capability was not stored exactly once';
  end if;

  begin
    perform *
    from public.exchange_reveal_capability(
      '20000000-0000-4000-8000-000000000010',
      repeat('c', 64),
      repeat('d', 64),
      timezone('utc', now()) + interval '15 minutes'
    );
    raise exception 'A future letter issued a reveal session';
  exception
    when sqlstate '22007' then
      null;
  end;

  begin
    perform *
    from public.exchange_reveal_capability(
      '20000000-0000-4000-8000-000000000009',
      repeat('f', 64),
      repeat('d', 64),
      timezone('utc', now()) + interval '15 minutes'
    );
    raise exception 'An invalid capability issued a reveal session';
  exception
    when sqlstate 'P0002' then
      null;
  end;

  select session_id
  into v_session_id
  from public.exchange_reveal_capability(
    '20000000-0000-4000-8000-000000000009',
    repeat('a', 64),
    repeat('b', 64),
    timezone('utc', now()) + interval '15 minutes'
  );

  if v_session_id is null then
    raise exception 'Reveal session was not issued';
  end if;

  insert into public.reveal_sessions (
    capability_id,
    letter_id,
    session_hash,
    created_at,
    expires_at
  )
  select
    id,
    letter_id,
    repeat('e', 64),
    timezone('utc', now()) - interval '2 hours',
    timezone('utc', now()) - interval '1 hour'
  from public.reveal_capabilities
  where letter_id = '20000000-0000-4000-8000-000000000009';

  begin
    perform public.authorize_reveal_session(
      '20000000-0000-4000-8000-000000000009',
      repeat('e', 64),
      'content_revealed'
    );
    raise exception 'An expired reveal session remained authorized';
  exception
    when sqlstate 'P0002' then
      null;
  end;

  begin
    perform public.authorize_reveal_session(
      '20000000-0000-4000-8000-000000000010',
      repeat('b', 64),
      'content_revealed'
    );
    raise exception 'A session crossed letter boundaries';
  exception
    when sqlstate 'P0002' then
      null;
  end;

  perform public.authorize_reveal_session(
    '20000000-0000-4000-8000-000000000009',
    repeat('b', 64),
    'content_revealed'
  );
  perform public.authorize_reveal_session(
    '20000000-0000-4000-8000-000000000009',
    repeat('b', 64),
    'content_revealed'
  );

  if (
    select count(*)
    from public.reveal_events
    where letter_id = '20000000-0000-4000-8000-000000000009'
      and event_type = 'content_revealed'
  ) <> 1 then
    raise exception 'Human reveal event was not idempotent';
  end if;

  if not public.revoke_reveal_capability(
    '20000000-0000-4000-8000-000000000009'
  ) then
    raise exception 'Reveal capability was not revoked';
  end if;

  begin
    perform public.authorize_reveal_session(
      '20000000-0000-4000-8000-000000000009',
      repeat('b', 64),
      'attachment_accessed'
    );
    raise exception 'Revoked reveal session remained authorized';
  exception
    when sqlstate 'P0002' then
      null;
  end;
end;
$$;

rollback;
