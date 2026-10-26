-- Two Blockly courses on one platform.
--
-- * CBC classroom learners follow grades and get one simple activity per
--   pathway (Say hello, Robot: stop or go?, A helpful guide).
-- * Coding-club learners keep the Beginner, Intermediate and Expert levels
--   (agreed with iHub on 2026-10-23): lessons 1-20 and three big projects.
--
-- A learner's course comes from club_members.in_club. "Say hello" is shared.
-- 20261026000000 rewrote lesson 19 and the first big project in place to make
-- the classroom versions. This migration moves those simple versions to their
-- own classroom rows and puts the club originals back, so club learners' work
-- stays attached to the activity they actually did. Nothing is deleted.

alter table public.lessons add column if not exists course text not null default 'both';
alter table public.lessons drop constraint if exists lessons_course_valid;
alter table public.lessons add constraint lessons_course_valid check (course in ('classroom', 'club', 'both'));
comment on column public.lessons.course is
  'Which learners see this Blockly lesson: classroom (CBC grades), club (coding club levels) or both.';

alter table public.lessons disable trigger lesson_content_change_requires_review_trg;

-- 1. Classroom copies of the two simplified activities, with their checks.
insert into public.lessons
select (jsonb_populate_record(null::public.lessons, to_jsonb(l) || jsonb_build_object(
  'id', copy.id, 'course', 'classroom', 'created_at', now(),
  'review_notes', 'Classroom version of a coding-club activity.'))).*
from public.lessons l
join (values
  ('b10c1000-0000-4000-8000-000000000019'::uuid, 'b10c3000-0000-4000-8000-000000000001'::uuid),
  ('b10c2000-0000-4000-8000-000000000001'::uuid, 'b10c3000-0000-4000-8000-000000000002'::uuid)
) as copy(original, id) on copy.original = l.id
on conflict (id) do nothing;

insert into public.learning_quizzes(slug, version, title, level, lesson_id, stage, pass_percent, questions, solutions, is_active)
select replace(q.slug, 'lesson-', 'classroom-'), 1, q.title, q.level,
  case q.lesson_id when 'b10c1000-0000-4000-8000-000000000019' then 'b10c3000-0000-4000-8000-000000000001'::uuid
                   else 'b10c3000-0000-4000-8000-000000000002'::uuid end,
  q.stage, q.pass_percent, q.questions, q.solutions, true
from public.learning_quizzes q
where q.slug in ('lesson-519-pre', 'lesson-519-mid', 'lesson-519-end', 'lesson-601-pre', 'lesson-601-mid', 'lesson-601-end')
  and q.version = (select max(v.version) from public.learning_quizzes v where v.slug = q.slug)
on conflict (slug, version) do nothing;

-- 2. Put the club originals back (content as of 20261021000000).
update public.lessons
set position = 519,
    title = 'Robot: stop or go?',
    description = 'Model a robotics decision with simulated readings; no hardware is connected.',
    learning_plan = (learning_plan || jsonb_build_object('problem', 'A robot car must stop before it hits a wall. If the wall is closer than 10 centimetres, it should stop. How does it decide?'::text, 'ideas', '[{"title":"Sensors give readings","body":"A distance sensor gives a number. Here we pretend the number comes from a sensor."},{"title":"Check bad readings too","body":"Real sensors can give wrong numbers, like a negative distance. Your program should say \"Invalid reading\"."}]'::jsonb) || '{"steps":["Make a box called distance. Set it to 5.","If distance < 10, print Stop. Else, print Move.","Try 5, then 10, then 20.","Add: if distance < 0, print Invalid reading."],"expectedResult":"5 → Stop\n10 → Move\n20 → Move\n-1 → Invalid reading"}'::jsonb) || jsonb_build_object(
      'level', 'expert',
      'competencyIds', '["algorithms","programming","debugging","robotics"]'::jsonb,
      'evidenceBrief', 'Submit your simulation, four test cases and an explanation of its hardware limitation.')
where id = 'b10c1000-0000-4000-8000-000000000019';

