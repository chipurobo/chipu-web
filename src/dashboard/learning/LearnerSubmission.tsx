import { lazy, Suspense, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LearningSubmission, CompetencyEvidence } from '../../lib/learningRecords';
import { fetchLearningProgram, saveLearningProgram, submitLearningWork } from '../../lib/learningQueries';
import { safeHttpUrl } from '../../lib/safeUrl';
import type { LearningLevel, CompetencyId } from '../../lib/learningFramework';
import type { BlocklyProgram } from '../../lib/blocklyProgram';
import { friendlyDate } from '../../lib/learnerCopy';
import { SkillChip, FriendlyAlert, Loading, Confetti, Cheer } from './ui/LearnerKit';

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
  const ran = !!program?.output?.trim();
  const checklist = [
    { done: blockCount > 0, emoji: '🧩', label: 'Blocks', help: 'Add some blocks' },
    { done: ran, emoji: '▶️', label: 'Run', help: 'Press Run and see what happens' },
    { done: text.trim().length > 0, emoji: '✍️', label: 'Words', help: 'Say what you made' },
  ];
  return <>
    <Confetti show={mutation.isSuccess} />
    <section className="learner-card p-4 sm:p-5 space-y-4" aria-label="Code this lesson">
      <h2><span aria-hidden="true">🧩 </span>Build</h2>
      {draft.isPending && <Loading>Loading your saved blocks</Loading>}
      {draft.error && <p role="alert" className="learner-card border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-900"><span aria-hidden="true">😬 </span>Blocks didn't load. <button type="button" className="underline" onClick={() => void draft.refetch()}>Try again</button></p>}
      {!draft.isPending && !draft.error && <Suspense fallback={<Loading>Loading the block editor</Loading>}>
        <BlocklyEditor initial={draft.data} level={level} onChange={(value, count) => { setProgram(value); setBlockCount(count); }} />
      </Suspense>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-secondary" disabled={!program || !blockCount || save.isPending || mutation.isPending || !!draft.error}
          onClick={() => program && save.mutate(program)}><span aria-hidden="true">💾</span> {save.isPending ? 'Saving…' : 'Save'}</button>
        {savedProgram && <p role="status" className="text-sm font-bold text-emerald-800">{JSON.stringify(program) === savedProgram ? <><span aria-hidden="true">✅ </span>Saved<span className="sr-only">. Your blocks are saved.</span></> : <><span aria-hidden="true">✏️ </span>Unsaved<span className="sr-only">. You have changes to save.</span></>}</p>}
      </div>
      <FriendlyAlert error={save.error} />
    </section>

    <section className="learner-card p-5 space-y-4" aria-label="Submit my work">
      <h2><span aria-hidden="true">📬 </span>Send</h2>
      <ul className="flex flex-wrap gap-2" aria-label="Before you send">
        {checklist.map((item) => <li key={item.label} title={item.help} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${item.done ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-600'}`}>
          <span aria-hidden="true">{item.done ? '✅' : '⬜'} {item.emoji}</span>{item.label}<span className="sr-only">: {item.done ? 'done' : item.help}</span></li>)}
      </ul>
      <form aria-label="My submission" onSubmit={submit} className="space-y-4">
        <div><label htmlFor="my-work" className="field-label"><span aria-hidden="true">✍️ </span>What did you make?</label>
          <textarea id="my-work" className="field-input" rows={3} required maxLength={10000} value={text} onChange={(event) => setText(event.target.value)} /></div>
        <div><label htmlFor="my-work-link" className="field-label"><span aria-hidden="true">🔗 </span>Link <span className="font-normal text-slate-500">(optional)</span></label>
          <input id="my-work-link" className="field-input" type="url" maxLength={2000} value={url} onChange={(event) => setUrl(event.target.value)}
            aria-invalid={!!url && !safeHttpUrl(url) || undefined} /></div>
        <div><label htmlFor="my-reflection" className="field-label"><span aria-hidden="true">💭 </span>What did you learn? <span className="font-normal text-slate-500">(optional)</span></label>
          <textarea id="my-reflection" className="field-input" rows={2} maxLength={5000} value={reflection} onChange={(event) => setReflection(event.target.value)} /></div>
        <FriendlyAlert error={mutation.error} />
        {mutation.isSuccess && <Cheer title="Sent!" body="Nice work. Your teacher will take a look and reply right here." />}
        <button type="submit" className="btn-play" disabled={mutation.isPending || save.isPending || !program || !blockCount || !text.trim() || (!!url && !safeHttpUrl(url))}>
          <span aria-hidden="true">🚀</span> {mutation.isPending ? 'Sending…' : 'Send'}<span className="sr-only"> to my teacher</span></button>
      </form>
    </section>

    <section className="learner-card p-5 space-y-4" aria-label="My submissions"><h2><span aria-hidden="true">📨 </span>Sent</h2>
      {!submissions.length && <p className="text-sm text-slate-600"><span aria-hidden="true">— </span>Nothing yet<span className="sr-only">. Build your program above, then send it.</span></p>}
      {submissions.map((submission) => <SubmissionDetails key={submission.id} submission={submission} friendly />)}
    </section>

    <section className="learner-card p-5 space-y-4" aria-label="My feedback"><h2><span aria-hidden="true">💌 </span>Teacher</h2>
      {!reviews.length && <p className="text-sm text-slate-600"><span aria-hidden="true">— </span>Not yet<span className="sr-only">. Your teacher's reply will appear here after they look at your work.</span></p>}
      {reviews.map((review) => <article key={review.id} className="rounded-2xl bg-emerald-50 p-4 text-sm space-y-3">
        <p className="font-bold text-emerald-900/70">{friendlyDate(review.recorded_at)}</p>
        <p className="whitespace-pre-wrap break-words text-base font-semibold text-emerald-950">{review.feedback}</p>
        <ul className="flex flex-wrap gap-2" aria-label="Skill ratings">{Object.entries(review.reviews).map(([id, rating]) => <li key={id}>
          <SkillChip id={id as CompetencyId} band={rating} />
        </li>)}</ul>
      </article>)}
    </section>
  </>;
}

/** `friendly` switches to learner wording; teachers keep the formal labels. */
export function SubmissionDetails({ submission, friendly = false }: { submission: LearningSubmission; friendly?: boolean }) {
  const [showBlocks, setShowBlocks] = useState(false);
  return <article className="border-t border-warm-200 pt-3 text-sm space-y-2">
    <p className="text-gray-600">{friendly ? 'Sent' : 'Submitted'} {friendly ? friendlyDate(submission.submitted_at) : new Date(submission.submitted_at).toLocaleString()}</p>
    <pre className="font-sans whitespace-pre-wrap break-words max-w-full text-gray-800">{submission.evidence_text}</pre>
    {safeHttpUrl(submission.evidence_url) && <a className="text-teal-700 underline" href={safeHttpUrl(submission.evidence_url)!} target="_blank" rel="noopener noreferrer">{friendly ? 'Open my link (new tab)' : 'Open submitted work (new tab)'}</a>}
    {submission.reflection && <p className="whitespace-pre-wrap break-words">{friendly ? 'What I learned: ' : 'Reflection: '}{submission.reflection}</p>}
    {submission.blockly_workspace && <details onToggle={(event) => setShowBlocks(event.currentTarget.open)}>
      <summary className="cursor-pointer underline">{friendly ? 'See my blocks' : 'View submitted Blockly program'}</summary>
      {showBlocks && <div className="mt-3"><Suspense fallback={<p role="status">Loading submitted blocks…</p>}>
        <BlocklyEditor readOnly initial={{ workspace: submission.blockly_workspace, code: submission.generated_code ?? '', output: submission.run_output ?? '' }} />
      </Suspense></div>}
    </details>}
  </article>;
}
