import { ProgressionReview } from './ProgressionReview';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchLearningStudents, fetchAssignments, fetchEvidence, fetchRecipients } from '../../lib/learningQueries';
import { competencies, evidenceRubric, learningLevels } from '../../lib/learningFramework';

export function LearnerProgress() {
  const { school } = useAuth();
  const students = useQuery({ queryKey: ['learning-students', school?.id], queryFn: () => fetchLearningStudents(school!.id), enabled: !!school });
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments(), enabled: !!school });
  const recipients = useQuery({ queryKey: ['learning-recipients'], queryFn: () => fetchRecipients(), enabled: !!school });
  const evidence = useQuery({ queryKey: ['competency-evidence'], queryFn: () => fetchEvidence(), enabled: !!school });
  const error = students.error ?? assignments.error ?? recipients.error ?? evidence.error;
  const loading = !!school && [students, assignments, recipients, evidence].some((query) => query.isPending);
  return (
    <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
      <div><h1>Learner progress</h1><p className="text-sm text-gray-600 mt-2">Review individual evidence at each learning level. Unreviewed outcomes remain unassessed.</p></div>
      {!school && <p className="text-sm">Open a school account to review its learners.</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error.message}</p>}
      {loading && <p role="status">Loading learner progress…</p>}
      {!loading && !error && school && !students.data?.length && <p className="text-sm">Add students to your roster to start tracking learning.</p>}
      {!loading && !error && students.data?.map((student) => {
        const work = (assignments.data ?? []).filter((assignment) => recipients.data?.some((recipient) => recipient.student_id === student.id && recipient.assignment_id === assignment.id));
        const reviews = (evidence.data ?? []).filter((item) => item.student_id === student.id);
        return <article key={student.id} aria-label={`Progress for ${student.full_name}`} className="card p-5 space-y-4">
          <div><h2 className="text-lg">{student.full_name}</h2><p className="text-sm text-gray-600">{work.length} assigned activities · {new Set(reviews.map((review) => review.assignment_id)).size} activities with evidence reviews</p></div>
          <div className="grid lg:grid-cols-3 gap-4">
            {learningLevels.map((level) => <section key={level.id} aria-label={level.title} className="border border-warm-200 rounded-md p-3">
              <h3 className="text-base mb-3">{level.title}</h3>
              <ul className="list-none p-0 m-0 space-y-2 text-sm">
                {competencies.map((competency) => {
                  // fetchEvidence orders newest first. The latest observation is displayed,
                  // never the highest score, and each level is considered independently.
                  const latest = reviews.find((review) => review.reviews[competency.id] && work.some((assignment) => assignment.id === review.assignment_id && assignment.learning_plan.level === level.id));
                  return <li key={competency.id} className="flex gap-2 justify-between flex-wrap">
                    <span>{competency.title}</span>
                    {latest ? <Link className="text-teal-700 underline" to={`/dashboard/assignments/${latest.assignment_id}`}>{evidenceRubric.find((band) => band.id === latest.reviews[competency.id])?.title}</Link>
                      : <span className="text-gray-600">Not yet observed</span>}
                  </li>;
                })}
              </ul>
            </section>)}
          </div>
          <ProgressionReview studentId={student.id} />
          {work.length > 0 && <details className="text-sm"><summary className="cursor-pointer text-teal-700">Assigned work</summary>
            <ul className="list-disc pl-5 mt-3 space-y-2">{work.map((assignment) => <li key={assignment.id}>
              <Link className="text-teal-700 underline" to={`/dashboard/assignments/${assignment.id}`}>{assignment.title}</Link>
            </li>)}</ul>
          </details>}
        </article>;
      })}
    </div>
  );
}
