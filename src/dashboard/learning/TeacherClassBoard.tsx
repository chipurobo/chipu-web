/**
 * The teacher's class at a glance. One grid: learners down the side, assigned
 * lessons across the top, a symbol in each cell for where that learner is.
 * Above it, the review queue: work that has been sent and not yet reviewed.
 * Everything here is read from records the dashboard already loads.
 */
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchAssignments, fetchEvidence, fetchLearningStudents, fetchRecipients, fetchSubmissions } from '../../lib/learningQueries';
import { fetchQuizAttempts } from '../../lib/learningOutcomes';
import type { LearningAssignment, LearningSubmission, CompetencyEvidence } from '../../lib/learningRecords';
import { friendlyDate } from '../../lib/learnerCopy';

type Cell = 'none' | 'assigned' | 'sent' | 'reviewed';
const cellLook: Record<Cell, { emoji: string; label: string; color: string }> = {
  none:     { emoji: '',   label: 'Not assigned',    color: 'bg-slate-50 text-slate-300' },
  assigned: { emoji: '🚀', label: 'Not started yet', color: 'bg-sky-50' },
  sent:     { emoji: '📬', label: 'Sent, needs your review', color: 'bg-amber-100' },
  reviewed: { emoji: '⭐', label: 'Reviewed',        color: 'bg-emerald-100' },
};

function cellFor(assignmentId: string, studentId: string, assigned: boolean, submissions: LearningSubmission[], evidence: CompetencyEvidence[]): Cell {
  if (!assigned) return 'none';
  const sent = submissions.find((item) => item.assignment_id === assignmentId && item.student_id === studentId);
  const review = evidence.find((item) => item.assignment_id === assignmentId && item.student_id === studentId);
  if (sent && (!review || review.recorded_at < sent.submitted_at)) return 'sent';
  if (review) return 'reviewed';
  return 'assigned';
}

