-- =============================================================
-- 20260601000026_inclusive_robotics_extra_activities.sql
--
-- Adds the two activities that were missing from the original seed:
--   • Outreach          (position 0, sorts before bootcamps)
--   • Bootcamp (Virtual) (position 6, after the physical bootcamp)
-- Also renames the existing "Bootcamp" → "Bootcamp (Physical)" so the
-- pair reads consistently.
--
-- Idempotent. Safe to re-run.
-- =============================================================

-- Rename the original bootcamp row to "Bootcamp (Physical)"
update public.programme_stages
   set title = 'Bootcamp (Physical)'
 where programme_id = (select id from public.programmes where slug = 'inclusive-robotics')
   and title = 'Bootcamp';

-- Insert Outreach at position 0 (sorts first by ORDER BY position).
-- ON CONFLICT keeps the migration idempotent.
with p as (
  select id from public.programmes where slug = 'inclusive-robotics'
)
insert into public.programme_stages
  (programme_id, position, title, kind, points, required_for_certificate)
select id, 0, 'Outreach', 'outreach'::public.stage_kind, 1, true from p
on conflict (programme_id, position) do nothing;

-- Insert Bootcamp (Virtual) at position 6.
with p as (
  select id from public.programmes where slug = 'inclusive-robotics'
)
insert into public.programme_stages
  (programme_id, position, title, kind, points, required_for_certificate)
select id, 6, 'Bootcamp (Virtual)', 'bootcamp_virtual'::public.stage_kind, 1, true from p
on conflict (programme_id, position) do nothing;

notify pgrst, 'reload schema';
