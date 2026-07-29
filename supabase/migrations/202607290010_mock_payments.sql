create table public.orders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  letter_id uuid not null unique references public.letters(id) on delete restrict,
  product_code text not null
    check (product_code in ('digital_letter', 'printed_letter', 'stored_original')),
  pricing_version text not null,
  amount integer not null check (amount > 0),
  currency text not null check (currency = 'VND'),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  paid_at timestamptz,
  cancelled_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint orders_status_timestamps check (
    (status <> 'paid' or paid_at is not null)
    and (status <> 'cancelled' or cancelled_at is not null)
    and (status <> 'refunded' or refunded_at is not null)
  )
);

create index orders_owner_created_idx
  on public.orders(owner_id, created_at desc);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider text not null check (provider in ('mock', 'payos')),
  provider_payment_id text not null,
  amount integer not null check (amount > 0),
  currency text not null check (currency = 'VND'),
  status text not null default 'pending'
    check (status in ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  failure_code text,
  succeeded_at timestamptz,
  cancelled_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (provider, provider_payment_id),
  constraint payments_status_timestamps check (
    (status <> 'succeeded' or succeeded_at is not null)
    and (status <> 'cancelled' or cancelled_at is not null)
    and (status <> 'refunded' or refunded_at is not null)
  )
);

create index payments_order_created_idx
  on public.payments(order_id, created_at desc);

create unique index payments_one_pending_attempt_idx
  on public.payments(order_id)
  where status = 'pending';

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete restrict,
  provider text not null,
  provider_event_id text not null,
  event_type text not null
    check (event_type in (
      'payment.succeeded',
      'payment.failed',
      'payment.cancelled',
      'payment.refunded'
    )),
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique (provider, provider_event_id)
);

create index payment_events_payment_created_idx
  on public.payment_events(payment_id, created_at desc);

alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;

create policy orders_select_own
  on public.orders for select
  to authenticated
  using (owner_id = auth.uid());

create policy payments_select_own
  on public.payments for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders
      where orders.id = payments.order_id
        and orders.owner_id = auth.uid()
    )
  );

create policy payment_events_select_own
  on public.payment_events for select
  to authenticated
  using (
    exists (
      select 1
      from public.payments
      join public.orders on orders.id = payments.order_id
      where payments.id = payment_events.payment_id
        and orders.owner_id = auth.uid()
    )
  );

revoke all on table public.orders from anon, authenticated;
grant select on table public.orders to authenticated;

revoke all on table public.payments from anon, authenticated;
grant select on table public.payments to authenticated;

revoke all on table public.payment_events from anon, authenticated;
grant select on table public.payment_events to authenticated;

comment on table public.orders is
  'Authoritative server-priced purchase intent. A letter may have only one order.';
comment on table public.payments is
  'Provider payment attempts. Application roles may read but only the backend service role writes.';
comment on table public.payment_events is
  'Deduplicated provider events used to drive payment state transitions.';

create or replace function public.apply_mock_payment_event(
  p_owner_id uuid,
  p_payment_id uuid,
  p_provider_event_id text,
  p_provider_payment_id text,
  p_event_type text,
  p_order_id uuid,
  p_amount integer,
  p_currency text,
  p_occurred_at timestamptz,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments;
  v_order public.orders;
  v_next_payment_status text;
  v_next_order_status text;
begin
  select *
  into v_payment
  from public.payments
  where id = p_payment_id
  for update;

  if not found then
    raise exception 'Payment not found' using errcode = 'P0002';
  end if;

  select *
  into v_order
  from public.orders
  where id = v_payment.order_id
    and owner_id = p_owner_id
  for update;

  if not found then
    raise exception 'Payment not found' using errcode = 'P0002';
  end if;

  if v_payment.provider <> 'mock'
    or v_payment.provider_payment_id <> p_provider_payment_id
    or v_order.id <> p_order_id
    or v_payment.amount <> p_amount
    or v_order.amount <> p_amount
    or v_payment.currency <> p_currency
    or v_order.currency <> p_currency
  then
    raise exception 'Payment event does not match the authoritative order'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.payment_events
    where provider = 'mock'
      and provider_event_id = p_provider_event_id
  ) then
    return jsonb_build_object(
      'order', to_jsonb(v_order),
      'payment', to_jsonb(v_payment)
    );
  end if;

  case p_event_type
    when 'payment.succeeded' then
      v_next_payment_status := 'succeeded';
      v_next_order_status := 'paid';
    when 'payment.failed' then
      v_next_payment_status := 'failed';
      v_next_order_status := 'failed';
    when 'payment.cancelled' then
      v_next_payment_status := 'cancelled';
      v_next_order_status := 'cancelled';
    when 'payment.refunded' then
      v_next_payment_status := 'refunded';
      v_next_order_status := 'refunded';
    else
      raise exception 'Unsupported payment event' using errcode = '23514';
  end case;

  if p_event_type = 'payment.refunded' then
    if v_payment.status <> 'succeeded' or v_order.status <> 'paid' then
      raise exception 'Only a successful payment can be refunded'
        using errcode = 'P0001';
    end if;
  elsif v_payment.status <> 'pending' or v_order.status <> 'pending' then
    raise exception 'Payment is not pending' using errcode = 'P0001';
  end if;

  insert into public.payment_events (
    payment_id,
    provider,
    provider_event_id,
    event_type,
    payload,
    processed_at
  )
  values (
    v_payment.id,
    'mock',
    p_provider_event_id,
    p_event_type,
    coalesce(p_payload, '{}'::jsonb),
    p_occurred_at
  );

  update public.payments
  set
    status = v_next_payment_status,
    failure_code = case
      when v_next_payment_status = 'failed' then 'mock_payment_failed'
      else null
    end,
    succeeded_at = case
      when v_next_payment_status = 'succeeded' then p_occurred_at
      else succeeded_at
    end,
    cancelled_at = case
      when v_next_payment_status = 'cancelled' then p_occurred_at
      else cancelled_at
    end,
    refunded_at = case
      when v_next_payment_status = 'refunded' then p_occurred_at
      else refunded_at
    end
  where id = v_payment.id
  returning * into v_payment;

  update public.orders
  set
    status = v_next_order_status,
    paid_at = case
      when v_next_order_status = 'paid' then p_occurred_at
      else paid_at
    end,
    cancelled_at = case
      when v_next_order_status = 'cancelled' then p_occurred_at
      else cancelled_at
    end,
    refunded_at = case
      when v_next_order_status = 'refunded' then p_occurred_at
      else refunded_at
    end
  where id = v_order.id
  returning * into v_order;

  return jsonb_build_object(
    'order', to_jsonb(v_order),
    'payment', to_jsonb(v_payment)
  );
end;
$$;

revoke all on function public.apply_mock_payment_event(
  uuid,
  uuid,
  text,
  text,
  text,
  uuid,
  integer,
  text,
  timestamptz,
  jsonb
) from public;
grant execute on function public.apply_mock_payment_event(
  uuid,
  uuid,
  text,
  text,
  text,
  uuid,
  integer,
  text,
  timestamptz,
  jsonb
) to service_role;
