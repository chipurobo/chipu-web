import { useState } from 'react';
import { CbcAssessment } from './CbcAssessment';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchLearningStudents, fetchAssignments, fetchEvidence, fetchRecipients, fetchSubmissions } from '../../lib/learningQueries';
import { cbcLevels, competencies } from '../../lib/learningFramework';
import { learnerLabel, skillLook } from '../../lib/learnerCopy';

/**
 * One card per learner: each skill with its latest CBC performance level
 * (EE, ME, AE or BE, never the highest one), then the CBC end-of-course
 * assessment. There are no course levels.
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
  const roster = (students.data ?? []).filter((student) => !filter || learnerLabel(student).toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1>Progress</h1><p className="text-sm text-gray-600 mt-1">Latest CBC performance level for each skill, from your reviews.</p></div>
        {(students.data?.length ?? 0) > 3 && <label className="field-label">Find a learner<input className="field-input mt-1 max-w-xs" type="search" value={filter} onChange={(event) => setFilter(event.target.value)} /></label>}
      </div>
      <ul className="flex flex-wrap gap-4 text-xs text-gray-700" aria-label="Key">
        {cbcLevels.map((level) => <li key={level.id}><strong>{level.short}</strong> {level.title}</li>)}
        <li><span aria-hidden="true">— </span>Not yet assessed</li>
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
          <ul className="m-0 grid list-none gap-2 p-0 text-sm sm:grid-cols-2 lg:grid-cols-3" aria-label="Skills">
            {competencies.map((competency) => {
              // fetchEvidence orders newest first: the latest rating is shown, never the highest.
              const latest = reviews.find((review) => review.reviews[competency.id]);
              const band = latest?.reviews[competency.id];
              const level = cbcLevels.find((item) => item.id === band);
              return <li key={competency.id} className="flex items-center justify-between gap-2 rounded-md border border-warm-200 px-3 py-2">
                <span className="text-gray-800"><span aria-hidden="true">{skillLook[competency.id].emoji} </span>{competency.title}</span>
                {latest && level ? <Link className="font-semibold text-teal-700 underline" to={`/dashboard/assignments/${latest.assignment_id}`} title={level.title}>
                  <span aria-hidden="true">{level.short}</span><span className="sr-only">{level.title}</span></Link>
                  : <><span aria-hidden="true" className="text-gray-400">—</span><span className="sr-only">Not yet assessed</span></>}
              </li>;
            })}
          </ul>
          <CbcAssessment studentId={student.id} />
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
