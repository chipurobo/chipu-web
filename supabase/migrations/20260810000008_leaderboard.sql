-- ============================================================================
-- Bring back the leaderboard — 2026-08-10
--
-- The original school_leaderboard was dropped by 20260718000000, and the RPC
-- that replaced it went with the programme concept in 20260719000001. It is
-- worth being precise about WHY, so this does not reintroduce it:
--
--   The old one was a VIEW. Supabase's default privileges granted anon
--   SELECT, and with security_invoker = off a view runs as its owner and
--   bypasses RLS entirely. That made every school's standing readable by
--   anyone with the publishable key. The hardening migration's durable fix was
--   to serve this kind of cross-school aggregate from a SECURITY DEFINER
--   function instead — "an RPC cannot be written through" — with EXECUTE
--   revoked from anon.
--
-- So this is a function, not a view, and it follows that shape exactly.
--
-- WHAT IT RETURNS: counts and points per SCHOOL. No learner names, no learner
-- codes, no per-student rows. A school's own detail — which pupil completed
-- what, and their certificate — is read through RLS by the client, where the
-- policies already scope it to that school.
--
-- SCORING IS PROVISIONAL. Every target in 04_Indicator_Matrix is still blank,
-- so these weights are a starting point for motivation, not an approved
-- measure. They live in one CTE so they can be tuned in a single place.
-- ============================================================================

create or replace function public.get_school_leaderboard()
returns table (
  school_id            uuid,
  school_name          text,
  county               text,
  lesson_points        bigint,
  lessons_completed    bigint,
  assessments_done     bigint,
  sessions_delivered   bigint,
  certificates_earned  bigint,
  workshops_attended   bigint,
  project_points       bigint,
  total_points         bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with weights as (
    -- Provisional. What a teacher does to keep a club running is weighted
    -- alongside what learners achieve, because the dashboard is only useful if
    -- the person filling it in sees their effort counted.
    select 5::bigint  as per_assessment,
           3::bigint  as per_session_delivered,
           1::bigint  as per_session_partly,
           2::bigint  as per_certificate,
           5::bigint  as per_workshop_attended,
           10::bigint as project_submitted,
           25::bigint as project_judged
  ),
  -- Learner achievement: each passed completion is worth its lesson's points.
  lesson_pts as (
    select cm.school_id,
           coalesce(sum(l.points), 0)::bigint as pts,
           count(*)::bigint                   as completions
    from lesson_completions lc
    join club_members cm on cm.id = lc.student_id
    join lessons l       on l.id  = lc.lesson_id
    where lc.passed
    group by cm.school_id
  ),
  -- Teacher effort: a submitted MERL instrument. Drafts do not count, or the
  -- score would reward opening a form rather than completing one.
  assessment_pts as (
    select r.school_id, count(*)::bigint as n
    from instrument_responses r
    where r.status = 'submitted' and r.school_id is not null
    group by r.school_id
  ),
  -- Delivery: a partly-delivered session still scores. Recording an honest
  -- "partly" is exactly the behaviour the MERL plan wants, and scoring it zero
  -- would quietly push teachers to log everything as fully delivered.
  session_pts as (
    select s.school_id,
           count(*) filter (where s.delivered = 'yes')::bigint    as delivered,
           count(*) filter (where s.delivered = 'partly')::bigint as partly
    from sessions s
    group by s.school_id
  ),
  cert_pts as (
    select ci.school_id, count(*)::bigint as n
    from certificate_issuances ci
    where ci.revoked_at is null
    group by ci.school_id
  ),
  workshop_pts as (
    select b.school_id, count(*)::bigint as n
    from workshop_bookings b
    where b.status = 'delivered'
    group by b.school_id
  ),
  project_pts as (
    select p.school_id,
           sum(case p.status
                 when 'judged'    then (select project_judged from weights)
                 when 'submitted' then (select project_submitted from weights)
                 else 0 end)::bigint as pts
    from projects p
    group by p.school_id
  )
  select
    sc.id,
    sc.name,
    sc.county,
    coalesce(lp.pts, 0),
    coalesce(lp.completions, 0),
    coalesce(ap.n, 0),
    coalesce(sp.delivered, 0),
    coalesce(cp.n, 0),
    coalesce(wp.n, 0),
    coalesce(pp.pts, 0),
    (
      coalesce(lp.pts, 0)
      + coalesce(ap.n, 0)        * (select per_assessment from weights)
      + coalesce(sp.delivered, 0)* (select per_session_delivered from weights)
      + coalesce(sp.partly, 0)   * (select per_session_partly from weights)
      + coalesce(cp.n, 0)        * (select per_certificate from weights)
      + coalesce(wp.n, 0)        * (select per_workshop_attended from weights)
      + coalesce(pp.pts, 0)
    )::bigint
  from schools sc
  left join lesson_pts     lp on lp.school_id = sc.id
  left join assessment_pts ap on ap.school_id = sc.id
  left join session_pts    sp on sp.school_id = sc.id
  left join cert_pts       cp on cp.school_id = sc.id
  left join workshop_pts   wp on wp.school_id = sc.id
  left join project_pts    pp on pp.school_id = sc.id
  order by 11 desc, sc.name;
$$;

-- The control the original view lacked. anon must never reach this.
revoke execute on function public.get_school_leaderboard() from public, anon;
grant  execute on function public.get_school_leaderboard() to authenticated;

comment on function public.get_school_leaderboard() is
  'SECURITY DEFINER by design (search_path pinned): cross-school aggregate '
  'standings for authenticated dashboard users. Returns per-school counts '
  'only — never learner names, codes or per-student rows. Replaces the '
  'school_leaderboard view dropped by 20260718000000, which was anon-readable '
  'and bypassed RLS.';

notify pgrst, 'reload schema';
