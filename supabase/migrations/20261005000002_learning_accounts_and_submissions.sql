-- Separate learning identities from school operations. Existing accounts retain
-- their roles; only an admin can create a new teacher or learner identity.
create table public.teacher_students (
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.club_members(id) on delete cascade,
  primary key(teacher_id, student_id)
);
create table public.learner_accounts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  student_id uuid not null unique references public.club_members(id) on delete cascade
);

-- Legacy policies use this helper for school-wide operations. A teacher or
-- learner must never inherit orders, stock, rosters, safeguarding or MERL access.
create or replace function public.me_school_id()
returns uuid language sql stable security definer set search_path = public as $$
  select school_id from public.profiles where id=auth.uid() and role='school_lead';
$$;

create or replace function public.can_manage_learning_school(p_school_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid()
    and (p.role='admin' or (p.role in ('school_lead','teacher') and p.school_id=p_school_id)));
$$;

create or replace function public.can_teach_learning_student(p_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles p join public.club_members s on s.id=p_student_id
    where p.id=auth.uid() and (p.role='admin' or (p.role='school_lead' and p.school_id=s.school_id)
      or (p.role='teacher' and p.school_id=s.school_id and exists(select 1 from public.teacher_students ts
        where ts.teacher_id=p.id and ts.student_id=s.id))));
$$;

create or replace function public.is_my_learning_student(p_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles p join public.learner_accounts l on l.profile_id=p.id
    join public.club_members s on s.id=l.student_id
    where p.id=auth.uid() and p.role='learner' and s.id=p_student_id and s.is_active
      and p.school_id=s.school_id);
$$;

create or replace function public.can_read_learning_assignment(p_assignment_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.learning_assignments a join public.profiles p on p.id=auth.uid()
    where a.id=p_assignment_id and (p.role='admin' or (p.role='school_lead' and p.school_id=a.school_id)
      or (p.role='teacher' and p.school_id=a.school_id and a.assigned_by=p.id)
      or (p.role='learner' and p.school_id=a.school_id and exists(
        select 1 from public.learning_assignment_recipients r where r.assignment_id=a.id
          and public.is_my_learning_student(r.student_id)))));
$$;

alter table public.teacher_students enable row level security;
alter table public.learner_accounts enable row level security;
create policy teacher_students_read on public.teacher_students for select to authenticated
  using (public.me_is_admin() or teacher_id=auth.uid());
create policy learner_accounts_read on public.learner_accounts for select to authenticated
  using (public.me_is_admin() or profile_id=auth.uid());
revoke all on public.teacher_students, public.learner_accounts from anon, authenticated;
grant select on public.teacher_students, public.learner_accounts to authenticated;

drop policy learning_assignments_read on public.learning_assignments;
create policy learning_assignments_read on public.learning_assignments for select to authenticated
  using (public.can_read_learning_assignment(id));
drop policy learning_recipients_read on public.learning_assignment_recipients;
create policy learning_recipients_read on public.learning_assignment_recipients for select to authenticated
  using (public.can_read_learning_assignment(assignment_id)
    and (public.can_teach_learning_student(student_id) or public.is_my_learning_student(student_id)));
drop policy competency_evidence_read on public.competency_evidence;
create policy competency_evidence_read on public.competency_evidence for select to authenticated
  using (public.can_read_learning_assignment(assignment_id)
    and (public.can_teach_learning_student(student_id) or public.is_my_learning_student(student_id)));

create table public.learning_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null,
  student_id uuid not null,
  evidence_text text not null check(length(btrim(evidence_text)) between 1 and 10000),
  evidence_url text check(evidence_url is null or evidence_url ~* '^https?://[^[:space:]]+$'),
  reflection text not null default '' check(length(reflection)<=5000),
  submitted_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz not null default now(),
  foreign key(assignment_id, student_id) references public.learning_assignment_recipients on delete cascade
);
create index learning_submissions_assignment_student_idx on public.learning_submissions(assignment_id, student_id, submitted_at desc);
alter table public.learning_submissions enable row level security;
create policy learning_submissions_read on public.learning_submissions for select to authenticated
  using(public.can_read_learning_assignment(assignment_id)
    and (public.can_teach_learning_student(student_id) or public.is_my_learning_student(student_id)));
revoke all on public.learning_submissions from anon, authenticated;
grant select on public.learning_submissions to authenticated;
alter table public.competency_evidence add column submission_id uuid references public.learning_submissions(id) on delete set null;

create or replace function public.get_my_learning_school()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id',s.id,'name',s.name,'type',s.type,'is_maker_space',false)
  from public.schools s join public.profiles p on p.school_id=s.id
  where p.id=auth.uid() and (p.role='teacher' or (p.role='learner' and exists(
    select 1 from public.learner_accounts l where l.profile_id=p.id and public.is_my_learning_student(l.student_id))));
$$;

