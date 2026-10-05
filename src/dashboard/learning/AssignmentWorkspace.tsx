import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchLearningStudents, fetchAssignment, fetchEvidence, fetchRecipients, fetchSubmissions, recordCompetencyEvidence, reviewLearningSubmission } from '../../lib/learningQueries';
import { competencies, evidenceRubric, learningLevels, learningPathways, type CompetencyId } from '../../lib/learningFramework';
import { useAuth } from '../../lib/auth';
import { LearnerSubmission, SubmissionDetails } from './LearnerSubmission';
import type { CompetencyEvidence, LearningAssignment, LearningSubmission, ReviewBand } from '../../lib/learningRecords';
import { safeHttpUrl } from '../../lib/safeUrl';

export function AssignmentWorkspace() {
  const { assignmentId } = useParams();
  const { profile } = useAuth();
  const isLearner = profile?.role === 'learner';
  const assignmentQuery = useQuery({ queryKey: ['learning-assignment', assignmentId],
    queryFn: () => fetchAssignment(assignmentId!), enabled: !!assignmentId });
  const assignment = assignmentQuery.data;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [assignment?.id]);
  const recipients = useQuery({ queryKey: ['learning-recipients', assignmentId],
    queryFn: () => fetchRecipients(assignmentId!), enabled: !!assignment });
  const members = useQuery({ queryKey: ['learning-students', assignment?.school_id],
    queryFn: () => fetchLearningStudents(assignment!.school_id), enabled: !!assignment });
  const evidence = useQuery({ queryKey: ['competency-evidence', assignmentId],
    queryFn: () => fetchEvidence(assignmentId!), enabled: !!assignment });
  const submissions = useQuery({ queryKey: ['learning-submissions', assignmentId], queryFn: () => fetchSubmissions(assignmentId!), enabled: !!assignment });
  const error = submissions.error ?? assignmentQuery.error ?? recipients.error ?? members.error ?? evidence.error;
  const assigned = (members.data ?? []).filter((member) => recipients.data?.some((row) => row.student_id === member.id));
  return (
    <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
      <Link to={isLearner ? '/dashboard/my-learning' : assignment ? `/dashboard/school/lessons/${assignment.lesson_id}` : '/dashboard/school/lessons'}
        className="text-sm text-teal-700 underline">{isLearner ? 'Back to my learning' : 'Back to lessons'}</Link>
      {error && <p role="alert" className="text-sm text-red-700">{error.message}</p>}
      {assignmentQuery.isPending && <p role="status">Loading assignment…</p>}
      {!assignmentQuery.isPending && !error && !assignment && <h1>Assignment not found</h1>}
      {assignment && <>
        <div>
          <p className="text-sm text-gray-600">{learningPathways.find((path) => path.id === assignment.learning_plan.pathwayId)?.title}</p>
          <h1 ref={heading} tabIndex={-1} className="focus:outline-none">{assignment.title}</h1>
          <div className="flex gap-2 flex-wrap mt-3">
            <span className="badge-teal">{learningLevels.find((level) => level.id === assignment.learning_plan.level)?.title}</span>
            <span className="badge-gray">{assignment.due_date ? `Due ${assignment.due_date}` : 'No due date'}</span>
            <span className="badge-amber">Draft competency mapping</span>
          </div>
        </div>
        <section className="card p-5 space-y-4" aria-label="Assigned learning task">
          <h2 className="text-lg">Activity</h2>
          {assignment.instructions && <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>}
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
            {assignment.learning_plan.steps.map((step, index) => <li key={index}>{step}</li>)}
          </ol>
          <div><h3 className="text-base">Evidence to show</h3><p className="text-sm text-gray-700">{assignment.learning_plan.evidenceBrief}</p></div>
          <details className="text-sm text-gray-700">
            <summary className="text-teal-700 cursor-pointer">Outcomes and access support</summary>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              {competencies.filter((item) => assignment.learning_plan.competencyIds.includes(item.id))
                .map((item) => <li key={item.id}>{item.outcomes[assignment.learning_plan.level]}</li>)}
            </ul>
            <p className="mt-3">Use readable text, captions, tactile materials or an oral explanation as needed. Access accommodations do not reduce competency. Record any help with the learning task separately.</p>
          </details>
        </section>
        {isLearner ? <LearnerSubmission assignmentId={assignment.id} submissions={submissions.data ?? []} reviews={evidence.data ?? []} /> : <section aria-label="Review student work" className="space-y-4">
          <h2 className="text-lg">Review student work</h2>
          <p className="text-sm text-gray-600">Record each student's work and your feedback. These reviews do not award an overall level or change lesson completion.</p>
          {(recipients.isPending || members.isPending || evidence.isPending) && <p role="status">Loading student work…</p>}
          {assigned.map((student) => <StudentEvidence key={student.id} name={student.full_name} studentId={student.id}
            assignment={assignment} submissions={(submissions.data ?? []).filter((item) => item.student_id === student.id)} evidence={(evidence.data ?? []).filter((item) => item.student_id === student.id)} />)}
        </section>}
      </>}
    </div>
  );
}

