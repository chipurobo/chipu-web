-- ============================================================================
-- Competitions — the thing ChipuRobo actually runs — 2026-08-10
--
-- "Inclusive Robotics" has been a string in two places: a `programme` label on
-- certificate templates, and the name of a programmes row that 20260719000001
-- deleted. Nothing modelled the competition itself, so there was no way to say
-- which schools are in the 2026 cycle, when entries close, or which cycle a
-- submitted project belongs to — the National Showcase had no year.
--
-- Three pieces:
--
--   competitions         One cycle: name, year, status, key dates. A new year
--                        is a new row, so last year's entries and projects stay
--                        attached to last year.
--   competition_schools  Which schools are in a cycle. Entry is ChipuRobo's
--                        call, matching the rest of onboarding, which the
--                        README describes as happening offline.
--   projects.competition_id
--                        A project is a school's entry to a specific cycle.
--                        projects + project_judgments already carried the
--                        draft → submitted → judged flow; it simply had no
--                        competition to belong to.
--
-- Lessons and workshops are deliberately NOT linked to a competition. The
-- curriculum is taught whether or not a school competes, and tying it to a
-- cycle would mean re-authoring every lesson each year.
-- ============================================================================


-- ── 1. Competitions ─────────────────────────────────────────────────────────
do $$ begin
  create type public.competition_status as enum ('draft', 'open', 'closed', 'judged');
exception when duplicate_object then null; end $$;

create table if not exists public.competitions (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  -- The cycle. Kept separate from the name so "Inclusive Robotics" can run
  -- again next year without the name carrying a date it will outgrow.
  year        integer not null,
  description text,
  status      public.competition_status not null default 'draft',

  opens_on    date,
  closes_on   date,
  showcase_on date,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint competitions_name_year_unique unique (name, year),
  constraint competitions_dates_ordered
    check (closes_on is null or opens_on is null or closes_on >= opens_on)
);

create index if not exists competitions_status_year_idx on public.competitions (status, year desc);

create or replace function public.competitions_touch()
returns trigger language plpgsql security definer set search_path = public
as $$ begin new.updated_at := now(); return new; end; $$;

drop trigger if exists competitions_touch_trg on public.competitions;
create trigger competitions_touch_trg
  before update on public.competitions
  for each row execute function public.competitions_touch();


-- ── 2. Which schools are in a cycle ─────────────────────────────────────────
create table if not exists public.competition_schools (
  competition_id uuid not null references public.competitions(id) on delete cascade,
  school_id      uuid not null references public.schools(id) on delete cascade,
  entered_at     timestamptz not null default now(),
  entered_by     uuid references public.profiles(id) on delete set null,
  withdrawn_at   timestamptz,
  primary key (competition_id, school_id)
);

create index if not exists competition_schools_school_idx
  on public.competition_schools (school_id);


-- ── 3. A project is an entry to a cycle ─────────────────────────────────────
alter table public.projects
  add column if not exists competition_id uuid references public.competitions(id) on delete set null;

create index if not exists projects_competition_idx on public.projects (competition_id);

comment on column public.projects.competition_id is
  'The competition cycle this project is entered into. Null for projects that '
  'predate competitions being modelled, or for work a school is doing outside '
  'a cycle.';


-- ── 4. Seed the current cycle ───────────────────────────────────────────────
-- Named from what production already carries on its certificate template
-- (`Inclusive Robotics`), so certificates issued so far keep matching.
insert into public.competitions (slug, name, year, description, status)
select 'inclusive-robotics-2026', 'Inclusive Robotics', 2026,
       'ChipuRobo''s Pan-African STEM competition: schools build inclusive robotics '
       'projects through the curriculum and present them at the National Showcase.',
       'open'
where not exists (select 1 from public.competitions c where c.slug = 'inclusive-robotics-2026');

-- Enter every school that exists today. 20260601000024 did the same thing when
-- it seeded the old programme ("auto-enrol every existing school"), and these
-- are the schools already taking part. Withdrawing one is a single row update,
-- so this is cheap to correct if any school should not be in the 2026 cycle.
insert into public.competition_schools (competition_id, school_id)
select c.id, s.id
from public.competitions c
cross join public.schools s
where c.slug = 'inclusive-robotics-2026'
  and not exists (
    select 1 from public.competition_schools cs
     where cs.competition_id = c.id and cs.school_id = s.id
  );

-- Existing projects belong to the cycle that is running.
update public.projects p
   set competition_id = (select id from public.competitions where slug = 'inclusive-robotics-2026')
 where p.competition_id is null;


-- ── 5. RLS ──────────────────────────────────────────────────────────────────
alter table public.competitions        enable row level security;
alter table public.competition_schools enable row level security;

-- Every signed-in user can read the competitions themselves — a school needs to
-- see the cycle it is competing in, and the dates it is working towards.
drop policy if exists competitions_read on public.competitions;
create policy competitions_read on public.competitions for select to authenticated
  using (status <> 'draft' or public.me_is_admin());

drop policy if exists competitions_admin on public.competitions;
create policy competitions_admin on public.competitions for all to authenticated
  using (public.me_is_admin()) with check (public.me_is_admin());

-- A school sees its own entry, not the full field. Who else is competing is
-- ChipuRobo's to disclose, not something every school lead can enumerate.
drop policy if exists competition_schools_select on public.competition_schools;
create policy competition_schools_select on public.competition_schools for select to authenticated
  using (school_id = public.me_school_id() or public.me_is_admin());

drop policy if exists competition_schools_admin on public.competition_schools;
create policy competition_schools_admin on public.competition_schools for all to authenticated
  using (public.me_is_admin()) with check (public.me_is_admin());

grant select                         on public.competitions        to authenticated, service_role;
grant insert, update, delete         on public.competitions        to authenticated, service_role;
grant select                         on public.competition_schools to authenticated, service_role;
grant insert, update, delete         on public.competition_schools to authenticated, service_role;


-- ── 6. Report ───────────────────────────────────────────────────────────────
do $$
declare v_c integer; v_s integer; v_p integer;
begin
  select count(*) into v_c from public.competitions;
  select count(*) into v_s from public.competition_schools;
  select count(*) into v_p from public.projects where competition_id is not null;
  raise notice 'competitions: %, schools entered: %, projects linked to a cycle: %', v_c, v_s, v_p;
end $$;
