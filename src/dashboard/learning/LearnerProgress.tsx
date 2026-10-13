import { useState } from 'react';
import { ProgressionReview } from './ProgressionReview';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchLearningStudents, fetchAssignments, fetchEvidence, fetchRecipients, fetchSubmissions } from '../../lib/learningQueries';
import { competencies, evidenceRubric, learningLevels } from '../../lib/learningFramework';
import { levelLook, ratingLook, skillLook } from '../../lib/learnerCopy';

/**
 * One card per learner: a skills grid (three levels across, six skills down)
 * where each cell is the latest teacher rating as stars, then the level
 * decision form. Logic is unchanged: the latest observation at that level is
 * shown, never the highest, and ratings never award a level by themselves.
 */
export function LearnerProgress() {
  const { school } = useAuth();
  const [filter, setFilter] = useState('');
  const students = useQuery({ queryKey: ['learning-students', school?.id], queryFn: () => fetchLearningStudents(school!.id), enabled: !!school });
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments(), enabled: !!school });
  const recipients = useQuery({ queryKey: ['learning-recipients'], queryFn: () => fetchRecipients(), enabled: !!school });
  const evidence = useQuery({ queryKey: ['competency-evidence'], queryFn: () => fetchEvidence(), enabled: !!school });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions(), enabled: !!school });
  const error = students.error ?? assignments.error ?? recipients.error ?? evidence.error;
  const loading = !!school && [students, assignments, recipients, evidence].some((query) => query.isPending);
  const roster = (students.data ?? []).filter((student) => !filter || student.full_name.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1>Progress</h1><p className="text-sm text-gray-600 mt-1">Latest rating per skill and level. Stars come from your reviews.</p></div>
        {(students.data?.length ?? 0) > 3 && <label className="field-label">Find a learner<input className="field-input mt-1 max-w-xs" type="search" value={filter} onChange={(event) => setFilter(event.target.value)} /></label>}
      </div>
      <ul className="flex flex-wrap gap-4 text-xs text-gray-700" aria-label="Key">
        {(['developing', 'demonstrated', 'extending'] as const).map((band) => <li key={band}><span aria-hidden="true">{'★'.repeat(ratingLook[band].stars)}{'☆'.repeat(3 - ratingLook[band].stars)} </span>{evidenceRubric.find((item) => item.id === band)?.title}</li>)}
        <li><span aria-hidden="true">— </span>Not yet observed</li>
      </ul>
      {!school && <p className="text-sm">Open a school account to review its learners.</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error.message}</p>}
      {loading && <p role="status">Loading progress…</p>}
      {!loading && !error && school && !students.data?.length && <p className="text-sm">No learners in your group yet.</p>}
      {!loading && !error && roster.map((student) => {
        const work = (assignments.data ?? []).filter((assignment) => recipients.data?.some((recipient) => recipient.student_id === student.id && recipient.assignment_id === assignment.id));
        const reviews = (evidence.data ?? []).filter((item) => item.student_id === student.id);
        const sent = new Set((submissions.data ?? []).filter((item) => item.student_id === student.id).map((item) => item.assignment_id)).size;
        const reviewed = new Set(reviews.map((review) => review.assignment_id)).size;
        return <article key={student.id} aria-label={`Progress for ${student.full_name}`} className="card p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg">{student.full_name}</h2>
            <p className="text-sm text-gray-600"><span aria-hidden="true">🧩 </span>{work.length}<span className="sr-only"> assigned</span> · <span aria-hidden="true">📬 </span>{sent}<span className="sr-only"> sent</span> · <span aria-hidden="true">⭐ </span>{reviewed}<span className="sr-only"> reviewed</span></p>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {learningLevels.map((level) => <section key={level.id} aria-label={level.title} className="rounded-md border border-warm-200 p-3">
              <h3 className="mb-2 text-sm font-semibold"><span aria-hidden="true">{levelLook[level.id].emoji} </span>{level.title}</h3>
              <ul className="m-0 list-none space-y-1.5 p-0 text-sm">
                {competencies.map((competency) => {
                  // fetchEvidence orders newest first. The latest observation is displayed,
                  // never the highest score, and each level is considered independently.
                  const latest = reviews.find((review) => review.reviews[competency.id] && work.some((assignment) => assignment.id === review.assignment_id && assignment.learning_plan.level === level.id));
                  const band = latest?.reviews[competency.id];
                  const bandTitle = evidenceRubric.find((item) => item.id === band)?.title;
                  return <li key={competency.id} className="flex items-center justify-between gap-2">
                    <span className="text-gray-800"><span aria-hidden="true">{skillLook[competency.id].emoji} </span>{competency.title}</span>
                    {latest && band ? <Link className="text-teal-700 underline" to={`/dashboard/assignments/${latest.assignment_id}`} title={bandTitle}>
                      <span aria-hidden="true">{'★'.repeat(ratingLook[band].stars)}{'☆'.repeat(3 - ratingLook[band].stars)}</span><span className="sr-only">{bandTitle}</span></Link>
                      : <><span aria-hidden="true" className="text-gray-400">—</span><span className="sr-only">Not yet observed</span></>}
                  </li>;
                })}
              </ul>
            </section>)}
          </div>
          <ProgressionReview studentId={student.id} />
          {work.length > 0 && <details className="text-sm"><summary className="cursor-pointer text-teal-700">Assigned lessons ({work.length})</summary>
            <ul className="list-disc pl-5 mt-3 space-y-2">{work.map((assignment) => <li key={assignment.id}>
              <Link className="text-teal-700 underline" to={`/dashboard/assignments/${assignment.id}`}>{assignment.title}</Link>
            </li>)}</ul>
          </details>}
        </article>;
      })}
    </div>
  );
}
