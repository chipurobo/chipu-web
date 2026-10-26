-- Keep the learner course intentionally small: one simple activity for each
-- pathway. Retire the rest instead of deleting them so assignments,
-- submissions, reviews and reports continue to point to valid records.

alter table public.lessons disable trigger lesson_content_change_requires_review_trg;

update public.lessons
set is_active = false,
    review_status = 'withdrawn',
    review_notes = 'Archived when the learner course was reduced to one simple lesson per pathway.',
    approved_at = null,
    approved_by = null
where learning_plan->>'delivery' = 'blockly'
  and id not in (
    'b10c1000-0000-4000-8000-000000000001', -- Creative coding: Say hello
    'b10c1000-0000-4000-8000-000000000019', -- Physical computing: Robot: stop or go?
    'b10c2000-0000-4000-8000-000000000001'  -- Project design: A morning guide
  );

-- Make the retained physical-computing activity a short beginner lesson.
update public.lessons
set position = 502,
    title = 'Robot: stop or go?',
    description = 'Use one simple rule to decide whether a robot should stop or move.',
    learning_plan = (learning_plan - 'requirements') || jsonb_build_object(
      'level', 'beginner',
      'competencyIds', '["robotics","algorithms"]'::jsonb,
      'problem', 'A robot is near a wall. How can it decide whether to stop or move?',
      'ideas', '[{"title":"A sensor gives a number","body":"A smaller number means the wall is closer."},{"title":"One rule makes the choice","body":"Stop below 10. Move at 10 or more."}]'::jsonb,
      'steps', '["Set distance to 5.","If distance is below 10, print Stop. Otherwise, print Move.","Press Run.","Try distance 15."]'::jsonb,
      'expectedResult', '5 → Stop\n15 → Move',
      'evidenceBrief', 'Send the Stop or Move program and say what happened for 5 and 15.'
    ),
    is_active = true,
    review_status = 'approved',
    review_notes = 'Retained as the simplest physical-computing pathway lesson.',
    approved_at = coalesce(approved_at, now())
where id = 'b10c1000-0000-4000-8000-000000000019';

-- Keep project design practical, but remove the variable and loop requirements
-- so a first-time learner can finish the activity with three print blocks.
update public.lessons
set position = 503,
    title = 'A helpful guide',
    description = 'Make three clear steps that help a new learner.',
    learning_plan = learning_plan || jsonb_build_object(
      'level', 'beginner',
      'competencyIds', '["algorithms","design","communication"]'::jsonb,
      'problem', 'A new learner needs help with the morning routine. Can you make a short guide?',
      'ideas', '[{"title":"Start with the learner","body":"Think about what a new learner needs to know."},{"title":"Clear steps are easy to follow","body":"Use short words and put each step in the right order."}]'::jsonb,
      'steps', '["Choose three morning steps.","Put each step in a print block.","Press Run and read the steps.","Ask someone to try them. Fix one unclear step."]'::jsonb,
      'expectedResult', 'Three clear morning steps, in order.',
      'requirements', '["Three clear steps","Steps in the right order","One test with another person","One improved step"]'::jsonb,
      'evidenceBrief', 'Send the three-step guide and name the step you improved.'
    ),
    is_active = true,
    review_status = 'approved',
    review_notes = 'Retained as the simplest project-design pathway lesson.',
    approved_at = coalesce(approved_at, now())
where id = 'b10c2000-0000-4000-8000-000000000001';

-- Keep the first creative-coding activity and put the three retained
-- activities in a clear order.
update public.lessons
set position = 501,
    description = 'Make the computer greet you with one print block.',
    is_active = true,
    review_status = 'approved',
    review_notes = 'Retained as the simplest creative-coding pathway lesson.',
    approved_at = coalesce(approved_at, now())
where id = 'b10c1000-0000-4000-8000-000000000001';

alter table public.lessons enable trigger lesson_content_change_requires_review_trg;

-- Retired lesson quizzes no longer belong in learner quiz lists. Attempts are
-- preserved; only future access to those quizzes is switched off.
update public.learning_quizzes q
set is_active = false
from public.lessons l
where l.id = q.lesson_id
  and l.learning_plan->>'delivery' = 'blockly'
  and not l.is_active;

-- A previous course-trimming migration switched off the physical-computing
-- checks together with its old expert lesson. Restore only the stage checks
-- belonging to the three lessons that remain.
update public.learning_quizzes
set is_active = true
where lesson_id in (
    'b10c1000-0000-4000-8000-000000000001',
    'b10c1000-0000-4000-8000-000000000019',
    'b10c2000-0000-4000-8000-000000000001'
  )
  and stage is not null;

