create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.letters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default '',
  content text,
  recipient_name text not null default '',
  recipient_email text not null default '',
  recipient_phone text,
  address text,
  delivery_at timestamptz,
  delivery_timezone text not null default 'Asia/Ho_Chi_Minh',
  delivery_method text not null default 'digital'
    check (delivery_method in ('digital', 'physical')),
  physical_fulfillment_mode text,
  letter_type text not null default 'online'
    check (letter_type in ('online', 'handwritten')),
  paper text not null default 'Ivory',
  font text not null default 'Editorial',
  envelope text not null default 'Burgundy',
  note text,
  content_status text not null default 'draft'
    check (content_status in ('draft', 'sealed')),
  encrypted_content text,
  content_iv text,
  content_auth_tag text,
  encryption_version smallint,
  sealed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint letters_title_length check (char_length(title) <= 200),
  constraint letters_content_length check (content is null or char_length(content) <= 50000),
  constraint letters_physical_fulfillment_mode check (
    (
      delivery_method = 'digital'
      and physical_fulfillment_mode is null
    )
    or (
      delivery_method = 'physical'
      and physical_fulfillment_mode is not null
      and physical_fulfillment_mode in ('print_design', 'stored_original')
    )
  ),
  constraint letters_sealed_content check (
    content_status = 'draft'
    or (
      content is null
      and sealed_at is not null
      and (
        (
          delivery_method = 'physical'
          and physical_fulfillment_mode = 'stored_original'
          and encrypted_content is null
          and content_iv is null
          and content_auth_tag is null
          and encryption_version is null
        )
        or (
          encrypted_content is not null
          and content_iv is not null
          and content_auth_tag is not null
          and encryption_version is not null
        )
      )
    )
  )
);

comment on column public.letters.delivery_at is
  'Immutable customer-promised expected arrival instant in UTC once the letter is sealed.';

comment on column public.letters.delivery_timezone is
  'IANA timezone used to interpret and display the expected arrival selection.';

comment on column public.letters.delivery_method is
  'Exclusive delivery method: digital or physical.';

comment on column public.letters.physical_fulfillment_mode is
  'Required only for physical delivery: print_design or stored_original.';

create index letters_owner_updated_idx
  on public.letters(owner_id, updated_at desc);
create index letters_delivery_idx
  on public.letters(delivery_at)
  where content_status = 'sealed';

create trigger letters_set_updated_at
  before update on public.letters
  for each row execute function public.set_updated_at();

create table public.physical_orders (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null unique
    references public.letters(id) on delete restrict,
  fulfillment_mode text not null
    check (fulfillment_mode in ('print_design', 'stored_original')),
  status text not null
    check (status in (
      'planning',
      'awaiting_intake',
      'received',
      'in_custody',
      'ready_for_production',
      'in_production',
      'quality_control',
      'ready_to_dispatch',
      'dispatched',
      'delivered',
      'failed',
      'cancelled'
    )),
  expected_arrival_at timestamptz not null,
  production_due_at timestamptz,
  dispatch_due_at timestamptz,
  address_snapshot text not null,
  carrier text,
  service_level text,
  tracking_code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint physical_orders_mode_status check (
    (
      fulfillment_mode = 'print_design'
      and status in (
        'planning',
        'ready_for_production',
        'in_production',
        'quality_control',
        'ready_to_dispatch',
        'dispatched',
        'delivered',
        'failed',
        'cancelled'
      )
    )
    or (
      fulfillment_mode = 'stored_original'
      and status in (
        'awaiting_intake',
        'received',
        'in_custody',
        'ready_to_dispatch',
        'dispatched',
        'delivered',
        'failed',
        'cancelled'
      )
    )
  ),
  constraint physical_orders_production_mode check (
    fulfillment_mode = 'print_design'
    or production_due_at is null
  ),
  constraint physical_orders_production_before_arrival check (
    production_due_at is null
    or production_due_at < expected_arrival_at
  ),
  constraint physical_orders_dispatch_before_arrival check (
    dispatch_due_at is null
    or dispatch_due_at < expected_arrival_at
  ),
  constraint physical_orders_deadline_order check (
    production_due_at is null
    or dispatch_due_at is null
    or production_due_at <= dispatch_due_at
  )
);

create index physical_orders_status_arrival_idx
  on public.physical_orders(status, expected_arrival_at);

create trigger physical_orders_set_updated_at
  before update on public.physical_orders
  for each row execute function public.set_updated_at();

create table public.scheduled_actions (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  action_type text not null
    check (action_type in (
      'deliver_email',
      'send_address_confirmation',
      'create_print_order'
    )),
  execute_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'queued', 'processing', 'completed', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 3 check (max_attempts > 0),
  next_attempt_at timestamptz,
  idempotency_key text not null unique,
  locked_at timestamptz,
  locked_by text,
  completed_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (letter_id, action_type)
);

create index scheduled_actions_due_idx
  on public.scheduled_actions(coalesce(next_attempt_at, execute_at))
  where status in ('pending', 'failed');

