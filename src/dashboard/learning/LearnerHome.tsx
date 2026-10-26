/**
 * Learner home: one thing to do next, and nothing else competing for
 * attention. Work a teacher set comes first; otherwise it is the next open
 * lesson on the path.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchAssignments, fetchEvidence, fetchSubmissions, startBlocklyLesson } from '../../lib/learningQueries';
import { useLearnerCourse } from './useLearnerCourse';
import { fetchQuizAttempts } from '../../lib/learningOutcomes';
import { artThemeFor, computeStats, firstName, learnerTitle, levelLook, pathwayLook } from '../../lib/learnerCopy';
import { buildPath, nextUp } from '../../lib/learnerPath';
import { LearnerPage, FriendlyAlert, Loading, EmptyNote, ReadAloud } from './ui/LearnerKit';
import { LessonArt, Mascot } from './ui/LearnerArt';

export function LearnerHome() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { course, lessons, projects } = useLearnerCourse();
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions() });
  const evidence = useQuery({ queryKey: ['competency-evidence'], queryFn: () => fetchEvidence() });
  const attempts = useQuery({ queryKey: ['quiz-attempts'], queryFn: fetchQuizAttempts });
  const start = useMutation({ mutationFn: startBlocklyLesson, onSuccess: (id) => {
    void qc.invalidateQueries({ queryKey: ['learning-assignments'] }); navigate(`/dashboard/assignments/${id}`);
  } });
  const error = lessons.error ?? assignments.error ?? submissions.error ?? evidence.error;
  const loading = lessons.isPending || assignments.isPending || submissions.isPending;
  const path = buildPath({ lessons: lessons.data, projects: projects.data, assignments: assignments.data, submissions: submissions.data, evidence: evidence.data });
  const { teacher, item } = nextUp(path, assignments.data, submissions.data);
  const done = path.filter((step) => step.state === 'done').length;
  const stats = computeStats({ assignments: assignments.data, submissions: submissions.data, evidence: evidence.data, attempts: attempts.data });
  const rawTitle = item?.lesson.title ?? teacher?.title;
  const title = rawTitle && learnerTitle(rawTitle);
  const nextPlan = teacher?.learning_plan ?? item?.lesson.learning_plan;
  const pathway = nextPlan ? pathwayLook[nextPlan.pathwayId] : undefined;
  const description = item?.lesson.description ?? nextPlan?.problem;
  const assignmentId = teacher?.id ?? item?.assignmentId;
  const started = !!assignmentId && !!assignments.data?.some((assignment) => assignment.id === assignmentId);
  const [welcomePending] = useState(() => {
    try { return sessionStorage.getItem('chipurobo:learner-welcome') === '1'; } catch { return false; }
  });
  const [showWelcome, setShowWelcome] = useState(false);
  const [announced, setAnnounced] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!welcomePending) return;
    try { sessionStorage.removeItem('chipurobo:learner-welcome'); } catch { /* private mode */ }
    // Signing in removes the button that had focus. Start the learner on
    // their greeting ("Hi, Amina!, heading level 1"), then populate an
    // already-mounted live region once that has been read, so screen readers
    // announce the short welcome once without talking over the greeting.
    heading.current?.focus();
    const timer = window.setTimeout(() => setShowWelcome(true), 700);
    // Empty the live region once it has been heard, so reading on does not
    // hear the welcome twice (it is also on screen).
    const clear = window.setTimeout(() => setAnnounced(true), 8000);
    return () => { window.clearTimeout(timer); window.clearTimeout(clear); };
  }, [welcomePending]);

  const welcomeText = 'Your next lesson is ready. Follow each step, then try a short quiz. You’ve got this!';
  const welcomeSpoken = `Welcome to ChipuRobo. ${welcomeText}`;

  return (
    <LearnerPage className="max-w-3xl">
      <header className="flex items-center gap-4">
        <Mascot size={56} mood="happy" className="shrink-0" />
        <h1 ref={heading} tabIndex={-1} className="learner-title flex-1 focus:outline-none">Hi, {firstName(profile?.full_name)}! <span aria-hidden="true">👋</span></h1>
        <Link to="/dashboard/my-progress" className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-4 py-2 text-base font-extrabold text-slate-900 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900">
          <span aria-hidden="true">⭐</span> {stats.xp}<span className="sr-only"> stars. See my stars and badges</span>
        </Link>
      </header>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {showWelcome && !announced ? welcomeSpoken : ''}
      </div>
      {showWelcome && (
        <section aria-labelledby="learner-welcome-heading" className="learner-card flex items-center gap-4 bg-teal-50 p-4">
          <div className="min-w-0 flex-1">
            <h2 id="learner-welcome-heading" className="text-lg">Welcome!</h2>
            <p className="mt-1 text-base font-semibold text-slate-900">{welcomeText}</p>
          </div>
          <ReadAloud text={welcomeSpoken} label="Read welcome aloud" />
          <button type="button" className="btn-primary shrink-0" onClick={() => setShowWelcome(false)}>Got it</button>
        </section>
      )}

      <FriendlyAlert error={error ?? start.error} />
      {loading && <Loading>Finding your next lesson</Loading>}

      {!loading && !error && title && (
        <section aria-labelledby="next-heading" className="learner-card overflow-hidden">
          <LessonArt theme={artThemeFor(title, { capstone: item?.project })} className="w-full max-h-56" />
          <div className="space-y-4 p-6">
            <p className="text-sm font-extrabold uppercase tracking-wide text-slate-600">
              {teacher ? 'From your teacher'
                : course === 'club' && item ? `${levelLook[item.level].title} · ${item.project ? 'Big project' : `Lesson ${item.number} of ${path.length}`}`
                : pathway ? <><span aria-hidden="true">{pathway.emoji} </span>{pathway.label}</> : item?.project ? 'Project' : `Lesson ${item?.number} of ${path.length}`}
            </p>
            <h2 id="next-heading" className="!text-3xl">{title}</h2>
            {description && <p className="text-base font-semibold leading-relaxed text-slate-700">{description}</p>}
            {teacher?.due_date && <p className="text-base font-semibold text-slate-700">Due {teacher.due_date}</p>}
            {started
              ? <Link className="btn-play" to={`/dashboard/assignments/${assignmentId}`} aria-label={`${teacher ? 'Open' : 'Continue'}: ${title}`}>{teacher ? 'Open' : 'Continue'}<span aria-hidden="true"> →</span></Link>
              : <button type="button" className="btn-play" disabled={start.isPending} onClick={() => item && start.mutate(item.lesson.id)} aria-label={start.isPending ? 'Starting your lesson' : `Start: ${title}`}>
                  {start.isPending ? 'Starting…' : <>Start<span aria-hidden="true"> →</span></>}</button>}
          </div>
        </section>
      )}
      {!loading && !error && !title && path.length > 0 && <EmptyNote emoji="🏆" title="You finished every lesson!" body="Amazing work. Ask your teacher what to try next." />}

      {!loading && !error && path.length > 0 && (
        <Link to="/dashboard/my-learning" className="learner-card learner-card-hover flex items-center justify-between gap-3 p-5">
          <span className="text-base font-extrabold text-slate-900">All lessons</span>
          <span className="text-base font-semibold text-slate-700">{done} of {path.length} done <span aria-hidden="true">→</span></span>
        </Link>
      )}
    </LearnerPage>
  );
}
