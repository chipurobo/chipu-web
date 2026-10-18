-- Accessible lesson media for hearing-impaired learners.
-- A media item cannot be published without a written equivalent. Videos also
-- require a WebVTT captions file; audio requires written instructions.

alter table public.lessons
  add column if not exists media_type text,
  add column if not exists media_url text,
  add column if not exists captions_url text,
  add column if not exists media_transcript text,
  add column if not exists media_instructions text;

alter table public.lessons drop constraint if exists lessons_media_type_valid;
alter table public.lessons add constraint lessons_media_type_valid
  check (media_type is null or media_type in ('video', 'audio'));

alter table public.lessons drop constraint if exists lessons_media_url_http;
alter table public.lessons add constraint lessons_media_url_http
  check (media_url is null or media_url ~* '^https?://[^[:space:]]+$');

alter table public.lessons drop constraint if exists lessons_captions_url_http;
alter table public.lessons add constraint lessons_captions_url_http
  check (captions_url is null or captions_url ~* '^https?://[^[:space:]]+$');

alter table public.lessons drop constraint if exists lessons_media_accessible;
alter table public.lessons add constraint lessons_media_accessible check (
  media_url is null
  or (
    media_type is not null
    and length(btrim(coalesce(media_transcript, ''))) > 0
    and length(btrim(coalesce(media_instructions, ''))) > 0
    and (media_type <> 'video' or captions_url is not null)
  )
);

comment on column public.lessons.media_url is
  'Direct http(s) URL for optional lesson audio/video. Publishing media requires a written equivalent.';
comment on column public.lessons.captions_url is
  'WebVTT captions for video media. Required whenever media_type is video.';
comment on column public.lessons.media_transcript is
  'Full written transcript of the lesson media, required for audio and video.';
comment on column public.lessons.media_instructions is
  'Written version of any instruction or task communicated through lesson media.';

notify pgrst, 'reload schema';
