-- Keep editable drafts separate from immutable submissions reviewed by teachers.
create or replace function public.valid_blockly_program(p_workspace jsonb, p_code text, p_output text)
returns boolean language sql immutable set search_path=public as $$
  select p_workspace is not null and jsonb_typeof(p_workspace)='object'
    and octet_length(p_workspace::text)<=200000
    and jsonb_typeof(p_workspace->'blocks')='object'
    and jsonb_typeof(p_workspace->'blocks'->'blocks')='array'
    and jsonb_array_length(p_workspace->'blocks'->'blocks') between 1 and 200
    and p_code is not null and length(p_code) between 1 and 50000
    and p_output is not null and length(p_output)<=10000;
$$;

create table public.learning_program_drafts (
  assignment_id uuid not null,
  student_id uuid not null,
  workspace jsonb not null,
  code text not null,
  output text not null default '',
  saved_at timestamptz not null default now(),
  primary key(assignment_id,student_id),
  foreign key(assignment_id,student_id) references public.learning_assignment_recipients on delete cascade,
  check(public.valid_blockly_program(workspace,code,output) is true)
);
alter table public.learning_program_drafts enable row level security;
create policy learning_program_drafts_read on public.learning_program_drafts for select to authenticated
  using(public.can_read_learning_assignment(assignment_id) and public.is_my_learning_student(student_id));
revoke all on public.learning_program_drafts from anon,authenticated;
grant select on public.learning_program_drafts to authenticated;

alter table public.learning_submissions
  add column blockly_workspace jsonb,
  add column generated_code text,
  add column run_output text,
  add constraint learning_submission_program_valid check(
    (blockly_workspace is null and generated_code is null and run_output is null)
    or public.valid_blockly_program(blockly_workspace,generated_code,run_output) is true
  );

create or replace function public.save_learning_program(p_assignment_id uuid,p_workspace jsonb,p_code text,p_output text default '')
returns timestamptz language plpgsql security definer set search_path=public as $$
declare v_student uuid; v_saved timestamptz;
begin
  select student_id into v_student from public.learner_accounts where profile_id=auth.uid()
    and public.is_my_learning_student(student_id);
  if not found or not public.can_read_learning_assignment(p_assignment_id)
    or not exists(select 1 from public.learning_assignment_recipients where assignment_id=p_assignment_id and student_id=v_student) then
    raise exception 'You can save only your own assigned program.' using errcode='42501'; end if;
  if public.valid_blockly_program(p_workspace,p_code,p_output) is not true then
    raise exception 'Add blocks and keep the program within the workspace limits.' using errcode='22023'; end if;
  insert into public.learning_program_drafts(assignment_id,student_id,workspace,code,output)
    values(p_assignment_id,v_student,p_workspace,p_code,p_output)
    on conflict(assignment_id,student_id) do update set workspace=excluded.workspace,code=excluded.code,output=excluded.output,saved_at=now()
    returning saved_at into v_saved;
  return v_saved;
end;
$$;

-- Default optional program arguments preserve existing non-coding evidence.
drop function public.submit_learning_work(uuid,text,text,text);
create function public.submit_learning_work(p_assignment_id uuid,p_evidence_text text,
  p_evidence_url text default null,p_reflection text default '',p_blockly_workspace jsonb default null,
  p_generated_code text default null,p_run_output text default null)
returns uuid language plpgsql security definer set search_path=public as $$
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
  if p_blockly_workspace is not null or p_generated_code is not null or p_run_output is not null then
    perform public.save_learning_program(p_assignment_id,p_blockly_workspace,p_generated_code,p_run_output);
  end if;
  insert into public.learning_submissions(assignment_id,student_id,evidence_text,evidence_url,reflection,submitted_by,
    blockly_workspace,generated_code,run_output)
    values(p_assignment_id,v_student,btrim(p_evidence_text),p_evidence_url,coalesce(p_reflection,''),auth.uid(),
      p_blockly_workspace,p_generated_code,p_run_output) returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.save_learning_program(uuid,jsonb,text,text),public.submit_learning_work(uuid,text,text,text,jsonb,text,text) from public,anon;
grant execute on function public.save_learning_program(uuid,jsonb,text,text),public.submit_learning_work(uuid,text,text,text,jsonb,text,text) to authenticated;
