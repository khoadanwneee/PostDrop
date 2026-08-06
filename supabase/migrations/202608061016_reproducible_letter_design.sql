-- Persist the normalized editor canvas while a letter is a draft, then freeze
-- that versioned snapshot into the immutable reveal presentation at sealing.
alter table public.letters
  add column if not exists draft_presentation jsonb;

alter table public.letters
  add constraint letters_draft_presentation_check
  check (
    draft_presentation is null
    or (
      jsonb_typeof(draft_presentation) = 'object'
      and draft_presentation ->> 'schemaVersion' = '1'
      and octet_length(draft_presentation::text) <= 2097152
    )
  );

comment on column public.letters.draft_presentation is
  'Versioned normalized editor snapshot. Copied into sealed_presentation and made immutable when the letter is sealed.';

create or replace function public.capture_sealed_presentation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.content_status = 'draft'
    and new.content_status = 'sealed'
    and not (
      old.delivery_method = 'physical'
      and old.physical_fulfillment_mode = 'stored_original'
    )
  then
    new.renderer_version := 2;
    new.sealed_presentation := jsonb_build_object(
      'title', old.title,
      'recipientName', old.recipient_name,
      'letterType', old.letter_type,
      'paper', old.paper,
      'font', old.font,
      'envelope', old.envelope,
      'note', old.note,
      'designSnapshot', old.draft_presentation
    );
  elsif old.content_status = 'sealed'
    and (
      new.renderer_version is distinct from old.renderer_version
      or new.sealed_presentation is distinct from old.sealed_presentation
      or new.draft_presentation is distinct from old.draft_presentation
    )
  then
    raise exception 'Sealed presentation is immutable' using errcode = 'P0001';
  end if;

  return new;
end;
$$;
