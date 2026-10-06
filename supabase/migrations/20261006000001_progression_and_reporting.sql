create table public.learning_progression_policies (
 id uuid primary key default gen_random_uuid(), version bigint generated always as identity unique, name text not null, framework_version text not null,
 required_competencies jsonb not null, approved boolean not null default false,
 review_notes text not null, created_at timestamptz not null default now(), created_by uuid references public.profiles
);
create table public.learning_progression_decisions (
 id uuid primary key default gen_random_uuid(), student_id uuid not null references public.club_members,
 level text not null check(level in ('beginner','intermediate','expert')), outcome text not null check(outcome in ('awarded','deferred','revoked')),
 policy_id uuid not null references public.learning_progression_policies, evidence_snapshot jsonb not null,
 reason text not null check(length(reason) between 1 and 5000), decided_by uuid not null references public.profiles,
 decided_at timestamptz not null default now()
);
create table public.learning_activity_events (
 id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles,
 school_id uuid references public.schools, kind text not null check(kind in ('login','resource_open','dashboard_open')),
 lesson_id uuid references public.lessons, occurred_at timestamptz not null default now()
);
create table public.learning_task_observations (
 id uuid primary key default gen_random_uuid(), student_id uuid not null references public.club_members,
 task text not null check(length(task) between 1 and 200), independent boolean not null,
 barrier text not null default '' check(length(barrier)<=5000), observed_by uuid not null references public.profiles,
 observed_at timestamptz not null default now()
);
-- A proposed policy is usable for readiness checks, but cannot award a level until
-- an admin has explicitly approved a NEW version with review notes.
insert into public.learning_progression_policies(name,framework_version,required_competencies,review_notes)
values('ChipuRobo pilot progression — draft','0.1','{"beginner":["algorithms","programming","debugging","design","communication"],"intermediate":["algorithms","programming","debugging","design","communication"],"expert":["algorithms","programming","debugging","robotics","design","communication"]}',
 'Proposed ChipuRobo criteria. Full current KICD mapping remains unverified. Passing quizzes and reviewed capstone work do not automatically award a level.');
