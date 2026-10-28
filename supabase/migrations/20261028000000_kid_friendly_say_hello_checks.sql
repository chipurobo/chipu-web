-- "Say hello" checks in words a small child understands. The before check is
-- the baseline; the end check asks the same two questions plus one more, so
-- teachers still see what was learned. Question ids and right answers stay
-- the same. New versions replace the old ones; past attempts keep pointing at
-- the old versions.

update public.learning_quizzes
set is_active = false
where slug in ('lesson-501-pre', 'lesson-501-end') and is_active
  and questions->0->>'prompt' <> 'What does a computer do?';

insert into public.learning_quizzes(slug, version, title, level, lesson_id, stage, pass_percent, questions, solutions)
select 'lesson-501-pre', coalesce(max(version), 0) + 1, 'Before you start', 'beginner', 'b10c1000-0000-4000-8000-000000000001', 'pre', 1,
  '[{"id":"q1","prompt":"What does a computer do?","choices":["What we tell it","What it wants","Nothing at all"]},{"id":"q2","prompt":"Which block makes the computer talk?","choices":["The repeat block","The print block","The number block"]}]'::jsonb,
  '{"q1":{"correct":0,"explanation":"A computer does what we tell it."},"q2":{"correct":1,"explanation":"The print block makes the computer talk."}}'::jsonb
from public.learning_quizzes where slug = 'lesson-501-pre'
having exists (select 1 from public.lessons where id = 'b10c1000-0000-4000-8000-000000000001')
   and not bool_or(is_active and questions->0->>'prompt' = 'What does a computer do?');

insert into public.learning_quizzes(slug, version, title, level, lesson_id, stage, pass_percent, questions, solutions)
select 'lesson-501-end', coalesce(max(version), 0) + 1, 'Final check', 'beginner', 'b10c1000-0000-4000-8000-000000000001', 'end', 60,
  '[{"id":"q1","prompt":"What does a computer do?","choices":["What we tell it","What it wants","Nothing at all"]},{"id":"q2","prompt":"Which block makes the computer talk?","choices":["The repeat block","The print block","The number block"]},{"id":"q3","prompt":"Oops! The computer says Helo. What do you do?","choices":["Fix the word, then press Run","Add more blocks","Leave it"]}]'::jsonb,
  '{"q1":{"correct":0,"explanation":"A computer does what we tell it."},"q2":{"correct":1,"explanation":"The print block makes the computer talk."},"q3":{"correct":0,"explanation":"Fix the word, then press Run again."}}'::jsonb
from public.learning_quizzes where slug = 'lesson-501-end'
having exists (select 1 from public.lessons where id = 'b10c1000-0000-4000-8000-000000000001')
   and not bool_or(is_active and questions->0->>'prompt' = 'What does a computer do?');

do $$
begin
  if (select count(*) from public.learning_quizzes
      where lesson_id = 'b10c1000-0000-4000-8000-000000000001' and stage in ('pre', 'end') and is_active) <> 2 then
    raise exception 'Say hello needs exactly one active before check and one active end check.';
  end if;
end;
$$;
