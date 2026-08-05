-- Allow authenticated letter owners to update contact and delivery metadata on sealed letters
drop policy if exists letters_update_own_draft on public.letters;
drop policy if exists letters_update_own on public.letters;

create policy letters_update_own
  on public.letters for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
