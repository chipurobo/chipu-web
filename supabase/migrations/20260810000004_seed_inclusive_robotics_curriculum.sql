-- ============================================================================
-- Seed the teachable curriculum — 2026-08-10
--
-- Production has exactly one lesson ("Introduction to Python"). The rest was
-- lost in 20260719000001, which replaced programmes with workshops: stages
-- were re-parented to events and anything without a surviving event went with
-- the programmes table. Its header flagged the data impact and it was intended
-- at the time, but the curriculum was never re-seeded.
--
-- WHAT IS AND IS NOT A LESSON
--
-- The old programme_stages list conflated three different things:
--
--   Outreach, Bootcamp (Physical), Bootcamp (Virtual)
--       → not lessons. Outreach is an EVENT; a bootcamp is training delivered
--         on a lesson, which is now a WORKSHOP with mode physical/virtual.
--   Project
--       → not a lesson. That is the competition entry, and it already has its
--         own model: projects + project_judgments, draft → submitted → judged.
--   Hardware & Electronics, Coding with Python, AI Basics
--       → genuinely teachable content. These are the lessons.
--
-- Seeding all seven as lessons would rebuild exactly the conflation that made
-- workshops look like containers of lessons, so only the teachable ones are
-- inserted here. Their titles, kinds, points and certificate flags are the
-- originals from 20260601000024.
--
-- event_id is null: a lesson is curriculum and is not owned by an event. A
-- school requests a workshop against one (see public.workshops).
--
-- NO WORKSHOP ROWS ARE CREATED. A workshop is a REQUEST from a specific
-- school; inventing one per lesson per school would put 100+ requests nobody
-- made into the very tables the Indicator Matrix counts. Every lesson being
-- requestable is what ties a workshop to it — the request itself stays real.
--
-- Idempotent: matched on title, so re-running adds nothing.
-- ============================================================================

-- ── 1. Teachable curriculum ─────────────────────────────────────────────────
insert into public.lessons
  (event_id, position, title, description, kind, points, required_for_certificate, is_active)
select null, v.position, v.title, v.description, v.kind, v.points, v.required, true
from (values
  (1, 'Hardware & Electronics',
   'Components, circuits and assembly. Learners build and wire the robot chassis and sensors.',
   'lesson'::public.stage_kind, 1, true),
  (2, 'Coding with Python',
   'Programming the robot: control flow, sensors and motors, and debugging what the hardware actually does.',
   'lesson'::public.stage_kind, 1, true),
  (3, 'AI Basics',
   'Introductory AI concepts applied to the robot — object detection, classification, and where the technology helps or fails.',
   'lesson'::public.stage_kind, 1, true)
) as v(position, title, description, kind, points, required)
where not exists (
  select 1 from public.lessons l where l.title = v.title
);


-- ── 2. Self-paced track ─────────────────────────────────────────────────────
-- Companion to the existing "Introduction to Python". Completion evidence is a
-- verification URL (lesson_completions.evidence_url, added 20260719000000).
insert into public.lessons
  (event_id, position, title, description, kind, points, required_for_certificate, is_active)
select null, 4, 'Introduction to Git and GitHub',
       'Self-paced: freeCodeCamp — https://www.freecodecamp.org/learn/introduction-to-git-and-github/',
       'async_track'::public.stage_kind, 2, false, true
where not exists (
  select 1 from public.lessons l where l.title = 'Introduction to Git and GitHub'
);


-- ── 3. Stop the existing lesson colliding at position 1 ─────────────────────
-- "Introduction to Python" sits at position 1 under the event it was created
-- in. Curriculum lessons carry event_id = null, and Postgres treats nulls as
-- distinct in the unique (event_id, position) index, so the two can share a
-- number and the admin list would show two position-1 rows in arbitrary order.
update public.lessons
   set position = 5
 where title = 'Introduction to Python'
   and position = 1;


-- ── 4. Report ───────────────────────────────────────────────────────────────
do $$
declare v_total integer; v_curriculum integer;
begin
  select count(*) into v_total from public.lessons;
  select count(*) into v_curriculum from public.lessons where event_id is null;
  raise notice 'lessons now: % total, % standalone curriculum', v_total, v_curriculum;
end $$;
