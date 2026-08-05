-- Payment records and opaque checkout capabilities are backend-owned. The
-- service-role client needs explicit table privileges in addition to bypassing
-- RLS; anon and authenticated clients remain read-only or fully revoked as
-- defined by the original payment migrations.
grant select, insert, update
  on table public.orders
  to service_role;

grant select, insert, update
  on table public.payments
  to service_role;

grant select, insert
  on table public.payment_events
  to service_role;

grant select, insert, update
  on table public.mock_checkout_sessions
  to service_role;
