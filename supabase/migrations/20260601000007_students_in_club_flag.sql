-- ============================================================================
-- Broaden club_members → school students
--
-- A school's durable units (robots, kits) can be held by ANY student at the
-- school, not just kids enrolled in the code club. We don't want to bifurcate
-- into two tables (students + club_members) — instead, the existing
-- club_members table becomes the canonical "people at this school we can
-- assign equipment to", with an `in_club` flag distinguishing roster
-- members from other students.
--
-- Existing rows keep their original meaning (default true). When a school
-- lead assigns a unit to a non-club student, they add them with in_club=false.
-- ============================================================================

alter table public.club_members
  add column if not exists in_club boolean not null default true;

create index if not exists club_members_in_club_idx
  on public.club_members (school_id, in_club);

comment on table  public.club_members
  is 'People at the school we can assign equipment to (in_club=true → roster of the code club; in_club=false → other students).';
comment on column public.club_members.in_club
  is 'true → counts toward the code-club roster. false → student at the school who can still hold equipment.';
