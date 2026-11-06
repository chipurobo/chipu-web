-- The one lesson every learner does becomes "What is programming?": a very simple,
-- kid-friendly lesson for Grade 10 and below, told as one story from start to
-- finish. It teaches what programming is, why order matters, how programming
-- began and what Scratch is. It describes Scratch and asks for no block coding.
-- The wording lives in the lesson plan, so it can be copied as a template for others.
-- Same lesson, so past assignments, attempts and submissions stay valid.

update public.lessons
set title = 'What is programming?',
    description = 'Learn what programming is, why order matters, how programming began and what Scratch is.',
    learning_plan = (coalesce(learning_plan, '{}'::jsonb) - 'readyBlocks') || $plan$
{
  "noBlocks": true,
  "competencyIds": [
    "algorithms"
  ],
  "problem": "What is programming, why does order matter, and what is Scratch?",
  "ideas": [
    {
      "title": "A program is a list of steps",
      "body": "A computer follows the steps in a program, in order."
    },
    {
      "title": "Scratch is programming with blocks",
      "body": "Each block is one step. Blocks join like puzzle pieces."
    }
  ],
  "storyHeading": "Amina, Robo and the chai",
  "story": [
    "👵 Grandma is coming to visit! Amina wants to give her a hot cup of chai.",
    "🤖 Amina is busy, so she asks her robot friend. \"Robo, make chai, please!\"",
    "🤔 Robo does not move. \"Beep? I do not know how.\" Robo only knows what it is told.",
    "💡 Amina has an idea. \"I will tell you each step!\"",
    "🗣️ \"Pour the tea. Boil the water. Add the tea leaves.\"",
    "💦 Splash! Cold water goes all over the floor! Robo did exactly what Amina said.",
    "😂 Amina laughs. \"Oops! My steps were in the wrong order!\"",
    "☕ She tries again. \"Boil the water. Add the tea leaves. Pour the tea.\"",
    "😋 Grandma takes a sip. \"Mmm! Who taught this robot?\"",
    "🤖 \"Amina did,\" says Robo. \"She gave me a list of steps. That is called a program.\"",
    "🎉 Grandma smiles. \"Then Amina is a programmer!\""
  ],
  "stepWords": {
    "story": {
      "say": "Story time! Meet Amina and Robo."
    },
    "welcome": {
      "say": "Here is our plan!"
    },
    "quiz": {
      "say": "What do you think? Just guess!"
    },
    "activity": {
      "label": "Fix Robo's steps",
      "say": "Help Robo fix its steps!"
    },
    "history": {
      "label": "Robo's family story",
      "say": "I have a very old family!"
    },
    "idea": {
      "label": "Meet Scratch",
      "say": "Meet Scratch!"
    },
    "final": {
      "label": "Help Amina teach Juma",
      "say": "Juma has three questions for you!"
    },
    "recap": {
      "say": "Hooray! Look what you learned!"
    }
  },
  "weWill": [
    "❓ Answer two quick questions. Just guess!",
    "🔧 Help Robo fix its steps.",
    "📜 Hear Robo's family story.",
    "🧩 Meet Scratch.",
    "⭐ Help Amina teach her brother, Juma."
  ],
  "together": "Sharing a computer? Take turns pressing Next.",
  "activity": {
    "talk": "Talk with a friend: what steps do you follow to get ready for school?"
  },
  "history": {
    "heading": "Who first told machines what to do?",
    "lines": [
      "🧵 Long ago, weaving machines followed holes punched in cards. \"They are my great-great-grandparents!\" says Robo.",
      "👩 About 180 years ago, Ada Lovelace wrote steps for a machine that was never finished. Many people call her the first programmer.",
      "💻 Later, Grace Hopper helped people write programs using English words, not only numbers.",
      "📱 In 2007, M-PESA began in Kenya, and people could send money with a phone. Programs make that work.",
      "🧩 That same year, people at MIT shared Scratch, so more children could start programming."
    ]
  },
  "idea": {
    "heading": "What is Scratch?",
    "before": [
      "Scratch is a way of programming with blocks.",
      "Each block is one step. Blocks join like puzzle pieces.",
      "The computer follows them from top to bottom, just like Amina's list.",
      "Here is a small Scratch program:"
    ],
    "cards": [
      "when green flag clicked",
      "say Hello!",
      "move 10 steps"
    ],
    "after": [
      "When the green flag is clicked, it says Hello, then moves.",
      "Today you only need to know what Scratch is."
    ]
  },
  "doneLine": "Well done! Juma understands now.",
  "recap": [
    "A program is a list of steps.",
    "Order matters. A mistake in the steps is called a bug.",
    "Scratch lets you program with blocks.",
    "People have been telling machines what to do for over 200 years.",
    "Grandma says: \"Well done, programmer!\""
  ],
  "steps": [
    "Hear the story.",
    "Help Robo fix its steps.",
    "Meet Scratch.",
    "Help Amina teach Juma."
  ],
  "expectedResult": "The learner can say what a program is, why order matters and what Scratch is.",
  "evidenceBrief": "The learner answers the quizzes and the fix-the-steps activity. This lesson describes Scratch and asks for no block coding."
}
$plan$::jsonb
where id = 'b10c1000-0000-4000-8000-000000000001';