update public.lessons
set position = 601,
    title = 'A morning guide',
    description = 'Create a clear, repeatable guide that prints the steps of an everyday task.',
    learning_plan = (learning_plan || jsonb_build_object('problem', 'A new learner does not know the morning routine. Can you build a guide that greets them by name and tells them the steps?'::text, 'ideas', '[{"title":"Use what you know","body":"Use print for steps, a variable for the name, and repeat for a step that happens more than once."},{"title":"Ask someone to try it","body":"Let a friend follow your guide. If a step is unclear, improve it and test again."}]'::jsonb) || '{"steps":["Pick a daily job. Who is your guide for?","Print at least 4 steps. Use a box for the person''s name.","Use repeat for a step that happens more than once.","Ask a friend to try it. Fix one step that was not clear."],"expectedResult":"Hello, (name)!\nthen your steps in order","requirements":["4 or more steps, in order","A box with a name in it","A repeat block","One thing you fixed"]}'::jsonb) || jsonb_build_object(
      'level', 'beginner',
      'competencyIds', '["algorithms","programming","debugging","design","communication"]'::jsonb,
      'evidenceBrief', 'Submit the Blockly program, run output, user brief and your fault-and-retest record.')
where id = 'b10c2000-0000-4000-8000-000000000001';

update public.learning_quizzes set title = 'Before you start', level = 'expert', pass_percent = 1,
    questions = '[{"id":"q1","prompt":"A wall is 5 cm away and the rule is stop below 10. Should the robot stop?","choices":["Yes","No"]},{"id":"q2","prompt":"Can a real distance be negative?","choices":["Yes","No"]}]'::jsonb,
    solutions = '{"q1":{"correct":0,"explanation":"5 is below 10."},"q2":{"correct":1,"explanation":"Distance cannot be less than zero, so a negative reading is a mistake."}}'::jsonb
  where slug = 'lesson-519-pre';
update public.learning_quizzes set title = 'Quick check', level = 'expert', pass_percent = 1,
    questions = '[{"id":"q1","prompt":"Distance is 10. The rule is \"stop if distance < 10\". What does the robot do?","choices":["Stop","Move"]}]'::jsonb,
    solutions = '{"q1":{"correct":1,"explanation":"10 is not less than 10, so it moves."}}'::jsonb
  where slug = 'lesson-519-mid';
update public.learning_quizzes set title = 'Final check', level = 'expert', pass_percent = 60,
    questions = '[{"id":"q1","prompt":"A wall is 5 cm away and the rule is stop below 10. Should the robot stop?","choices":["Yes","No"]},{"id":"q2","prompt":"Can a real distance be negative?","choices":["Yes","No"]},{"id":"q3","prompt":"Distance is −3. What should your program print?","choices":["Stop","Move","Invalid reading"]}]'::jsonb,
    solutions = '{"q1":{"correct":0,"explanation":"5 is below 10."},"q2":{"correct":1,"explanation":"Distance cannot be less than zero, so a negative reading is a mistake."},"q3":{"correct":2,"explanation":"A negative reading is not possible, so it is invalid."}}'::jsonb
  where slug = 'lesson-519-end';
update public.learning_quizzes set title = 'Before you start', level = 'beginner', pass_percent = 1,
    questions = '[{"id":"q1","prompt":"Which block would store the learner''s name?","choices":["A variable","A repeat","A maths block"]},{"id":"q2","prompt":"Which block helps with a step that happens many times?","choices":["Repeat","Print","Compare"]}]'::jsonb,
    solutions = '{"q1":{"correct":0,"explanation":"Variables store values like names."},"q2":{"correct":0,"explanation":"Repeat runs blocks again and again."}}'::jsonb
  where slug = 'lesson-601-pre';
update public.learning_quizzes set title = 'Quick check', level = 'beginner', pass_percent = 1,
    questions = '[{"id":"q1","prompt":"Your guide needs at least how many steps?","choices":["Two","Four","Ten"]}]'::jsonb,
    solutions = '{"q1":{"correct":1,"explanation":"The project asks for at least four clear steps."}}'::jsonb
  where slug = 'lesson-601-mid';
