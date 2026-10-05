import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchAssignments, fetchEvidence, fetchSubmissions } from '../../lib/learningQueries';
import { learningLevels, learningPathways } from '../../lib/learningFramework';

export function MyLearning() {
  const { profile, school } = useAuth();
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions() });
  const reviews = useQuery({ queryKey: ['competency-evidence'], queryFn: () => fetchEvidence() });
  const error = assignments.error ?? submissions.error ?? reviews.error;
  return (
    <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
      <div><p className="text-sm text-gray-600">{school?.name ?? 'Your learning dashboard'}</p>
        <h1>My learning</h1><p className="text-sm text-gray-600 mt-2">Hello, {profile?.full_name?.split(' ')[0] ?? 'there'}. Open an activity, show your work and read your teacher's feedback.</p></div>
      <Link className="btn-secondary" to="/dashboard/my-progress">View my progress</Link>
      {error && <p role="alert" className="text-red-700 text-sm">{error.message}</p>}
      {(assignments.isPending || submissions.isPending || reviews.isPending) && <p role="status">Loading your learning…</p>}
      {!assignments.isPending && !error && !assignments.data?.length && <div className="card p-5"><h2 className="text-lg">No assigned activities yet</h2><p className="text-sm text-gray-600">Your teacher will assign activities here.</p></div>}
      <div className="grid sm:grid-cols-2 gap-4">
        {assignments.data?.map((assignment) => {
          const submitted = submissions.data?.some((item) => item.assignment_id === assignment.id);
          const reviewed = reviews.data?.some((item) => item.assignment_id === assignment.id);
          return <article key={assignment.id} className="card p-5 flex flex-col gap-3">
            <p className="text-sm text-gray-600">{learningPathways.find((path) => path.id === assignment.learning_plan.pathwayId)?.title}</p>
            <h2 className="text-lg">{assignment.title}</h2>
            <div className="flex flex-wrap gap-2"><span className="badge-teal">{learningLevels.find((level) => level.id === assignment.learning_plan.level)?.title}</span>
              <span className="badge-gray">{reviewed ? 'Feedback available' : submitted ? 'Submitted' : 'Ready to start'}</span></div>
            {assignment.due_date && <p className="text-sm text-gray-600">Due {assignment.due_date}</p>}
            <Link className="btn-primary self-start mt-auto" to={`/dashboard/assignments/${assignment.id}`}>{reviewed ? 'Open activity and feedback' : submitted ? 'View my submission' : 'Start activity'}</Link>
          </article>;
        })}
      </div>
    </div>
  );
}
