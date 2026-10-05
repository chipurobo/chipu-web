import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LearningSubmission, CompetencyEvidence } from '../../lib/learningRecords';
import { submitLearningWork } from '../../lib/learningQueries';
import { safeHttpUrl } from '../../lib/safeUrl';
import { competencies, evidenceRubric } from '../../lib/learningFramework';

export function LearnerSubmission({ assignmentId, submissions, reviews }: {
  assignmentId: string; submissions: LearningSubmission[]; reviews: CompetencyEvidence[];
}) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [reflection, setReflection] = useState('');
  const qc = useQueryClient();
  const mutation = useMutation({ mutationFn: () => submitLearningWork({ assignmentId, text, url, reflection }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['learning-submissions'] }); setText(''); setUrl(''); setReflection(''); } });
  function submit(event: FormEvent) { event.preventDefault(); mutation.mutate(); }
  return <>
    <section className="card p-5 space-y-4" aria-label="Submit my work">
      <h2 className="text-lg">Show your work</h2>
      <form aria-label="My submission" onSubmit={submit} className="space-y-4">
        <div><label htmlFor="my-work" className="field-label">Describe your work or paste your code</label>
          <textarea id="my-work" className="field-input" rows={5} required maxLength={10000} value={text} onChange={(event) => setText(event.target.value)} /></div>
        <div><label htmlFor="my-work-link" className="field-label">Link to your work (optional)</label>
          <input id="my-work-link" className="field-input" type="url" maxLength={2000} value={url} onChange={(event) => setUrl(event.target.value)}
            aria-invalid={!!url && !safeHttpUrl(url) || undefined} /></div>
        <div><label htmlFor="my-reflection" className="field-label">What did you learn or find difficult? (optional)</label>
          <textarea id="my-reflection" className="field-input" rows={3} maxLength={5000} value={reflection} onChange={(event) => setReflection(event.target.value)} /></div>
        {mutation.error && <p role="alert" className="text-sm text-red-700">{mutation.error.message}</p>}
        {mutation.isSuccess && <p role="status" className="text-sm text-teal-800">Your work was submitted. Your teacher can now review it.</p>}
        <button type="submit" className="btn-primary" disabled={mutation.isPending || !text.trim() || (!!url && !safeHttpUrl(url))}>
          {mutation.isPending ? 'Submitting…' : submissions.length ? 'Submit updated work' : 'Submit my work'}</button>
      </form>
    </section>
    <section className="card p-5 space-y-4" aria-label="My submissions"><h2 className="text-lg">My submissions</h2>
      {!submissions.length && <p className="text-sm text-gray-600">You have not submitted this activity yet.</p>}
      {submissions.map((submission) => <SubmissionDetails key={submission.id} submission={submission} />)}
    </section>
    <section className="card p-5 space-y-4" aria-label="My feedback"><h2 className="text-lg">Teacher feedback</h2>
      {!reviews.length && <p className="text-sm text-gray-600">Your teacher's feedback will appear here after review.</p>}
      {reviews.map((review) => <article key={review.id} className="border-t border-warm-200 pt-3 text-sm space-y-2">
        <p className="text-gray-600">{new Date(review.recorded_at).toLocaleString()}</p>
        <p className="whitespace-pre-wrap break-words">{review.feedback}</p>
        <ul className="list-disc pl-5">{Object.entries(review.reviews).map(([id, rating]) => <li key={id}>
          {competencies.find((item) => item.id === id)?.title}: {evidenceRubric.find((item) => item.id === rating)?.title}
        </li>)}</ul>
      </article>)}
    </section>
  </>;
}

export function SubmissionDetails({ submission }: { submission: LearningSubmission }) {
  return <article className="border-t border-warm-200 pt-3 text-sm space-y-2">
    <p className="text-gray-600">Submitted {new Date(submission.submitted_at).toLocaleString()}</p>
    <pre className="font-sans whitespace-pre-wrap break-words max-w-full text-gray-800">{submission.evidence_text}</pre>
    {safeHttpUrl(submission.evidence_url) && <a className="text-teal-700 underline" href={safeHttpUrl(submission.evidence_url)!} target="_blank" rel="noopener noreferrer">Open submitted work (new tab)</a>}
    {submission.reflection && <p className="whitespace-pre-wrap break-words">Reflection: {submission.reflection}</p>}
  </article>;
}
