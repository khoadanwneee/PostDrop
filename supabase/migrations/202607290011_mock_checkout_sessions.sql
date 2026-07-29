create table public.mock_checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null unique
    references public.payments(id) on delete cascade,
  token_hash text not null unique
    check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint mock_checkout_expiry_after_creation check (
    expires_at > created_at
  )
);

create index mock_checkout_sessions_expiry_idx
  on public.mock_checkout_sessions(expires_at);

create trigger mock_checkout_sessions_set_updated_at
  before update on public.mock_checkout_sessions
  for each row execute function public.set_updated_at();

alter table public.mock_checkout_sessions enable row level security;

-- Checkout capability tokens are verified by the NestJS service-role client.
-- Browser and authenticated application roles never read session hashes.
revoke all on table public.mock_checkout_sessions from anon, authenticated;

comment on table public.mock_checkout_sessions is
  'Expiring, hashed bearer capabilities for the development-only hosted mock checkout.';
