import { lazy, Suspense, useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LearningSubmission, CompetencyEvidence } from '../../lib/learningRecords';
import { fetchLearningProgram, saveLearningProgram, submitLearningWork } from '../../lib/learningQueries';
import { safeHttpUrl } from '../../lib/safeUrl';
import type { LearningLevel, CompetencyId } from '../../lib/learningFramework';
import type { BlocklyProgram } from '../../lib/blocklyProgram';
import { friendlyDate } from '../../lib/learnerCopy';
import { SkillChip, FriendlyAlert, Loading, Confetti, Cheer } from './ui/LearnerKit';

const BlocklyEditor = lazy(() => import('./BlocklyEditor').then((module) => ({ default: module.BlocklyEditor })));

/**
 * The learner's blocks for one lesson. Lives above the lesson stages so moving
 * between Build and Send never loses unsaved blocks.
 */
export function useLessonWork(assignmentId: string) {
  const qc = useQueryClient();
  const [program, setProgram] = useState<BlocklyProgram | null>(null);
  const [blockCount, setBlockCount] = useState(0);
  const [savedProgram, setSavedProgram] = useState('');
  const draft = useQuery({ queryKey: ['learning-program', assignmentId], queryFn: () => fetchLearningProgram(assignmentId) });
  const save = useMutation({ mutationFn: (value: BlocklyProgram) => saveLearningProgram(assignmentId, value),
    onSuccess: (_, value) => { setSavedProgram(JSON.stringify(value)); void qc.invalidateQueries({ queryKey: ['learning-program', assignmentId] }); } });
  const unsaved = !!program && blockCount > 0 && JSON.stringify(program) !== (savedProgram || JSON.stringify(draft.data ?? null));
  return {
    assignmentId, draft, save, program, blockCount, savedProgram, setSavedProgram, unsaved,
    update: (value: BlocklyProgram, count: number) => { setProgram(value); setBlockCount(count); },
    /** Save quietly when the learner moves to another stage. */
    saveIfChanged: () => { if (unsaved && program && !save.isPending) save.mutate(program); },
  };
}
export type LessonWork = ReturnType<typeof useLessonWork>;

export function LessonBuild({ work, level }: { work: LessonWork; level: LearningLevel }) {
  const { draft, save, program } = work;
  // Blocks save on their own a moment after each change; there is no Save button.
  const programJson = program ? JSON.stringify(program) : '';
  useEffect(() => {
    if (!work.unsaved) return;
    const timer = setTimeout(() => work.saveIfChanged(), 1500);
    return () => clearTimeout(timer);
  }, [programJson]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {draft.isPending && <Loading>Loading your saved blocks</Loading>}
      {draft.error && <p role="alert" className="learner-card border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-900"><span aria-hidden="true">😬 </span>Blocks didn't load. <button type="button" className="underline" onClick={() => void draft.refetch()}>Try again</button></p>}
      {!draft.isPending && !draft.error && <Suspense fallback={<Loading>Loading the block editor</Loading>}>
        <BlocklyEditor initial={program ?? draft.data} level={level} drawers={false} onChange={work.update} />
      </Suspense>}
      <FriendlyAlert error={save.error} />
    </div>
  );
}

export function LessonSend({ work, submissions, reviews, onSent }: {
  work: LessonWork; submissions: LearningSubmission[]; reviews: CompetencyEvidence[]; onSent?: () => void;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [reflection, setReflection] = useState('');
  const program = work.program ?? work.draft.data ?? null;
  const hasBlocks = work.program ? work.blockCount > 0 : !!program?.code?.trim();
  const ran = !!program?.output?.trim();
  const mutation = useMutation({ mutationFn: (value: { text: string; reflection: string; program: BlocklyProgram }) => submitLearningWork({ assignmentId: work.assignmentId, url: '', ...value }),
    onSuccess: (_, value) => { void qc.invalidateQueries({ queryKey: ['learning-submissions'] }); void qc.invalidateQueries({ queryKey: ['learning-program', work.assignmentId] });
      work.setSavedProgram(JSON.stringify(value.program)); setText(''); setReflection(''); onSent?.(); } });
  function submit(event: FormEvent) { event.preventDefault(); if (program) mutation.mutate({ text, reflection, program }); }
  const latestReview = reviews[0];
  return <div className="space-y-5">
    <Confetti show={mutation.isSuccess} />
    {latestReview && <article className="learner-card space-y-3 border-teal-200 bg-teal-50 p-5">
      <h3><span aria-hidden="true">💌 </span>Your teacher said</h3>
      <p className="whitespace-pre-wrap break-words text-base font-semibold text-teal-950">{latestReview.feedback}</p>
      <ul className="flex flex-wrap gap-2" aria-label="Skill ratings">{Object.entries(latestReview.reviews).map(([id, rating]) => <li key={id}>
        <SkillChip id={id as CompetencyId} band={rating} />
      </li>)}</ul>
    </article>}

    {!hasBlocks && <p className="learner-card p-4 text-base font-semibold text-slate-800"><span aria-hidden="true">🧩 </span>Build your program first, then come back here to send it.</p>}
    {hasBlocks && !ran && <p className="text-sm font-semibold text-slate-700"><span aria-hidden="true">▶️ </span>Tip: press Run on the Build step so your teacher can see what it does.</p>}

    <form aria-label="Send my work" onSubmit={submit} className="space-y-4">
      <div><label htmlFor="my-work" className="field-label">What did you make?</label>
        <textarea id="my-work" className="field-input" rows={3} required maxLength={10000} value={text} onChange={(event) => setText(event.target.value)} /></div>
      <div><label htmlFor="my-reflection" className="field-label">What did you learn? <span className="font-normal text-slate-600">(you can skip this)</span></label>
        <textarea id="my-reflection" className="field-input" rows={2} maxLength={5000} value={reflection} onChange={(event) => setReflection(event.target.value)} /></div>
      <FriendlyAlert error={mutation.error} />
      {mutation.isSuccess && <Cheer title="Sent!" body="Nice work. Your teacher will reply here." />}
      <button type="submit" className="btn-play" disabled={mutation.isPending || !program || !hasBlocks || !text.trim()}>
        <span aria-hidden="true">🚀</span> {mutation.isPending ? 'Sending…' : 'Send'}<span className="sr-only"> to my teacher</span></button>
    </form>

    {!!submissions.length && <details className="text-sm">
      <summary className="cursor-pointer font-extrabold text-slate-900">Sent before ({submissions.length})</summary>
      <div className="mt-3 space-y-3">{submissions.map((submission) => <SubmissionDetails key={submission.id} submission={submission} friendly />)}</div>
    </details>}
  </div>;
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
