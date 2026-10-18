/**
 * The lesson page a learner sees. Wraps the same assignment, submission and
 * feedback records as the teacher view, but adds scaffolding: a step
 * checklist, hints that reveal one at a time, and a block-drawer guide.
 * Hints are built from the lesson plan itself, so nothing new is stored.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { trackLearningActivity } from '../../lib/learningOutcomes';
import { fetchAssignment, fetchEvidence, fetchSubmissions } from '../../lib/learningQueries';
import { fetchLessonById } from '../../lib/gql/queries';
import type { LearningLevel } from '../../lib/learningFramework';
import type { LessonLearningPlan } from '../../lib/learningRecords';
import { artThemeFor, pathwayLook, skillGoals, skillLook, stepKindFor, type ArtTheme } from '../../lib/learnerCopy';
import { LearnerPage, LevelChip, SkillChip, FriendlyAlert, Loading, ReadAloud } from './ui/LearnerKit';
import { LessonArt, StepIcon, Mascot } from './ui/LearnerArt';
import { LearnerSubmission } from './LearnerSubmission';
import { ReportConcernLink } from '../components/ReportConcernLink';
import { AccessibleLessonMedia } from './AccessibleLessonMedia';

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

const drawers: { name: string; emoji: string; what: string; from?: LearningLevel }[] = [
  { name: 'Output and text', emoji: '💬', what: 'Show words on the screen with the print block.' },
  { name: 'Numbers', emoji: '🔢', what: 'Add, subtract, multiply or pick a random number.' },
  { name: 'Choices (if)', emoji: '🔀', what: 'Do something only when a test is true.' },
  { name: 'Repeat (loops)', emoji: '🔁', what: 'Do the same blocks again and again without copying them.' },
  { name: 'Remember (variables)', emoji: '📦', what: 'Give a value a name so your program can remember it.' },
  { name: 'Lists', emoji: '📋', what: 'Keep lots of values together in one place.', from: 'intermediate' },
  { name: 'My own blocks (functions)', emoji: '🧰', what: 'Name a group of blocks so you can use it again and again.', from: 'expert' },
];
const levelRank: Record<LearningLevel, number> = { beginner: 0, intermediate: 1, expert: 2 };

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

export function LearnerLesson() {
  const { assignmentId } = useParams();
  const assignmentQuery = useQuery({ queryKey: ['learning-assignment', assignmentId], queryFn: () => fetchAssignment(assignmentId!), enabled: !!assignmentId });
  const assignment = assignmentQuery.data;
  const lessonQuery = useQuery({ queryKey: ['lesson', assignment?.lesson_id], queryFn: () => fetchLessonById(assignment!.lesson_id), enabled: !!assignment?.lesson_id });
  useEffect(() => { if (assignment) trackLearningActivity('resource_open', assignment.lesson_id); }, [assignment]);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [assignment?.id]);
  const evidence = useQuery({ queryKey: ['competency-evidence', assignmentId], queryFn: () => fetchEvidence(assignmentId!), enabled: !!assignment });
  const submissions = useQuery({ queryKey: ['learning-submissions', assignmentId], queryFn: () => fetchSubmissions(assignmentId!), enabled: !!assignment });
  const error = submissions.error ?? assignmentQuery.error ?? evidence.error;
  const isCapstone = assignment?.learning_plan.activityKind === 'capstone';
  const plan = assignment?.learning_plan;
  const theme = assignment ? artThemeFor(assignment.title, { pathwayId: assignment.learning_plan.pathwayId, capstone: isCapstone }) : 'print';

  return (
    <LearnerPage>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={isCapstone ? '/dashboard/my-projects' : '/dashboard/my-learning'} className="btn-secondary">
          <span aria-hidden="true">← </span><span className="sr-only">Back to </span>{isCapstone ? 'Projects' : 'Lessons'}
        </Link>
        <ReportConcernLink lessonId={assignment?.lesson_id} />
      </div>
      <FriendlyAlert error={error} />
      {assignmentQuery.isPending && <Loading>Opening your lesson</Loading>}
      {!assignmentQuery.isPending && !error && !assignment && <h1 className="learner-title"><span aria-hidden="true">🔍 </span>Not found</h1>}
      {assignment && plan && <>
        <header className="learner-card flex flex-col overflow-hidden sm:flex-row">
          <LessonArt theme={theme} className="w-full sm:w-64 shrink-0" />
          <div className="flex flex-col gap-3 p-5">
            <p className="sr-only">{pathwayLook[plan.pathwayId]?.label}</p>
            <h1 ref={heading} tabIndex={-1} className="learner-title focus:outline-none">{assignment.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <LevelChip level={plan.level} big />
              {assignment.due_date && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700"><span aria-hidden="true">📅</span><span className="sr-only">Due</span> {assignment.due_date}</span>}
            </div>
            <ul className="flex flex-wrap gap-2" aria-label="Skills you will practise">
              {plan.competencyIds.map((id) => <li key={id}><SkillChip id={id} /></li>)}
            </ul>
          </div>
        </header>

        {lessonQuery.data && <AccessibleLessonMedia lesson={lessonQuery.data} learnerFriendly />}

        <section className="space-y-4" aria-label="Your mission">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2><span aria-hidden="true">🎯 </span>Mission</h2>
            <ReadAloud text={[assignment.title, assignment.instructions, ...plan.steps.map((step, index) => `Step ${index + 1}. ${step}`), `What to show your teacher. ${plan.evidenceBrief}`, plan.expectedResult ? `When it is working, your program should show: ${plan.expectedResult}` : ''].filter(Boolean).join('. ')} />
          </div>
          {assignment.instructions && <p className="learner-card whitespace-pre-wrap border-sky-200 bg-sky-50 p-4 text-base font-semibold text-sky-950"><span aria-hidden="true">🧑‍🏫 </span>{assignment.instructions}</p>}
          <StepChecklist key={assignment.id} steps={plan.steps} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="learner-card p-4">
              <h3><span aria-hidden="true">📸 </span>Show</h3>
              <p className="mt-1 text-sm text-slate-700">{plan.evidenceBrief}</p>
            </div>
            {plan.expectedResult && <div className="learner-card p-4">
              <h3><span aria-hidden="true">👀 </span>Should show</h3>
              <pre className="mt-2 whitespace-pre-wrap break-words rounded-2xl bg-slate-900 p-3 text-sm text-emerald-300">{plan.expectedResult}</pre>
            </div>}
          </div>
          {isCapstone && !!plan.requirements?.length && <div className="learner-card border-amber-200 bg-amber-50 p-4">
            <h3 className="text-amber-900"><span aria-hidden="true">✅ </span>Done when</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">{plan.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
          </div>}
          <details className="learner-card p-4 text-sm text-slate-700">
            <summary className="cursor-pointer font-extrabold text-slate-900"><span aria-hidden="true">💪 </span>Skills</summary>
            <ul className="mt-3 space-y-2">
              {plan.competencyIds.map((id) => <li key={id} className="flex items-start gap-2"><span aria-hidden="true">{skillLook[id].emoji}</span><span><span className="font-extrabold">{skillLook[id].label}:</span> {skillGoals[id][plan.level]}</span></li>)}
            </ul>
            <p className="mt-3"><span aria-hidden="true">🤝 </span>Help is always okay.</p>
          </details>
        </section>

        <HintBox key={`hints-${assignment.id}`} hints={buildHints(assignment.title, plan)} level={plan.level} />

        <LearnerSubmission key={assignment.id} assignmentId={assignment.id} level={plan.level} submissions={submissions.data ?? []} reviews={evidence.data ?? []} />

        <Link className="btn-secondary" to={`/dashboard/quizzes?level=${plan.level}`}><span aria-hidden="true">🧠</span> Quiz</Link>
      </>}
    </LearnerPage>
  );
}

function StepChecklist({ steps }: { steps: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const percent = steps.length ? Math.round((done.size / steps.length) * 100) : 0;
  function toggle(index: number) {
    setDone((current) => { const next = new Set(current); if (next.has(index)) next.delete(index); else next.add(index); return next; });
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Steps done" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-sm font-extrabold text-slate-700" role="status">{done.size}/{steps.length}<span className="sr-only"> steps done</span>{done.size === steps.length && steps.length > 0 ? <> <span aria-hidden="true">🎉</span><span className="sr-only">, all finished!</span></> : ''}</p>
      </div>
      {done.size === steps.length && steps.length > 0 && (
        <div role="status" aria-live="polite" className="learner-card flex items-center gap-3 border-emerald-300 bg-emerald-50 p-4 text-emerald-950">
          <span className="text-3xl" aria-hidden="true">✅</span>
          <div><p className="font-extrabold">All steps complete!</p><p className="text-sm font-semibold">Great work. You can now test your project and send it to your teacher.</p></div>
        </div>
      )}
      <ol className="grid gap-3 sm:grid-cols-2" aria-label="Steps">
        {steps.map((step, index) => (
          <li key={index} className={`learner-card flex items-start gap-3 p-4 transition-colors ${done.has(index) ? 'border-emerald-300 bg-emerald-50' : ''}`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-extrabold text-white" aria-hidden="true">{index + 1}</span>
            <StepIcon kind={stepKindFor(step)} />
            <label className="flex flex-1 cursor-pointer items-start gap-3 pt-1.5">
              <span className="flex-1 text-base font-semibold text-slate-800"><span className="sr-only">Step {index + 1}: </span>{step}</span>
              <input type="checkbox" className="mt-1 h-6 w-6 shrink-0 rounded-md border-2 border-slate-400 text-emerald-600 focus:ring-emerald-400" checked={done.has(index)} onChange={() => toggle(index)} />
            </label>
          </li>
        ))}
      </ol>
    </div>
  );
}

function HintBox({ hints, level }: { hints: string[]; level: LearningLevel }) {
  const [shown, setShown] = useState(0);
  const available = drawers.filter((drawer) => !drawer.from || levelRank[level] >= levelRank[drawer.from]);
  return (
    <section className="learner-card border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 space-y-4" aria-label="Help and hints">
      <div className="flex items-center gap-3">
        <Mascot size={56} mood="think" />
        <div>
          <h2><span aria-hidden="true">💡 </span>Hints</h2>
          <p className="sr-only">Everyone gets stuck sometimes. Hints open one at a time, so give each one a go before the next.</p>
        </div>
      </div>
      <ol className="space-y-2" aria-label="Hints" aria-live="polite">
        {hints.slice(0, shown).map((hint, index) => (
          <li key={index} className="learner-pop flex items-start gap-3 rounded-2xl bg-white p-3 text-sm font-semibold text-slate-800">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-extrabold text-white" aria-hidden="true">{index + 1}</span>{hint}
          </li>
        ))}
      </ol>
      {shown < hints.length
        ? <button type="button" className="btn-primary" onClick={() => setShown(shown + 1)}><span aria-hidden="true">💡 </span>Hint<span className="sr-only"> {shown + 1} of {hints.length}</span> <span aria-hidden="true">({hints.length - shown})</span></button>
        : <p role="status" className="text-sm font-bold text-violet-900"><span aria-hidden="true">🙌 </span>Ask your teacher<span className="sr-only">. That's all the hints, and you've done great to get this far</span>.</p>}
      <details className="text-sm text-slate-700">
        <summary className="cursor-pointer font-extrabold text-slate-900"><span aria-hidden="true">🧰 </span>Blocks</summary>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {available.map((drawer) => <li key={drawer.name} className="flex items-start gap-2 rounded-2xl bg-white p-3">
            <span className="text-xl" aria-hidden="true">{drawer.emoji}</span>
            <span><span className="font-extrabold text-slate-900">{drawer.name}</span><br />{drawer.what}</span>
          </li>)}
        </ul>
      </details>
    </section>
  );
}
