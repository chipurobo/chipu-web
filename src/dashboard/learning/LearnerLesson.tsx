/**
 * The lesson page a learner sees, one stage at a time:
 *   Think (the problem + what do you know?) → Learn (two ideas + quick check)
 *   → Build (blocks, steps, hints) → Check (final check) → Send.
 * Only one stage is on screen, so there is one thing to read and one thing to
 * press. Uses the same assignment, submission and feedback records as the
 * teacher view; hints are built from the lesson plan, so nothing new is stored.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchQuizAttempts, listQuizzes, trackLearningActivity } from '../../lib/learningOutcomes';
import { fetchAssignment, fetchAssignments, fetchEvidence, fetchSubmissions, startBlocklyLesson, submitLearningWork } from '../../lib/learningQueries';
import { useLearnerCourse } from './useLearnerCourse';
import { fetchLessonById } from '../../lib/gql/queries';
import type { LessonLearningPlan } from '../../lib/learningRecords';
import { learnerTitle } from '../../lib/learnerCopy';
import { buildPath } from '../../lib/learnerPath';
import { LearnerPage, FriendlyAlert, Loading, ReadAloud } from './ui/LearnerKit';
import { AccessibleLessonMedia } from './AccessibleLessonMedia';
import { QuizRunner, type BarProps } from './ui/QuizRunner';
import { LessonBuild, LessonSend, useLessonWork } from './LearnerSubmission';
import { Mascot } from './ui/LearnerArt';

/** Five steps, like a Duolingo or Khan Academy Kids lesson: a short story,
 *  get ready, a short quiz, code, and a final quiz. Robo says what to do on
 *  each one. Lessons with nothing to tell skip the story. */
const stages = [
  { id: 'story', emoji: '📖', label: 'Story', say: "Hi! I'm Robo! Story time!" },
  { id: 'welcome', emoji: '🔍', label: 'Get ready', say: "Let's make the computer say hi!" },
  { id: 'quiz', emoji: '❓', label: 'Quick quiz', say: "Let's play a guessing game!" },
  { id: 'activity', emoji: '🔢', label: 'Try it', say: 'Have a go at this one.' },
  { id: 'history', emoji: '📜', label: 'A short history', say: 'Here is how it began.' },
  { id: 'idea', emoji: '🧩', label: 'A new idea', say: 'Here is something new.' },
  { id: 'code', emoji: '🧩', label: 'Code it', say: 'Change the words, then press Run!' },
  { id: 'final', emoji: '🏆', label: 'Final quiz', say: 'One more game! You can do it!' },
  { id: 'recap', emoji: '🎉', label: 'What you learned', say: 'Here is what you learned.' },
] as const;
type StageId = (typeof stages)[number]['id'];

function buildHints(plan: LessonLearningPlan): string[] {
  const hints: string[] = [];
  if (plan.steps[0]) hints.push(`Start with step 1: ${plan.steps[0]}`);
  hints.push(plan.expectedResult
    ? `Your program should show: "${plan.expectedResult}". Press Run and compare what you see with that.`
    : 'Press Run after every change. Seeing what each block does is the fastest way to learn.');
  if (plan.steps.length > 2) hints.push(`Check your blocks against step ${plan.steps.length}: ${plan.steps[plan.steps.length - 1]}`);
  hints.push("Still stuck? That's okay! Ask a friend or your teacher, and tell them which step you're on.");
  return hints;
}

const stageKey = (assignmentId: string) => `chipurobo:lesson-stage:${assignmentId}`;

/** "🤖 Robo whispers…" → a picture for sighted children and the words for everyone. */
function storyLine(line: string): { picture?: string; words: string } {
  const match = line.match(/^(\p{Extended_Pictographic}\uFE0F?)\s*(.*)$/u);
  return match ? { picture: match[1], words: match[2] } : { words: line };
}

