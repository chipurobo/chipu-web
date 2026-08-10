-- ============================================================================
-- A lesson carries the link to its own resource — 2026-08-10
--
-- Self-paced lessons had their URL buried in the description prose, which
-- meant a teacher had to spot it in a sentence and the UI could not render it
-- as a link. A lesson is often nothing BUT a pointer to a resource, so the
-- pointer deserves a column.
--
-- The check mirrors lesson_completions.evidence_url exactly: http(s) only.
-- These links are rendered as anchors in the dashboard, and an admin can
-- author them, so anything that is not plainly http(s) must never become an
-- href — see src/lib/safeUrl.ts for the same rule on the client.
-- ============================================================================

alter table public.lessons add column if not exists resource_url text;

alter table public.lessons drop constraint if exists lessons_resource_url_http;
alter table public.lessons add constraint lessons_resource_url_http
  check (resource_url is null or resource_url ~* '^https?://[^[:space:]]+$');

comment on column public.lessons.resource_url is
  'Where a teacher or learner goes to do this lesson — the course, project or '
  'video. http(s) only, enforced above, because it is rendered as an anchor.';

-- Lift the URL out of any description that already carries one, so existing
-- lessons gain the link without anybody retyping it.
update public.lessons
   set resource_url = (regexp_match(description, '(https?://[^[:space:]]+)'))[1]
 where resource_url is null
   and description ~* 'https?://';



-- ── School level ────────────────────────────────────────────────────────────
-- Kenyan schools run primary and secondary separately, and a teacher browsing
-- 140 lessons needs to see the ones that fit the learners in front of them.
--
-- 'both' is a real answer, not a cop-out: much of the curriculum is taught in
-- upper primary and junior secondary alike, and forcing a single choice would
-- hide lessons from half the schools that can use them.
do $$ begin
  create type public.lesson_level as enum ('primary', 'secondary', 'both');
exception when duplicate_object then null; end $$;

alter table public.lessons
  add column if not exists level public.lesson_level not null default 'both';

comment on column public.lessons.level is
  'Which school level this lesson suits: primary, secondary, or both. Set by '
  'ChipuRobo — the seeded values are a starting point derived from the source '
  'material''s own difficulty rating, not an assessment of the Kenyan '
  'curriculum, and are expected to be corrected by hand.';

-- The core ChipuRobo curriculum is taught across both levels, which is the
-- column default, so nothing to set here. Library lessons carry their own
-- level from the migration that inserts them.

do $$
declare v_linked integer; v_total integer;
begin
  select count(*) into v_total  from public.lessons;
  select count(*) into v_linked from public.lessons where resource_url is not null;
  raise notice 'lessons: %, now carrying a resource link: %', v_total, v_linked;
end $$;
