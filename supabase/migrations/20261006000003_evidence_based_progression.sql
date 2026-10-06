-- Progression depends on learner evidence and a teacher decision, without curriculum sign-off.
-- Preserve historical policy versions, flags and decision snapshots; no learner data is changed.
-- policy_approved remains legacy metadata for older clients, not an award requirement.
create or replace function public.learning_progression_readiness(p_student_id uuid,p_level text) returns jsonb language plpgsql stable security definer set search_path=public as $$
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
 'ready',jsonb_array_length(missing)=0 and quiz_id is not null and capstone_id is not null and previous_ok);
end; $$;
create or replace function public.record_learning_progression(p_student_id uuid,p_level text,p_outcome text,p_reason text) returns uuid language plpgsql security definer set search_path=public as $$
declare readiness jsonb; v_id uuid;
begin
 if not public.can_teach_learning_student(p_student_id) then raise exception 'Teacher access required for this learner.' using errcode='42501'; end if;
 if p_outcome is null or p_outcome not in ('awarded','deferred','revoked') or length(btrim(coalesce(p_reason,''))) not between 1 and 5000 then raise exception 'Choose a decision and explain the next steps.'; end if;
 perform pg_advisory_xact_lock(hashtext(p_student_id::text));
 readiness:=public.learning_progression_readiness(p_student_id,p_level);
 if p_outcome='revoked' and not exists(select 1 from public.learning_progression_decisions where student_id=p_student_id and level=p_level) then raise exception 'There is no prior decision to revoke.'; end if;
 if p_outcome='awarded' and not (readiness->>'ready')::boolean then raise exception 'A level requires demonstrated competencies, a passed quiz, reviewed Blockly capstone and any previous level.'; end if;
 insert into public.learning_progression_decisions(student_id,level,outcome,policy_id,evidence_snapshot,reason,decided_by)
 values(p_student_id,p_level,p_outcome,(readiness->>'policy_id')::uuid,readiness,btrim(p_reason),auth.uid()) returning id into v_id;
 return v_id;
end; $$;

-- Retire the dashboard approval RPC; historical policy records remain intact.
revoke all on function public.approve_learning_progression_policy(text) from public, anon, authenticated;