-- Whitelist roster fields. No learner receives classmates' names, support
-- notes, contacts or other school-operation fields via the old roster endpoint.
create or replace function public.get_my_learning_students(p_school_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'school_id',s.school_id,
    'full_name',s.full_name,'grade',s.grade,'learner_code',s.learner_code,
    'is_active',s.is_active,'in_club',s.in_club) order by s.full_name),'[]'::jsonb)
  from public.club_members s where s.school_id=p_school_id
    and (public.can_teach_learning_student(s.id) or public.is_my_learning_student(s.id));
$$;

create or replace function public.admin_set_teacher_students(p_teacher_id uuid, p_student_ids uuid[])
returns void language plpgsql security definer set search_path = public as $$
declare v_school uuid; v_count integer;
begin
  if not public.me_is_admin() then raise exception 'Admin access required.' using errcode='42501'; end if;
  select school_id into v_school from public.profiles where id=p_teacher_id and role='teacher';
  if not found then raise exception 'Teacher account not found.' using errcode='22023'; end if;
  if p_student_ids is null or cardinality(p_student_ids)>500 then
    raise exception 'Choose up to 500 learners.' using errcode='22023'; end if;
  select count(*) into v_count from public.club_members where id=any(p_student_ids) and school_id=v_school and is_active;
  if v_count<>cardinality(p_student_ids) then
    raise exception 'Choose distinct active learners from the teacher''s school.' using errcode='22023'; end if;
  delete from public.teacher_students where teacher_id=p_teacher_id;
  insert into public.teacher_students select p_teacher_id, unnest(p_student_ids);
end;
$$;

create or replace function public.admin_create_learning_account(
  p_school_id uuid, p_role text, p_login text, p_password text,
  p_full_name text, p_student_id uuid default null, p_teacher_student_ids uuid[] default '{}'
) returns jsonb language plpgsql security definer set search_path = public, auth, extensions as $$
declare v_id uuid; v_login text := lower(btrim(coalesce(p_login,''))); v_name text;
begin
  if not public.me_is_admin() then raise exception 'Admin access required.' using errcode='42501'; end if;
  if p_role not in ('teacher','learner') or p_role is null then
    raise exception 'Choose teacher or learner.' using errcode='22023'; end if;
  if not exists(select 1 from public.schools where id=p_school_id) then
    raise exception 'School not found.' using errcode='22023'; end if;
  if p_role='learner' then
    select full_name into v_name from public.club_members where id=p_student_id and school_id=p_school_id and is_active;
    if not found then raise exception 'Choose an active learner at this school.' using errcode='22023'; end if;
    if v_login !~ '^[a-z0-9][a-z0-9._-]{2,31}$' then
      raise exception 'Learner username must be 3–32 lowercase letters, numbers, dots, dashes or underscores.' using errcode='22023'; end if;
    v_login := v_login || '@learners.chipurobo.local';
  else
    v_name := btrim(coalesce(p_full_name,''));
    if length(v_name) not between 1 and 200 then raise exception 'Enter the teacher''s name.' using errcode='22023'; end if;
  end if;
  v_id := public.mint_login(v_login, p_password, v_name);
  update public.profiles set role=p_role::public.user_role, school_id=p_school_id, full_name=v_name where id=v_id;
  if p_role='learner' then
    insert into public.learner_accounts values(v_id,p_student_id);
  else
    perform public.admin_set_teacher_students(v_id,p_teacher_student_ids);
  end if;
  return jsonb_build_object('user_id',v_id,'login',case when p_role='learner' then split_part(v_login,'@',1) else v_login end,'role',p_role);
end;
$$;

create or replace function public.admin_list_learning_accounts(p_school_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.me_is_admin() then raise exception 'Admin access required.' using errcode='42501'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'role',p.role,'full_name',p.full_name,
    'login',case when p.role='learner' then split_part(u.email,'@',1) else u.email end,
    'student_id',l.student_id) order by p.full_name),'[]'::jsonb)
    from public.profiles p join auth.users u on u.id=p.id left join public.learner_accounts l on l.profile_id=p.id
    where p.school_id=p_school_id and p.role in ('teacher','learner'));
end;
$$;

create or replace function public.submit_learning_work(p_assignment_id uuid, p_evidence_text text,
  p_evidence_url text default null, p_reflection text default '')
returns uuid language plpgsql security definer set search_path = public as $$
declare v_student uuid; v_id uuid;
begin
  select student_id into v_student from public.learner_accounts where profile_id=auth.uid()
    and public.is_my_learning_student(student_id);
  if not found or not public.can_read_learning_assignment(p_assignment_id)
    or not exists(select 1 from public.learning_assignment_recipients where assignment_id=p_assignment_id and student_id=v_student) then
    raise exception 'You can submit only your own assigned work.' using errcode='42501'; end if;
  if length(btrim(coalesce(p_evidence_text,''))) not between 1 and 10000
    or length(coalesce(p_reflection,''))>5000 then
    raise exception 'Describe your work and keep the reflection under 5000 characters.' using errcode='22023'; end if;
  if p_evidence_url is not null and (length(p_evidence_url)>2000 or p_evidence_url !~* '^https?://[^[:space:]]+$') then
    raise exception 'Evidence links must use http:// or https://.' using errcode='22023'; end if;
  insert into public.learning_submissions(assignment_id,student_id,evidence_text,evidence_url,reflection,submitted_by)
  values(p_assignment_id,v_student,btrim(p_evidence_text),p_evidence_url,coalesce(p_reflection,''),auth.uid()) returning id into v_id;
  return v_id;
