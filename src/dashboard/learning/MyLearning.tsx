/**
 * The lesson path, in order, one line per lesson. CBC classroom learners see
 * one list (CBC follows grades, not levels); coding-club learners see it
 * grouped by Beginner, Intermediate and Expert. Done and open lessons can be
 * opened; the next two locked lessons are shown and the rest fold into one
 * line so the page stays short. Work a teacher set outside the path is
 * listed on top.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAssignments, fetchEvidence, fetchSubmissions, startBlocklyLesson } from '../../lib/learningQueries';
import { useLearnerCourse } from './useLearnerCourse';
import { learnerTitle, levelLook, levelOrder, pathwayLook } from '../../lib/learnerCopy';
import { buildPath, type PathItem } from '../../lib/learnerPath';
import { LearnerPage, FriendlyAlert, Loading } from './ui/LearnerKit';

export function MyLearning() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { course, lessons, projects } = useLearnerCourse();
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions() });
  const evidence = useQuery({ queryKey: ['competency-evidence'], queryFn: () => fetchEvidence() });
  const start = useMutation({ mutationFn: startBlocklyLesson, onSuccess: (id) => {
    void qc.invalidateQueries({ queryKey: ['learning-assignments'] }); navigate(`/dashboard/assignments/${id}`);
  } });
  const error = lessons.error ?? assignments.error ?? submissions.error ?? evidence.error;
  const loading = lessons.isPending || assignments.isPending || submissions.isPending;
  const path = buildPath({ lessons: lessons.data, projects: projects.data, assignments: assignments.data, submissions: submissions.data, evidence: evidence.data });
  const onPath = new Set(path.map((item) => item.lesson.id));
  // Work a teacher set outside the course. Lessons a learner opened that have
  // since been switched off are not listed (their work is kept).
  const extra = (assignments.data ?? []).filter((assignment) => !onPath.has(assignment.lesson_id) && assignment.self_started === false);
  const done = path.filter((item) => item.state === 'done').length;
  const nowId = path.find((item) => item.state === 'open')?.lesson.id;
  const percent = path.length ? Math.round((done / path.length) * 100) : 0;
  // Levels only help when the club course actually has more than one.
  const levelled = course === 'club' && new Set(path.map((item) => item.level)).size > 1;
  // Everything up to two locked lessons is listed; later ones fold away.
  const firstLocked = path.findIndex((item) => item.state === 'locked');
  const cut = firstLocked < 0 ? path.length : firstLocked + 2;
  const shown = path.slice(0, cut);
  const later = path.slice(cut);

  return (
    <LearnerPage className="max-w-3xl">
      <header className="space-y-3">
        <h1 className="learner-title">Lessons</h1>
        <div className="flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Lessons done" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
            <div className="h-full rounded-full bg-teal-700" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-base font-extrabold text-slate-800">{done} of {path.length} done</p>
        </div>
      </header>

      <FriendlyAlert error={error ?? start.error} />
      {loading && <Loading>Loading your lessons</Loading>}

      {!loading && !error && !!extra.length && (
        <section aria-labelledby="teacher-set" className="space-y-2">
          <h2 id="teacher-set">From your teacher</h2>
          <ul className="space-y-2">
            {extra.map((assignment) => <li key={assignment.id}>
              <Link to={`/dashboard/assignments/${assignment.id}`} className="learner-card learner-card-hover flex items-center gap-3 p-4">
                <span className="text-xl" aria-hidden="true">📌</span><span className="text-base font-extrabold text-slate-900">{assignment.title}</span>
              </Link>
            </li>)}
          </ul>
        </section>
      )}

      {!loading && !error && !!path.length && levelled && levelOrder.map((level) => {
        // Coding clubs follow Beginner, Intermediate and Expert. A level that
        // is still fully locked is one line, not a wall of padlocks.
        const items = path.filter((item) => item.level === level);
        if (!items.length) return null;
        const look = levelLook[level];
        if (items.every((item) => item.state === 'locked')) return (
          <section key={level} aria-labelledby={`level-${level}`} className="flex items-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 p-4">
            <span aria-hidden="true" className="text-2xl">🔒</span>
            <div>
              <h2 id={`level-${level}`} className="!text-lg"><span aria-hidden="true">{look.emoji} </span>{look.title}</h2>
              <p className="text-base">{laterSummary(items, '')} Opens when you finish {learnerTitle(items[0].after ?? '')}.</p>
            </div>
          </section>
        );
        const firstLockedHere = items.findIndex((item) => item.state === 'locked');
        const cutHere = firstLockedHere < 0 ? items.length : firstLockedHere + 2;
        const laterHere = items.slice(cutHere);
        return (
          <section key={level} aria-labelledby={`level-${level}`} className="space-y-2">
            <h2 id={`level-${level}`}><span aria-hidden="true">{look.emoji} </span>{look.title}</h2>
            <ol className="space-y-2">
              {items.slice(0, cutHere).map((item) => <PathRow key={item.lesson.id} item={item} now={item.lesson.id === nowId} total={path.length}
                starting={start.isPending && start.variables === item.lesson.id} disabled={start.isPending}
                onStart={() => start.mutate(item.lesson.id)} />)}
            </ol>
            {!!laterHere.length && <LaterNote items={laterHere} />}
          </section>
        );
      })}

      {!loading && !error && !!path.length && !levelled && (
        <section aria-labelledby="path-heading" className="space-y-2">
          <h2 id="path-heading" className="sr-only">All lessons, in order</h2>
          <ol className="space-y-2">
            {shown.map((item) => <PathRow key={item.lesson.id} item={item} now={item.lesson.id === nowId} total={path.length}
              starting={start.isPending && start.variables === item.lesson.id} disabled={start.isPending}
              onStart={() => start.mutate(item.lesson.id)} />)}
          </ol>
          {!!later.length && <LaterNote items={later} />}
        </section>
      )}
    </LearnerPage>
  );
}

function PathRow({ item, now, total, starting, disabled, onStart }: {
  item: PathItem; now: boolean; total: number; starting: boolean; disabled: boolean; onStart: () => void;
}) {
  const pathway = pathwayLook[item.lesson.learning_plan?.pathwayId ?? ''];
  const titleId = `lesson-${item.lesson.id}-title`;
  const detailsId = `lesson-${item.lesson.id}-details`;
  const marker = <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-extrabold ${
    item.state === 'done' ? 'bg-teal-700 text-white' : now ? 'bg-amber-400 text-slate-900' : item.state === 'locked' ? 'bg-slate-100 text-slate-500' : 'bg-white text-slate-800 border-2 border-slate-300'}`}>
    {item.state === 'done' ? '✓' : item.state === 'locked' ? '🔒' : item.project ? '★' : item.number}
  </span>;
  const status = item.state === 'done' ? 'Done.' : item.state === 'locked' ? `Locked. Finish ${item.after} first.` : now ? 'Ready to start.' : '';
  const text = <span className="min-w-0 flex-1">
    <span id={titleId} className={`block text-base font-extrabold ${item.state === 'locked' ? 'text-slate-600' : 'text-slate-900'}`}>
      <span className="sr-only">{item.project ? 'Big project' : `Lesson ${item.number} of ${total}`}: </span>
      {learnerTitle(item.lesson.title)}
    </span>
    <span id={detailsId} className="mt-1 block text-sm font-semibold leading-snug text-slate-700">
      {pathway && <><span aria-hidden="true">{pathway.emoji} </span>{pathway.label}</>}
      {pathway && item.lesson.description && <span aria-hidden="true"> · </span>}
      {item.lesson.description}
      <span className="sr-only"> {status}</span>
    </span>
  </span>;
  // One clean sentence per part, so VoiceOver, NVDA and JAWS read the card as
  // "Lesson 1 of 4: Light it up. Creative coding. Plan and test a sequence.
  // Ready to start. Start lesson." rather than run-together fragments.
  const name = (action: string) => [
    `${item.project ? 'Big project' : `Lesson ${item.number} of ${total}`}: ${learnerTitle(item.lesson.title)}`,
    pathway?.label, item.lesson.description, status, action,
  ].filter(Boolean).map((part) => sentence(part!)).join(' ');

  if (item.state === 'locked') return <li className="flex items-center gap-3 rounded-3xl px-4 py-3">{marker}{text}</li>;
  if (item.assignmentId) return <li>
    <Link to={`/dashboard/assignments/${item.assignmentId}`} aria-current={now ? 'step' : undefined} aria-label={name('Open lesson')}
      className={`learner-card learner-card-hover flex items-center gap-3 px-4 py-3 ${now ? '!border-teal-700' : ''}`}>
      {marker}{text}<span aria-hidden="true" className="text-slate-500">→</span>
    </Link>
  </li>;
  return <li>
    <button type="button" onClick={onStart} disabled={disabled} aria-current={now ? 'step' : undefined} aria-label={name(starting ? 'Starting lesson' : 'Start lesson')}
      className={`learner-card learner-card-hover flex w-full items-center gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-900 ${now ? '!border-teal-700' : ''}`}>
      {marker}{text}<span className="text-base font-extrabold text-teal-800" aria-hidden="true">{starting ? 'Starting…' : 'Start →'}</span>
    </button>
  </li>;
}

/** "Add a period" → "Add a period."; leaves "Ready?" and "Done." alone. */
function sentence(text: string): string {
  const trimmed = text.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/** "3 more lessons and 1 big project." Leaves out a part that is zero. */
function laterSummary(later: PathItem[], more = 'more '): string {
  const lessons = later.filter((item) => !item.project).length;
  const projects = later.length - lessons;
  const parts = [
    lessons ? `${lessons} ${more}${lessons === 1 ? 'lesson' : 'lessons'}` : '',
    projects ? `${projects} big ${projects === 1 ? 'project' : 'projects'}` : '',
  ].filter(Boolean);
  return `${parts.join(' and ').replace(/^./, (letter) => letter.toUpperCase())}.`;
}

function LaterNote({ items }: { items: PathItem[] }) {
  return (
    <p className="flex items-center gap-3 rounded-3xl border-2 border-dashed border-slate-300 p-4 text-base font-semibold text-slate-700">
      <span aria-hidden="true" className="text-2xl">🔒</span>
      {laterSummary(items)} They open one at a time.
    </p>
  );
}
