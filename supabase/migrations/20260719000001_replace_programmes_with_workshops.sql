-- ============================================================================
-- Replace "programmes" with "workshops" — 2026-07-19
--
-- The programme concept is removed. A school's unit of enrolment is now a
-- WORKSHOP, which is the existing events table (event_type: outreach /
-- bootcamp_physical / bootcamp_webinar). A school is "enrolled in a workshop"
-- when it has an event_schools row.
--
-- Changes:
--   • programme_stages  → renamed to `lessons`, re-parented from programmes to
--     events (workshops). A lesson belongs to a workshop.
--   • lesson_completions → stage_id renamed to lesson_id, re-pointed at lessons.
--     The fcc evidence_url column and its check constraint are preserved.
--   • projects → programme link dropped; a project is now free-standing per
--     school (one per school). Enrolment is NOT required to create one.
--   • Dropped: programmes table, schools.programme_id, projects.programme_id,
--     get_school_leaderboard() and the leaderboard concept entirely.
--
-- DATA IMPACT (production): every school's programme enrolment and any
-- lesson_completions recorded against the seeded programme stages are removed
-- — those stages are being dropped, so their completions cannot be re-parented.
-- Projects survive (they only lose the programme_id column). Reviewed and
-- intended before pushing to production.
-- ============================================================================


-- ── 1. Drop the leaderboard ─────────────────────────────────────────────────
-- The security migration already dropped the school_leaderboard view; this
-- removes the RPC replacement, which joined programmes/programme_stages.
drop function if exists public.get_school_leaderboard();
drop view     if exists public.school_leaderboard;


-- ── 2. Lessons: re-parent from programmes to workshops (events) ─────────────
-- Completions reference programme_stages, which is being re-parented. The old
-- rows point at programme stages that will no longer belong to a programme;
-- clear them rather than leave dangling meaning. (Evidence links were only
-- ever demo data at this point.)
truncate table public.lesson_completions;

-- programme_stages becomes lessons, hung off a workshop instead of a programme.
alter table public.programme_stages rename to lessons;

alter table public.lessons drop constraint if exists programme_stages_programme_id_fkey;
alter table public.lessons drop constraint if exists programme_stages_programme_id_position_key;
alter index if exists public.programme_stages_pkey rename to lessons_pkey;
alter index if exists public.programme_stages_programme_pos_idx rename to lessons_event_pos_idx;

-- Re-point the parent column: programme_id → event_id (the workshop).
-- All existing rows belong to the seeded programme and have no workshop, so
-- they are removed; workshops and their lessons are created by admins.
delete from public.lessons;
alter table public.lessons rename column programme_id to event_id;
alter table public.lessons
  add constraint lessons_event_id_fkey
    foreign key (event_id) references public.events(id) on delete cascade;
alter table public.lessons
  add constraint lessons_event_id_position_key unique (event_id, position);

comment on table public.lessons is
  'Ordered learning activities belonging to a workshop (events row). '
  'Replaces programme_stages; the parent is a workshop, not a programme.';

-- Lesson RLS: a school sees lessons for workshops it is enrolled in
-- (event_schools); admins see all and are the only writers.
drop policy if exists "Read stages"          on public.lessons;
drop policy if exists "Admin writes stages"   on public.lessons;

create policy "Read lessons"
  on public.lessons for select to authenticated
  using (
    public.me_is_admin()
    or exists (
      select 1 from public.event_schools es
      where es.event_id = lessons.event_id
        and es.school_id = public.me_school_id()
    )
  );

create policy "Admin writes lessons"
  on public.lessons for all to authenticated
  using (public.me_is_admin())
  with check (public.me_is_admin());


-- ── 3. lesson_completions: re-point stage_id → lesson_id ────────────────────
alter table public.lesson_completions drop constraint if exists lesson_completions_stage_id_fkey;
alter table public.lesson_completions drop constraint if exists lesson_completions_stage_id_student_id_key;
alter index if exists public.lesson_completions_stage_idx rename to lesson_completions_lesson_idx;

alter table public.lesson_completions rename column stage_id to lesson_id;
alter table public.lesson_completions
  add constraint lesson_completions_lesson_id_fkey
    foreign key (lesson_id) references public.lessons(id) on delete cascade;
alter table public.lesson_completions
  add constraint lesson_completions_lesson_student_key unique (lesson_id, student_id);

-- evidence_url column + its http(s) check constraint are untouched and carry
-- over from 20260719000000.


-- ── 4. Projects: drop the programme link, make free-standing ────────────────
-- One project per school (was: one per school+programme). Enrolment is not
-- required — the insert policy already checks only school ownership.
alter table public.projects drop constraint if exists projects_school_id_programme_id_key;
drop index if exists public.projects_programme_idx;
alter table public.projects drop column if exists programme_id;
alter table public.projects
  add constraint projects_school_id_key unique (school_id);


-- ── 5. Drop programmes ──────────────────────────────────────────────────────
alter table public.schools drop column if exists programme_id;
drop table if exists public.programmes cascade;


notify pgrst, 'reload schema';
