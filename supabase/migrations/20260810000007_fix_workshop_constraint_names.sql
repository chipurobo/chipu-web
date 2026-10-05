-- ============================================================================
-- Fix the workshop foreign-key names PostgREST resolves embeds by — 2026-08-10
--
-- 20260810000005 renamed the workshops table to workshop_bookings and created a
-- new workshops table. It renamed the indexes and the check constraint but NOT
-- the foreign keys, so:
--
--   • workshop_bookings kept workshops_lesson_id_fkey, workshops_school_id_fkey,
--     workshops_requested_by_fkey, workshops_source_event_id_fkey
--   • the new workshops table's own key could not take the name it wanted and
--     was auto-suffixed to workshops_lesson_id_fkey1
--
-- PostgREST resolves embedded resources BY CONSTRAINT NAME, so every workshop
-- query was naming a key that either did not exist or belonged to the other
-- table. All three failed:
--
--   workshops     ... lessons!workshops_lesson_id_fkey          → wrong table
--   workshop_bookings ... lessons!workshop_bookings_lesson_id_fkey  → no such key
--   workshop_bookings ... schools!workshop_bookings_school_id_fkey  → no such key
--
-- The school catalogue and the admin booking queue were both dead in
-- production, showing an empty state rather than an error, because the screens
-- fell back to `data ?? []`. That fallback is fixed alongside this.
--
-- This renames only constraints. No data, no policy and no column changes.
-- ============================================================================

-- Free the name first: workshop_bookings is holding what the workshops table's
-- own key should be called.
alter table public.workshop_bookings
  rename constraint workshops_lesson_id_fkey to workshop_bookings_lesson_id_fkey;
alter table public.workshop_bookings
  rename constraint workshops_school_id_fkey to workshop_bookings_school_id_fkey;
alter table public.workshop_bookings
  rename constraint workshops_requested_by_fkey to workshop_bookings_requested_by_fkey;
alter table public.workshop_bookings
  rename constraint workshops_source_event_id_fkey to workshop_bookings_source_event_id_fkey;

-- Now the new table can take the unsuffixed name the client asks for.
alter table public.workshops
  rename constraint workshops_lesson_id_fkey1 to workshops_lesson_id_fkey;

-- PostgREST caches the schema, including which constraint names are available
-- for embedding. Without this the rename is invisible until the next restart —
-- the same reason the older migrations in this repo end with it.
notify pgrst, 'reload schema';
