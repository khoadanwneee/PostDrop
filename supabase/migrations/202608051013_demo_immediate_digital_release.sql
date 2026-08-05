-- DEMO-ONLY RELAXATION: for recording a product demo, digital letters should
-- email/reveal-link immediately on seal instead of waiting for the chosen
-- delivery date, and the "must be in the future" date guard is dropped so a
-- demo doesn't have to fuss over date-picking. This intentionally changes
-- production behavior (every digital letter now releases at seal time) —
-- revert this migration (or restore the two commented-out blocks below)
-- before shipping the real scheduled-delivery experience.
create or replace function public.seal_letter_with_attachments(
  p_owner_id uuid,
  p_letter_id uuid,
  p_encrypted_content text,
  p_content_iv text,
  p_content_auth_tag text,
  p_encryption_version smallint,
  p_encrypted_data_key text,
  p_data_key_iv text,
  p_data_key_auth_tag text,
  p_master_key_version smallint,
  p_sealed_attachments jsonb
)
returns setof public.letters
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_letter public.letters;
  v_action_type text;
  v_attachment_count integer;
begin
  select *
  into v_letter
  from public.letters
  where id = p_letter_id
    and owner_id = p_owner_id
  for update;

  if not found then
    raise exception 'Letter not found' using errcode = 'P0002';
  end if;

  if v_letter.content_status <> 'draft' then
    raise exception 'Only draft letters can be sealed' using errcode = 'P0001';
  end if;

  if v_letter.delivery_method = 'physical'
    and v_letter.physical_fulfillment_mode = 'stored_original'
  then
    raise exception 'Stored-original orders use the custody sealing workflow'
      using errcode = 'P0001';
  end if;

  if char_length(trim(v_letter.title)) < 2
    or v_letter.content is null
    or char_length(trim(v_letter.content)) < 10
    or char_length(trim(v_letter.recipient_name)) < 2
    or (
      v_letter.delivery_method = 'digital'
      and char_length(trim(v_letter.recipient_email)) < 3
    )
    or (
      v_letter.delivery_method = 'physical'
      and (
        v_letter.physical_fulfillment_mode is null
        or char_length(trim(coalesce(v_letter.address, ''))) < 3
      )
    )
    or v_letter.delivery_at is null
  then
    raise exception 'Letter is incomplete' using errcode = '23514';
  end if;

  -- DEMO: future-date requirement dropped.
  -- if v_letter.delivery_at <= timezone('utc', now()) then
  --   raise exception 'Expected arrival time must be in the future'
  --     using errcode = '22007';
  -- end if;

  if p_encryption_version < 2
    or nullif(p_encrypted_content, '') is null
    or nullif(p_content_iv, '') is null
    or nullif(p_content_auth_tag, '') is null
    or nullif(p_encrypted_data_key, '') is null
    or nullif(p_data_key_iv, '') is null
    or nullif(p_data_key_auth_tag, '') is null
    or p_master_key_version is null
    or p_master_key_version <= 0
  then
    raise exception 'Envelope-encryption metadata is incomplete'
      using errcode = '23514';
  end if;

  if p_sealed_attachments is null
    or jsonb_typeof(p_sealed_attachments) <> 'array'
  then
    raise exception 'Sealed attachment manifest must be an array'
      using errcode = '23514';
  end if;

  select count(*)
  into v_attachment_count
  from public.letter_attachments
  where letter_id = p_letter_id;

  if jsonb_array_length(p_sealed_attachments) <> v_attachment_count then
    raise exception 'Sealed attachment manifest is incomplete'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_sealed_attachments) as item
    group by item ->> 'letter_attachment_id'
    having count(*) > 1
  ) then
    raise exception 'Sealed attachment manifest contains duplicates'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.letter_attachments as attachment
    where attachment.letter_id = p_letter_id
      and not exists (
        select 1
        from jsonb_array_elements(p_sealed_attachments) as item
        where item ->> 'letter_attachment_id' = attachment.id::text
      )
  ) then
    raise exception 'Sealed attachment manifest is incomplete'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_sealed_attachments) as item
    where
      nullif(item ->> 'id', '') is null
      or nullif(item ->> 'letter_attachment_id', '') is null
      or nullif(item ->> 'source_asset_id', '') is null
      or item ->> 'bucket_id' <> 'sealed-attachments'
      or item ->> 'object_path'
        <> p_letter_id::text || '/' || (item ->> 'id') || '.bin'
      or nullif(item ->> 'original_mime_type', '') is null
      or (item ->> 'original_byte_size')::bigint <= 0
      or (item ->> 'encrypted_byte_size')::bigint <= 0
      or (item ->> 'plaintext_sha256') !~ '^[0-9a-f]{64}$'
      or (item ->> 'ciphertext_sha256') !~ '^[0-9a-f]{64}$'
      or nullif(item ->> 'content_iv', '') is null
      or nullif(item ->> 'content_auth_tag', '') is null
      or (item ->> 'encryption_version')::smallint <> p_encryption_version
      or not exists (
        select 1
        from public.letter_attachments as attachment
        join public.media_assets as asset
          on asset.id = attachment.asset_id
        where attachment.id = (item ->> 'letter_attachment_id')::uuid
          and attachment.letter_id = p_letter_id
          and asset.id = (item ->> 'source_asset_id')::uuid
          and asset.status = 'ready'
          and asset.mime_type = item ->> 'original_mime_type'
          and asset.byte_size = (item ->> 'original_byte_size')::bigint
      )
  ) then
    raise exception 'Sealed attachment manifest is invalid'
      using errcode = '23514';
  end if;

  insert into public.sealed_letter_attachments (
    id,
    letter_id,
    letter_attachment_id,
    source_asset_id,
    bucket_id,
    object_path,
    original_mime_type,
    original_byte_size,
    encrypted_byte_size,
    plaintext_sha256,
    ciphertext_sha256,
    content_iv,
    content_auth_tag,
    encryption_version
  )
  select
    (item ->> 'id')::uuid,
    p_letter_id,
    (item ->> 'letter_attachment_id')::uuid,
    (item ->> 'source_asset_id')::uuid,
    item ->> 'bucket_id',
    item ->> 'object_path',
    item ->> 'original_mime_type',
    (item ->> 'original_byte_size')::bigint,
    (item ->> 'encrypted_byte_size')::bigint,
    item ->> 'plaintext_sha256',
    item ->> 'ciphertext_sha256',
    item ->> 'content_iv',
    item ->> 'content_auth_tag',
    (item ->> 'encryption_version')::smallint
  from jsonb_array_elements(p_sealed_attachments) as item;

  update public.letters
  set
    content = null,
    encrypted_content = p_encrypted_content,
    content_iv = p_content_iv,
    content_auth_tag = p_content_auth_tag,
    encryption_version = p_encryption_version,
    encrypted_data_key = p_encrypted_data_key,
    data_key_iv = p_data_key_iv,
    data_key_auth_tag = p_data_key_auth_tag,
    master_key_version = p_master_key_version,
    content_status = 'sealed',
    sealed_at = timezone('utc', now())
  where id = p_letter_id;

  if v_letter.delivery_method = 'digital' then
    v_action_type := 'release_letter';

    insert into public.scheduled_actions (
      letter_id,
      action_type,
      execute_at,
      idempotency_key
    )
    values (
      p_letter_id,
      v_action_type,
      -- DEMO: release immediately instead of waiting for delivery_at so the
      -- reveal email/link is available right after sealing.
      timezone('utc', now()),
      v_action_type || ':' || p_letter_id::text
    );
  else
    insert into public.physical_orders (
      letter_id,
      fulfillment_mode,
      status,
      expected_arrival_at,
      address_snapshot
    )
    values (
      p_letter_id,
      'print_design',
      'planning',
      v_letter.delivery_at,
      v_letter.address
    );
  end if;

  return query
  select *
  from public.letters
  where id = p_letter_id;
end;
$$;
