-- Coding clubs keep the Beginner, Intermediate and Expert levels (agreed with
-- iHub on 2026-10-23); the CBC classroom pathway follows grades. Switch the
-- Intermediate and Expert lessons, their big projects and their checks back on.
-- Teachers still rate work on the CBC performance levels (EE, ME, AE, BE).
update public.lessons
set is_active = true, review_notes = null
where learning_plan->>'delivery' = 'blockly'
  and not is_active
  and review_status = 'approved'
  and review_notes like 'Switched off on 2026-10-21:%';

update public.learning_quizzes q
set is_active = true
where not q.is_active
  and (q.slug in ('intermediate-coding-check', 'expert-coding-check')
       or (q.stage is not null and exists (
         select 1 from public.lessons l where l.id = q.lesson_id and l.is_active and l.learning_plan->>'delivery' = 'blockly')))
  -- Only the newest version of each quiz comes back.
  and q.version = (select max(v.version) from public.learning_quizzes v where v.slug = q.slug);

update public.learning_quizzes set title = 'Coding check: Beginner' where slug = 'beginner-coding-check' and title in ('Coding check', 'Coding check 1');
update public.learning_quizzes set title = 'Coding check: Intermediate' where slug = 'intermediate-coding-check' and title = 'Coding check 2';
update public.learning_quizzes set title = 'Coding check: Expert' where slug = 'expert-coding-check' and title = 'Coding check 3';
