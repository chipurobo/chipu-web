/**
 * Learner home: one thing to do next, and nothing else competing for
 * attention. Work a teacher set comes first; otherwise it is the next open
 * lesson on the path.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchAssignments, fetchBlocklyLessons, fetchBlocklyProjects, fetchEvidence, fetchSubmissions, startBlocklyLesson } from '../../lib/learningQueries';
import { fetchQuizAttempts } from '../../lib/learningOutcomes';
import { artThemeFor, computeStats, firstName, learnerTitle } from '../../lib/learnerCopy';
import { buildPath, nextUp } from '../../lib/learnerPath';
import { LearnerPage, FriendlyAlert, Loading, EmptyNote } from './ui/LearnerKit';
import { LessonArt, Mascot } from './ui/LearnerArt';

export function LearnerHome() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const lessons = useQuery({ queryKey: ['blockly-lessons'], queryFn: fetchBlocklyLessons });
  const projects = useQuery({ queryKey: ['blockly-projects'], queryFn: fetchBlocklyProjects });
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
  const assignmentId = teacher?.id ?? item?.assignmentId;
  const started = !!assignmentId && !!assignments.data?.some((assignment) => assignment.id === assignmentId);

  return (
    <LearnerPage className="max-w-3xl">
      <header className="flex items-center gap-4">
        <Mascot size={56} mood="happy" className="shrink-0" />
        <h1 className="learner-title flex-1">Hi, {firstName(profile?.full_name)}! <span aria-hidden="true">👋</span></h1>
        <Link to="/dashboard/my-progress" className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-4 py-2 text-base font-extrabold text-slate-900 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900">
          <span aria-hidden="true">⭐</span> {stats.xp}<span className="sr-only"> stars. See my stars and badges</span>
        </Link>
      </header>

      <FriendlyAlert error={error ?? start.error} />
      {loading && <Loading>Finding your next lesson</Loading>}

      {!loading && !error && title && (
        <section aria-labelledby="next-heading" className="learner-card overflow-hidden">
          <LessonArt theme={artThemeFor(title, { capstone: item?.project })} className="w-full max-h-56" />
          <div className="space-y-4 p-6">
            <p className="text-sm font-extrabold uppercase tracking-wide text-slate-600">
              {teacher ? 'From your teacher' : item?.project ? 'Big project' : `Lesson ${item?.number} of ${path.length}`}
            </p>
            <h2 id="next-heading" className="!text-3xl">{title}</h2>
            {teacher?.due_date && <p className="text-base font-semibold text-slate-700">Due {teacher.due_date}</p>}
            {started
              ? <Link className="btn-play" to={`/dashboard/assignments/${assignmentId}`}>{teacher ? 'Open' : 'Continue'}<span className="sr-only"> {title}</span><span aria-hidden="true"> →</span></Link>
              : <button type="button" className="btn-play" disabled={start.isPending} onClick={() => item && start.mutate(item.lesson.id)}>
                  {start.isPending ? 'Starting…' : <>Start<span className="sr-only"> {title}</span><span aria-hidden="true"> →</span></>}</button>}
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
