-- ============================================================================
-- Workshops are predefined and bookable; a school's click is a booking
-- 2026-08-10
--
-- 20260810000003 modelled a workshop AS the request. That made every lesson
-- un-bookable until somebody typed a request from scratch, and left "all
-- lessons should have a workshop tied to it" impossible to satisfy without
-- fabricating requests no school had made.
--
-- The working model is two things, not one:
--
--   WORKSHOP        Predefined by ChipuRobo and tied to a lesson. One per
--                   lesson, created automatically, saying "training on this
--                   lesson can be booked, in these modes". Not a request, so
--                   it counts towards nothing in the Indicator Matrix.
--   WORKSHOP BOOKING A school or teacher clicking "request training" against
--                   a workshop, choosing in-person or online. This is the real
--                   event with a lifecycle: requested → scheduled → delivered.
--
-- So the table added in 20260810000003 is renamed to workshop_bookings — it
-- always held bookings — and `workshops` is rebuilt as the bookable catalogue.
-- Nothing is dropped: the six rows migrated from bootcamp events are carried
-- across intact, keeping their source_event_id provenance.
-- ============================================================================


-- ── 1. What was called a workshop was always a booking ──────────────────────
alter table if exists public.workshops rename to workshop_bookings;

-- Constraint and index names follow the old noun; rename them so the schema
-- does not describe itself wrongly to the next person reading it.
alter index if exists workshops_school_status_idx rename to workshop_bookings_school_status_idx;
alter index if exists workshops_lesson_idx        rename to workshop_bookings_lesson_idx;
alter index if exists workshops_source_event_idx  rename to workshop_bookings_source_event_idx;
alter table public.workshop_bookings
  rename constraint workshops_delivered_has_timestamp to workshop_bookings_delivered_has_timestamp;

drop policy if exists workshops_select on public.workshop_bookings;
drop policy if exists workshops_insert on public.workshop_bookings;
drop policy if exists workshops_update on public.workshop_bookings;
drop policy if exists workshops_delete on public.workshop_bookings;

create policy workshop_bookings_select on public.workshop_bookings for select to authenticated
  using (school_id = public.me_school_id() or public.me_is_admin());
create policy workshop_bookings_insert on public.workshop_bookings for insert to authenticated
  with check (school_id = public.me_school_id() or public.me_is_admin());
create policy workshop_bookings_update on public.workshop_bookings for update to authenticated
  using      (school_id = public.me_school_id() or public.me_is_admin())
  with check (school_id = public.me_school_id() or public.me_is_admin());
create policy workshop_bookings_delete on public.workshop_bookings for delete to authenticated
  using (public.me_is_admin());

grant select, insert, update, delete on public.workshop_bookings to authenticated, service_role;

-- The triggers followed the table through the rename; give them names that
-- match what they now guard.
alter trigger workshops_touch_trg        on public.workshop_bookings rename to workshop_bookings_touch_trg;
alter trigger workshops_guard_status_trg on public.workshop_bookings rename to workshop_bookings_guard_status_trg;


-- ── 2. Workshops: the bookable catalogue ────────────────────────────────────
-- One per lesson. lesson_id is UNIQUE and NOT NULL, which is what makes
-- "every lesson has a workshop tied to it" a database guarantee rather than a
-- convention somebody has to remember.
create table if not exists public.workshops (
  id              uuid primary key default gen_random_uuid(),
  lesson_id       uuid not null unique references public.lessons(id) on delete cascade,

  -- Optional overrides. Null means "use the lesson's own title/description",
  -- so an admin never has to retype the curriculum to make it bookable.
  title           text,
  description     text,

  allows_physical boolean not null default true,
  allows_virtual  boolean not null default true,
  -- Lets ChipuRobo withdraw a workshop from booking without retiring the
  -- lesson itself, which stays readable curriculum.
  is_active       boolean not null default true,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint workshops_at_least_one_mode
    check (allows_physical or allows_virtual)
);

create index if not exists workshops_active_idx on public.workshops (is_active);

create or replace function public.workshops_touch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists workshops_touch_trg on public.workshops;
create trigger workshops_touch_trg
  before update on public.workshops
  for each row execute function public.workshops_touch();


-- ── 3. Every lesson gets one, now and in future ─────────────────────────────
insert into public.workshops (lesson_id)
select l.id from public.lessons l
where not exists (select 1 from public.workshops w where w.lesson_id = l.id);

-- Without this, a lesson authored tomorrow would silently not be bookable and
-- the gap would only surface when a teacher went looking for it.
create or replace function public.lessons_ensure_workshop()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workshops (lesson_id)
  values (new.id)
  on conflict (lesson_id) do nothing;
  return new;
end;
$$;

drop trigger if exists lessons_ensure_workshop_trg on public.lessons;
create trigger lessons_ensure_workshop_trg
  after insert on public.lessons
  for each row execute function public.lessons_ensure_workshop();


-- ── 4. Point existing bookings at their workshop ────────────────────────────
alter table public.workshop_bookings
  add column if not exists workshop_id uuid references public.workshops(id) on delete set null;

update public.workshop_bookings b
   set workshop_id = w.id
  from public.workshops w
 where w.lesson_id = b.lesson_id
   and b.workshop_id is null;

create index if not exists workshop_bookings_workshop_idx
  on public.workshop_bookings (workshop_id);

-- workshop_id stays nullable: the bookings migrated out of bootcamp events
-- where the source taught zero or several lessons have no lesson, so they have
-- no workshop either. Requiring it would mean either dropping that history or
-- inventing a link for it.


-- ── 5. RLS for the catalogue ────────────────────────────────────────────────
-- Readable by any signed-in user — a teacher cannot book what they cannot see.
-- Only ChipuRobo curates it.
alter table public.workshops enable row level security;

drop policy if exists workshops_read on public.workshops;
create policy workshops_read on public.workshops for select to authenticated
  using (is_active or public.me_is_admin());

drop policy if exists workshops_admin on public.workshops;
create policy workshops_admin on public.workshops for all to authenticated
  using (public.me_is_admin()) with check (public.me_is_admin());

grant select                         on public.workshops to authenticated, service_role;
grant insert, update, delete         on public.workshops to authenticated, service_role;


-- ── 6. Report ───────────────────────────────────────────────────────────────
do $$
declare v_lessons integer; v_workshops integer; v_bookings integer; v_linked integer;
begin
  select count(*) into v_lessons   from public.lessons;
  select count(*) into v_workshops from public.workshops;
  select count(*) into v_bookings  from public.workshop_bookings;
  select count(*) into v_linked    from public.workshop_bookings where workshop_id is not null;
  raise notice 'lessons: %, bookable workshops: % (one per lesson)', v_lessons, v_workshops;
  raise notice 'bookings carried across: %, of which linked to a workshop: %', v_bookings, v_linked;
end $$;
