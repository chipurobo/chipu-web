/**
 * The lesson page a learner sees, one stage at a time:
 *   Think (the problem + what do you know?) → Learn (two ideas + quick check)
 *   → Build (blocks, steps, hints) → Check (final check) → Send.
 * Only one stage is on screen, so there is one thing to read and one thing to
 * press. Uses the same assignment, submission and feedback records as the
 * teacher view; hints are built from the lesson plan, so nothing new is stored.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { trackLearningActivity } from '../../lib/learningOutcomes';
import { fetchAssignment, fetchAssignments, fetchBlocklyLessons, fetchBlocklyProjects, fetchEvidence, fetchSubmissions } from '../../lib/learningQueries';
import { fetchLessonById } from '../../lib/gql/queries';
import type { LessonLearningPlan } from '../../lib/learningRecords';
import { artThemeFor, learnerTitle, type ArtTheme } from '../../lib/learnerCopy';
import { buildPath } from '../../lib/learnerPath';
import { LearnerPage, FriendlyAlert, Loading, ReadAloud } from './ui/LearnerKit';
import { LessonArt } from './ui/LearnerArt';
import { StageQuiz } from './ui/StageQuiz';
import { LessonBuild, LessonSend, useLessonWork } from './LearnerSubmission';
import { AccessibleLessonMedia } from './AccessibleLessonMedia';

const stages = [
  { id: 'think', emoji: '🤔', label: 'Think' },
  { id: 'learn', emoji: '📖', label: 'Learn' },
  { id: 'build', emoji: '🧩', label: 'Build' },
  { id: 'check', emoji: '✅', label: 'Assess' },
  { id: 'send', emoji: '📬', label: 'Send' },
] as const;
type StageId = (typeof stages)[number]['id'];

const drawerTip: Record<ArtTheme, string> = {
  loop: 'Open the Repeat drawer and look for the "repeat" block.',
  decision: 'Open the Choices drawer. The "if" block only runs what is inside it when the test is true.',
  variable: 'Open the Remember drawer and make a variable. Give it a name that says what it holds.',
  print: 'Open the Output and text drawer. The "print" block shows words on the screen.',
  list: 'Open the Lists drawer. A list keeps several values together.',
  function: 'Open the My own blocks drawer. A function is a group of blocks you can use again by name.',
  robot: 'Think about input, then processing, then output. What goes in, and what should come out?',
  plan: 'Write the steps in order before you add any blocks. Then add one block per step.',
  design: 'Say who you are building for and what they need. Then build the simplest version first.',
  story: 'Use the "print" block for each line your program says. Put them in the order you want.',
  number: 'Open the Numbers drawer. Snap a maths block into a "print" block to show the answer.',
  project: 'Break the project into small parts. Build and test one part before you start the next.',
};

function buildHints(title: string, plan: LessonLearningPlan): string[] {
  const theme = artThemeFor(title, { pathwayId: plan.pathwayId, capstone: plan.activityKind === 'capstone' });
  const hints: string[] = [];
  if (plan.steps[0]) hints.push(`Start with step 1: ${plan.steps[0]} ${drawerTip[theme]}`);
  else hints.push(drawerTip[theme]);
  hints.push(plan.expectedResult
    ? `Your program should show: "${plan.expectedResult}". Press Run and compare what you see with that.`
    : 'Press Run after every change. Seeing what each block does is the fastest way to learn.');
  if (plan.steps.length > 2) hints.push(`Check your blocks against step ${plan.steps.length}: ${plan.steps[plan.steps.length - 1]}`);
  hints.push("Still stuck? That's okay! Ask a friend or your teacher, and tell them which step you're on.");
  return hints;
}

const stageKey = (assignmentId: string) => `chipurobo:lesson-stage:${assignmentId}`;
const introKey = (assignmentId: string) => `chipurobo:lesson-intro:${assignmentId}`;

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
    <LearnerPage className="!space-y-5 max-w-4xl">
      <FriendlyAlert error={error} />
      {assignmentQuery.isPending && <Loading>Opening your lesson</Loading>}
      {!assignmentQuery.isPending && !error && !assignment && <>
        <h1 className="learner-title"><span aria-hidden="true">🔍 </span>Not found</h1>
        <Link to="/dashboard/my-learning" className="btn-secondary">Back to lessons</Link>
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
  const fresh: Partial<LessonLearningPlan> = { problem: plan.problem, ideas: plan.ideas };
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
  const introWasCompleted = () => Boolean(
    submissions.length
    || localStorage.getItem(introKey(assignmentId))
    || localStorage.getItem(stageKey(assignmentId)),
  );
  const [introCompleted, setIntroCompleted] = useState(introWasCompleted);
  const [showIntro, setShowIntro] = useState(() => !introWasCompleted());
  const [stage, setStage] = useState<StageId>(() => {
    const saved = localStorage.getItem(stageKey(assignmentId)) as StageId | null;
    if (saved && stages.some((item) => item.id === saved)) return saved;
    return submissions.length ? 'send' : 'think';
  });
  const heading = useRef<HTMLHeadingElement>(null);
  const introHeading = useRef<HTMLHeadingElement>(null);
  const work = useLessonWork(assignmentId);
  const path = usePath();
  const here = path.findIndex((item) => item.lesson.id === lessonId);
  const next = here >= 0 ? path[here + 1] : undefined;
  const isProject = plan.activityKind === 'capstone';
  const index = stages.findIndex((item) => item.id === stage);
  const current = stages[index];
  const theme = artThemeFor(title, { pathwayId: plan.pathwayId, capstone: isProject });
  // The general "how to use your lesson" video belongs on the first lesson
  // only; lesson-specific audio or video shows on its own lesson.
  const generalVideo = !lesson?.media_url || lesson.media_url.endsWith('/lesson-media/lesson-orientation.webm');
  const showMedia = !!lesson && (!generalVideo || here === 0);

  useEffect(() => {
    if (showIntro) {
      introHeading.current?.focus();
      window.scrollTo?.({ top: 0 });
      return;
    }
    localStorage.setItem(stageKey(assignmentId), stage);
    // Moving to a new stage puts focus on its heading, so screen readers start
    // reading the new stage and keyboard users are not left at the bottom.
    heading.current?.focus();
    window.scrollTo?.({ top: 0 });
  }, [stage, assignmentId, showIntro]);

  function go(to: StageId) { if (stage === 'build') work.saveIfChanged(); setStage(to); }

  function finishIntro() {
    localStorage.setItem(introKey(assignmentId), 'done');
    setIntroCompleted(true);
    setShowIntro(false);
  }

  // What the read-aloud button says. Written to be heard, not read: short
  // sentences, "first, next, last" instead of numbers, and a little cheer.
  const steps = plan.steps.map((step, n) => `${n === 0 ? 'First' : n === plan.steps.length - 1 ? 'Last' : 'Next'}, ${lowerFirst(step)}`);
  const spoken: Record<StageId, string> = {
    think: [`Let's think about ${title}.`, plan.problem ? `Here's your mission. ${plan.problem}` : '', instructions ? `Your teacher says: ${instructions}` : '', 'What do you know already? Have a go. It is fine to guess!'].filter(Boolean).join(' '),
    learn: [`Here's the big idea.`, ...(plan.ideas ?? []).map((idea) => `${idea.title}. ${idea.body}`), plan.expectedResult ? `When it works, you will see this. ${plan.expectedResult}` : ''].filter(Boolean).join(' '),
    build: [`Time to build!`, ...steps, 'Test it as you go. Mistakes help you learn!'].join(' '),
    check: 'Quiz time! Answer a few quick questions. Take your time. You can always try again.',
    send: 'Great work! Tell your teacher what you made, then press Send. Your teacher will reply here.',
  };

  const introSteps = [
    'Learn the idea.',
    'Build and test it.',
    'Take a short assessment.',
    'Send your work.',
  ];
  const introSpoken = [
    `Let's get ready for ${title}!`,
    `Here's your mission. ${plan.problem ?? lesson?.description ?? title}`,
    instructions ? `Your teacher says: ${instructions}` : '',
    'Here is the plan. First, learn the idea. Next, build it and test it. Then, try a short quiz. Last, send your work to your teacher.',
    'Ready? Press Start lesson when you are. You have got this!',
  ].filter(Boolean).join(' ');

  return <>
    <div className="flex items-center gap-3">
      <Link to="/dashboard/my-learning" className="btn-secondary !px-3" title="All lessons">
        <span aria-hidden="true">←</span><span className="sr-only">All lessons</span>
      </Link>
      <h1 className="learner-title min-w-0 flex-1 !text-2xl sm:!text-3xl">{learnerTitle(title)}</h1>
      {!showIntro && <button type="button" className="btn-secondary !px-3" onClick={() => setShowIntro(true)}>
        <span aria-hidden="true">📋 </span>Instructions
      </button>}
    </div>

    {showIntro ? <section aria-labelledby="lesson-intro-heading" className="learner-card space-y-5 overflow-hidden p-5 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-teal-700">Get ready</p>
          <h2 id="lesson-intro-heading" ref={introHeading} tabIndex={-1} className="mt-1 focus:outline-none">Before you start</h2>
        </div>
        <ReadAloud text={introSpoken} />
      </div>

      <div className="rounded-2xl bg-teal-50 p-4">
        <h3 className="text-base">Your mission</h3>
        <p className="mt-1 text-base font-semibold leading-relaxed text-slate-900">{plan.problem ?? lesson?.description ?? title}</p>
      </div>

      {instructions && <div className="rounded-2xl bg-amber-50 p-4">
        <h3 className="text-base">From your teacher</h3>
        <p className="mt-1 text-base font-semibold text-slate-900">{instructions}</p>
      </div>}

      <ol className="grid gap-3 sm:grid-cols-2" aria-label="What to do in this lesson">
        {introSteps.map((step, number) => <li key={step} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
          <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 font-extrabold text-white">{number + 1}</span>
          <span className="pt-1 text-base font-semibold text-slate-900"><span className="sr-only">Step {number + 1}: </span>{step}</span>
        </li>)}
      </ol>

      <button type="button" className="btn-play w-full justify-center sm:w-auto" onClick={finishIntro}>
        {introCompleted ? 'Back to lesson' : 'Start lesson'}<span aria-hidden="true"> →</span>
      </button>
    </section> : <>

    <nav aria-label="Lesson steps">
      <ol className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {stages.map((item, n) => (
          <li key={item.id} aria-current={n === index ? 'step' : undefined}
            className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-xs font-extrabold sm:text-sm ${n === index ? 'bg-teal-700 text-white' : n < index ? 'bg-teal-50 text-teal-900' : 'bg-white text-slate-600 border-2 border-slate-200'}`}>
            <span aria-hidden="true" className="text-lg">{n < index ? '✓' : item.emoji}</span>
            <span><span className="sr-only">Step {n + 1}: </span>{item.label}<span className="sr-only">{n < index ? ', done' : n === index ? ', you are here' : ''}</span></span>
          </li>
        ))}
      </ol>
    </nav>

    <section aria-labelledby="stage-heading" className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="stage-heading" ref={heading} tabIndex={-1} className="focus:outline-none">
          <span className="sr-only">Step {index + 1} of {stages.length}: </span><span aria-hidden="true">{current.emoji} </span>{current.label}
        </h2>
        <ReadAloud key={stage} text={spoken[stage]} />
      </div>

      {stage === 'think' && <>
        <div className="learner-card flex flex-col overflow-hidden sm:flex-row">
          <LessonArt theme={theme} className="w-full sm:w-56 shrink-0" />
          <div className="space-y-3 p-5">
            <p className="text-lg font-semibold leading-relaxed text-slate-900">{plan.problem ?? lesson?.description ?? title}</p>
            {instructions && <p className="rounded-2xl bg-slate-100 p-3 text-base font-semibold text-slate-900"><span className="font-extrabold">From your teacher: </span>{instructions}</p>}
          </div>
        </div>
        {showMedia && lesson && <AccessibleLessonMedia lesson={lesson} learnerFriendly />}
        <StageQuiz lessonId={lessonId} stage="pre" title="What do you know already?" />
      </>}

      {stage === 'learn' && <>
        <ol className="space-y-3" aria-label="Ideas">
          {(plan.ideas ?? []).map((idea, n) => (
            <li key={idea.title} className="learner-card flex items-start gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-lg font-extrabold text-white" aria-hidden="true">{n + 1}</span>
              <div><h3>{idea.title}</h3><p className="mt-1 text-base">{idea.body}</p></div>
            </li>
          ))}
        </ol>
        {!plan.ideas?.length && lesson?.description && <p className="learner-card p-5 text-base">{lesson.description}</p>}
        {plan.expectedResult && <div className="learner-card p-5">
          <h3>When it works, you will see</h3>
          <p className="mt-2 whitespace-pre-line rounded-2xl bg-slate-900 p-3 text-base font-semibold !text-white">{plan.expectedResult}</p>
        </div>}
        {isProject && !!plan.requirements?.length && <div className="learner-card p-5">
          <h3>Your project is done when it has</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-slate-800">{plan.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
        </div>}
        <StageQuiz lessonId={lessonId} stage="mid" title="Quick check" />
      </>}

      {stage === 'build' && <>
        <StepChecklist key={assignmentId} steps={plan.steps} />
        <LessonBuild work={work} level={plan.level} />
        <HintBox hints={buildHints(title, plan)} />
      </>}

      {stage === 'check' && <StageQuiz lessonId={lessonId} stage="end" title="Short assessment" />}

      {stage === 'send' && <>
        <LessonSend work={work} submissions={submissions} reviews={reviews} />
        {!!submissions.length && next && next.state !== 'locked' && <NextLesson item={next} />}
      </>}
    </section>

    <div className="flex items-center justify-between gap-3 border-t-2 border-slate-200 pt-5">
      {index > 0
        ? <button type="button" className="btn-secondary" onClick={() => go(stages[index - 1].id)}><span aria-hidden="true">← </span>Back</button>
        : <span />}
      {index < stages.length - 1 && <button type="button" className="btn-play" onClick={() => go(stages[index + 1].id)}>
        Next<span className="sr-only">: {stages[index + 1].label}</span><span aria-hidden="true"> →</span></button>}
    </div>
    </>}
  </>;
}

function usePath() {
  const lessons = useQuery({ queryKey: ['blockly-lessons'], queryFn: fetchBlocklyLessons });
  const projects = useQuery({ queryKey: ['blockly-projects'], queryFn: fetchBlocklyProjects });
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions() });
  return buildPath({ lessons: lessons.data, projects: projects.data, assignments: assignments.data, submissions: submissions.data });
}

function NextLesson({ item }: { item: ReturnType<typeof buildPath>[number] }) {
  return (
    <div className="learner-card flex flex-wrap items-center justify-between gap-3 p-5">
      <p className="text-base font-extrabold text-slate-900"><span className="font-semibold text-slate-600">Next: </span>{learnerTitle(item.lesson.title)}</p>
      <Link className="btn-play" to="/dashboard">Go<span className="sr-only"> to the next lesson</span><span aria-hidden="true"> →</span></Link>
    </div>
  );
}

function StepChecklist({ steps }: { steps: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  function toggle(index: number) {
    setDone((current) => { const next = new Set(current); if (next.has(index)) next.delete(index); else next.add(index); return next; });
  }
  return (
    <div className="learner-card space-y-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3>Steps</h3>
        <p className="text-sm font-extrabold text-slate-700" role="status">{done.size} of {steps.length}<span className="sr-only"> steps done</span></p>
      </div>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li key={index}>
            <label className={`flex cursor-pointer items-start gap-3 rounded-2xl p-3 ${done.has(index) ? 'bg-teal-50' : 'bg-slate-50'}`}>
              <input type="checkbox" aria-label={`Step ${index + 1}: ${step}`} className="mt-0.5 h-6 w-6 shrink-0 rounded-md border-2 border-slate-400 text-teal-700 focus:ring-teal-500" checked={done.has(index)} onChange={() => toggle(index)} />
              <span className="text-base font-semibold text-slate-900"><span className="font-extrabold">{index + 1}. </span>{step}</span>
            </label>
          </li>
        ))}
      </ol>
    </div>
  );
}

function HintBox({ hints }: { hints: string[] }) {
  const [shown, setShown] = useState(0);
  return (
    <section className="space-y-3" aria-label="Hints">
      <ol className="space-y-2" aria-live="polite">
        {hints.slice(0, shown).map((hint, index) => (
          <li key={index} className="learner-pop flex items-start gap-3 rounded-2xl bg-amber-50 p-3 text-base font-semibold text-slate-900">
            <span aria-hidden="true">💡</span><span><span className="sr-only">Hint {index + 1}: </span>{hint}</span>
          </li>
        ))}
      </ol>
      {shown < hints.length
        ? <button type="button" className="btn-secondary" onClick={() => setShown(shown + 1)}
          aria-label={`${shown ? 'Another hint' : 'I need a hint'}. ${hints.length - shown === 1 ? 'One hint' : `${hints.length - shown} hints`} left.`}>
          <span aria-hidden="true">💡 </span>{shown ? 'Another hint' : 'I need a hint'}</button>
        : <p role="status" className="text-base font-bold text-slate-800">That's all the hints. Ask your teacher or a friend.</p>}
    </section>
  );
}

/** "Drag a block" → "drag a block", so it reads naturally after "First, ". */
function lowerFirst(text: string): string {
  return /^[A-Z][a-z]/.test(text) ? text[0].toLowerCase() + text.slice(1) : text;
}
