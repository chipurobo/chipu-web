import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAssignments, fetchEvidence, fetchSubmissions } from '../../lib/learningQueries';
import { fetchQuizAttempts } from '../../lib/learningOutcomes';
import { competencies } from '../../lib/learningFramework';
import type { ReviewBand } from '../../lib/learningRecords';
import { activityStatus, artThemeFor, computeStats, friendlyDate, ratingLook, skillLook } from '../../lib/learnerCopy';
import { LearnerPage, Hero, XpBar, StatTile, BadgeGrid, LevelChip, StatusChip, FriendlyAlert, Loading, EmptyNote } from './ui/LearnerKit';
import { LessonArt } from './ui/LearnerArt';

const bandRank: Record<ReviewBand, number> = { developing: 1, demonstrated: 2, extending: 3 };

export function MyProgress() {
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions() });
  const evidence = useQuery({ queryKey: ['competency-evidence'], queryFn: () => fetchEvidence() });
  const attempts = useQuery({ queryKey: ['quiz-attempts'], queryFn: fetchQuizAttempts });
  const error = assignments.error ?? submissions.error ?? evidence.error;
  const loading = [assignments, submissions, evidence].some((query) => query.isPending);
  const work = assignments.data ?? [];
  const stats = computeStats({ assignments: assignments.data, submissions: submissions.data, evidence: evidence.data, attempts: attempts.data });
  const bestBands = competencies.map((skill) => {
    let best: ReviewBand | null = null;
    for (const item of evidence.data ?? []) {
      const band = item.reviews[skill.id];
      if (band && (!best || bandRank[band] > bandRank[best])) best = band;
    }
    return { id: skill.id, best };
  });

  return (
    <LearnerPage>
      <Hero title={<>Journey <span aria-hidden="true">🗺️</span></>} blurb="Every lesson, quiz and teacher reply earns you points." mood="cheer">
        <XpBar stats={stats} />
      </Hero>
      <FriendlyAlert error={error} />
      {loading && <Loading>Adding up your points</Loading>}
      {!loading && !error && (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="My totals">
            <StatTile emoji="🧩" label="Lessons" value={stats.started} tone="bg-sky-50" />
            <StatTile emoji="📬" label="Sent" value={stats.sent} tone="bg-amber-50" />
            <StatTile emoji="💌" label="Replies" value={stats.replied} tone="bg-emerald-50" />
            <StatTile emoji="🧠" label="Quizzes" value={stats.quizPasses} tone="bg-violet-50" />
          </ul>

          <section aria-label="Badges" className="space-y-3">
            <h2><span aria-hidden="true">🏅 </span>Badges</h2>
            <BadgeGrid badges={stats.badges} />
          </section>

          <section aria-label="My skills" className="space-y-3">
            <h2><span aria-hidden="true">💪 </span>Skills</h2>
            <p className="sr-only">Your teacher fills in stars when they see you use a skill. Empty stars mean they have not seen it yet.</p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bestBands.map(({ id, best }) => {
                const look = skillLook[id];
                const rating = ratingLook[best ?? 'not-observed'];
                return (
                  <li key={id} className={`learner-card flex items-center gap-3 p-4 ${look.color}`}>
                    <span className="text-3xl" aria-hidden="true">{look.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-slate-900">{look.label}</p>
                      <p className="sr-only">{look.blurb}</p>
                      <p className="mt-1 text-lg font-bold"><span aria-hidden="true">{'★'.repeat(rating.stars)}{'☆'.repeat(3 - rating.stars)}</span><span className="sr-only">{rating.stars} of 3 stars, {rating.label}</span></p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-label="My activity progress" className="space-y-4">
            <h2><span aria-hidden="true">📚 </span>Work</h2>
            {!work.length && <EmptyNote emoji="🚀" title="Start a lesson" body="Your work and your teacher's replies will show up on this page.">
              <Link className="btn-play mt-2" to="/dashboard/my-learning">Lessons</Link></EmptyNote>}
            <div className="grid gap-4 sm:grid-cols-2">
              {work.map((assignment) => {
                // Queries return newest first. Show the latest feedback and keep a
                // newer submission waiting for review separate from earlier feedback.
                const submission = submissions.data?.find((item) => item.assignment_id === assignment.id);
                const review = evidence.data?.find((item) => item.assignment_id === assignment.id && item.feedback?.trim());
                const status = activityStatus(assignment.id, submissions.data, evidence.data);
                return (
                  <article key={assignment.id} aria-label={`Activity progress: ${assignment.title}`} className="learner-card flex flex-col overflow-hidden">
                    <div className="flex items-center gap-3 p-4">
                      <LessonArt theme={artThemeFor(assignment.title, { pathwayId: assignment.learning_plan.pathwayId, capstone: assignment.learning_plan.activityKind === 'capstone' })} className="h-16 w-24 shrink-0" />
                      <div className="min-w-0">
                        <h3>{assignment.title}</h3>
                        <div className="mt-1 flex flex-wrap gap-2"><LevelChip level={assignment.learning_plan.level} /><StatusChip status={status} /></div>
                      </div>
                    </div>
                    <div className="space-y-3 px-4 pb-4">
                      {submission && <p className="text-sm font-semibold text-slate-600"><span aria-hidden="true">📅 </span><span className="sr-only">Last sent </span>{friendlyDate(submission.submitted_at)}</p>}
                      {review && (
                        <div className="rounded-2xl bg-emerald-50 p-3">
                          <h4 className="text-sm font-extrabold text-emerald-900"><span aria-hidden="true">💌 </span>Teacher</h4>
                          <p className="whitespace-pre-wrap text-sm text-emerald-900">{review.feedback}</p>
                        </div>
                      )}
                      <Link className="btn-secondary self-start" to={`/dashboard/assignments/${assignment.id}`}>{status === 'replied' ? 'Feedback' : 'Open'}<span className="sr-only"> {assignment.title}</span></Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </LearnerPage>
  );
}
