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
import { LearnerPage, FriendlyAlert, Loading } from './ui/LearnerKit';
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
  { id: 'code', emoji: '🧩', label: 'Code it', say: 'Change the words, then press Run!' },
  { id: 'final', emoji: '🏆', label: 'Final quiz', say: 'One more game! You can do it!' },
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
      {assignmentQuery.isPending && <Loading>Opening your lesson</Loading>}
      {!assignmentQuery.isPending && !error && !assignment && <>
        <h1 className="learner-title"><span aria-hidden="true">🔍 </span>Not found</h1>
        <Link to="/dashboard" className="btn-secondary">Back</Link>
      </>}
      {assignment && submissions.isSuccess && <LessonStages key={assignment.id}
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
  const fresh: Partial<LessonLearningPlan> = { problem: plan.problem, ideas: plan.ideas, story: plan.story };
  if (plan.steps?.length) fresh.steps = plan.steps;
  if (plan.expectedResult) fresh.expectedResult = plan.expectedResult;
  if (plan.requirements?.length) fresh.requirements = plan.requirements;
  return fresh;
}

function LessonStages({ assignmentId, title, lessonId, instructions, plan, submissions, reviews }: {
  assignmentId: string; title: string; lessonId: string; instructions: string; plan: LessonLearningPlan;
  lesson: Awaited<ReturnType<typeof fetchLessonById>> | null;
  submissions: Parameters<typeof LessonSend>[0]['submissions']; reviews: Parameters<typeof LessonSend>[0]['reviews'];
}) {
  // The learning bit before the quiz: the lesson's short story, or its ideas
  // when a lesson has no story yet, so no learner is quizzed cold.
  const story: string[] = plan.story?.length ? plan.story : (plan.ideas ?? []).map((idea) => idea.body);
  const steps = story.length ? stages : stages.filter((item) => item.id !== 'story');
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
    mutationFn: (program: NonNullable<typeof work.program>) => submitLearningWork({
      assignmentId, text: `My program for "${learnerTitle(title)}"`, url: '', reflection: '', program }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['learning-submissions'] }); void qc.invalidateQueries({ queryKey: ['learning-program', assignmentId] }); },
  });
  function go(to: StageId) {
    if (stage === 'code') {
      const program = work.program ?? work.draft.data ?? null;
      const changed = !submissions.length || submissions[0].generated_code !== program?.code;
      if (program?.code?.trim() && changed) send.mutate(program); else work.saveIfChanged();
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
        <Mascot size={64} mood={stage === 'final' && finished ? 'cheer' : stage === 'code' ? 'think' : 'happy'} className="mascot-float shrink-0" />
        <div className="speech-bubble">
          <h2 id="stage-heading" ref={heading} tabIndex={0} className="!text-xl sm:!text-2xl">
            <span className="sr-only">Step {index + 1} of {steps.length}{stage === 'story' ? '' : `: ${current.label}`}. </span>{current.say}
          </h2>
        </div>
      </div>

      <div key={stage} className="stage-pop space-y-6">
      {/* Discovery, written for a blind child under 10: Robo talks to them,
          tiny sentences, and which keys to press. Pictures are for children
          with some sight; screen readers skip them. */}
      {/* The story, written for a child under 10: one line at a time, each a
          Tab stop, with a picture when the line starts with one. Screen
          readers hear the words only. */}
      {stage === 'story' && <div className="learner-card space-y-4 p-6">
        <h3 tabIndex={0} className="lesson-subhead">{plan.story?.length ? 'A short story' : 'Good to know'}</h3>
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
          {[
            { picture: '❓', words: `Answer ${numberWord(preCount).toLowerCase()} questions. Just guess!` },
            { picture: '💬', words: 'Make the computer talk!' },
            { picture: '⭐', words: `Answer ${numberWord(endCount).toLowerCase()} more. Yay, all done!` },
          ].map((step, n) => (
            <li key={step.words} tabIndex={0} className="flex items-center gap-4 rounded-2xl text-2xl font-bold text-slate-900">
              <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl" style={{ background: 'var(--stage-soft)', border: '3px solid var(--stage)' }}>{step.picture}</span>
              <span><span className="sr-only">{n + 1}. </span>{step.words}</span>
            </li>
          ))}
        </ol>
        <p tabIndex={0} className="rounded-2xl bg-amber-100 p-4 text-2xl font-bold !text-slate-900">Tab moves. Space picks.</p>
        <p tabIndex={0} className="text-2xl font-bold !text-slate-900">Ready? Press Next!</p>
      </div>}
      {stage === 'welcome' && instructions && <p tabIndex={0} className="learner-card p-5 text-xl font-bold text-slate-900">Your teacher says: {instructions}</p>}

      {stage === 'quiz' && <QuizRunner lessonId={lessonId} stage="pre" onBack={goBack} onDone={goNext ?? null} bar={(props) => <Bar {...props} />} />}

      {stage === 'code' && <>
        <LessonBuild work={work} level={plan.level} />
        <HintBox hints={buildHints(plan)} />
      </>}

      {stage === 'final' && <>
        <QuizRunner lessonId={lessonId} stage="end" onBack={goBack} onDone={goNext ?? null} bar={(props) => <Bar {...props} />}
          doneText="Yay! You did it! Your teacher can see your work." />
        {latestReview && <div className="learner-card space-y-2 p-5">
          <h3>Your teacher said</h3>
          <p tabIndex={0} className="whitespace-pre-wrap text-lg font-semibold text-slate-900">{latestReview.feedback}</p>
        </div>}
      </>}
      <FriendlyAlert error={send.error} />
      </div>
    </section>

    {(stage === 'story' || stage === 'welcome' || stage === 'code') && <Bar back={goBack} next={goNext} />}
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