-- The retained physical-computing assessment stays at three short questions.
update public.learning_quizzes
set level = 'beginner',
    questions = '[{"id":"q1","prompt":"The wall is 5 cm away. Should the robot stop?","choices":["Yes","No"]},{"id":"q2","prompt":"The wall is 15 cm away. Should the robot move?","choices":["Yes","No"]}]'::jsonb,
    solutions = '{"q1":{"correct":0,"explanation":"5 is below 10, so the robot stops."},"q2":{"correct":0,"explanation":"15 is 10 or more, so the robot moves."}}'::jsonb
where slug = 'lesson-519-pre' and stage = 'pre';

update public.learning_quizzes
set level = 'beginner',
    questions = '[{"id":"q1","prompt":"Which rule is correct?","choices":["Stop below 10","Stop above 10"]}]'::jsonb,
    solutions = '{"q1":{"correct":0,"explanation":"The robot stops when the distance is below 10."}}'::jsonb
where slug = 'lesson-519-mid' and stage = 'mid';

update public.learning_quizzes
set title = 'Short assessment',
    level = 'beginner',
    questions = '[{"id":"q1","prompt":"The distance is 5. What should print?","choices":["Stop","Move"]},{"id":"q2","prompt":"The distance is 15. What should print?","choices":["Stop","Move"]},{"id":"q3","prompt":"Why do we test both numbers?","choices":["To check both choices","To make the program longer"]}]'::jsonb,
    solutions = '{"q1":{"correct":0,"explanation":"5 is below 10."},"q2":{"correct":1,"explanation":"15 is 10 or more."},"q3":{"correct":0,"explanation":"Testing both numbers checks Stop and Move."}}'::jsonb
where slug = 'lesson-519-end' and stage = 'end';

-- The project-design checks now match the simplified three-step guide.
update public.learning_quizzes
set questions = '[{"id":"q1","prompt":"What should you do first?","choices":["Choose the three steps","Press Send"]},{"id":"q2","prompt":"How many steps does the guide need?","choices":["Three","Ten"]}]'::jsonb,
    solutions = '{"q1":{"correct":0,"explanation":"Choose the steps before building the guide."},"q2":{"correct":0,"explanation":"This short guide needs three steps."}}'::jsonb
where slug = 'lesson-601-pre' and stage = 'pre';

update public.learning_quizzes
set questions = '[{"id":"q1","prompt":"A step is unclear. What should you do?","choices":["Fix it and test again","Leave it"]}]'::jsonb,
    solutions = '{"q1":{"correct":0,"explanation":"Improve the unclear step, then test it again."}}'::jsonb
where slug = 'lesson-601-mid' and stage = 'mid';

update public.learning_quizzes
set title = 'Short assessment',
    questions = '[{"id":"q1","prompt":"How many clear steps should the guide have?","choices":["Three","Ten"]},{"id":"q2","prompt":"Where should each step go?","choices":["In its own print block","In the lesson title"]},{"id":"q3","prompt":"What should you do after feedback?","choices":["Improve and test again","Ignore it"]}]'::jsonb,
    solutions = '{"q1":{"correct":0,"explanation":"The guide needs three clear steps."},"q2":{"correct":0,"explanation":"Each step goes in a print block."},"q3":{"correct":0,"explanation":"Use the feedback, then test the improved guide."}}'::jsonb
where slug = 'lesson-601-end' and stage = 'end';

-- Fail loudly if future seed changes would accidentally publish more than one
-- Blockly activity for a pathway.
do $$
begin
  if exists (
    select learning_plan->>'pathwayId'
    from public.lessons
    where is_active and learning_plan->>'delivery' = 'blockly'
    group by learning_plan->>'pathwayId'
    having count(*) <> 1
  ) or (
    select count(*) from public.lessons
    where is_active and learning_plan->>'delivery' = 'blockly'
  ) <> 3 then
    raise exception 'Expected exactly one active Blockly lesson in each of the three pathways.';
  end if;
  if (
    select count(*)
    from public.learning_quizzes q
    join public.lessons l on l.id = q.lesson_id
    where q.is_active and q.stage = 'end'
      and l.is_active and l.learning_plan->>'delivery' = 'blockly'
  ) <> 3 then
    raise exception 'Expected one active short assessment for each retained lesson.';
  end if;
end;
$$;

notify pgrst, 'reload schema';
