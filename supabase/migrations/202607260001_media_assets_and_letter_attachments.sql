-- Public built-in media and private user uploads.
--
-- Built-in assets are intentionally public: they are product artwork, not user
-- content. User uploads remain private and are served through short-lived signed
-- URLs.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'built-in-assets',
    'built-in-assets',
    true,
    52428800,
    array[
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/webm'
    ]
  ),
  (
    'user-assets',
    'user-assets',
    false,
    52428800,
    array[
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/webm'
    ]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  source text not null check (source in ('built_in', 'upload')),
  kind text not null check (kind in ('sticker', 'image', 'video')),
  bucket_id text not null references storage.buckets(id),
  object_path text not null,
  display_name text not null,
  category text,
  mime_type text not null,
  byte_size bigint not null check (byte_size > 0 and byte_size <= 52428800),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  status text not null default 'pending' check (status in ('pending', 'ready')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (bucket_id, object_path),
  constraint media_assets_source_owner check (
    (
      source = 'built_in'
      and owner_id is null
      and bucket_id = 'built-in-assets'
      and status = 'ready'
    )
    or (
      source = 'upload'
      and owner_id is not null
      and bucket_id = 'user-assets'
    )
  ),
  constraint media_assets_kind_mime check (
    (kind in ('sticker', 'image') and mime_type like 'image/%')
    or (kind = 'video' and mime_type like 'video/%')
  )
);

create index media_assets_library_idx
  on public.media_assets(source, kind, category, created_at desc)
  where status = 'ready';

create index media_assets_owner_idx
  on public.media_assets(owner_id, created_at desc)
  where owner_id is not null;

create trigger media_assets_set_updated_at
  before update on public.media_assets
  for each row execute function public.set_updated_at();

create table public.letter_attachments (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  asset_id uuid not null references public.media_assets(id) on delete restrict,
  client_id text,
  role text not null default 'attachment'
    check (role in ('decoration', 'inline', 'attachment')),
  x_percent numeric(6, 3)
    check (x_percent is null or (x_percent >= 0 and x_percent <= 100)),
  y_percent numeric(6, 3)
    check (y_percent is null or (y_percent >= 0 and y_percent <= 100)),
  scale numeric(6, 3) check (scale is null or (scale >= 0.1 and scale <= 10)),
  rotation numeric(7, 3)
    check (rotation is null or (rotation >= -360 and rotation <= 360)),
  z_index integer not null default 0 check (z_index >= 0 and z_index <= 1000),
  alt_text text check (alt_text is null or char_length(alt_text) <= 500),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint letter_attachments_decoration_placement check (
    role <> 'decoration'
    or (
      x_percent is not null
      and y_percent is not null
      and scale is not null
      and rotation is not null
    )
  )
);

create index letter_attachments_letter_idx
  on public.letter_attachments(letter_id, z_index, created_at);

create unique index letter_attachments_client_id_idx
  on public.letter_attachments(letter_id, client_id)
  where client_id is not null;

create trigger letter_attachments_set_updated_at
  before update on public.letter_attachments
  for each row execute function public.set_updated_at();

-- The API checks the uploaded Storage object before invoking this function.
-- Keeping the status mutation in a function means authenticated clients cannot
-- freely rewrite immutable paths or ownership metadata through PostgREST.
create or replace function public.complete_media_asset(
  p_asset_id uuid,
  p_width integer default null,
  p_height integer default null,
  p_duration_ms integer default null
)
returns setof public.media_assets
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_asset public.media_assets;
  v_actual_mime_type text;
  v_actual_byte_size bigint;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into v_asset
  from public.media_assets
  where id = p_asset_id
    and owner_id = auth.uid()
    and source = 'upload'
    and status = 'pending'
  for update;

  if not found then
    raise exception 'Pending asset not found' using errcode = 'P0002';
  end if;

  select
    objects.metadata ->> 'mimetype',
    (objects.metadata ->> 'size')::bigint
  into v_actual_mime_type, v_actual_byte_size
  from storage.objects
  where objects.bucket_id = v_asset.bucket_id
    and objects.name = v_asset.object_path;

  if not found then
    raise exception 'Uploaded object not found' using errcode = 'P0002';
  end if;

  if v_actual_mime_type is distinct from v_asset.mime_type
    or v_actual_byte_size is distinct from v_asset.byte_size
  then
    raise exception 'Uploaded object does not match declared type and size'
      using errcode = '23514';
  end if;

  update public.media_assets
  set
    width = p_width,
    height = p_height,
    duration_ms = p_duration_ms,
    status = 'ready'
  where id = p_asset_id;

  return query
  select *
  from public.media_assets
  where id = p_asset_id;
end;
$$;

alter table public.media_assets enable row level security;
alter table public.letter_attachments enable row level security;

create policy media_assets_select_visible
  on public.media_assets for select
  to anon, authenticated
  using (
    (source = 'built_in' and status = 'ready')
    or owner_id = auth.uid()
  );

create policy media_assets_insert_own_upload
  on public.media_assets for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and source = 'upload'
    and bucket_id = 'user-assets'
    and status = 'pending'
    and (storage.foldername(object_path))[1] = auth.uid()::text
  );

