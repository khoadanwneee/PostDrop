-- Keep the complete user-owned data graph deletable from auth.users.
--
-- The root ownership foreign keys already cascade from auth.users to profiles,
-- letters, media_assets, and orders. Every child edge below must also cascade;
-- otherwise a RESTRICT edge can stop the root deletion partway through.
-- Storage objects are not covered by PostgreSQL foreign keys and must still be
-- removed through the Supabase Storage API before deleting their owner.

alter table public.physical_orders
  drop constraint if exists physical_orders_letter_id_fkey,
  add constraint physical_orders_letter_id_fkey
    foreign key (letter_id)
    references public.letters(id)
    on delete cascade;

alter table public.letter_attachments
  drop constraint if exists letter_attachments_asset_id_fkey,
  add constraint letter_attachments_asset_id_fkey
    foreign key (asset_id)
    references public.media_assets(id)
    on delete cascade;

alter table public.sealed_letter_attachments
  drop constraint if exists sealed_letter_attachments_letter_id_fkey,
  drop constraint if exists sealed_letter_attachments_letter_attachment_id_fkey,
  drop constraint if exists sealed_letter_attachments_source_asset_id_fkey,
  add constraint sealed_letter_attachments_letter_id_fkey
    foreign key (letter_id)
    references public.letters(id)
    on delete cascade,
  add constraint sealed_letter_attachments_letter_attachment_id_fkey
    foreign key (letter_attachment_id)
    references public.letter_attachments(id)
    on delete cascade,
  add constraint sealed_letter_attachments_source_asset_id_fkey
    foreign key (source_asset_id)
    references public.media_assets(id)
    on delete cascade;

alter table public.reveal_capabilities
  drop constraint if exists reveal_capabilities_letter_id_fkey,
  add constraint reveal_capabilities_letter_id_fkey
    foreign key (letter_id)
    references public.letters(id)
    on delete cascade;

alter table public.reveal_sessions
  drop constraint if exists reveal_sessions_letter_id_fkey,
  drop constraint if exists reveal_session_capability_letter_fk,
  add constraint reveal_sessions_letter_id_fkey
    foreign key (letter_id)
    references public.letters(id)
    on delete cascade,
  add constraint reveal_session_capability_letter_fk
    foreign key (capability_id, letter_id)
    references public.reveal_capabilities(id, letter_id)
    on delete cascade;

alter table public.reveal_events
  drop constraint if exists reveal_events_letter_id_fkey,
  drop constraint if exists reveal_event_capability_letter_fk,
  drop constraint if exists reveal_event_session_letter_fk,
  add constraint reveal_events_letter_id_fkey
    foreign key (letter_id)
    references public.letters(id)
    on delete cascade,
  add constraint reveal_event_capability_letter_fk
    foreign key (capability_id, letter_id)
    references public.reveal_capabilities(id, letter_id)
    on delete cascade,
  add constraint reveal_event_session_letter_fk
    foreign key (session_id, letter_id)
    references public.reveal_sessions(id, letter_id)
    on delete cascade;

alter table public.orders
  drop constraint if exists orders_letter_id_fkey,
  add constraint orders_letter_id_fkey
    foreign key (letter_id)
    references public.letters(id)
    on delete cascade;

alter table public.payments
  drop constraint if exists payments_order_id_fkey,
  add constraint payments_order_id_fkey
    foreign key (order_id)
    references public.orders(id)
    on delete cascade;

alter table public.payment_events
  drop constraint if exists payment_events_payment_id_fkey,
  add constraint payment_events_payment_id_fkey
    foreign key (payment_id)
    references public.payments(id)
    on delete cascade;