export function LearnerLesson() {
  const { assignmentId } = useParams();
  const assignmentQuery = useQuery({ queryKey: ['learning-assignment', assignmentId], queryFn: () => fetchAssignment(assignmentId!), enabled: !!assignmentId });
  const assignment = assignmentQuery.data;
  const lessonQuery = useQuery({ queryKey: ['lesson', assignment?.lesson_id], queryFn: () => fetchLessonById(assignment!.lesson_id), enabled: !!assignment?.lesson_id });
  useEffect(() => { if (assignment) trackLearningActivity('resource_open', assignment.lesson_id); }, [assignment]);
  const evidence = useQuery({ queryKey: ['competency-evidence', assignmentId], queryFn: () => fetchEvidence(assignmentId!), enabled: !!assignment });
  const submissions = useQuery({ queryKey: ['learning-submissions', assignmentId], queryFn: () => fetchSubmissions(assignmentId!), enabled: !!assignment });
  const error = submissions.error ?? assignmentQuery.error ?? evidence.error;

  return (
    <LearnerPage className="learner-player !space-y-5 max-w-4xl">
      <FriendlyAlert error={error} />
      {(assignmentQuery.isPending || lessonQuery.isLoading) && <Loading>Opening your lesson</Loading>}
      {!assignmentQuery.isPending && !error && !assignment && <>
        <h1 className="learner-title"><span aria-hidden="true">🔍 </span>Not found</h1>
        <Link to="/dashboard" className="btn-secondary">Back</Link>
      </>}
      {/* Wait for the lesson itself: its story decides which step comes first. */}
      {assignment && submissions.isSuccess && !lessonQuery.isLoading && <LessonStages key={assignment.id}
        assignmentId={assignment.id} title={lessonQuery.data?.title ?? assignment.title} lessonId={assignment.lesson_id}
        instructions={assignment.self_started ? '' : assignment.instructions}
        plan={{ ...assignment.learning_plan, ...pickStageContent(lessonQuery.data?.learning_plan) }}
        lesson={lessonQuery.data ?? null}
        submissions={submissions.data} reviews={evidence.data ?? []} />}
    </LearnerPage>
  );
}

/**
 * Assignments keep a copy of the lesson plan from the day they were set. The
 * learner-facing wording (problem, ideas, simple steps) comes from the lesson
 * itself, so improvements reach work that was set earlier. The skills and the
 * teacher's evidence brief stay as they were set.
 */
function pickStageContent(plan: LessonLearningPlan | null | undefined): Partial<LessonLearningPlan> {
  if (!plan) return {};
  const fresh: Partial<LessonLearningPlan> = { problem: plan.problem, ideas: plan.ideas, story: plan.story,
    storyHeading: plan.storyHeading, stepWords: plan.stepWords, weWill: plan.weWill, together: plan.together,
    doneLine: plan.doneLine, activity: plan.activity, history: plan.history, idea: plan.idea, noBlocks: plan.noBlocks, recap: plan.recap };
  if (plan.steps?.length) fresh.steps = plan.steps;
  if (plan.expectedResult) fresh.expectedResult = plan.expectedResult;
  if (plan.requirements?.length) fresh.requirements = plan.requirements;
  return fresh;
}