do $$ declare t text; begin
 foreach t in array array['learning_progression_policies','learning_progression_decisions','learning_activity_events','learning_task_observations'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 end loop;
end $$;
grant select on public.learning_progression_policies,public.learning_progression_decisions,public.learning_task_observations to authenticated;
create policy policies_read on public.learning_progression_policies for select to authenticated using(exists(select 1 from public.profiles where id=auth.uid()));
create policy decisions_read on public.learning_progression_decisions for select to authenticated using(public.can_teach_learning_student(student_id) or public.is_my_learning_student(student_id));
create policy observations_read on public.learning_task_observations for select to authenticated using(public.can_teach_learning_student(student_id) or public.is_my_learning_student(student_id));
create function public.approve_learning_progression_policy(p_notes text) returns uuid language plpgsql security definer set search_path=public as $$
declare v public.learning_progression_policies; v_id uuid;
begin
 if not public.me_is_admin() then raise exception 'Admin access required.' using errcode='42501'; end if;
 if length(btrim(coalesce(p_notes,''))) not between 20 and 5000 then raise exception 'Record the curriculum review and why these ChipuRobo criteria are approved (20–5000 characters).'; end if;
 select * into v from public.learning_progression_policies order by version desc limit 1;
 insert into public.learning_progression_policies(name,framework_version,required_competencies,approved,review_notes,created_by)
 values('ChipuRobo pilot progression',v.framework_version,v.required_competencies,true,btrim(p_notes),auth.uid()) returning id into v_id;
 return v_id;
end; $$;
create function public.learning_progression_readiness(p_student_id uuid,p_level text) returns jsonb language plpgsql stable security definer set search_path=public as $$
declare policy public.learning_progression_policies; required text; v_review uuid; v_band text; missing jsonb:='[]'; evidence_ids jsonb:='[]'; quiz_id uuid; capstone_id uuid; previous_level text; previous_ok boolean:=true;
begin
 if not (public.can_teach_learning_student(p_student_id) or public.is_my_learning_student(p_student_id)) then raise exception 'Learner access denied.' using errcode='42501'; end if;
 if p_level is null or p_level not in ('beginner','intermediate','expert') then raise exception 'Choose a learning level.'; end if;
 select * into policy from public.learning_progression_policies order by version desc limit 1;
 for required in select jsonb_array_elements_text(policy.required_competencies->p_level) loop
  v_review:=null; v_band:=null;
  select e.id,e.reviews->>required into v_review,v_band from public.competency_evidence e join public.learning_assignments a on a.id=e.assignment_id
  where e.student_id=p_student_id and a.learning_plan->>'level'=p_level and a.learning_plan->>'frameworkVersion'=policy.framework_version and e.reviews ? required
  order by e.recorded_at desc,e.id desc limit 1;
  if v_band is null or v_band not in ('demonstrated','extending') then missing:=missing||to_jsonb(required); else evidence_ids:=evidence_ids||to_jsonb(v_review); end if;
 end loop;
 select id into quiz_id from public.learning_quiz_attempts where student_id=p_student_id and passed and question_snapshot->>'level'=p_level order by submitted_at desc,id desc limit 1;
 select e.id into capstone_id from public.competency_evidence e join public.learning_assignments a on a.id=e.assignment_id join public.learning_submissions s on s.id=e.submission_id
 where e.student_id=p_student_id and a.learning_plan->>'level'=p_level and a.learning_plan->>'frameworkVersion'=policy.framework_version
 and a.learning_plan->>'activityKind'='capstone' and s.blockly_workspace is not null
 and not exists(select 1 from public.competency_evidence newer where newer.student_id=e.student_id and newer.assignment_id=e.assignment_id and (newer.recorded_at,newer.id)>(e.recorded_at,e.id))
 and not exists(select 1 from jsonb_array_elements_text(a.learning_plan->'competencyIds') c where coalesce(e.reviews->>c,'') not in ('demonstrated','extending'))
 order by e.recorded_at desc,e.id desc limit 1;
 previous_level:=case p_level when 'intermediate' then 'beginner' when 'expert' then 'intermediate' end;
 if previous_level is not null then
  select coalesce((select outcome='awarded' from public.learning_progression_decisions where student_id=p_student_id and level=previous_level order by decided_at desc,id desc limit 1),false) into previous_ok;
 end if;
 return jsonb_build_object('policy_id',policy.id,'policy_approved',policy.approved,'level',p_level,'missing_competencies',missing,'evidence_ids',evidence_ids,
 'quiz_attempt_id',quiz_id,'capstone_review_id',capstone_id,'previous_level_awarded',previous_ok,
 'ready',policy.approved and jsonb_array_length(missing)=0 and quiz_id is not null and capstone_id is not null and previous_ok);
end; $$;
create function public.record_learning_progression(p_student_id uuid,p_level text,p_outcome text,p_reason text) returns uuid language plpgsql security definer set search_path=public as $$
declare readiness jsonb; v_id uuid;
begin
 if not public.can_teach_learning_student(p_student_id) then raise exception 'Teacher access required for this learner.' using errcode='42501'; end if;
 if p_outcome is null or p_outcome not in ('awarded','deferred','revoked') or length(btrim(coalesce(p_reason,''))) not between 1 and 5000 then raise exception 'Choose a decision and explain the next steps.'; end if;
 perform pg_advisory_xact_lock(hashtext(p_student_id::text));
 readiness:=public.learning_progression_readiness(p_student_id,p_level);
 if p_outcome='revoked' and not exists(select 1 from public.learning_progression_decisions where student_id=p_student_id and level=p_level) then raise exception 'There is no prior decision to revoke.'; end if;
 if p_outcome='awarded' and not (readiness->>'ready')::boolean then raise exception 'A level requires an approved policy, demonstrated competencies, a passed quiz, reviewed Blockly capstone and any previous level.'; end if;
 insert into public.learning_progression_decisions(student_id,level,outcome,policy_id,evidence_snapshot,reason,decided_by)
 values(p_student_id,p_level,p_outcome,(readiness->>'policy_id')::uuid,readiness,btrim(p_reason),auth.uid()) returning id into v_id;
 return v_id;
end; $$;
create function public.record_learning_activity(p_kind text,p_lesson_id uuid default null) returns void language plpgsql security definer set search_path=public as $$
declare v_school uuid;
begin
 select school_id into v_school from public.profiles where id=auth.uid();
 if not found then raise exception 'Sign in to record activity.' using errcode='42501'; end if;
 if p_kind is null or p_kind not in ('login','resource_open','dashboard_open') then raise exception 'Unknown activity.'; end if;
 if p_lesson_id is not null and not exists(select 1 from public.lessons where id=p_lesson_id and is_active) then raise exception 'Lesson unavailable.'; end if;
 -- Bound repeated opens; activity is an exposure signal, never attainment.
 if not exists(select 1 from public.learning_activity_events where profile_id=auth.uid() and kind=p_kind and lesson_id is not distinct from p_lesson_id and occurred_at>now()-interval '5 minutes') then
 insert into public.learning_activity_events(profile_id,school_id,kind,lesson_id) values(auth.uid(),v_school,p_kind,p_lesson_id); end if;
end; $$;
create function public.record_learning_task_observation(p_student_id uuid,p_task text,p_independent boolean,p_barrier text) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.can_teach_learning_student(p_student_id) then raise exception 'Teacher access required.' using errcode='42501'; end if;
 if length(btrim(coalesce(p_task,''))) not between 1 and 200 or p_independent is null or length(coalesce(p_barrier,''))>5000 then raise exception 'Enter the task and observation.'; end if;
 insert into public.learning_task_observations(student_id,task,independent,barrier,observed_by) values(p_student_id,btrim(p_task),p_independent,coalesce(p_barrier,''),auth.uid());
end; $$;
create function public.learning_pilot_report(p_school_id uuid,p_from date,p_to date) returns jsonb language plpgsql stable security definer set search_path=public as $$
declare result jsonb;
begin
 if not public.can_manage_learning_school(p_school_id) then raise exception 'School reporting access required.' using errcode='42501'; end if;
 if p_from is null or p_to is null or p_to<p_from or p_to-p_from>366 then raise exception 'Choose an inclusive date range of up to 367 days.'; end if;
 with cohort as (select s.id from public.club_members s where s.school_id=p_school_id and s.is_active and public.can_teach_learning_student(s.id)),
 users_in_cohort as (select l.profile_id,l.student_id from public.learner_accounts l join cohort c on c.id=l.student_id),
 activity as (select u.student_id,e.kind,e.occurred_at from public.learning_activity_events e join users_in_cohort u on u.profile_id=e.profile_id where e.occurred_at>=p_from::timestamptz and e.occurred_at<(p_to+1)::timestamptz),
 attempts as (select a.* from public.learning_quiz_attempts a join cohort c on c.id=a.student_id where submitted_at>=p_from::timestamptz and submitted_at<(p_to+1)::timestamptz),
 work as (select s.* from public.learning_submissions s join cohort c on c.id=s.student_id where submitted_at>=p_from::timestamptz and submitted_at<(p_to+1)::timestamptz),
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
 'level_awards',(select count(*) from public.learning_progression_decisions d join cohort c on c.id=d.student_id where outcome='awarded' and decided_at>=p_from::timestamptz and decided_at<(p_to+1)::timestamptz),
 'teacher_logins',(select count(distinct e.profile_id) from public.learning_activity_events e join public.profiles p on p.id=e.profile_id where e.school_id=p_school_id and p.role in ('teacher','school_lead') and (public.me_is_admin() or p.id=auth.uid() or public.me_school_id()=p_school_id) and e.kind='login' and e.occurred_at>=p_from::timestamptz and e.occurred_at<(p_to+1)::timestamptz),
 'resource_opens',(select count(*) from public.learning_activity_events e join public.profiles p on p.id=e.profile_id where e.school_id=p_school_id and (p.id=auth.uid() or exists(select 1 from users_in_cohort u where u.profile_id=p.id) or public.me_is_admin() or public.me_school_id()=p_school_id) and e.kind='resource_open' and e.occurred_at>=p_from::timestamptz and e.occurred_at<(p_to+1)::timestamptz),
 'attendance_present',(select count(*) from public.session_attendance sa join public.sessions se on se.id=sa.session_id join cohort c on c.id=sa.learner_id where sa.present and se.school_id=p_school_id and se.session_date between p_from and p_to),
 'attendance_recorded',(select count(*) from public.session_attendance sa join public.sessions se on se.id=sa.session_id join cohort c on c.id=sa.learner_id where se.school_id=p_school_id and se.session_date between p_from and p_to),
 'observed_tasks',(select count(*) from observations),'independent_tasks',(select count(*) from observations where independent),'tasks_with_barriers',(select count(*) from observations where barrier<>'')) into result;
 return result;
