-- ============================================================================
-- Make the headline learner outcome measurable — 2026-08-10
--
-- The Theory of Change's first stated Outcome is:
--
--   "Learners build, program and debug without or with little help from
--    sighted assistance"
--
-- Independence is the outcome. Nothing in the dashboard measured it. The
-- nearest field was lesson_completions.confidence, which asks something
-- genuinely different: a learner can feel confident while being walked through
-- every step, and can work unaided while still feeling unsure. Reading one as
-- the other would have quietly reported the wrong thing.
--
-- So independence is its own scale, recorded alongside confidence rather than
-- instead of it. The two together are what the outcome actually claims — a
-- learner who is both independent and confident.
--
-- The wording of the scale matters. It is framed as how much SUPPORT was
-- needed, not how able the learner is, so it records the delivery rather than
-- judging the child. That is the same distinction 20260810000012 draws for
-- adaptations, and the same one the MERL Plan draws throughout.
-- ============================================================================

alter table public.lesson_completions
  add column if not exists independence smallint
    check (independence is null or independence between 1 and 5);

comment on column public.lesson_completions.independence is
  'How much support the learner needed to complete this lesson, 1-5: '
  '1 = fully supported throughout, 3 = some prompting, 5 = worked unaided. '
  'The ToC outcome is that learners build, program and debug with little or no '
  'sighted assistance, so this is the field that evidences it. Distinct from '
  'confidence, which asks how the learner FELT — the two move independently. '
  'Null means not assessed, which is not the same as 1.';

-- Reported per school for the ToC Outcome, alongside the existing standings.
-- SECURITY DEFINER with search_path pinned, EXECUTE revoked from anon — the
-- same shape as get_school_leaderboard(), and for the same reason: this is a
-- cross-school aggregate and must never be readable with the publishable key.
create or replace function public.get_independence_summary()
returns table (
  school_id          uuid,
  school_name        text,
  assessed           bigint,
  worked_unaided     bigint,
  mostly_unaided     bigint,
  needed_support     bigint,
  mean_independence  numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    sc.id,
    sc.name,
    count(lc.independence)::bigint,
    count(*) filter (where lc.independence = 5)::bigint,
    count(*) filter (where lc.independence = 4)::bigint,
    count(*) filter (where lc.independence <= 2)::bigint,
    round(avg(lc.independence)::numeric, 2)
  from schools sc
  left join club_members cm       on cm.school_id = sc.id
  left join lesson_completions lc on lc.student_id = cm.id and lc.independence is not null
  group by sc.id, sc.name
  order by sc.name;
$$;

revoke execute on function public.get_independence_summary() from public, anon;
grant  execute on function public.get_independence_summary() to authenticated;

comment on function public.get_independence_summary() is
  'SECURITY DEFINER (search_path pinned): per-school independence counts for '
  'the ToC outcome "learners build, program and debug without or with little '
  'help from sighted assistance". Aggregates only — no learner rows.';

notify pgrst, 'reload schema';