function LessonStages({ assignmentId, title, lessonId, instructions, plan, lesson, submissions, reviews }: {
  assignmentId: string; title: string; lessonId: string; instructions: string; plan: LessonLearningPlan;
  lesson: Awaited<ReturnType<typeof fetchLessonById>> | null;
  submissions: Parameters<typeof LessonSend>[0]['submissions']; reviews: Parameters<typeof LessonSend>[0]['reviews'];
}) {
  // The learning bit before the quiz: the lesson's short story, or its ideas
  // when a lesson has no story yet, so no learner is quizzed cold.
  const story: string[] = plan.story?.length ? plan.story : (plan.ideas ?? []).map((idea) => idea.body);
  const recap = plan.recap ?? [];
  // The story, activity, history, idea and recap steps appear only for lessons
  // that have them, and a lesson can leave out the blocks step.
  const steps = stages.filter((item) => (item.id !== 'story' || story.length > 0)
    && (item.id !== 'activity' || !!plan.activity) && (item.id !== 'history' || !!plan.history?.lines.length)
    && (item.id !== 'idea' || !!plan.idea) && (item.id !== 'code' || !plan.noBlocks) && (item.id !== 'recap' || recap.length > 0))
    .map((item) => ({ id: item.id, label: plan.stepWords?.[item.id]?.label ?? item.label, say: plan.stepWords?.[item.id]?.say ?? item.say }));
  // Every time the lesson opens (after signing in, too) it starts on the
  // story, so learners always know what they are about to do.
  const [stage, setStage] = useState<StageId>(steps[0].id);
  const heading = useRef<HTMLHeadingElement>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const work = useLessonWork(assignmentId);
  const path = usePath();
  const here = path.findIndex((item) => item.lesson.id === lessonId);
  const previous = here > 0 ? path[here - 1] : undefined;
  const next = here >= 0 ? path[here + 1] : undefined;
  const openNext = useMutation({
    mutationFn: async () => next!.assignmentId ?? startBlocklyLesson(next!.lesson.id),
    onSuccess: (id) => { void qc.invalidateQueries({ queryKey: ['learning-assignments'] }); navigate(`/dashboard/assignments/${id}`); },
  });
  const index = steps.findIndex((item) => item.id === stage);
  const current = steps[index];

  useEffect(() => {
    localStorage.setItem(stageKey(assignmentId), stage);
    // Moving to a new stage puts focus on its heading, so screen readers start
    // reading the new stage and keyboard users are not left at the bottom.
    heading.current?.focus();
    window.scrollTo?.({ top: 0 });
  }, [stage, assignmentId]);

  // As Tab moves through the lesson, the page scrolls so whatever has focus
  // sits in the middle of the screen, clear of the header and the Back/Next
  // bar (browsers alone can leave it hidden behind the sticky bar).
  useEffect(() => {
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const onFocus = (event: FocusEvent) => {
      const target = event.target as Element | null;
      if (!target || !(target instanceof Element) || target.closest('nav[aria-label="Back and next"], header')) return;
      target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: still ? 'auto' : 'smooth' });
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, []);

  // Leaving the code step sends the program to the teacher, so there is no
  // separate Send step or form. Unchanged programs are not sent twice.
  const send = useMutation({
    mutationFn: (program: NonNullable<typeof work.program> | null) => submitLearningWork({
      assignmentId, text: program ? `My program for "${learnerTitle(title)}"` : `Finished "${learnerTitle(title)}"`, url: '', reflection: '', program: program ?? undefined }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['learning-submissions'] }); void qc.invalidateQueries({ queryKey: ['learning-program', assignmentId] }); },
  });
  // The error sits at the foot of the step, where the sticky Back/Next bar would
  // cover it, so bring it into view. Focus stays on Next, ready to try again.
  const sendError = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!send.error) return;
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    sendError.current?.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' });
  }, [send.error]);
  function go(to: StageId) {
    if (send.isPending) return;
    // With no blocks step, finishing the final quiz is what tells the teacher.
    // As with sending blocks, the lesson moves on only once it has worked.
    if (stage === 'final' && plan.noBlocks && !submissions.length && steps.findIndex((item) => item.id === to) > index) {
      send.mutate(null, { onSuccess: () => setStage(to) });
      return;
    }
    if (stage === 'code') {
      const program = work.program ?? work.draft.data ?? null;
      const changed = !submissions.length || submissions[0].generated_code !== program?.code;
      if (program?.code?.trim() && changed) {
        // Going forward waits for the send: if it fails, the learner stays here
        // with the error showing and presses Next to try again. The final quiz
        // can only be reached by this path, so it never follows unsent work.
        if (steps.findIndex((item) => item.id === to) > index) {
          send.mutate(program, { onSuccess: () => setStage(to) });
          return;
        }
        send.mutate(program);
      } else work.saveIfChanged();
    }
    setStage(to);
  }
  const goBack = index > 0
    ? () => go(steps[index - 1].id)
    : previous?.assignmentId
      ? () => { localStorage.setItem(stageKey(previous.assignmentId!), 'final'); navigate(`/dashboard/assignments/${previous.assignmentId}`); }
      : undefined;
  const goNext = index < steps.length - 1
    ? () => go(steps[index + 1].id)
    : next && submissions.length > 0 ? () => openNext.mutate() : undefined;
  const finalQuiz = useQuery({ queryKey: ['learning-quizzes'], queryFn: listQuizzes });
  const attempts = useQuery({ queryKey: ['quiz-attempts'], queryFn: fetchQuizAttempts });
  const finalId = finalQuiz.data?.find((quiz) => quiz.lesson_id === lessonId && quiz.stage === 'end')?.id;
  const finished = !!finalId && !!attempts.data?.some((attempt) => attempt.quiz_id === finalId);
  const lessonQuiz = (which: 'pre' | 'end') => finalQuiz.data?.find((quiz) => quiz.lesson_id === lessonId && quiz.stage === which);
  const preCount = lessonQuiz('pre')?.questions.length ?? 2;
  const endCount = lessonQuiz('end')?.questions.length ?? 3;
  const latestReview = reviews[0];
  // Only a lesson's own audio or video shows. The general "how to use your
  // lesson" video describes an older lesson flow, so it stays off for now.
  const generalVideo = !lesson?.media_url || lesson.media_url.endsWith('/lesson-media/lesson-orientation.webm');
  const showMedia = !!lesson && !generalVideo;
  const welcomeSteps: { picture?: string; words: string }[] = plan.weWill?.map(storyLine) ?? [
    { picture: '❓', words: `Answer ${numberWord(preCount).toLowerCase()} questions. Just guess!` },
    { picture: '💬', words: 'Make the computer talk!' },
    { picture: '⭐', words: `Answer ${numberWord(endCount).toLowerCase()} more. Yay, all done!` },
  ];
  // Read aloud says the same words the screen shows, for learners with low
  // vision or a reading difficulty who are not using a screen reader.
  const readAloudText = stage === 'recap'
    ? [current.say, ...recap].join(' ')
    : stage === 'idea' && plan.idea
      ? [current.say, plan.idea.heading, ...plan.idea.before, ...plan.idea.cards.map((card, n) => `Block ${n + 1}: ${card}.`), ...plan.idea.after].join(' ')
    : stage === 'history'
      ? [current.say, plan.history?.heading ?? '', ...(plan.history?.lines ?? []).map((line) => storyLine(line).words)].filter(Boolean).join(' ')
    : stage === 'story'
    ? [current.say, ...story.map((line) => storyLine(line).words), 'Press Next!'].join(' ')
    : stage === 'welcome'
      ? [current.say, 'We will:', ...welcomeSteps.map((step) => step.words), 'Tab moves. Space picks.', plan.together ?? '',
          instructions ? `Your teacher says: ${instructions}` : '', 'Ready? Press Next!'].filter(Boolean).join(' ')
      : null;

  return <>
    {/* The lesson title is the page heading for screen readers; the screen
        holds just the step, its content, and Back and Next. */}
    <h1 className="sr-only">{learnerTitle(title)}</h1>


    <section aria-labelledby="stage-heading" className={`stage-${stage} space-y-6`}>
      {/* Robo says what to do. The bubble is the step heading, so a screen
          reader hears "Step 2 of 4, Quick quiz. Two quick questions…" in one go. */}
      {/* Robo and one short line. Screen readers also hear the step number
          and name, in one go, from the same heading. */}
      <div className="stage-banner">
        <Mascot size={64} mood={(stage === 'final' && finished) || stage === 'recap' ? 'cheer' : stage === 'code' ? 'think' : 'happy'} className="mascot-float shrink-0" />
        <div className="speech-bubble">
          <h2 id="stage-heading" ref={heading} tabIndex={0} className="!text-xl sm:!text-2xl">
            <span className="sr-only">Step {index + 1} of {steps.length}{stage === 'story' ? '' : `: ${current.label}`}. </span>{current.say}
          </h2>
        </div>
        {/* Keyed by step, so moving on stops the voice and it never reads the old step. */}
        {readAloudText && <ReadAloud key={stage} text={readAloudText} />}
      </div>

      <div key={stage} className="stage-pop space-y-6">
      {/* Discovery, written for a blind child under 10: Robo talks to them,
          tiny sentences, and which keys to press. Pictures are for children
          with some sight; screen readers skip them. */}
      {/* The story, written for a child under 10: one line at a time, each a
          Tab stop, with a picture when the line starts with one. Screen
          readers hear the words only. */}
      {stage === 'story' && <div className="learner-card space-y-4 p-6">
        <h3 tabIndex={0} className="lesson-subhead">{plan.storyHeading ?? (plan.story?.length ? 'A short story' : 'Good to know')}</h3>
        {story.map(storyLine).map(({ picture, words }, n) => (
          <p key={n} tabIndex={0} className="flex items-center gap-4 text-2xl font-bold !text-slate-900">
            {picture && <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl" style={{ background: 'var(--stage-soft)', border: '3px solid var(--stage)' }}>{picture}</span>}
            <span>{words}</span>
          </p>
        ))}
        <p tabIndex={0} className="text-2xl font-bold !text-slate-900">Press Next!</p>
      </div>}
      {stage === 'welcome' && <div className="learner-card space-y-5 p-6">
        <h3 tabIndex={0} className="lesson-subhead">We will:</h3>
        <ol className="space-y-4">
          {welcomeSteps.map((step, n) => (
            <li key={step.words} tabIndex={0} className="flex items-center gap-4 rounded-2xl text-2xl font-bold text-slate-900">
              {step.picture && <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl" style={{ background: 'var(--stage-soft)', border: '3px solid var(--stage)' }}>{step.picture}</span>}
              <span><span className="sr-only">{n + 1}. </span>{step.words}</span>
            </li>
          ))}
        </ol>
        <p tabIndex={0} className="rounded-2xl bg-amber-100 p-4 text-2xl font-bold !text-slate-900">Tab moves. Space picks.</p>
        {plan.together && <p tabIndex={0} className="text-2xl font-bold !text-slate-900">{plan.together}</p>}
        <p tabIndex={0} className="text-2xl font-bold !text-slate-900">Ready? Press Next!</p>
      </div>}
      {stage === 'welcome' && instructions && <p tabIndex={0} className="learner-card p-5 text-xl font-bold text-slate-900">Your teacher says: {instructions}</p>}
      {stage === 'welcome' && showMedia && lesson && <AccessibleLessonMedia lesson={lesson} learnerFriendly />}

      {stage === 'quiz' && <QuizRunner lessonId={lessonId} stage="pre" onBack={goBack} onDone={goNext ?? null} bar={(props) => <Bar {...props} />} />}

      {stage === 'activity' && <QuizRunner lessonId={lessonId} stage="mid" onBack={goBack} onDone={goNext ?? null} bar={(props) => <Bar {...props} />}
        afterResult={plan.activity?.talk && <p tabIndex={0} className="w-full rounded-2xl bg-amber-100 p-4 text-left text-xl font-bold !text-slate-900">{plan.activity.talk}</p>} />}

      {stage === 'history' && plan.history && <div className="learner-card space-y-4 p-6">
        <h3 tabIndex={0} className="lesson-subhead">{plan.history.heading}</h3>
        {plan.history.lines.map(storyLine).map(({ picture, words }) => (
          <p key={words} tabIndex={0} className="flex items-center gap-4 text-2xl font-bold !text-slate-900">
            {picture && <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl" style={{ background: 'var(--stage-soft)', border: '3px solid var(--stage)' }}>{picture}</span>}
            <span>{words}</span>
          </p>
        ))}
      </div>}

      {stage === 'idea' && plan.idea && <div className="learner-card space-y-4 p-6">
        <h3 tabIndex={0} className="lesson-subhead">{plan.idea.heading}</h3>
        {plan.idea.before.map((line) => <p key={line} tabIndex={0} className="text-2xl font-bold !text-slate-900">{line}</p>)}
        <ol className="idea-cards space-y-1">
          {plan.idea.cards.map((card, n) => <li key={card} tabIndex={0} className="idea-card"><span className="sr-only">Block {n + 1}: </span>{card}</li>)}
        </ol>
        {plan.idea.after.map((line) => <p key={line} tabIndex={0} className="text-2xl font-bold !text-slate-900">{line}</p>)}
      </div>}

      {stage === 'code' && <>
        <LessonBuild work={work} level={plan.level} />
        <HintBox hints={buildHints(plan)} />
      </>}

      {stage === 'final' && <>
        <QuizRunner lessonId={lessonId} stage="end" onBack={goBack} onDone={goNext ?? null} bar={(props) => <Bar {...props} nextLabel={send.isPending ? 'Sending…' : props.nextLabel} />}
          doneText={`${plan.doneLine ?? 'Yay! You did it!'}${submissions.length ? ' Your teacher can see your work.' : ''}`} />
      </>}
      {stage === 'recap' && <div className="learner-card space-y-4 p-6">
        {recap.map((line) => <p key={line} tabIndex={0} className="text-2xl font-bold !text-slate-900">{line}</p>)}
        {plan.noBlocks && submissions.length > 0 && <p tabIndex={0} className="text-xl font-bold !text-slate-900">Your teacher can see that you finished.</p>}
      </div>}
      {/* A teacher's comments close the lesson: on its last step, whichever that is. */}
      {stage === steps[steps.length - 1].id && latestReview && <div className="learner-card space-y-2 p-5">
        <h3>Your teacher said</h3>
        <p tabIndex={0} className="whitespace-pre-wrap text-lg font-semibold text-slate-900">{latestReview.feedback}</p>
      </div>}
      {send.error && <div ref={sendError}><FriendlyAlert error={send.error} /></div>}
      </div>
    </section>

    {(stage === 'story' || stage === 'welcome' || stage === 'history' || stage === 'idea' || stage === 'code' || stage === 'recap') && <Bar back={goBack} next={goNext} nextLabel={send.isPending ? 'Sending…' : 'Next'} />}
    <FriendlyAlert error={openNext.error} />
  </>;
}

function usePath() {
  const { lessons, projects } = useLearnerCourse();
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions() });
  return buildPath({ lessons: lessons.data, projects: projects.data, assignments: assignments.data, submissions: submissions.data });
}