end; $$;
revoke all on function public.approve_learning_progression_policy(text),public.learning_progression_readiness(uuid,text),public.record_learning_progression(uuid,text,text,text),public.record_learning_activity(text,uuid),public.record_learning_task_observation(uuid,text,boolean,text),public.learning_pilot_report(uuid,date,date) from public,anon;
grant execute on function public.approve_learning_progression_policy(text),public.learning_progression_readiness(uuid,text),public.record_learning_progression(uuid,text,text,text),public.record_learning_activity(text,uuid),public.record_learning_task_observation(uuid,text,boolean,text),public.learning_pilot_report(uuid,date,date) to authenticated;
create index on public.learning_activity_events(profile_id,occurred_at desc);
create index on public.learning_progression_decisions(student_id,level,decided_at desc);
create function public.record_learning_attendance(p_school_id uuid,p_date date,p_lesson_id uuid,p_attendance jsonb) returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid; entry record; v_student uuid;
begin
 if not public.can_manage_learning_school(p_school_id) then raise exception 'Teacher access required.' using errcode='42501'; end if;
 if p_date is null or p_date>current_date or jsonb_typeof(p_attendance) is distinct from 'object' then raise exception 'Choose the delivered session date and learners.'; end if;
 if (select count(*) from jsonb_object_keys(p_attendance)) not between 1 and 500 then raise exception 'Choose 1–500 learners.'; end if;
 if p_lesson_id is not null and not exists(select 1 from public.lessons where id=p_lesson_id and is_active) then raise exception 'Choose an active lesson.'; end if;
 for entry in select * from jsonb_each(p_attendance) loop
  v_student:=entry.key::uuid;
  if jsonb_typeof(entry.value)<>'boolean' or not exists(select 1 from public.club_members where id=v_student and school_id=p_school_id and is_active and public.can_teach_learning_student(id)) then raise exception 'Choose active allocated learners from this school.' using errcode='42501'; end if;
 end loop;
 insert into public.sessions(school_id,activity_type,session_date,lesson_id,delivered,focus,recorded_by)
 values(p_school_id,'weekly_code_club',p_date,p_lesson_id,'yes','Dashboard learning session',auth.uid()) returning id into v_id;
 insert into public.session_attendance(session_id,learner_id,present) select v_id,key::uuid,(value#>>'{}')::boolean from jsonb_each(p_attendance);
 return v_id;
end; $$;
revoke all on function public.record_learning_attendance(uuid,date,uuid,jsonb) from public,anon;
grant execute on function public.record_learning_attendance(uuid,date,uuid,jsonb) to authenticated;
