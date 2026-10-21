-- CBC performance levels replace ChipuRobo's own Beginner / Intermediate /
-- Expert scheme, which is not part of the CBC.
--
-- 1. Teachers rate each skill on the CBC four-point scale that schools
--    already use: Exceeding (EE), Meeting (ME), Approaching (AE) and Below (BE)
--    expectations. Existing ratings are converted:
--    extending → exceeding, demonstrated → meeting, developing → approaching.
-- 2. Level awards are replaced by a CBC end-of-course assessment: the teacher
--    records one overall performance level with a comment. The platform
--    suggests a level from the latest skill ratings; the teacher decides.
--    Earlier level decisions stay in learning_progression_decisions as
--    history; no screen offers level awards any more.
-- 3. The pilot report counts CBC assessments by performance level instead of
--    level awards.
-- 4. The course covers the basics only: lessons 9–20 and the second and third
--    big projects are switched off (is_active = false, nothing deleted), with
--    their checks. Learners keep any work they already did.

-- 1 ─────────────────────────────────────────────────────────────────────────
update public.competency_evidence e
set reviews = (
  select coalesce(jsonb_object_agg(key, case value #>> '{}'
    when 'extending' then 'exceeding' when 'demonstrated' then 'meeting' when 'developing' then 'approaching'
    else value #>> '{}' end), '{}'::jsonb)
  from jsonb_each(e.reviews))
where exists(select 1 from jsonb_each_text(e.reviews) r where r.value in ('extending','demonstrated','developing'));

create or replace function public.record_competency_evidence(p_assignment_id uuid, p_student_id uuid, p_evidence_text text, p_evidence_url text, p_feedback text, p_reviews jsonb)
 returns uuid language plpgsql security definer set search_path to 'public' as $function$
declare v_assignment public.learning_assignments%rowtype; v_key text; v_value jsonb; v_id uuid;
begin
  select * into v_assignment from public.learning_assignments where id = p_assignment_id;
  if not found or not public.can_manage_learning_school(v_assignment.school_id)
    or not public.can_read_learning_assignment(p_assignment_id)
    or not public.can_teach_learning_student(p_student_id) then
    raise exception 'You cannot review this assignment.' using errcode = '42501';
  end if;
  if not exists(select 1 from public.learning_assignment_recipients
    where assignment_id = p_assignment_id and student_id = p_student_id) then
    raise exception 'The student must be assigned this activity.' using errcode = '22023';
  end if;
  if length(btrim(coalesce(p_evidence_text, ''))) not between 1 and 10000
     or length(btrim(coalesce(p_feedback, ''))) not between 1 and 5000 then
    raise exception 'Describe the evidence and give review feedback.' using errcode = '22023';
  end if;
  if p_evidence_url is not null and (length(p_evidence_url) > 2000 or p_evidence_url !~* '^https?://[^[:space:]]+$') then
    raise exception 'Evidence links must use http:// or https://.' using errcode = '22023';
  end if;
  if p_reviews is null or jsonb_typeof(p_reviews) <> 'object' or p_reviews = '{}'::jsonb then
    raise exception 'Rate at least one skill.' using errcode = '22023';
  end if;
  -- Screens still on the old wording send developing / demonstrated /
  -- extending; store them as the matching CBC level.
  select jsonb_object_agg(key, case when jsonb_typeof(value) = 'string' then to_jsonb(case value #>> '{}'
      when 'extending' then 'exceeding' when 'demonstrated' then 'meeting' when 'developing' then 'approaching'
      else value #>> '{}' end) else value end)
    into p_reviews from jsonb_each(p_reviews);
  for v_key, v_value in select key, value from jsonb_each(p_reviews) loop
    if not (v_assignment.learning_plan->'competencyIds' ? v_key)
      or jsonb_typeof(v_value) <> 'string'
      or v_value #>> '{}' not in ('below', 'approaching', 'meeting', 'exceeding') then
      raise exception 'Rate only this activity''s skills, using a CBC performance level.' using errcode = '22023';
    end if;
  end loop;
  insert into public.competency_evidence(assignment_id, student_id, evidence_text, evidence_url, feedback, reviews, recorded_by)
  values (p_assignment_id, p_student_id, btrim(p_evidence_text), p_evidence_url, btrim(p_feedback), p_reviews, auth.uid())
  returning id into v_id;
  return v_id;
end;
$function$;

-- 2 ─────────────────────────────────────────────────────────────────────────
create table if not exists public.learning_cbc_assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.club_members,
  performance_level text not null check (performance_level in ('below','approaching','meeting','exceeding')),
  summary_snapshot jsonb not null,
  comment text not null check (length(btrim(comment)) between 1 and 5000),
  decided_by uuid not null references public.profiles,
  decided_at timestamptz not null default now()
);
alter table public.learning_cbc_assessments enable row level security;
revoke all on public.learning_cbc_assessments from anon, authenticated;
grant select on public.learning_cbc_assessments to authenticated;
drop policy if exists cbc_assessments_read on public.learning_cbc_assessments;
create policy cbc_assessments_read on public.learning_cbc_assessments for select to authenticated
  using (public.can_teach_learning_student(student_id) or public.is_my_learning_student(student_id));
create index if not exists learning_cbc_assessments_student_idx on public.learning_cbc_assessments(student_id, decided_at desc);

-- The latest rating for each skill (never the highest), points EE 4 · ME 3 ·
-- AE 2 · BE 1, and a suggested overall level from the rounded average.
create or replace function public.learning_cbc_summary(p_student_id uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare skills jsonb := '{}'; skill text; band text; total int := 0; rated int := 0; suggested text;
begin
  if not (public.can_teach_learning_student(p_student_id) or public.is_my_learning_student(p_student_id)) then
    raise exception 'Learner access denied.' using errcode = '42501';
  end if;
  foreach skill in array array['algorithms','programming','debugging','robotics','design','communication'] loop
    select e.reviews->>skill into band from public.competency_evidence e
      where e.student_id = p_student_id and e.reviews ? skill order by e.recorded_at desc, e.id desc limit 1;
    if band in ('below','approaching','meeting','exceeding') then
      skills := skills || jsonb_build_object(skill, band);
      total := total + case band when 'exceeding' then 4 when 'meeting' then 3 when 'approaching' then 2 else 1 end;
      rated := rated + 1;
    end if;
  end loop;
  if rated > 0 then
    suggested := case round(total::numeric / rated) when 4 then 'exceeding' when 3 then 'meeting' when 2 then 'approaching' else 'below' end;
  end if;
  return jsonb_build_object(
    'skills', skills, 'suggested_level', suggested,
    'lessons_sent', (select count(distinct a.lesson_id) from public.learning_submissions s join public.learning_assignments a on a.id = s.assignment_id where s.student_id = p_student_id),
    'projects_sent', (select count(distinct a.lesson_id) from public.learning_submissions s join public.learning_assignments a on a.id = s.assignment_id where s.student_id = p_student_id and a.learning_plan->>'activityKind' = 'capstone'),
    'final_checks_passed', (select count(distinct q.lesson_id) from public.learning_quiz_attempts t join public.learning_quizzes q on q.id = t.quiz_id where t.student_id = p_student_id and t.passed and q.stage = 'end'));
end; $$;

create or replace function public.record_cbc_assessment(p_student_id uuid, p_level text, p_comment text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.can_teach_learning_student(p_student_id) then raise exception 'Teacher access required for this learner.' using errcode = '42501'; end if;
  if p_level is null or p_level not in ('below','approaching','meeting','exceeding') then raise exception 'Choose a CBC performance level.'; end if;
  if length(btrim(coalesce(p_comment, ''))) not between 1 and 5000 then raise exception 'Add a comment: what the learner did well and what to do next.'; end if;
  insert into public.learning_cbc_assessments(student_id, performance_level, summary_snapshot, comment, decided_by)
  values (p_student_id, p_level, public.learning_cbc_summary(p_student_id), btrim(p_comment), auth.uid()) returning id into v_id;
  return v_id;
end; $$;
revoke all on function public.learning_cbc_summary(uuid), public.record_cbc_assessment(uuid, text, text) from public, anon;
grant execute on function public.learning_cbc_summary(uuid), public.record_cbc_assessment(uuid, text, text) to authenticated;

-- Level awards are retired: no screen uses them any more and their records
-- stay as history. The functions stay callable so a browser still on the old
-- screens keeps working until it reloads.

-- 3 ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.learning_pilot_report(p_school_id uuid, p_from date, p_to date)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare result jsonb;
begin
 if not public.can_manage_learning_school(p_school_id) then raise exception 'School reporting access required.' using errcode='42501'; end if;
 if p_from is null or p_to is null or p_to<p_from or p_to-p_from>366 then raise exception 'Choose an inclusive date range of up to 367 days.'; end if;
 with cohort as (select s.id from public.club_members s where s.school_id=p_school_id and s.is_active and public.can_teach_learning_student(s.id)),
 users_in_cohort as (select l.profile_id,l.student_id from public.learner_accounts l join cohort c on c.id=l.student_id),
 activity as (select u.student_id,e.kind,e.occurred_at from public.learning_activity_events e join users_in_cohort u on u.profile_id=e.profile_id where e.occurred_at>=p_from::timestamptz and e.occurred_at<(p_to+1)::timestamptz),
 attempts as (select a.* from public.learning_quiz_attempts a join cohort c on c.id=a.student_id join public.learning_quizzes q on q.id=a.quiz_id where q.stage is null and a.submitted_at>=p_from::timestamptz and a.submitted_at<(p_to+1)::timestamptz),
 work as (select s.* from public.learning_submissions s join cohort c on c.id=s.student_id where submitted_at>=p_from::timestamptz and submitted_at<(p_to+1)::timestamptz),
 cbc as (select distinct on (x.student_id) x.* from public.learning_cbc_assessments x join cohort c on c.id=x.student_id where x.decided_at>=p_from::timestamptz and x.decided_at<(p_to+1)::timestamptz order by x.student_id,x.decided_at desc,x.id desc),
 observations as (select distinct on (o.student_id,o.task) o.* from public.learning_task_observations o join cohort c on c.id=o.student_id where observed_at>=p_from::timestamptz and observed_at<(p_to+1)::timestamptz order by o.student_id,o.task,o.observed_at desc,o.id desc)
 select jsonb_build_object('school_id',p_school_id,'from',p_from,'to',p_to,'timezone','UTC','cohort','Current active roster accessible to this account',
 'enrolled_learners',(select count(*) from cohort),'learners_with_accounts',(select count(*) from users_in_cohort),
 'active_learners',(select count(distinct student_id) from activity),
 'retained_learners',(select count(*) from (select student_id from activity group by student_id having min(occurred_at)<(p_from+(p_to-p_from+1)/2)::timestamptz and max(occurred_at)>=(p_from+(p_to-p_from+1)/2)::timestamptz) r),
 'quiz_attempts',(select count(*) from attempts),'passed_quiz_attempts',(select count(*) from attempts where passed),
 'learners_passing_quizzes',(select count(distinct student_id) from attempts where passed),
 'submissions',(select count(*) from work),'learners_submitting',(select count(distinct student_id) from work),
 'project_artifacts',(select count(*) from work w join public.learning_assignments a on a.id=w.assignment_id where a.learning_plan->>'activityKind'='capstone'),
 'evidence_reviews',(select count(*) from public.competency_evidence e join cohort c on c.id=e.student_id where recorded_at>=p_from::timestamptz and recorded_at<(p_to+1)::timestamptz),
 'cbc_assessments',(select count(*) from cbc),
 'cbc_exceeding',(select count(*) from cbc where performance_level='exceeding'),'cbc_meeting',(select count(*) from cbc where performance_level='meeting'),
 'cbc_approaching',(select count(*) from cbc where performance_level='approaching'),'cbc_below',(select count(*) from cbc where performance_level='below'),
 'teacher_logins',(select count(distinct e.profile_id) from public.learning_activity_events e join public.profiles p on p.id=e.profile_id where e.school_id=p_school_id and p.role in ('teacher','school_lead') and (public.me_is_admin() or p.id=auth.uid() or public.me_school_id()=p_school_id) and e.kind='login' and e.occurred_at>=p_from::timestamptz and e.occurred_at<(p_to+1)::timestamptz),
 'resource_opens',(select count(*) from public.learning_activity_events e join public.profiles p on p.id=e.profile_id where e.school_id=p_school_id and (p.id=auth.uid() or exists(select 1 from users_in_cohort u where u.profile_id=p.id) or public.me_is_admin() or public.me_school_id()=p_school_id) and e.kind='resource_open' and e.occurred_at>=p_from::timestamptz and e.occurred_at<(p_to+1)::timestamptz),
 'attendance_present',(select count(*) from public.session_attendance sa join public.sessions se on se.id=sa.session_id join cohort c on c.id=sa.learner_id where sa.present and se.school_id=p_school_id and se.session_date between p_from and p_to),
 'attendance_recorded',(select count(*) from public.session_attendance sa join public.sessions se on se.id=sa.session_id join cohort c on c.id=sa.learner_id where se.school_id=p_school_id and se.session_date between p_from and p_to),
 'observed_tasks',(select count(*) from observations),'independent_tasks',(select count(*) from observations where independent),'tasks_with_barriers',(select count(*) from observations where barrier<>'')) into result;
 return result;
end; $function$;

-- 4 ─────────────────────────────────────────────────────────────────────────
update public.lessons set is_active = false,
  review_notes = 'Switched off on 2026-10-21: the course now covers the basics only. Set is_active back to true to restore.'
where id in (
  select id from public.lessons where learning_plan->>'delivery' = 'blockly'
  and (id::text between 'b10c1000-0000-4000-8000-000000000009' and 'b10c1000-0000-4000-8000-000000000020'
       or id in ('b10c2000-0000-4000-8000-000000000002', 'b10c2000-0000-4000-8000-000000000003')));
update public.learning_quizzes set is_active = false
where is_active and (slug in ('intermediate-coding-check', 'expert-coding-check')
  or lesson_id in (select id from public.lessons where not is_active and learning_plan->>'delivery' = 'blockly'));
update public.learning_quizzes set title = 'Coding check' where slug = 'beginner-coding-check' and title = 'Coding check 1';