function HintBox({ hints }: { hints: string[] }) {
  const [shown, setShown] = useState(0);
  return (
    <section className="space-y-3" aria-label="Hints">
      {/* The live region is always there (so it is announced); the list only
          appears once there is a hint in it. */}
      <div aria-live="polite">{shown > 0 && <ol className="space-y-2">
        {hints.slice(0, shown).map((hint, index) => (
          <li key={index} tabIndex={0} className="learner-pop flex items-start gap-3 rounded-2xl bg-amber-50 p-3 text-base font-semibold text-slate-900">
            <span aria-hidden="true">💡</span><span><span className="sr-only">Hint {index + 1}: </span>{hint}</span>
          </li>
        ))}
      </ol>}</div>
      {shown < hints.length
        ? <button type="button" className="btn-secondary" onClick={() => setShown(shown + 1)}
          aria-label={`${shown ? 'Another hint' : 'I need a hint'}. ${hints.length - shown === 1 ? 'One hint' : `${hints.length - shown} hints`} left.`}>
          <span aria-hidden="true">💡 </span>{shown ? 'Another hint' : 'I need a hint'}</button>
        : <p role="status" className="text-base font-bold text-slate-800">That's all the hints. Ask your teacher or a friend.</p>}
    </section>
  );
}

/** Left and Right arrows move between Back and Next, like a toolbar. */
function moveBetween(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  const buttons = Array.from(event.currentTarget.querySelectorAll('button'));
  const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
  if (at < 0) return;
  const to = buttons[at + (event.key === 'ArrowRight' ? 1 : -1)];
  if (to) { event.preventDefault(); to.focus(); }
}

/** Back and Next: the only way to move around a lesson. */
function Bar({ back, next, nextLabel = 'Next', nextDisabled }: BarProps) {
  return (
    <nav aria-label="Back and next" onKeyDown={moveBetween} className="lesson-bar sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-full border-2 border-slate-200 bg-white/95 px-3 py-3 shadow-[0_4px_0_#e2e8f0]">
      {back ? <button type="button" className="btn-secondary" onClick={back}><span aria-hidden="true">← </span>Back</button> : <span />}
      {/* aria-disabled, never disabled: the button stays in the Tab order so
          JAWS and NVDA users can always find it. */}
      {next && <button type="button" className="btn-play" aria-disabled={nextDisabled || undefined} onClick={() => { if (!nextDisabled) next(); }}>{nextLabel}<span aria-hidden="true"> →</span></button>}
    </nav>
  );
}

/** Small counts as words a young child hears naturally: 2 → "Two". */
function numberWord(n: number) {
  return ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'][n] ?? String(n);
}
