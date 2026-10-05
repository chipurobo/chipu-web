-- Dashboard learning actions. The current users remain admins/school leads.
-- Learner account access must be introduced with its own audited policies.
-- No anonymous content or write access; assignments and evidence are snapshots.
create or replace function public.valid_lesson_learning_plan(p_plan jsonb)
returns boolean language plpgsql immutable set search_path = public as $$
declare v_item jsonb;
begin
  if p_plan is null or jsonb_typeof(p_plan) <> 'object' then return false; end if;
  if not coalesce(
    jsonb_typeof(p_plan->'frameworkVersion') = 'string'
    and jsonb_typeof(p_plan->'pathwayId') = 'string'
    and jsonb_typeof(p_plan->'level') = 'string'
    and p_plan->>'frameworkVersion' = '0.1'
    and p_plan->>'pathwayId' in ('creative-coding', 'physical-computing', 'project-design')
    and p_plan->>'level' in ('beginner', 'intermediate', 'expert')
    and jsonb_typeof(p_plan->'competencyIds') = 'array'
    and jsonb_typeof(p_plan->'steps') = 'array'
    and jsonb_typeof(p_plan->'evidenceBrief') = 'string'
    and length(btrim(p_plan->>'evidenceBrief')) between 1 and 5000, false)
  then return false; end if;
  if jsonb_array_length(p_plan->'competencyIds') not between 1 and 6
     or jsonb_array_length(p_plan->'steps') not between 1 and 50 then return false; end if;
  for v_item in select value from jsonb_array_elements(p_plan->'competencyIds') loop
    if jsonb_typeof(v_item) <> 'string' or v_item #>> '{}' not in
      ('algorithms','programming','debugging','robotics','design','communication') then return false; end if;
  end loop;
  if (select count(distinct value) from jsonb_array_elements(p_plan->'competencyIds'))
     <> jsonb_array_length(p_plan->'competencyIds') then return false; end if;
  for v_item in select value from jsonb_array_elements(p_plan->'steps') loop
    if jsonb_typeof(v_item) <> 'string' or length(btrim(v_item #>> '{}')) not between 1 and 5000
    then return false; end if;
  end loop;
  return true;
end;
$$;

alter table public.lessons add column learning_plan jsonb;
alter table public.lessons add constraint lessons_learning_plan_valid
  check (learning_plan is null or public.valid_lesson_learning_plan(learning_plan));

create table public.learning_assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete restrict,
  title text not null,
  instructions text not null default '',
  due_date date,
  learning_plan jsonb not null check (public.valid_lesson_learning_plan(learning_plan)),
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index learning_assignments_school_lesson_idx on public.learning_assignments(school_id, lesson_id);

create table public.learning_assignment_recipients (
  assignment_id uuid not null references public.learning_assignments(id) on delete cascade,
  student_id uuid not null references public.club_members(id) on delete cascade,
  primary key (assignment_id, student_id)
);
create index learning_recipients_student_idx on public.learning_assignment_recipients(student_id);

create table public.competency_evidence (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null,
  student_id uuid not null,
  evidence_text text not null,
  evidence_url text check (evidence_url is null or evidence_url ~* '^https?://[^[:space:]]+$'),
  reviews jsonb not null,
  feedback text not null,
  recorded_by uuid references public.profiles(id) on delete set null,
  recorded_at timestamptz not null default now(),
  foreign key (assignment_id, student_id) references public.learning_assignment_recipients
    (assignment_id, student_id) on delete cascade
);
create index competency_evidence_assignment_student_idx on public.competency_evidence(assignment_id, student_id, recorded_at desc);

create or replace function public.can_manage_learning_school(p_school_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid()
    and (p.role = 'admin' or (p.role = 'school_lead' and p.school_id = p_school_id)));
$$;

alter table public.learning_assignments enable row level security;
alter table public.learning_assignment_recipients enable row level security;
alter table public.competency_evidence enable row level security;
create policy learning_assignments_read on public.learning_assignments for select to authenticated
  using (public.can_manage_learning_school(school_id));
create policy learning_recipients_read on public.learning_assignment_recipients for select to authenticated
  using (exists(select 1 from public.learning_assignments a where a.id = assignment_id
    and public.can_manage_learning_school(a.school_id)));
create policy competency_evidence_read on public.competency_evidence for select to authenticated
  using (exists(select 1 from public.learning_assignments a where a.id = assignment_id
    and public.can_manage_learning_school(a.school_id)));

-- Immutable snapshots and append-only reviews. All writes go through checked RPCs.
revoke all on public.learning_assignments, public.learning_assignment_recipients,
  public.competency_evidence from anon, authenticated;
grant select on public.learning_assignments, public.learning_assignment_recipients,
  public.competency_evidence to authenticated;

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
  if not found or not public.can_manage_learning_school(v_assignment.school_id) then
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

revoke all on function public.can_manage_learning_school(uuid), public.valid_lesson_learning_plan(jsonb),
  public.assign_learning_lesson(uuid, uuid, uuid[], text, date),
  public.record_competency_evidence(uuid, uuid, text, text, text, jsonb) from public, anon;
grant execute on function public.can_manage_learning_school(uuid), public.valid_lesson_learning_plan(jsonb),
  public.assign_learning_lesson(uuid, uuid, uuid[], text, date),
  public.record_competency_evidence(uuid, uuid, text, text, text, jsonb) to authenticated;

comment on column public.lessons.learning_plan is
  'Draft ChipuRobo mapping to KICD Grade 10; Beginner/Intermediate/Expert are learning stages, not approved KICD ratings.';
comment on table public.competency_evidence is
  'Individual, append-only teacher evidence reviews. Completion and leaderboard points do not confer competency or a level.';
