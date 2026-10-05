-- ============================================================================
-- Disability flag on students
--
-- ChipuRobo runs an inclusive-robotics program, so the lead teacher needs
-- to mark which kids have a disability (and optionally what kind). Two
-- additive columns on club_members:
--
--   has_disability    boolean, default false
--   disability_notes  text, nullable — free-text (e.g. "Visual impairment",
--                     "Hearing impairment", "Uses a wheelchair", …)
-- ============================================================================

alter table public.club_members
  add column if not exists has_disability   boolean not null default false,
  add column if not exists disability_notes text;

comment on column public.club_members.has_disability is
  'true if the student has a disability — used by the inclusive-robotics program.';
comment on column public.club_members.disability_notes is
  'Optional free-text describing the disability (visual / hearing / physical / etc).';