create trigger scheduled_actions_set_updated_at
  before update on public.scheduled_actions
  for each row execute function public.set_updated_at();

create table public.delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  letter_id uuid not null references public.letters(id) on delete cascade,
  scheduled_action_id uuid not null references public.scheduled_actions(id) on delete cascade,
  provider text not null,
  provider_message_id text,
  status text not null check (status in ('processing', 'sent', 'delivered', 'failed', 'bounced')),
  attempt_number integer not null check (attempt_number > 0),
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (scheduled_action_id, attempt_number)
);

create or replace function public.seal_letter(
  p_letter_id uuid,
  p_encrypted_content text,
  p_content_iv text,
  p_content_auth_tag text,
  p_encryption_version smallint
)
returns setof public.letters
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_letter public.letters;
  v_action_type text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into v_letter
  from public.letters
  where id = p_letter_id and owner_id = auth.uid()
  for update;

  if not found then
    raise exception 'Letter not found' using errcode = 'P0002';
  end if;

  if v_letter.content_status <> 'draft' then
    raise exception 'Only draft letters can be sealed' using errcode = 'P0001';
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

  if v_letter.delivery_at <= timezone('utc', now()) then
    raise exception 'Expected arrival time must be in the future'
      using errcode = '22007';
  end if;

  update public.letters
  set
    content = null,
    encrypted_content = p_encrypted_content,
    content_iv = p_content_iv,
    content_auth_tag = p_content_auth_tag,
    encryption_version = p_encryption_version,
    content_status = 'sealed',
    sealed_at = timezone('utc', now())
  where id = p_letter_id;

  if v_letter.delivery_method = 'digital' then
    v_action_type := 'deliver_email';

    insert into public.scheduled_actions (
      letter_id,
      action_type,
      execute_at,
      idempotency_key
    )
    values (
      p_letter_id,
      v_action_type,
      v_letter.delivery_at,
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
      v_letter.physical_fulfillment_mode,
      case
        when v_letter.physical_fulfillment_mode = 'stored_original'
          then 'awaiting_intake'
        else 'planning'
      end,
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

alter table public.profiles enable row level security;
alter table public.letters enable row level security;
alter table public.physical_orders enable row level security;
alter table public.scheduled_actions enable row level security;
alter table public.delivery_attempts enable row level security;

create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy letters_select_own
  on public.letters for select
  to authenticated
  using (owner_id = auth.uid());

create policy letters_insert_own
  on public.letters for insert
  to authenticated
  with check (owner_id = auth.uid() and content_status = 'draft');

create policy letters_update_own_draft
  on public.letters for update
  to authenticated
  using (owner_id = auth.uid() and content_status = 'draft')
  with check (owner_id = auth.uid() and content_status = 'draft');

create policy letters_delete_own_draft
  on public.letters for delete
  to authenticated
  using (owner_id = auth.uid() and content_status = 'draft');

create policy physical_orders_select_own
  on public.physical_orders for select
  to authenticated
  using (
    exists (
      select 1
      from public.letters
      where letters.id = physical_orders.letter_id
        and letters.owner_id = auth.uid()
    )
  );

create policy scheduled_actions_select_own
  on public.scheduled_actions for select
  to authenticated
  using (
    exists (
      select 1
      from public.letters
      where letters.id = scheduled_actions.letter_id
        and letters.owner_id = auth.uid()
    )
  );

create policy delivery_attempts_select_own
  on public.delivery_attempts for select
  to authenticated
  using (
    exists (
      select 1
      from public.letters
      where letters.id = delivery_attempts.letter_id
        and letters.owner_id = auth.uid()
    )
  );

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;

revoke all on table public.letters from anon, authenticated;
grant select on table public.letters to authenticated;
grant insert (
  title,
  content,
  recipient_name,
  recipient_email,
  recipient_phone,
  address,
  delivery_at,
  delivery_timezone,
  delivery_method,
  physical_fulfillment_mode,
  letter_type,
  paper,
  font,
  envelope,
  note
) on table public.letters to authenticated;
grant update (
  title,
  content,
  recipient_name,
  recipient_email,
  recipient_phone,
  address,
  delivery_at,
  delivery_timezone,
  delivery_method,
  physical_fulfillment_mode,
  letter_type,
  paper,
  font,
  envelope,
  note
) on table public.letters to authenticated;
grant delete on table public.letters to authenticated;

revoke all on table public.scheduled_actions from anon, authenticated;
grant select on table public.scheduled_actions to authenticated;

revoke all on table public.physical_orders from anon, authenticated;
grant select on table public.physical_orders to authenticated;

revoke all on table public.delivery_attempts from anon, authenticated;
grant select on table public.delivery_attempts to authenticated;

revoke all on function public.seal_letter(uuid, text, text, text, smallint) from public;
grant execute on function public.seal_letter(uuid, text, text, text, smallint) to authenticated;
