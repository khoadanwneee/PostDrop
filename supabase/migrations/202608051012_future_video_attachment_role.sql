-- Allow a letter to carry one "future video" attachment: the video the
-- author records when composing the letter, to be watched by the recipient
-- (alongside their own reply, merged client-side) once the letter is
-- revealed. This rides entirely on the existing media_assets/letter_attachments
-- seal + reveal pipeline; the only new behaviour is the role value itself,
-- a one-per-letter guarantee, no placement fields, and a guard that it can
-- only ever point at a video asset.

alter table public.letter_attachments
  drop constraint letter_attachments_role_check;

alter table public.letter_attachments
  add constraint letter_attachments_role_check
  check (role in ('decoration', 'inline', 'attachment', 'future_video'));

alter table public.letter_attachments
  add constraint letter_attachments_future_video_no_placement check (
    role <> 'future_video'
    or (
      x_percent is null
      and y_percent is null
      and scale is null
      and rotation is null
    )
  );

create unique index letter_attachments_future_video_idx
  on public.letter_attachments (letter_id)
  where role = 'future_video';

create or replace function public.enforce_future_video_asset_kind()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_kind text;
begin
  if new.role = 'future_video' then
    select kind into v_kind from public.media_assets where id = new.asset_id;
    if v_kind is distinct from 'video' then
      raise exception 'future_video attachments must reference a video asset'
        using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create trigger letter_attachments_future_video_kind_guard
  before insert or update on public.letter_attachments
  for each row execute function public.enforce_future_video_asset_kind();