create policy media_assets_delete_unused_upload
  on public.media_assets for delete
  to authenticated
  using (
    owner_id = auth.uid()
    and source = 'upload'
    and not exists (
      select 1
      from public.letter_attachments
      where letter_attachments.asset_id = media_assets.id
    )
  );

create policy letter_attachments_select_own
  on public.letter_attachments for select
  to authenticated
  using (
    exists (
      select 1
      from public.letters
      where letters.id = letter_attachments.letter_id
        and letters.owner_id = auth.uid()
    )
  );

create policy letter_attachments_insert_own_draft
  on public.letter_attachments for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.letters
      where letters.id = letter_attachments.letter_id
        and letters.owner_id = auth.uid()
        and letters.content_status = 'draft'
    )
    and exists (
      select 1
      from public.media_assets
      where media_assets.id = letter_attachments.asset_id
        and media_assets.status = 'ready'
        and (
          media_assets.source = 'built_in'
          or media_assets.owner_id = auth.uid()
        )
    )
  );

create policy letter_attachments_update_own_draft
  on public.letter_attachments for update
  to authenticated
  using (
    exists (
      select 1
      from public.letters
      where letters.id = letter_attachments.letter_id
        and letters.owner_id = auth.uid()
        and letters.content_status = 'draft'
    )
  )
  with check (
    exists (
      select 1
      from public.letters
      where letters.id = letter_attachments.letter_id
        and letters.owner_id = auth.uid()
        and letters.content_status = 'draft'
    )
  );

create policy letter_attachments_delete_own_draft
  on public.letter_attachments for delete
  to authenticated
  using (
    exists (
      select 1
      from public.letters
      where letters.id = letter_attachments.letter_id
        and letters.owner_id = auth.uid()
        and letters.content_status = 'draft'
    )
  );

-- Built-in objects are product artwork. User objects remain private.
create policy built_in_assets_public_read
  on storage.objects for select
  to public
  using (bucket_id = 'built-in-assets');

create policy user_assets_select_own
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'user-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy user_assets_insert_own
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy user_assets_delete_own
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

revoke all on table public.media_assets from anon, authenticated;
grant select on table public.media_assets to anon, authenticated;
grant insert (
  id,
  owner_id,
  source,
  kind,
  bucket_id,
  object_path,
  display_name,
  category,
  mime_type,
  byte_size,
  status
) on table public.media_assets to authenticated;
grant delete on table public.media_assets to authenticated;

revoke all on table public.letter_attachments from anon, authenticated;
grant select on table public.letter_attachments to authenticated;
grant insert (
  letter_id,
  asset_id,
  client_id,
  role,
  x_percent,
  y_percent,
  scale,
  rotation,
  z_index,
  alt_text
) on table public.letter_attachments to authenticated;
grant update (
  client_id,
  role,
  x_percent,
  y_percent,
  scale,
  rotation,
  z_index,
  alt_text
) on table public.letter_attachments to authenticated;
grant delete on table public.letter_attachments to authenticated;

revoke all on function public.complete_media_asset(
  uuid,
  integer,
  integer,
  integer
) from public;
grant execute on function public.complete_media_asset(
  uuid,
  integer,
  integer,
  integer
) to authenticated;
