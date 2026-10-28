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
import { trackLearningActivity } from '../../lib/learningOutcomes';
import { fetchAssignment, fetchAssignments, fetchEvidence, fetchSubmissions, startBlocklyLesson } from '../../lib/learningQueries';
import { useLearnerCourse } from './useLearnerCourse';
import { fetchLessonById } from '../../lib/gql/queries';
import type { LessonLearningPlan } from '../../lib/learningRecords';
import { artThemeFor, learnerTitle } from '../../lib/learnerCopy';
import { buildPath } from '../../lib/learnerPath';
import { LearnerPage, FriendlyAlert, Loading } from './ui/LearnerKit';
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
  const [stage, setStage] = useState<StageId>(() => {
    const saved = localStorage.getItem(stageKey(assignmentId)) as StageId | null;
    if (saved && stages.some((item) => item.id === saved)) return saved;
    return submissions.length ? 'send' : 'think';
  });
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
  const isProject = plan.activityKind === 'capstone';
  const index = stages.findIndex((item) => item.id === stage);
  const current = stages[index];
  const theme = artThemeFor(title, { pathwayId: plan.pathwayId, capstone: isProject });
  // The general "how to use your lesson" video belongs on the first lesson
  // only; lesson-specific audio or video shows on its own lesson.
  const generalVideo = !lesson?.media_url || lesson.media_url.endsWith('/lesson-media/lesson-orientation.webm');
  const showMedia = !!lesson && (!generalVideo || here === 0);

  useEffect(() => {
    localStorage.setItem(stageKey(assignmentId), stage);
    // Moving to a new stage puts focus on its heading, so screen readers start
    // reading the new stage and keyboard users are not left at the bottom.
    heading.current?.focus();
    window.scrollTo?.({ top: 0 });
  }, [stage, assignmentId]);

  function go(to: StageId) { if (stage === 'build') work.saveIfChanged(); setStage(to); }


  return <>
    {/* The lesson title is the page heading for screen readers; the screen
        holds just the step, its content, and Back and Next. */}
    <h1 className="sr-only">{learnerTitle(title)}</h1>


    <section aria-labelledby="stage-heading" className="space-y-5">
      {/* One small line says where you are; the step name is the heading. */}
      <h2 id="stage-heading" ref={heading} tabIndex={-1} className="focus:outline-none">
        <span className="block text-base font-bold text-slate-700">Step {index + 1} of {stages.length}<span className="sr-only">:</span></span>
        {current.label}
      </h2>

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
        <HintBox hints={buildHints(plan)} />
      </>}

      {stage === 'check' && <StageQuiz lessonId={lessonId} stage="end" title="Short assessment" />}

      {stage === 'send' && <>
        <LessonSend work={work} submissions={submissions} reviews={reviews} />
      </>}
    </section>

    <nav aria-label="Back and next" className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t-2 border-slate-200 bg-warm-50/95 px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      {index > 0
        ? <button type="button" className="btn-secondary" onClick={() => go(stages[index - 1].id)}><span aria-hidden="true">← </span>Back</button>
        : previous?.assignmentId
          ? <button type="button" className="btn-secondary" onClick={() => { localStorage.setItem(stageKey(previous.assignmentId!), 'send'); navigate(`/dashboard/assignments/${previous.assignmentId}`); }}>
              <span aria-hidden="true">← </span>Back<span className="sr-only"> to the last lesson</span></button>
          : <span />}
      {index < stages.length - 1
        ? <button type="button" className="btn-play" onClick={() => go(stages[index + 1].id)}>
            Next<span className="sr-only">: {stages[index + 1].label}</span><span aria-hidden="true"> →</span></button>
        : next && submissions.length > 0
          ? <button type="button" className="btn-play" disabled={openNext.isPending} onClick={() => openNext.mutate()}>
              Next<span className="sr-only">: the next lesson</span><span aria-hidden="true"> →</span></button>
          : <span />}
    </nav>
    <FriendlyAlert error={openNext.error} />
  </>;
}

function usePath() {
  const { lessons, projects } = useLearnerCourse();
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions() });
  return buildPath({ lessons: lessons.data, projects: projects.data, assignments: assignments.data, submissions: submissions.data });
}


function StepChecklist({ steps }: { steps: string[] }) {
  return (
    <ol className="learner-card space-y-2 p-5" aria-label="Steps">
      {steps.map((step, index) => (
        <li key={index} className="flex items-start gap-3 text-base font-semibold text-slate-900">
          <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 font-extrabold text-white">{index + 1}</span>
          <span className="pt-1">{step}</span>
        </li>
      ))}
    </ol>
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

