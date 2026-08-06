-- The letters table intentionally uses column-level write grants. Adding the
-- design snapshot column does not automatically make it writable through the
-- authenticated PostgREST client used by the API.
grant insert (draft_presentation) on table public.letters to authenticated;
grant update (draft_presentation) on table public.letters to authenticated;