update public.learning_quizzes set title = 'Final check', level = 'beginner', pass_percent = 60,
    questions = '[{"id":"q1","prompt":"Which block would store the learner''s name?","choices":["A variable","A repeat","A maths block"]},{"id":"q2","prompt":"Which block helps with a step that happens many times?","choices":["Repeat","Print","Compare"]},{"id":"q3","prompt":"A friend found one step confusing. What do you do?","choices":["Change the step and test again","Ignore it","Delete the guide"]}]'::jsonb,
    solutions = '{"q1":{"correct":0,"explanation":"Variables store values like names."},"q2":{"correct":0,"explanation":"Repeat runs blocks again and again."},"q3":{"correct":0,"explanation":"Improve, then retest."}}'::jsonb
  where slug = 'lesson-601-end';

-- 3. Which course each Blockly lesson belongs to, and switch the club course on.
update public.lessons set course = 'both' where id = 'b10c1000-0000-4000-8000-000000000001';
update public.lessons set course = 'classroom'
  where id in ('b10c3000-0000-4000-8000-000000000001', 'b10c3000-0000-4000-8000-000000000002');
update public.lessons
set course = 'club',
    is_active = true,
    review_status = 'approved',
    review_notes = 'Coding-club course (Beginner, Intermediate, Expert), agreed with iHub on 2026-10-23.',
    approved_at = coalesce(approved_at, now())
where learning_plan->>'delivery' = 'blockly'
  and (id::text like 'b10c1000-%' or id::text like 'b10c2000-%');
update public.lessons set course = 'both', review_notes = 'Shared first lesson for classroom and coding-club learners.'
  where id = 'b10c1000-0000-4000-8000-000000000001';

alter table public.lessons enable trigger lesson_content_change_requires_review_trg;

-- Stage checks for every active Blockly lesson (newest version of each), and
-- the three coding-club level checks.
update public.learning_quizzes q
set is_active = true
from public.lessons l
where l.id = q.lesson_id and l.is_active and l.learning_plan->>'delivery' = 'blockly'
  and q.stage is not null
  and q.version = (select max(v.version) from public.learning_quizzes v where v.slug = q.slug);

update public.learning_quizzes q
set is_active = true
where q.slug in ('beginner-coding-check', 'intermediate-coding-check', 'expert-coding-check')
  and q.version = (select max(v.version) from public.learning_quizzes v where v.slug = q.slug);
update public.learning_quizzes set title = 'Coding check: Beginner' where slug = 'beginner-coding-check';
update public.learning_quizzes set title = 'Coding check: Intermediate' where slug = 'intermediate-coding-check';
update public.learning_quizzes set title = 'Coding check: Expert' where slug = 'expert-coding-check';

-- 4. The signed-in learner's course.
create or replace function public.my_learning_course()
returns text language sql stable security definer set search_path = public as $$
  select case when s.in_club then 'club' else 'classroom' end
  from public.learner_accounts l
  join public.profiles p on p.id = l.profile_id
  join public.club_members s on s.id = l.student_id
  where p.id = auth.uid() and p.role = 'learner'
  limit 1;
$$;
revoke all on function public.my_learning_course() from public;
grant execute on function public.my_learning_course() to authenticated;

-- 5. Lessons open one after another within the learner's own course.
--    Mirrors buildPath() in src/lib/learnerPath.ts. Change both or neither.
drop function if exists public.blockly_lesson_prerequisite(uuid);
create or replace function public.blockly_lesson_prerequisite(p_lesson_id uuid, p_course text default null)
returns uuid language sql stable security definer set search_path = public as $$
 with target as (
  select id, kind, position, learning_plan->>'level' as level from public.lessons where id = p_lesson_id
 ), course_lessons as (
  select l.* from public.lessons l
  where l.is_active and l.kind = 'lesson' and l.learning_plan->>'delivery' = 'blockly'
    and (p_course is null or l.course in (p_course, 'both'))
 )
 select case when t.kind = 'project' then
   (select l.id from course_lessons l where l.learning_plan->>'level' = t.level order by l.position desc limit 1)
  else
   (select l.id from course_lessons l where l.position < t.position order by l.position desc limit 1)
  end
 from target t;