end;
$$;

-- Checked writes are defined below. All helpers deny access without a profile.
revoke all on function public.can_teach_learning_student(uuid),public.is_my_learning_student(uuid),
  public.can_read_learning_assignment(uuid),public.get_my_learning_school(),public.get_my_learning_students(uuid),
  public.admin_set_teacher_students(uuid,uuid[]),public.admin_create_learning_account(uuid,text,text,text,text,uuid,uuid[]),
  public.admin_list_learning_accounts(uuid),public.submit_learning_work(uuid,text,text,text) from public,anon;
grant execute on function public.can_teach_learning_student(uuid),public.is_my_learning_student(uuid),
  public.can_read_learning_assignment(uuid),public.get_my_learning_school(),public.get_my_learning_students(uuid),
  public.admin_set_teacher_students(uuid,uuid[]),public.admin_create_learning_account(uuid,text,text,text,text,uuid,uuid[]),
  public.admin_list_learning_accounts(uuid),public.submit_learning_work(uuid,text,text,text) to authenticated;

create or replace function public.assign_learning_lesson(
  p_lesson_id uuid, p_school_id uuid, p_student_ids uuid[],
  p_instructions text default '', p_due_date date default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_lesson public.lessons%rowtype; v_id uuid; v_count integer;
begin
  if not public.can_manage_learning_school(p_school_id) then
    raise exception 'You cannot assign learning activities to this school.' using errcode = '42501';
  end if;
  select * into v_lesson from public.lessons where id = p_lesson_id and is_active;
  if not found or not public.valid_lesson_learning_plan(v_lesson.learning_plan) then
    raise exception 'An active lesson needs a saved learning plan before it can be assigned.' using errcode = '22023';
  end if;
  if coalesce(cardinality(p_student_ids), 0) not between 1 and 500 then
    raise exception 'Select between 1 and 500 active students.' using errcode = '22023';
  end if;
  select count(*) into v_count from public.club_members where id = any(p_student_ids)
    and school_id = p_school_id and is_active;
  if v_count <> cardinality(p_student_ids) then
    raise exception 'Every recipient must be a distinct active student at this school.' using errcode = '22023';
  end if;
  if length(coalesce(p_instructions, '')) > 10000 then
    raise exception 'Instructions are too long.' using errcode = '22023';
  end if;
  if exists(select 1 from unnest(p_student_ids) as student(id) where not public.can_teach_learning_student(student.id)) then
    raise exception 'Assign only learners allocated to your teaching group.' using errcode='42501';
  end if;
  insert into public.learning_assignments(school_id, lesson_id, title, instructions, due_date, learning_plan, assigned_by)
  values (p_school_id, p_lesson_id, v_lesson.title, btrim(coalesce(p_instructions, '')), p_due_date,
    v_lesson.learning_plan, auth.uid()) returning id into v_id;
  insert into public.learning_assignment_recipients(assignment_id, student_id)
    select v_id, unnest(p_student_ids);
  return v_id;
end;
$$;

create or replace function public.record_competency_evidence(
  p_assignment_id uuid, p_student_id uuid, p_evidence_text text,
  p_evidence_url text, p_feedback text, p_reviews jsonb
) returns uuid language plpgsql security definer set search_path = public as $$
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
    raise exception 'Review at least one competency.' using errcode = '22023';
  end if;
  for v_key, v_value in select key, value from jsonb_each(p_reviews) loop
    if not (v_assignment.learning_plan->'competencyIds' ? v_key)
      or jsonb_typeof(v_value) <> 'string'
      or v_value #>> '{}' not in ('developing', 'demonstrated', 'extending') then
      raise exception 'Review only the competencies and ratings defined for this assignment.' using errcode = '22023';
    end if;
  end loop;
  insert into public.competency_evidence(assignment_id, student_id, evidence_text, evidence_url, feedback, reviews, recorded_by)
  values (p_assignment_id, p_student_id, btrim(p_evidence_text), p_evidence_url, btrim(p_feedback), p_reviews, auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;


create or replace function public.review_learning_submission(p_submission_id uuid, p_feedback text, p_reviews jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_submission public.learning_submissions%rowtype; v_id uuid;
begin
  select * into v_submission from public.learning_submissions where id=p_submission_id;
  if not found or not public.can_read_learning_assignment(v_submission.assignment_id)
    or not public.can_teach_learning_student(v_submission.student_id) then
    raise exception 'You cannot review this learner''s submission.' using errcode='42501'; end if;
  v_id := public.record_competency_evidence(v_submission.assignment_id,v_submission.student_id,
    v_submission.evidence_text,v_submission.evidence_url,p_feedback,p_reviews);
  update public.competency_evidence set submission_id=p_submission_id where id=v_id;
  return v_id;
end;
$$;
revoke all on function public.review_learning_submission(uuid,text,jsonb) from public,anon;
grant execute on function public.review_learning_submission(uuid,text,jsonb) to authenticated;
