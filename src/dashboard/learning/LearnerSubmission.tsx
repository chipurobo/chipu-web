import { lazy, Suspense, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LearningSubmission, CompetencyEvidence } from '../../lib/learningRecords';
import { fetchLearningProgram, saveLearningProgram, submitLearningWork } from '../../lib/learningQueries';
import { safeHttpUrl } from '../../lib/safeUrl';
import { competencies, evidenceRubric, type LearningLevel } from '../../lib/learningFramework';
import type { BlocklyProgram } from '../../lib/blocklyProgram';

const BlocklyEditor = lazy(() => import('./BlocklyEditor').then((module) => ({ default: module.BlocklyEditor })));

export function LearnerSubmission({ assignmentId, level, submissions, reviews }: {
  assignmentId: string; level: LearningLevel; submissions: LearningSubmission[]; reviews: CompetencyEvidence[];
}) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [reflection, setReflection] = useState('');
  const [program, setProgram] = useState<BlocklyProgram | null>(null);
  const [blockCount, setBlockCount] = useState(0);
  const [savedProgram, setSavedProgram] = useState('');
  const qc = useQueryClient();
  const draft = useQuery({ queryKey: ['learning-program', assignmentId], queryFn: () => fetchLearningProgram(assignmentId) });
  const save = useMutation({ mutationFn: (value: BlocklyProgram) => saveLearningProgram(assignmentId, value),
    onSuccess: (_, value) => { setSavedProgram(JSON.stringify(value)); void qc.invalidateQueries({ queryKey: ['learning-program', assignmentId] }); } });
  const mutation = useMutation({ mutationFn: (value: { text: string; url: string; reflection: string; program: BlocklyProgram }) => submitLearningWork({ assignmentId, ...value }),
    onSuccess: (_, value) => { void qc.invalidateQueries({ queryKey: ['learning-submissions'] }); void qc.invalidateQueries({ queryKey: ['learning-program', assignmentId] });
      setSavedProgram(JSON.stringify(value.program)); setText(''); setUrl(''); setReflection(''); } });
  function submit(event: FormEvent) { event.preventDefault(); if (program) mutation.mutate({ text, url, reflection, program }); }
  return <>
    <section className="card p-4 sm:p-5 space-y-4" aria-label="Code this lesson">
      <h2 className="text-lg">Code this lesson in Blockly</h2>
      {draft.isPending && <p role="status">Loading your saved blocks…</p>}
      {draft.error && <p role="alert" className="text-sm text-red-700">{draft.error.message} <button type="button" className="underline" onClick={() => void draft.refetch()}>Retry loading blocks</button></p>}
      {!draft.isPending && !draft.error && <Suspense fallback={<p role="status">Loading Blockly…</p>}>
        <BlocklyEditor initial={draft.data} level={level} onChange={(value, count) => { setProgram(value); setBlockCount(count); }} />
      </Suspense>}
      <button type="button" className="btn-secondary" disabled={!program || !blockCount || save.isPending || mutation.isPending || !!draft.error}
        onClick={() => program && save.mutate(program)}>{save.isPending ? 'Saving blocks…' : 'Save program'}</button>
      {save.error && <p role="alert" className="text-sm text-red-700">{save.error.message}</p>}
      {savedProgram && <p role="status" className="text-sm text-teal-800">{JSON.stringify(program) === savedProgram ? 'Your blocks are saved.' : 'You have changes to save.'}</p>}
    </section>
    <section className="card p-5 space-y-4" aria-label="Submit my work">
      <h2 className="text-lg">Show your work</h2>
      <p className="text-sm text-gray-600">Submit your Blockly program with a short explanation. Your teacher will see your blocks, generated code and last run output.</p>
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
        <button type="submit" className="btn-primary" disabled={mutation.isPending || save.isPending || !program || !blockCount || !text.trim() || (!!url && !safeHttpUrl(url))}>
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
  const [showBlocks, setShowBlocks] = useState(false);
  return <article className="border-t border-warm-200 pt-3 text-sm space-y-2">
    <p className="text-gray-600">Submitted {new Date(submission.submitted_at).toLocaleString()}</p>
    <pre className="font-sans whitespace-pre-wrap break-words max-w-full text-gray-800">{submission.evidence_text}</pre>
    {safeHttpUrl(submission.evidence_url) && <a className="text-teal-700 underline" href={safeHttpUrl(submission.evidence_url)!} target="_blank" rel="noopener noreferrer">Open submitted work (new tab)</a>}
    {submission.reflection && <p className="whitespace-pre-wrap break-words">Reflection: {submission.reflection}</p>}
    {submission.blockly_workspace && <details onToggle={(event) => setShowBlocks(event.currentTarget.open)}>
      <summary className="cursor-pointer underline">View submitted Blockly program</summary>
      {showBlocks && <div className="mt-3"><Suspense fallback={<p role="status">Loading submitted blocks…</p>}>
        <BlocklyEditor readOnly initial={{ workspace: submission.blockly_workspace, code: submission.generated_code ?? '', output: submission.run_output ?? '' }} />
      </Suspense></div>}
    </details>}
  </article>;
}
