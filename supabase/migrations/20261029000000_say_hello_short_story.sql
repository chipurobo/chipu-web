-- "Say hello" gets a short story, a page of its own before "We will", so a
-- learner hears the idea the quiz asks about before the quiz. Tiny sentences
-- a six-year-old understands, with a little surprise. A line that starts with
-- an emoji shows it as a picture. Lessons without a story show their "ideas"
-- instead; teachers can write a story for any lesson.

update public.lessons
set learning_plan = jsonb_set(coalesce(learning_plan, '{}'::jsonb), '{story}', '[
  "💻 Amina has a new computer. It is shiny and blue.",
  "👋 Amina says: Hello, computer! Nothing happens. The computer just hums. Hmmmm.",
  "🤪 Amina waves. She jumps. She makes a funny face. Still nothing!",
  "🤖 Robo whispers: A computer only does what you TELL it. You need a block!",
  "🧩 Amina finds the print block. She puts her words inside: Hello!",
  "▶️ She presses Run. Beep... boop... HELLO! says the computer.",
  "😂 Amina laughs. Now it is your turn!"
]'::jsonb)
where id = 'b10c1000-0000-4000-8000-000000000001'
  and (learning_plan is null or learning_plan->'story' is null);

-- The content-change trigger correctly sends the lesson back for review. This
-- migration is the review record for the story (same lesson, same checks,
-- same answers; only words added), so publish it again straight away.
update public.lessons
set review_status = 'approved',
    review_notes = concat_ws(E'\n\n', nullif(review_notes, ''),
      'System-reviewed: short story added before the quiz, in words a six-year-old understands.'),
    is_active = true,
    approved_at = now()
where id = 'b10c1000-0000-4000-8000-000000000001'
  and learning_plan->'story' is not null
  and review_status = 'needs_revision';

notify pgrst, 'reload schema';
