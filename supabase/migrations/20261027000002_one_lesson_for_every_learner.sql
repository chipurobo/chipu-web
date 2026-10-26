-- One lesson for every learner. Classroom and coding-club learners all do
-- "Say hello" (the lesson both courses already share). Every other Blockly
-- lesson and big project is switched off, not deleted: assignments,
-- submissions, reviews and reports keep pointing at valid records, and an
-- admin can switch a lesson back on from the Lessons page.

alter table public.lessons disable trigger lesson_content_change_requires_review_trg;

update public.lessons
set is_active = false,
    review_notes = 'Switched off on 2026-10-26: one lesson for every learner.'
where learning_plan->>'delivery' = 'blockly'
  and is_active
  and id <> 'b10c1000-0000-4000-8000-000000000001';

update public.lessons
set course = 'both',
    review_notes = 'The one lesson every learner does.'
where id = 'b10c1000-0000-4000-8000-000000000001';

alter table public.lessons enable trigger lesson_content_change_requires_review_trg;

-- Checks for switched-off lessons, and the Intermediate and Expert level
-- checks, are no longer offered. Attempts are kept.
update public.learning_quizzes q
set is_active = false
from public.lessons l
where l.id = q.lesson_id and not l.is_active and q.is_active
  and l.learning_plan->>'delivery' = 'blockly';

update public.learning_quizzes
set is_active = false
where slug in ('intermediate-coding-check', 'expert-coding-check');

do $$
begin
  if (select count(*) from public.lessons where is_active and learning_plan->>'delivery' = 'blockly') <> 1
     or not exists (select 1 from public.lessons where id = 'b10c1000-0000-4000-8000-000000000001' and is_active and course = 'both') then
    raise exception 'Expected exactly one active Blockly lesson (Say hello) for every learner.';
  end if;
  if not exists (select 1 from public.learning_quizzes
                 where lesson_id = 'b10c1000-0000-4000-8000-000000000001' and stage = 'end' and is_active) then
    raise exception 'Say hello needs an active end-of-lesson assessment.';
  end if;
end;
$$;

notify pgrst, 'reload schema';
