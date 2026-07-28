-- Permissions for trusted backend processes that use a Supabase
-- secret/service-role key, including the future scheduled-action dispatcher and
-- delivery worker. RLS bypass does not replace PostgreSQL table privileges.
--
-- Keep these grants explicit. Future tables (outbox_events, webhook_events,
-- physical_shipments, and so on) must grant only the privileges required by
-- their worker in the same migration that creates them.

-- Resolve the owning user when sending operational notifications.
grant select
  on table public.profiles
  to service_role;

-- Read encrypted payloads. Content immutability is separate from fulfillment
-- lifecycle state.
grant select, update
  on table public.letters
  to service_role;

-- Fulfillment workers plan, dispatch, and reconcile physical orders without
-- changing the sealed letter content state.
grant select, insert, update
  on table public.physical_orders
  to service_role;

-- Read both built-in and user media. Insert/update support is also required by
-- the built-in sync and future sealed-asset metadata workflows. Delete supports
-- explicit retention/cleanup jobs.
grant select, insert, update, delete
  on table public.media_assets
  to service_role;

-- Sealed attachments are read by render/delivery workers, but workers do not
-- edit the customer's letter composition.
grant select
  on table public.letter_attachments
  to service_role;

-- Dispatchers claim actions and workers record retries and completion.
grant select, insert, update
  on table public.scheduled_actions
  to service_role;

-- Delivery workers create attempts and update provider outcomes.
grant select, insert, update
  on table public.delivery_attempts
  to service_role;
