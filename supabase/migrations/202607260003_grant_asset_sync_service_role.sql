-- New Supabase projects no longer expose newly created public tables to the
-- Data API automatically. The built-in sync script uses a secret/service-role
-- client and needs only these catalog privileges for its upsert operation.
grant select, insert, update
  on table public.media_assets
  to service_role;