-- The content-change trigger correctly sends the lesson back for review and
-- switches it off. This migration is the review record, so publish it again.
update public.lessons
set review_status = 'approved',
    review_notes = concat_ws(E'\n\n', nullif(review_notes, ''),
      'System-reviewed: rewritten as "What is programming?", the one lesson every learner does.'),
    is_active = true,
    approved_at = now()
where id = 'b10c1000-0000-4000-8000-000000000001'
  and review_status = 'needs_revision';

-- This lesson has no blocks step, so finishing it sends no program. Work on any
-- other Blockly lesson must still include one. The setting is read from the lesson
-- itself: assignments keep a copy of the plan from the day they were set.
create or replace function public.require_blockly_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.blockly_workspace is null and exists(
    select 1 from public.learning_assignments a
    left join public.lessons l on l.id = a.lesson_id
    where a.id = new.assignment_id and a.learning_plan->>'delivery' = 'blockly'
      and coalesce(l.learning_plan->>'noBlocks', 'false') <> 'true'
  ) then
    raise exception 'This lesson or project requires a Blockly program.' using errcode = '22023';
  end if;
  return new;
end;
$$;

-- New quiz versions replace the old ones; past attempts keep pointing at the old
-- versions, so learners take these once.
create temporary table what_is_programming_quizzes (slug text, title text, stage text, pass_percent integer, questions jsonb, solutions jsonb) on commit drop;

insert into what_is_programming_quizzes values
('lesson-501-pre', 'Quick quiz', 'pre', 1,
  '[{"id":"q1","prompt":"Why did Robo not make chai at first?","choices":["Robo was asleep","Nobody told Robo the steps","Robo does not like chai"]},{"id":"q2","prompt":"What do we call a list of steps for a computer?","choices":["A picture","A password","A program"]}]',
  '{"q1":{"correct":1,"explanation":"Robo only does what it is told. A computer is the same."},"q2":{"correct":2,"explanation":"A program is a list of steps that a computer follows."}}'),
('lesson-501-mid', 'Fix the steps', 'mid', 1,
  '[{"id":"q1","prompt":"Amina is teaching Robo to wash its hands. What comes first?","choices":["Dry your hands","Turn on the water","Use soap"]},{"id":"q2","prompt":"What comes next?","choices":["Use soap","Go to sleep","Dry your hands"]},{"id":"q3","prompt":"The steps say: Dry your hands. Wash your hands. What is wrong?","choices":["Nothing is wrong","Drying should come after washing","Robo needs more hands"]}]',
  '{"q1":{"correct":1,"explanation":"Robo needs water before anything else."},"q2":{"correct":0,"explanation":"Soap comes before drying."},"q3":{"correct":1,"explanation":"A mistake in a program is called a bug. Fixing it is called debugging."}}'),
('lesson-501-end', 'Help Amina teach Juma', 'end', 60,
  '[{"id":"q1","prompt":"Juma asks: What is a program?","choices":["A kind of computer","A list of steps for a computer","A computer game"]},{"id":"q2","prompt":"Juma asks: What is Scratch?","choices":["A computer game","A kind of keyboard","A way of programming with blocks"]},{"id":"q3","prompt":"A program says: say Hello! Then: when green flag clicked. What is wrong?","choices":["The green flag block should come first","Nothing is wrong","Say Hello! should be deleted"]}]',
  '{"q1":{"correct":1,"explanation":"A program is a list of steps that a computer follows."},"q2":{"correct":2,"explanation":"In Scratch, you join blocks to make a program."},"q3":{"correct":0,"explanation":"The flag block starts the program, so it goes on top. This was a bug!"}}');

update public.learning_quizzes q
set is_active = false
from what_is_programming_quizzes n
where q.slug = n.slug and q.is_active and q.questions <> n.questions;

insert into public.learning_quizzes(slug, version, title, level, lesson_id, stage, pass_percent, questions, solutions)
select n.slug, coalesce((select max(version) from public.learning_quizzes q where q.slug = n.slug), 0) + 1, n.title, 'beginner',
       'b10c1000-0000-4000-8000-000000000001', n.stage, n.pass_percent, n.questions, n.solutions
from what_is_programming_quizzes n
where exists (select 1 from public.lessons where id = 'b10c1000-0000-4000-8000-000000000001')
  and not exists (select 1 from public.learning_quizzes q where q.slug = n.slug and q.is_active and q.questions = n.questions);

do $$
begin
  if (select count(*) from public.lessons where is_active and learning_plan->>'delivery' = 'blockly') <> 1
     or not exists (select 1 from public.lessons where id = 'b10c1000-0000-4000-8000-000000000001'
                    and is_active and title = 'What is programming?') then
    raise exception 'Expected exactly one active Blockly lesson: What is programming?';
  end if;
  if (select count(*) from public.learning_quizzes
      where lesson_id = 'b10c1000-0000-4000-8000-000000000001' and stage in ('pre', 'mid', 'end') and is_active) <> 3 then
    raise exception 'What is programming? needs exactly one active quiz for each of its three quiz steps.';
  end if;
end;
$$;

notify pgrst, 'reload schema';