function StudentEvidence({ name, studentId, assignment, submissions, evidence }: {
  name: string; studentId: string; assignment: LearningAssignment; evidence: CompetencyEvidence[]; submissions: LearningSubmission[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<LearningSubmission | null>(null);
  return (
    <article className="card p-4 space-y-3" aria-label={`Work from ${name}`}>
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div><h3 className="text-base">{name}</h3><p className="text-sm text-gray-600">{evidence.length ? `${evidence.length} evidence review${evidence.length === 1 ? '' : 's'}` : 'Awaiting evidence review'}</p></div>
        <button type="button" className="btn-secondary" aria-expanded={open} aria-controls={`review-${studentId}`}
          onClick={() => { setSelectedSubmission(null); setOpen(!open); }}>{open ? 'Close review' : 'Record evidence and review'}</button>
      </div>
      {submissions.map((submission) => <div key={submission.id} className="space-y-3">
        <SubmissionDetails submission={submission} />
        <button type="button" className="btn-primary" onClick={() => { setSelectedSubmission(submission); setOpen(true); }}>Review submitted work</button>
      </div>)}
      {open && <div id={`review-${studentId}`}><EvidenceReviewForm key={selectedSubmission?.id ?? 'manual'} assignment={assignment} studentId={studentId} name={name} submission={selectedSubmission} /></div>}
      {evidence.length > 0 && <details className="text-sm">
        <summary className="cursor-pointer text-teal-700">Review history</summary>
        <ol className="list-none p-0 mt-3 space-y-4">
          {evidence.map((item) => <li key={item.id} className="border-t border-warm-200 pt-3 space-y-2">
            <p className="text-gray-600">{new Date(item.recorded_at).toLocaleString()}</p>
            <p className="whitespace-pre-wrap break-words">{item.evidence_text}</p>
            {safeHttpUrl(item.evidence_url) && <a className="underline text-teal-700" href={safeHttpUrl(item.evidence_url)!} target="_blank" rel="noopener noreferrer">Open evidence (new tab)</a>}
            <ul className="list-disc pl-5">{Object.entries(item.reviews).map(([id, band]) => <li key={id}>
              {competencies.find((competency) => competency.id === id)?.title}: {evidenceRubric.find((rating) => rating.id === band)?.title}
            </li>)}</ul>
            <p className="whitespace-pre-wrap break-words">Feedback: {item.feedback}</p>
          </li>)}
        </ol>
      </details>}
    </article>
  );
}

function EvidenceReviewForm({ assignment, studentId, name, submission }: { assignment: LearningAssignment; studentId: string; name: string; submission: LearningSubmission | null }) {
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [feedback, setFeedback] = useState('');
  const [reviews, setReviews] = useState<Partial<Record<CompetencyId, ReviewBand>>>({});
  const mutation = useMutation({
    mutationFn: () => submission ? reviewLearningSubmission(submission.id, feedback, reviews) : recordCompetencyEvidence({ assignmentId: assignment.id, studentId,
      evidenceText: text, evidenceUrl: url, feedback, reviews }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['competency-evidence'] });
      setText(''); setUrl(''); setFeedback(''); setReviews({});
    },
  });
  function submit(event: FormEvent) { event.preventDefault(); mutation.mutate(); }
  const plan = assignment.learning_plan;
  return (
    <form onSubmit={submit} aria-label={`Evidence review for ${name}`} className="space-y-4 border-t border-warm-200 pt-4">
      {submission ? <div><p className="text-sm font-semibold">Reviewing submitted work</p><SubmissionDetails submission={submission} /></div> : <>
      <div>
        <label htmlFor={`evidence-text-${studentId}`} className="field-label">Describe the learner's evidence</label>
        <textarea id={`evidence-text-${studentId}`} required maxLength={10000} rows={3} className="field-input"
          value={text} onChange={(event) => setText(event.target.value)} />
      </div>
      <div>
        <label htmlFor={`evidence-url-${studentId}`} className="field-label">Evidence link (optional)</label>
        <input id={`evidence-url-${studentId}`} type="url" maxLength={2000} className="field-input" value={url}
          onChange={(event) => setUrl(event.target.value)} aria-invalid={!!url && !safeHttpUrl(url) || undefined} />
      </div>
      </>}
      <fieldset className="space-y-4">
        <legend className="field-label">Review competencies at {learningLevels.find((item) => item.id === plan.level)?.title}</legend>
        {competencies.filter((item) => plan.competencyIds.includes(item.id)).map((item) => <div key={item.id}>
          <label className="field-label" htmlFor={`review-${studentId}-${item.id}`}>{item.title}</label>
          <p className="text-sm text-gray-600 mb-2" id={`outcome-${studentId}-${item.id}`}>{item.outcomes[plan.level]}</p>
          <select id={`review-${studentId}-${item.id}`} className="field-input" value={reviews[item.id] ?? ''}
            aria-describedby={`outcome-${studentId}-${item.id}`} onChange={(event) => {
              const next = { ...reviews };
              if (event.target.value) next[item.id] = event.target.value as ReviewBand;
              else delete next[item.id];
              setReviews(next);
            }}>
            <option value="">Not yet observed</option>
            {evidenceRubric.filter((band) => band.id !== 'not-observed').map((band) => <option key={band.id} value={band.id}>{band.title}</option>)}
          </select>
        </div>)}
      </fieldset>
      <div>
        <label htmlFor={`feedback-${studentId}`} className="field-label">Feedback and next step</label>
        <textarea id={`feedback-${studentId}`} required maxLength={5000} rows={2} className="field-input"
          value={feedback} onChange={(event) => setFeedback(event.target.value)} />
      </div>
      {mutation.error && <p role="alert" className="text-sm text-red-700">{mutation.error.message}</p>}
      {mutation.isSuccess && <p role="status" className="text-sm text-teal-800">Evidence review saved.</p>}
      <button type="submit" className="btn-primary" disabled={mutation.isPending || (!submission && !text.trim()) || !feedback.trim() || !Object.keys(reviews).length || (!!url && !safeHttpUrl(url))}>
        {mutation.isPending ? 'Saving…' : submission ? 'Save submission review' : 'Save evidence review'}
      </button>
    </form>
  );
}
