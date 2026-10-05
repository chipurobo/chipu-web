-- ============================================================================
-- MERL phase 1 — participant codes, sessions and attendance — 2026-08-10
--
-- Implements the operational half of the MERL toolkit (03_MERL_Plan,
-- 09_Weekly_Monitoring_Form, 10_Attendance_Registers). These are relational
-- tables rather than generic form responses because the Indicator Matrix
-- aggregates over them and they are the highest-volume records in the system.
--
-- What the source documents require that the schema could not previously do:
--
--   • PARTICIPANT CODES. The MERL Plan §4 requires "a non-identifying code for
--     analysis" with the identity key held separately, and the register says
--     to use "a participant code or approved ID rather than full names in
--     shared reports". Neither teachers nor learners had one. Codes are drawn
--     from a sequence and deliberately encode nothing — no school prefix, no
--     initials — because a code that leaks the school is not non-identifying.
--
--   • EXPLICIT ABSENCE. event_attendances records only attendance: a row means
--     present, and there is no way to say "absent". The register is a P/A tick
--     per participant, and absence is the signal that matters for the
--     continuity indicator, so `present` is a boolean, not row existence.
--
--   • TEACHERS AS PARTICIPANTS. event_attendances.student_id is NOT NULL
--     against club_members, so a teacher attending their own training could
--     not be recorded at all — which blocked the Tier 2 training indicators
--     outright. Attendance here takes either a learner or a teacher.
--
--   • NON-DELIVERY AS A POSITIVE FACT. Previously a lesson taught where nobody
--     passed wrote no rows, and was indistinguishable from a lesson never
--     held. Those mean opposite things for "where support is needed". The
--     weekly form asks "Planned session delivered? Yes / Partly / No" with a
--     reason, so that is stored explicitly.
--
-- Deliberately NOT here: indicator values, targets and scoring rules. Every
-- target in 04_Indicator_Matrix is blank pending approval, so this migration
-- stores raw facts only and leaves computation to a later, configurable layer.
-- ============================================================================


-- ── 1. RLS helpers ──────────────────────────────────────────────────────────
-- Existing policies inline `(select school_id from profiles where id =
-- auth.uid())` in every clause. This migration adds eight tables; repeating
-- that subquery four times each is where a scoping bug eventually hides. These
-- return only facts about the CALLER (derived from auth.uid()), so they leak
-- nothing a user could not already read from their own profile row.
create or replace function public.auth_school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$ select school_id from public.profiles where id = auth.uid() $$;

create or replace function public.auth_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

revoke execute on function public.auth_school_id() from public, anon;
revoke execute on function public.auth_is_admin() from public, anon;
grant  execute on function public.auth_school_id() to authenticated;
grant  execute on function public.auth_is_admin()  to authenticated;


-- ── 2. Participant codes ────────────────────────────────────────────────────
-- Sequence-backed rather than computed from a count. Migrations 19, 21 and 23
-- exist because counting existing rows to build an identifier collides under
-- concurrency; a sequence cannot.
create sequence if not exists public.learner_code_seq;
create sequence if not exists public.teacher_code_seq;

alter table public.club_members add column if not exists learner_code text;
alter table public.profiles     add column if not exists teacher_code text;

