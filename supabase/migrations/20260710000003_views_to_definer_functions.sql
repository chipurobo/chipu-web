-- =============================================================
-- Resolve the remaining Security Advisor findings on
-- public.school_leaderboard and public.public_schools_map.
--
-- Why not `security_invoker = on` (the advisor's Option A):
--   • school_leaderboard joins club_members / lesson_completions /
--     schools, all of which are school-scoped for non-admins — an
--     invoker view would show each school lead only their own points
--     (every other school would read 0). Silently wrong data.
--   • public_schools_map serves ANON visitors, and schools has no anon
--     policy at all — an invoker view would blank the marketing map.
--     Adding an anon policy to schools would leak contact columns via
--     REST, since RLS cannot restrict columns.
--
-- So we take the advisor's Option B, done properly: replace the two
-- exposed SECURITY DEFINER *views* with SECURITY DEFINER *functions*
-- with a pinned search_path — the sanctioned Supabase pattern for an
-- intentional, narrowly-scoped RLS bypass. The functions expose exactly
-- the same columns and rows the views did; grants stay as tightened in
-- 20260710000001 (leaderboard: authenticated only; map: anon too).
--
-- Frontend counterpart (same deploy): fetchLeaderboard() and
-- MakerSpacesMap switch from view reads to supabase.rpc(...).
-- =============================================================

-- ── school_leaderboard: view → RPC ─────────────────────────────
drop view if exists public.school_leaderboard;

create or replace function public.get_school_leaderboard()
returns table (
  school_id      uuid,
  school_name    text,
  county         text,
  programme_id   uuid,
  programme_name text,
  lesson_pts     bigint,
  project_pts    integer,
  total_pts      bigint
)
language sql stable security definer
set search_path = public
as $$
  with school_lesson_points as (
    select cm.school_id,
           coalesce(sum(s.points), 0)::bigint as lesson_pts
    from lesson_completions lc
    join club_members cm on cm.id = lc.student_id
    join programme_stages s on s.id = lc.stage_id
    where lc.passed = true
    group by cm.school_id
  ),
  school_project_points as (
    select p.school_id,
           j.score as project_pts
    from projects p
    join project_judgments j on j.project_id = p.id
  )
  select s.id,
         s.name,
         s.county,
         s.programme_id,
         pr.name,
         coalesce(lp.lesson_pts, 0)::bigint,
         coalesce(pp.project_pts, 0),
         (coalesce(lp.lesson_pts, 0) + coalesce(pp.project_pts, 0))::bigint
  from schools s
  left join programmes pr on pr.id = s.programme_id
  left join school_lesson_points lp on lp.school_id = s.id
  left join school_project_points pp on pp.school_id = s.id
  order by coalesce(lp.lesson_pts, 0) + coalesce(pp.project_pts, 0) desc, s.name
$$;

revoke execute on function public.get_school_leaderboard() from public, anon;
grant execute on function public.get_school_leaderboard() to authenticated;

comment on function public.get_school_leaderboard() is
  'SECURITY DEFINER by design (search_path pinned): cross-school '
  'aggregate leaderboard for authenticated dashboard users. Replaces '
  'the school_leaderboard view flagged by the Security Advisor.';

-- ── public_schools_map: view → RPC ─────────────────────────────
drop view if exists public.public_schools_map;

create or replace function public.get_public_schools_map()
returns table (
  id             uuid,
  name           text,
  county         text,
  latitude       numeric,
  longitude      numeric,
  is_maker_space boolean
)
language sql stable security definer
set search_path = public
as $$
  select id, name, county, latitude, longitude, is_maker_space
  from schools
  where latitude is not null and longitude is not null
$$;

revoke execute on function public.get_public_schools_map() from public;
grant execute on function public.get_public_schools_map() to anon, authenticated;

comment on function public.get_public_schools_map() is
  'SECURITY DEFINER by design (search_path pinned): redacted school '
  'pins (no contact columns) for the anonymous marketing-site map. '
  'Replaces the public_schools_map view flagged by the Security Advisor.';
