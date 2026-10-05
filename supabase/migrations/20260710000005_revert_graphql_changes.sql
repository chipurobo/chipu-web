-- =============================================================
-- Revert pg_graphql schema changes that broke all GraphQL queries.
--
-- Removes every @graphql constraint comment (migration 002) and
-- the schema comment (migration 004) that caused "argument 0
-- must not be null" during schema introspection. Recreates the
-- two views dropped in migration 003 (the RPC replacements stay
-- so the current app code keeps working). Reverts stock_on_hand
-- security_invoker flag (migration 001).
-- =============================================================

-- ── 1. Remove @graphql schema comment ──────────────────────────
comment on schema public is null;

-- ── 2. Remove ALL @graphql constraint comments ─────────────────
comment on constraint lesson_completions_student_id_fkey on public.lesson_completions is null;
comment on constraint project_team_members_student_id_fkey on public.project_team_members is null;
comment on constraint certificate_issuances_student_id_fkey on public.certificate_issuances is null;
comment on constraint product_units_current_member_id_fkey on public.product_units is null;
comment on constraint product_units_product_id_fkey on public.product_units is null;
comment on constraint orders_product_id_fkey on public.orders is null;
comment on constraint projects_school_id_fkey on public.projects is null;
comment on constraint certificate_issuances_school_id_fkey on public.certificate_issuances is null;
comment on constraint event_schools_school_id_fkey on public.event_schools is null;
comment on constraint orders_placed_by_school_id_fkey on public.orders is null;
comment on constraint orders_fulfilled_by_school_id_fkey on public.orders is null;
comment on constraint certificate_issuances_template_id_fkey on public.certificate_issuances is null;
comment on constraint projects_programme_id_fkey on public.projects is null;
comment on constraint event_schools_event_id_fkey on public.event_schools is null;
comment on constraint product_units_order_id_fkey on public.product_units is null;

-- ── 3. Recreate the two views dropped in migration 003 ────────
-- (The RPC functions created in 003 stay — app code uses them.)

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

create or replace view public.public_schools_map as
  select
    id,
    name,
    county,
    latitude,
    longitude,
    is_maker_space
  from public.schools
  where latitude  is not null
    and longitude is not null;

grant select on public.public_schools_map to anon, authenticated;

-- ── 4. Revert stock_on_hand to default security ────────────────
alter view public.stock_on_hand set (security_invoker = off);
grant select on public.stock_on_hand to authenticated;

-- ── 5. Force pg_graphql schema rebuild + PostgREST reload ──────
notify pgrst, 'reload schema';
