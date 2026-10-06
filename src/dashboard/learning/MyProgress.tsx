import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAssignments, fetchEvidence, fetchSubmissions } from '../../lib/learningQueries';
import { learningLevels } from '../../lib/learningFramework';

export function MyProgress() {
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions() });
  const evidence = useQuery({ queryKey: ['competency-evidence'], queryFn: () => fetchEvidence() });
  const error = assignments.error ?? submissions.error ?? evidence.error;
  const loading = [assignments, submissions, evidence].some((query) => query.isPending);
  const work = assignments.data ?? [];
  const submitted = work.filter((assignment) => submissions.data?.some((item) => item.assignment_id === assignment.id)).length;
  const reviewed = work.filter((assignment) => evidence.data?.some((item) => item.assignment_id === assignment.id && item.feedback?.trim())).length;

  return (
    <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
      <div>
        <h1>My progress</h1>
        <p className="text-sm text-gray-600 mt-2">See the work you have submitted and your teacher’s feedback. Open an activity to continue learning.</p>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error.message}</p>}
      {loading && <p role="status">Loading your progress…</p>}
      {!loading && !error && (
        <>
          <dl className="grid sm:grid-cols-3 gap-4">
            {[
              ['My activities', work.length],
              ['Activities submitted', submitted],
              ['Activities with feedback', reviewed],
            ].map(([label, count]) => (
              <div key={label} className="card p-5">
                <dt className="text-sm text-gray-600">{label}</dt>
                <dd className="text-2xl font-semibold mt-2">{count}</dd>
              </div>
            ))}
          </dl>
          <section aria-label="My activity progress" className="space-y-4">
            <h2 className="text-lg">My activities and feedback</h2>
            {!work.length && <p className="text-sm text-gray-600">Start a Blockly lesson to begin. Your submitted work and teacher feedback will appear here.</p>}
            <div className="grid sm:grid-cols-2 gap-4">
              {work.map((assignment) => {
                // Queries return newest first. Show the latest feedback and keep a
                // newer submission waiting for review separate from earlier feedback.
                const submission = submissions.data?.find((item) => item.assignment_id === assignment.id);
                const review = evidence.data?.find((item) => item.assignment_id === assignment.id && item.feedback?.trim());
                const awaitingFeedback = submission && (!review || submission.submitted_at > review.recorded_at);
                return (
                  <article key={assignment.id} aria-label={`Activity progress: ${assignment.title}`} className="card p-5 space-y-3">
                    <h3 className="text-lg">{assignment.title}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className="badge-teal">{learningLevels.find((level) => level.id === assignment.learning_plan.level)?.title}</span>
                      <span className="badge-gray">{awaitingFeedback ? 'Awaiting teacher feedback' : review ? 'Feedback available' : 'Ready to start'}</span>
                    </div>
                    {submission && <p className="text-sm text-gray-600">Last submitted: {new Date(submission.submitted_at).toLocaleDateString()}</p>}
                    {review && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">Latest teacher feedback</h4>
                        <p className="text-sm whitespace-pre-wrap">{review.feedback}</p>
                      </div>
                    )}
                    <Link className="text-teal-700 underline text-sm inline-block" to={`/dashboard/assignments/${assignment.id}`}>
                      {review ? 'Open activity and feedback' : submission ? 'View my submission' : 'Start activity'}
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
      <div className="flex gap-3 flex-wrap">
        <Link className="btn-primary" to="/dashboard/my-learning">Open Blockly lessons</Link>
        <Link className="btn-secondary" to="/dashboard/my-projects">Open capstone projects</Link>
        <Link className="btn-secondary" to="/dashboard/quizzes">Open knowledge checks</Link>
        <Link className="btn-secondary" to="/dashboard/portfolio">Open my portfolio</Link>
      </div>
    </div>
  );
}