$$;

create or replace function public.start_blockly_lesson(p_lesson_id uuid)
 returns uuid language plpgsql security definer set search_path to 'public' as $function$
declare v_student uuid; v_school uuid; v_course text; v_lesson public.lessons%rowtype; v_id uuid; v_before uuid;
begin
  select l.student_id, p.school_id, case when s.in_club then 'club' else 'classroom' end
    into v_student, v_school, v_course
    from public.learner_accounts l
    join public.profiles p on p.id = l.profile_id
    join public.club_members s on s.id = l.student_id
    where p.id = auth.uid() and public.is_my_learning_student(l.student_id);
  if not found then raise exception 'An active learner account is required.' using errcode = '42501'; end if;
  select a.id into v_id from public.learning_assignments a join public.learning_assignment_recipients r on r.assignment_id = a.id
    where a.lesson_id = p_lesson_id and a.school_id = v_school and r.student_id = v_student order by a.created_at desc limit 1;
  if found then return v_id; end if;
  select * into v_lesson from public.lessons where id = p_lesson_id and is_active
    and learning_plan->>'delivery' = 'blockly' and course in (v_course, 'both')
    and public.valid_lesson_learning_plan(learning_plan);
  if not found then raise exception 'This Blockly lesson is not available.' using errcode = '22023'; end if;
  v_before := public.blockly_lesson_prerequisite(p_lesson_id, v_course);
  if v_before is not null and not exists(
    select 1 from public.learning_submissions s join public.learning_assignments a on a.id = s.assignment_id
    where s.student_id = v_student and a.lesson_id = v_before) then
    raise exception 'Finish the lesson before this one first.' using errcode = '22023';
  end if;
  insert into public.learning_assignments(school_id, lesson_id, title, instructions, learning_plan, assigned_by, self_started)
    values(v_school, v_lesson.id, v_lesson.title, '', v_lesson.learning_plan, auth.uid(), true)
    on conflict(lesson_id, school_id, assigned_by) where self_started do update set self_started = true returning id into v_id;
  insert into public.learning_assignment_recipients(assignment_id, student_id) values(v_id, v_student) on conflict do nothing;
  return v_id;
end;
$function$;

-- 6. Fail loudly if the two courses are not what learners should see.
do $$
begin
  if (select count(*) from public.lessons where is_active and learning_plan->>'delivery' = 'blockly' and course in ('classroom', 'both')) <> 3
    or exists (
      select learning_plan->>'pathwayId' from public.lessons
      where is_active and learning_plan->>'delivery' = 'blockly' and course in ('classroom', 'both')
      group by learning_plan->>'pathwayId' having count(*) <> 1) then
    raise exception 'The classroom course must have exactly one active Blockly activity per pathway.';
  end if;
  if exists (
    select level from (values ('beginner'), ('intermediate'), ('expert')) as levels(level)
    where not exists (select 1 from public.lessons where is_active and kind = 'lesson' and course in ('club', 'both')
                        and learning_plan->>'delivery' = 'blockly' and learning_plan->>'level' = levels.level)
       or not exists (select 1 from public.lessons where is_active and kind = 'project' and course = 'club'
                        and learning_plan->>'delivery' = 'blockly' and learning_plan->>'level' = levels.level)) then
    raise exception 'The coding-club course needs lessons and a big project at every level.';
  end if;
  if exists (
    select 1 from public.lessons l where l.is_active and l.learning_plan->>'delivery' = 'blockly'
      and not exists (select 1 from public.learning_quizzes q where q.lesson_id = l.id and q.is_active and q.stage = 'end')) then
    raise exception 'Every active Blockly lesson needs an active end-of-lesson assessment.';
  end if;
end;
$$;

notify pgrst, 'reload schema';
