-- Public buckets already allow object downloads through public URLs. A broad
-- SELECT policy is unnecessary and also permits clients to enumerate every
-- object through the Storage list API. Built-in discovery goes through the
-- public.media_assets catalog instead.
drop policy if exists built_in_assets_public_read on storage.objects;
