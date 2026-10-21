import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAssignments, fetchEvidence, fetchSubmissions } from '../../lib/learningQueries';
import { fetchQuizAttempts } from '../../lib/learningOutcomes';
import { computeStats } from '../../lib/learnerCopy';
import { LearnerPage, XpBar, BadgeGrid, FriendlyAlert, Loading } from './ui/LearnerKit';

/** My stars: points and badges. Lesson progress lives on the Lessons page. */
export function MyProgress() {
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions() });
  const evidence = useQuery({ queryKey: ['competency-evidence'], queryFn: () => fetchEvidence() });
  const attempts = useQuery({ queryKey: ['quiz-attempts'], queryFn: fetchQuizAttempts });
  const error = assignments.error ?? submissions.error ?? evidence.error;
  const loading = [assignments, submissions, evidence].some((query) => query.isPending);
  const stats = computeStats({ assignments: assignments.data, submissions: submissions.data, evidence: evidence.data, attempts: attempts.data });

  return (
    <LearnerPage className="max-w-3xl">
      <h1 className="learner-title">My stars <span aria-hidden="true">⭐</span></h1>
      <FriendlyAlert error={error} />
      {loading && <Loading>Adding up your stars</Loading>}
      {!loading && !error && <>
        <XpBar stats={stats} />
        <section aria-labelledby="badges-heading" className="space-y-3">
          <h2 id="badges-heading">Badges <span className="text-base font-bold text-slate-600">{stats.badges.filter((badge) => badge.earned).length} of {stats.badges.length}</span></h2>
          <BadgeGrid badges={stats.badges} />
        </section>
        <Link to="/dashboard/portfolio" className="learner-card learner-card-hover flex items-center justify-between gap-3 p-5">
          <span className="text-base font-extrabold text-slate-900"><span aria-hidden="true">🖼️ </span>My showcase</span>
          <span aria-hidden="true" className="text-slate-500">→</span>
        </Link>
      </>}
    </LearnerPage>
  );
}
