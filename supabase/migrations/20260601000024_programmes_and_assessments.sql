-- =============================================================
-- 20260601000024_programmes_and_assessments.sql
--
-- Programme pipeline:
--   • A school is enrolled in a programme (schools.programme_id).
--   • A programme has ordered stages (lessons / bootcamps / project).
--   • Teachers tick per-student lesson completions (one row per
--     student per stage).
--   • Schools submit one team project per programme.
--   • Admins judge each project with a single 0–100 score.
--   • Leaderboard view ranks schools by reach-weighted points:
--       lesson_pts = SUM(stage.points) across every passed completion
--       project_pts = admin's 0–100 score
--       total      = lesson_pts + project_pts
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. programmes
-- ─────────────────────────────────────────────────────────────
create table public.programmes (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.programmes enable row level security;

create policy "Read programmes"
  on public.programmes for select to authenticated
  using (true);

create policy "Admin writes programmes"
  on public.programmes for all to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');

-- ─────────────────────────────────────────────────────────────
-- 2. programme_stages — ordered list of lessons / bootcamps / project
-- ─────────────────────────────────────────────────────────────
create type public.stage_kind as enum (
  'bootcamp_physical',
  'bootcamp_virtual',
  'lesson',
  'project'
);

create table public.programme_stages (
  id                       uuid primary key default gen_random_uuid(),
  programme_id             uuid not null references public.programmes(id) on delete cascade,
  position                 int  not null,
  title                    text not null,
  description              text,
  kind                     public.stage_kind not null default 'lesson',
  -- Points awarded per student per completion. Project stages typically
  -- carry 0 here because the project_judgments score is added separately.
  points                   int  not null default 1,
  required_for_certificate boolean not null default true,
  is_active                boolean not null default true,
  created_at               timestamptz not null default now(),
  unique (programme_id, position)
);

alter table public.programme_stages enable row level security;

create policy "Read stages"
  on public.programme_stages for select to authenticated using (true);

create policy "Admin writes stages"
  on public.programme_stages for all to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');

create index programme_stages_programme_pos_idx
  on public.programme_stages (programme_id, position);

-- ─────────────────────────────────────────────────────────────
-- 3. schools.programme_id
-- ─────────────────────────────────────────────────────────────
alter table public.schools
  add column programme_id uuid references public.programmes(id);

-- ─────────────────────────────────────────────────────────────
-- 4. lesson_completions — one per student per stage
-- ─────────────────────────────────────────────────────────────
create table public.lesson_completions (
  id           uuid primary key default gen_random_uuid(),
  stage_id     uuid not null references public.programme_stages(id) on delete cascade,
  student_id   uuid not null references public.club_members(id) on delete cascade,
  confidence   smallint check (confidence between 1 and 5),
  passed       boolean not null default true,
  recorded_by  uuid references public.profiles(id),
  recorded_at  timestamptz not null default now(),
  unique (stage_id, student_id)
);

alter table public.lesson_completions enable row level security;

-- School leads manage completions for their own students; admins do anything.
create policy "Read completions"
  on public.lesson_completions for select to authenticated
  using (
    exists (
      select 1 from public.club_members m
      where m.id = lesson_completions.student_id
        and m.school_id = (select school_id from public.profiles where id = auth.uid())
    )
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "School lead writes own completions"
  on public.lesson_completions for insert to authenticated
  with check (
    exists (
      select 1 from public.club_members m
      where m.id = student_id
        and m.school_id = (select school_id from public.profiles where id = auth.uid())
    )
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "School lead updates own completions"
  on public.lesson_completions for update to authenticated
  using (
    exists (
      select 1 from public.club_members m
      where m.id = student_id
        and m.school_id = (select school_id from public.profiles where id = auth.uid())
    )
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  )
  with check (
    exists (
      select 1 from public.club_members m
      where m.id = student_id
        and m.school_id = (select school_id from public.profiles where id = auth.uid())
    )
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "School lead deletes own completions"
  on public.lesson_completions for delete to authenticated
  using (
    exists (
      select 1 from public.club_members m
      where m.id = student_id
        and m.school_id = (select school_id from public.profiles where id = auth.uid())
    )
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create index lesson_completions_stage_idx on public.lesson_completions (stage_id);
create index lesson_completions_student_idx on public.lesson_completions (student_id);

-- ─────────────────────────────────────────────────────────────
-- 5. projects — one per (school, programme)
-- ─────────────────────────────────────────────────────────────
create type public.project_status as enum ('draft','submitted','judged');

create table public.projects (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id) on delete cascade,
  programme_id   uuid not null references public.programmes(id) on delete cascade,
  title          text not null,
  description    text,
  repo_url       text,
  video_url      text,
  image_url      text,
  status         public.project_status not null default 'draft',
  submitted_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (school_id, programme_id)
);

alter table public.projects enable row level security;

-- Anyone signed in can see submitted/judged projects (for leaderboard);
-- drafts only visible to the owning school + admin.
create policy "Read projects"
  on public.projects for select to authenticated
  using (
    status in ('submitted','judged')
    or (select role from public.profiles where id = auth.uid()) = 'admin'
    or school_id = (select school_id from public.profiles where id = auth.uid())
  );

create policy "School lead inserts own project"
  on public.projects for insert to authenticated
  with check (
    school_id = (select school_id from public.profiles where id = auth.uid())
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- School lead can update their own project while in draft.
-- Admins can update any project at any time (re-open + edit).
create policy "School lead updates own draft project"
  on public.projects for update to authenticated
  using (
    (school_id = (select school_id from public.profiles where id = auth.uid()) and status = 'draft')
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  )
  with check (
    school_id = (select school_id from public.profiles where id = auth.uid())
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "Admin deletes projects"
  on public.projects for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

create index projects_school_idx    on public.projects (school_id);
create index projects_programme_idx on public.projects (programme_id);

-- updated_at trigger
create or replace function public.touch_project_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_project_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 6. project_team_members
-- ─────────────────────────────────────────────────────────────
create table public.project_team_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  student_id uuid not null references public.club_members(id) on delete cascade,
  role       text,
  primary key (project_id, student_id)
);

alter table public.project_team_members enable row level security;

create policy "Read team members"
  on public.project_team_members for select to authenticated using (true);

create policy "School lead manages own team"
  on public.project_team_members for all to authenticated
  using (
    exists (
      select 1 from public.projects pj
      where pj.id = project_team_members.project_id
        and (
          pj.school_id = (select school_id from public.profiles where id = auth.uid())
          or (select role from public.profiles where id = auth.uid()) = 'admin'
        )
    )
  )
  with check (
    exists (
      select 1 from public.projects pj
      where pj.id = project_team_members.project_id
        and (
          pj.school_id = (select school_id from public.profiles where id = auth.uid())
          or (select role from public.profiles where id = auth.uid()) = 'admin'
        )
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 7. project_judgments — admin-only, one row per project (latest wins via upsert)
-- ─────────────────────────────────────────────────────────────
create table public.project_judgments (
  project_id uuid primary key references public.projects(id) on delete cascade,
  score      int  not null check (score between 0 and 100),
  comment    text,
  judged_by  uuid not null references public.profiles(id),
  judged_at  timestamptz not null default now()
);

alter table public.project_judgments enable row level security;

create policy "Read judgments"
  on public.project_judgments for select to authenticated using (true);

create policy "Admin writes judgments"
  on public.project_judgments for all to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');

-- When a judgment is saved, automatically flip the project status to 'judged'.
create or replace function public.mark_project_judged()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.projects
    set status = 'judged', updated_at = now()
    where id = new.project_id and status <> 'judged';
  return new;
end;
$$;

create trigger judgment_marks_project_judged
  after insert or update on public.project_judgments
  for each row execute function public.mark_project_judged();

-- ─────────────────────────────────────────────────────────────
-- 8. Leaderboard view
-- ─────────────────────────────────────────────────────────────
-- Per-school lesson points = SUM(stage.points) across every passed completion
-- belonging to that school's students. Project points = admin's 0–100 score
-- (NULL → 0). Total = lesson + project. Ranked DESC.
create or replace view public.school_leaderboard as
with school_lesson_points as (
  select
    cm.school_id,
    coalesce(sum(s.points), 0) as lesson_pts
  from public.lesson_completions lc
  join public.club_members      cm on cm.id = lc.student_id
  join public.programme_stages  s  on s.id  = lc.stage_id
  where lc.passed = true
  group by cm.school_id
),
school_project_points as (
  select
    p.school_id,
    j.score as project_pts
  from public.projects p
  join public.project_judgments j on j.project_id = p.id
)
select
  s.id                                                            as school_id,
  s.name                                                          as school_name,
  s.county,
  s.programme_id,
  pr.name                                                         as programme_name,
  coalesce(lp.lesson_pts, 0)                                      as lesson_pts,
  coalesce(pp.project_pts, 0)                                     as project_pts,
  coalesce(lp.lesson_pts, 0) + coalesce(pp.project_pts, 0)        as total_pts
from public.schools s
left join public.programmes        pr on pr.id        = s.programme_id
left join school_lesson_points     lp on lp.school_id = s.id
left join school_project_points    pp on pp.school_id = s.id
order by total_pts desc, s.name asc;

grant select on public.school_leaderboard to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 9. Seed Inclusive Robotics + auto-enrol every existing school
-- ─────────────────────────────────────────────────────────────
insert into public.programmes (slug, name, description)
values (
  'inclusive-robotics',
  'Inclusive Robotics',
  'ChipuRobo''s Pan-African programme: bootcamps, hardware and electronics, Python coding, AI basics, and the National Showcase project.'
);

with p as (
  select id from public.programmes where slug = 'inclusive-robotics'
)
insert into public.programme_stages (programme_id, position, title, kind, points, required_for_certificate)
select id, 1, 'Bootcamp',               'bootcamp_physical'::public.stage_kind, 1, true from p
union all
select id, 2, 'Hardware & Electronics', 'lesson'::public.stage_kind,            1, true from p
union all
select id, 3, 'Coding with Python',     'lesson'::public.stage_kind,            1, true from p
union all
select id, 4, 'AI Basics',              'lesson'::public.stage_kind,            1, true from p
union all
select id, 5, 'Project',                'project'::public.stage_kind,           0, true from p;

-- Auto-enrol every existing school in Inclusive Robotics.
update public.schools
set programme_id = (select id from public.programmes where slug = 'inclusive-robotics')
where programme_id is null;

-- ─────────────────────────────────────────────────────────────
-- 10. PostgREST schema reload
-- ─────────────────────────────────────────────────────────────
notify pgrst, 'reload schema';