create or replace function public.assign_learner_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.learner_code is null then
    new.learner_code := 'LRN-' || lpad(nextval('public.learner_code_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create or replace function public.assign_teacher_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Admin accounts are ChipuRobo staff, not programme respondents, so they are
  -- not issued a teacher code. The clear-on-promotion branch is load-bearing:
  -- handle_new_auth_user() inserts every profile at the column default
  -- ('school_lead') and create_admin_user() promotes it in a second statement,
  -- so without it every admin would be issued a code it should never hold.
  -- Dropping the code on promotion is safe because responses reference
  -- teacher_id, not the code — nothing dangles.
  if new.role = 'admin' then
    new.teacher_code := null;
  elsif new.teacher_code is null and new.role = 'school_lead' then
    new.teacher_code := 'TCH-' || lpad(nextval('public.teacher_code_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists club_members_assign_learner_code on public.club_members;
create trigger club_members_assign_learner_code
  before insert on public.club_members
  for each row execute function public.assign_learner_code();

drop trigger if exists profiles_assign_teacher_code on public.profiles;
create trigger profiles_assign_teacher_code
  before insert or update of role on public.profiles
  for each row execute function public.assign_teacher_code();

-- Backfill anything that predates the trigger.
update public.club_members
   set learner_code = 'LRN-' || lpad(nextval('public.learner_code_seq')::text, 6, '0')
 where learner_code is null;

update public.profiles
   set teacher_code = 'TCH-' || lpad(nextval('public.teacher_code_seq')::text, 6, '0')
 where teacher_code is null and role = 'school_lead';

create unique index if not exists club_members_learner_code_key on public.club_members (learner_code);
create unique index if not exists profiles_teacher_code_key     on public.profiles (teacher_code);


-- ── 3. Sessions ─────────────────────────────────────────────────────────────
-- One row per delivered (or attempted) activity. This is 09_Weekly_Monitoring
-- sections A–C plus the register header from 10_Attendance_Registers §A, which
-- describe the same event from two directions.
do $$ begin
  create type public.session_activity as enum (
    'weekly_code_club', 'teacher_support', 'bootcamp', 'hackathon', 'webinar', 'other'
  );
exception when duplicate_object then null; end $$;

-- "Yes / Partly / No" recurs across the weekly form and the visit checklist.
do $$ begin
  create type public.ypn_status as enum ('yes', 'partly', 'no');
exception when duplicate_object then null; end $$;

create table if not exists public.sessions (
  id                uuid primary key default gen_random_uuid(),
  school_id         uuid not null references public.schools(id) on delete cascade,
  activity_type     public.session_activity not null,
  activity_other    text,                       -- when activity_type = 'other'
  session_date      date not null,
  week_ending       date,
  -- Optional link to the curriculum. A club session usually works through a
  -- lesson the ChipuRobo admin authored; teacher-support and webinar sessions
  -- have no lesson.
  lesson_id         uuid references public.lessons(id) on delete set null,
  -- Free text because facilitators are not always platform account holders.
  facilitators      text,

  delivered         public.ypn_status not null,
  delivery_note     text,                       -- required by the form when not 'yes'

  -- Weekly form section C. Narrative evidence, kept as prose because the
  -- indicator definitions that would structure it are still unapproved.
  focus             text,
  learner_activity  text,
  evidence_observed text,
  inclusion_supports text,
  resources_adequate public.ypn_status,
  resources_note    text,
  notable_pattern   text,                       -- "notable attendance pattern or barrier"

  -- Entered rather than derived: the Indicator Matrix leaves the unique-
  -- participant rule blank, so "new" cannot yet be computed reliably.
  new_participants  integer check (new_participants is null or new_participants >= 0),

  recorded_by       uuid references public.profiles(id) on delete set null,
  recorded_at       timestamptz not null default now(),
  reviewed_by       uuid references public.profiles(id) on delete set null,
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now(),

  constraint sessions_delivery_note_when_not_full
    check (delivered = 'yes' or delivery_note is not null)
);

create index if not exists sessions_school_date_idx on public.sessions (school_id, session_date desc);
create index if not exists sessions_lesson_idx      on public.sessions (lesson_id);


-- ── 4. Attendance ───────────────────────────────────────────────────────────
create table if not exists public.session_attendance (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.sessions(id) on delete cascade,
  learner_id   uuid references public.club_members(id) on delete cascade,
  teacher_id   uuid references public.profiles(id) on delete cascade,
  present      boolean not null,
  -- 10_Attendance_Registers offers an optional "participation support / note".
  -- The MERL Plan §4 and the learner tool both forbid diagnoses or case detail
  -- here; this is for agreed accommodations only.
  support_note text,
  created_at   timestamptz not null default now(),

  constraint session_attendance_one_participant
    check ((learner_id is not null)::int + (teacher_id is not null)::int = 1)
);

create unique index if not exists session_attendance_learner_key
  on public.session_attendance (session_id, learner_id) where learner_id is not null;
create unique index if not exists session_attendance_teacher_key
  on public.session_attendance (session_id, teacher_id) where teacher_id is not null;
create index if not exists session_attendance_session_idx on public.session_attendance (session_id);


-- ── 5. RLS ──────────────────────────────────────────────────────────────────
alter table public.sessions           enable row level security;
alter table public.session_attendance enable row level security;

drop policy if exists sessions_select on public.sessions;
create policy sessions_select on public.sessions for select to authenticated
  using (school_id = public.auth_school_id() or public.auth_is_admin());

drop policy if exists sessions_insert on public.sessions;
create policy sessions_insert on public.sessions for insert to authenticated
  with check (school_id = public.auth_school_id() or public.auth_is_admin());

drop policy if exists sessions_update on public.sessions;
create policy sessions_update on public.sessions for update to authenticated
  using      (school_id = public.auth_school_id() or public.auth_is_admin())
  with check (school_id = public.auth_school_id() or public.auth_is_admin());

drop policy if exists sessions_delete on public.sessions;
create policy sessions_delete on public.sessions for delete to authenticated
  using (school_id = public.auth_school_id() or public.auth_is_admin());

-- Attendance inherits its scope from the parent session, so a school lead can
-- never write a register row against another school's session.
drop policy if exists session_attendance_select on public.session_attendance;
create policy session_attendance_select on public.session_attendance for select to authenticated
  using (exists (
    select 1 from public.sessions s
     where s.id = session_attendance.session_id
       and (s.school_id = public.auth_school_id() or public.auth_is_admin())
  ));

drop policy if exists session_attendance_write on public.session_attendance;
create policy session_attendance_write on public.session_attendance for all to authenticated
  using (exists (
    select 1 from public.sessions s
     where s.id = session_attendance.session_id
       and (s.school_id = public.auth_school_id() or public.auth_is_admin())
  ))
  with check (exists (
    select 1 from public.sessions s
     where s.id = session_attendance.session_id
       and (s.school_id = public.auth_school_id() or public.auth_is_admin())
  ));


-- ── 6. Grants ───────────────────────────────────────────────────────────────
-- 20260724000000 granted DML on the tables that existed then; new tables need
-- it explicitly or every policy above is unreachable. anon gets nothing.
grant select, insert, update, delete on public.sessions           to authenticated, service_role;
grant select, insert, update, delete on public.session_attendance to authenticated, service_role;
