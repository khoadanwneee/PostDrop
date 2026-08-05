-- Administrative cleanup deletes only the user-owned root letter rows. The
-- dependency graph is removed by the foreign-key cascades from migration 012.
grant delete on table public.letters to service_role;
