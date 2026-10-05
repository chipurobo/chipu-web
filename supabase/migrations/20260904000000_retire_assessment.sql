-- ============================================================================
-- Retire assessment from the dashboard — 2026-09-04
--
-- The MERL instruments (teacher / learner / school baselines, endline, webinar
-- feedback, school visit checklist) are no longer collected here. Incident
-- reporting replaces them as the thing a school submits.
--
-- NOTHING IS DROPPED. Six tables and every answer already given stay exactly
-- where they are:
--
--   instruments, instrument_versions, instrument_sections,
--   instrument_questions, instrument_responses, instrument_answers
--
-- What changes is reach. The `authenticated` role loses access, so the removed
-- screens cannot be resurrected by anyone calling PostgREST directly, and no
-- new answers can arrive. Existing rows remain readable to service_role and to
-- anyone with direct database access, which is what an export needs.
--
-- Dropping the tables is a separate decision, to be taken after someone has
-- looked at what is in them. Deleting a programme's evidence base is not a
-- side effect of removing its user interface.
--
-- programme_actions.response_id is deliberately untouched. It still points at
-- instrument_responses, so actions raised off the back of an assessment keep
-- their origin rather than silently becoming orphans.
-- ============================================================================

revoke all on public.instruments          from authenticated;
revoke all on public.instrument_versions  from authenticated;
revoke all on public.instrument_sections  from authenticated;
revoke all on public.instrument_questions from authenticated;
revoke all on public.instrument_responses from authenticated;
revoke all on public.instrument_answers   from authenticated;

comment on table public.instruments is
  'RETIRED 2026-09-04: no longer collected through the dashboard. Retained for '
  'export and historical reporting; authenticated has no access. Do not drop '
  'without an explicit decision about the data.';

-- ----------------------------------------------------------------------------
-- The leaderboard stops scoring assessments
--
-- assessments_done and its 5 points are gone. They are NOT redistributed: the
-- points existed to reward filling in an instrument, and there is no longer an
-- instrument to fill in, so inventing a replacement would credit schools for
-- work nobody asked them to do. Totals fall for schools that had submitted
-- responses, and the standings shift accordingly. That is the honest result.
--
-- Incidents are deliberately absent from this function and must stay absent.
-- Scoring a school on incident reports rewards the school that reports least.
-- ----------------------------------------------------------------------------
drop function if exists public.get_school_leaderboard();

create or replace function public.get_school_leaderboard()
returns table (
  school_id            uuid,
  school_name          text,
  county               text,
  lesson_points        bigint,
  lessons_completed    bigint,
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
    select 3::bigint  as per_session_delivered,
           1::bigint  as per_session_partly,
           2::bigint  as per_certificate,
           5::bigint  as per_workshop_attended,
           10::bigint as project_submitted,
           25::bigint as project_judged
  ),
  lesson_pts as (
    select cm.school_id,
           sum(l.points)::bigint as pts,
           count(*)::bigint      as completions
    from lesson_completions lc
    join club_members cm on cm.id = lc.student_id
    join lessons l       on l.id  = lc.lesson_id
    where lc.passed
    group by cm.school_id
  ),
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
    coalesce(sp.delivered, 0),
    coalesce(cp.n, 0),
    coalesce(wp.n, 0),
    coalesce(pp.pts, 0),
    (
      coalesce(lp.pts, 0)
      + coalesce(sp.delivered, 0)* (select per_session_delivered from weights)
      + coalesce(sp.partly, 0)   * (select per_session_partly from weights)
      + coalesce(cp.n, 0)        * (select per_certificate from weights)
      + coalesce(wp.n, 0)        * (select per_workshop_attended from weights)
      + coalesce(pp.pts, 0)
    )::bigint
  from schools sc
  left join lesson_pts     lp on lp.school_id = sc.id
  left join session_pts    sp on sp.school_id = sc.id
  left join cert_pts       cp on cp.school_id = sc.id
  left join workshop_pts   wp on wp.school_id = sc.id
  left join project_pts    pp on pp.school_id = sc.id
  order by 10 desc, sc.name;
$$;

revoke execute on function public.get_school_leaderboard() from public, anon;
grant  execute on function public.get_school_leaderboard() to authenticated;

comment on function public.get_school_leaderboard() is
  'SECURITY DEFINER (search_path pinned): per-school standings. Aggregates '
  'only, never a learner row. Assessments were removed 2026-09-04. Incidents '
  'are deliberately not scored and must never be added.';

notify pgrst, 'reload schema';