export function TeacherClassBoard() {
  const { school } = useAuth();
  const students = useQuery({ queryKey: ['learning-students', school?.id], queryFn: () => fetchLearningStudents(school!.id), enabled: !!school });
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments(), enabled: !!school });
  const recipients = useQuery({ queryKey: ['learning-recipients'], queryFn: () => fetchRecipients(), enabled: !!school });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions(), enabled: !!school });
  const evidence = useQuery({ queryKey: ['competency-evidence'], queryFn: () => fetchEvidence(), enabled: !!school });
  const attempts = useQuery({ queryKey: ['quiz-attempts'], queryFn: fetchQuizAttempts, enabled: !!school });
  const error = students.error ?? assignments.error ?? recipients.error ?? submissions.error ?? evidence.error;
  const loading = [students, assignments, recipients, submissions, evidence].some((query) => query.isPending);
  const roster = (students.data ?? []).filter((student) => student.is_active);
  const work: LearningAssignment[] = assignments.data ?? [];
  const subs = submissions.data ?? [];
  const reviews = evidence.data ?? [];
  const isAssigned = (assignmentId: string, studentId: string) => !!recipients.data?.some((row) => row.assignment_id === assignmentId && row.student_id === studentId);

  // Review queue: newest submission per learner and lesson that has no later review.
  const queue = subs.filter((sub) => {
    const newer = subs.some((other) => other.assignment_id === sub.assignment_id && other.student_id === sub.student_id && other.submitted_at > sub.submitted_at);
    if (newer) return false;
    const review = reviews.find((item) => item.assignment_id === sub.assignment_id && item.student_id === sub.student_id);
    return !review || review.recorded_at < sub.submitted_at;
  });
  const quizPasses = (attempts.data ?? []).filter((item) => item.passed).length;
  const counters = [
    { emoji: '🧑‍🎓', label: 'Learners', value: roster.length, tone: 'bg-sky-50' },
    { emoji: '📬', label: 'Review', value: queue.length, tone: queue.length ? 'bg-amber-100 ring-2 ring-amber-300' : 'bg-amber-50' },
    { emoji: '🧠', label: 'Passed', value: quizPasses, tone: 'bg-violet-50' },
  ];

  return (
    <div className="learning-zone space-y-6">
      {error && <p role="alert" className="text-sm text-red-700">{error.message}</p>}
      {loading && <p role="status" className="text-sm text-gray-600">Loading your class…</p>}
      {!loading && !error && <>
        <ul className="grid grid-cols-3 gap-3" aria-label="Class totals">
          {counters.map((item) => (
            <li key={item.label} className={`learner-card flex items-center gap-3 p-4 ${item.tone}`}>
              <span className="text-2xl" aria-hidden="true">{item.emoji}</span>
              <div><p className="text-2xl font-extrabold leading-none text-slate-900">{item.value}</p><p className="mt-1 text-sm font-bold text-slate-700">{item.label}</p></div>
            </li>
          ))}
        </ul>

        <section id="review-work" aria-label="Review queue" className="learner-card p-5 space-y-3 scroll-mt-4">
          <div className="flex items-center justify-between gap-3">
            <h2><span aria-hidden="true">📬 </span>Review</h2>
            {!queue.length && <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">Done</span>}
          </div>
          {!!queue.length && <ul className="divide-y divide-slate-200">
            {queue.map((sub) => {
                const student = roster.find((item) => item.id === sub.student_id);
                const assignment = work.find((item) => item.id === sub.assignment_id);
                return (
                  <li key={sub.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900">{student?.full_name ?? 'Learner'}</p>
                      <p className="text-slate-600">{assignment?.title ?? 'Activity'} · <span className="sr-only">sent </span>{friendlyDate(sub.submitted_at)}</p>
                    </div>
                    <Link className="btn-primary" to={`/dashboard/assignments/${sub.assignment_id}`}>Review<span className="sr-only"> {student?.full_name}'s work on {assignment?.title}</span></Link>
                  </li>
                );
              })}
          </ul>}
        </section>

        <details id="class-board" className="learner-card scroll-mt-4 overflow-hidden">
          <summary className="cursor-pointer px-5 py-4 text-lg font-extrabold text-slate-900"><span aria-hidden="true">🗂️ </span>Class board</summary>
          <section aria-label="Class board" className="space-y-3 border-t border-slate-200 p-5">
            <ul className="flex flex-wrap gap-3 text-xs font-bold text-slate-700" aria-label="Key">
              <li><span aria-hidden="true">🚀 </span>Assigned</li>
              <li><span aria-hidden="true">📬 </span>Review</li>
              <li><span aria-hidden="true">⭐ </span>Done</li>
            </ul>
            {!roster.length && <p className="text-sm">No learners yet.</p>}
            {!work.length && roster.length > 0 && <p className="text-sm">No lessons yet.</p>}
            {roster.length > 0 && work.length > 0 && (
              <div className="overflow-x-auto">
                <table className="data-table min-w-full" aria-label="Learners and their lessons">
                <thead>
                  <tr>
                    <th scope="col">Learner</th>
                    {work.map((item) => <th key={item.id} scope="col" className="!text-center !normal-case !tracking-normal"><Link className="underline" to={`/dashboard/assignments/${item.id}`}>{item.title}</Link></th>)}
                  </tr>
                </thead>
                <tbody>
                  {roster.map((student) => (
                    <tr key={student.id}>
                      <th scope="row" className="text-left font-medium text-gray-900">{student.full_name}</th>
                      {work.map((item) => {
                        const cell = cellFor(item.id, student.id, isAssigned(item.id, student.id), subs, reviews);
                        const look = cellLook[cell];
                        return (
                          <td key={item.id} className={`!text-center ${look.color}`}>
                            {cell === 'none' ? <span aria-hidden="true">·</span> : <Link to={`/dashboard/assignments/${item.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-lg" title={look.label}><span aria-hidden="true">{look.emoji}</span></Link>}
                            <span className="sr-only">{look.label}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            )}
          </section>
        </details>
      </>}
    </div>
  );
}
