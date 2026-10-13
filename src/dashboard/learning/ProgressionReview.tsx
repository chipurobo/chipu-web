import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningLevels, competencies, type LearningLevel } from '../../lib/learningFramework';
import { fetchReadiness, fetchDecisions, decideProgression } from '../../lib/learningOutcomes';
import { levelLook } from '../../lib/learnerCopy';

const outcomeWord: Record<string, string> = { awarded: 'awarded', deferred: 'not yet', revoked: 'taken back' };

export function ProgressionReview({ studentId }: { studentId: string }) {
  const qc = useQueryClient();
  const [level, setLevel] = useState<LearningLevel>('beginner');
  const [outcome, setOutcome] = useState('deferred');
  const [reason, setReason] = useState('');
  const readiness = useQuery({
    queryKey: ['progression-readiness', studentId, level],
    queryFn: () => fetchReadiness(studentId, level),
  });
  const decisions = useQuery({ queryKey: ['progression-decisions'], queryFn: fetchDecisions });
  const save = useMutation({
    mutationFn: () => decideProgression(studentId, level, outcome, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['progression-decisions'] });
      void qc.invalidateQueries({ queryKey: ['progression-readiness'] });
      setReason('');
    },
  });
  const history = decisions.data?.filter((d) => d.student_id === studentId) ?? [];
  const r = readiness.data;
  return (
    <section className="space-y-4 border-t border-warm-200 pt-4" aria-label="Level progression">
      <h3><span aria-hidden="true">🏅 </span>Level</h3>
      <div className="flex gap-2 flex-wrap">
        {learningLevels.map((l) => {
          const latest = history.find((d) => d.level === l.id);
          return (
            <span className={latest?.outcome === 'awarded' ? 'badge-green' : 'badge-gray'} key={l.id}>
              <span aria-hidden="true">{levelLook[l.id].emoji} </span><span>{l.title}: {latest?.outcome ?? 'Not awarded'}</span>
            </span>
          );
        })}
      </div>
      <label className="field-label">
        Review learning level
        <select
          className="field-select max-w-xs"
          value={level}
          onChange={(e) => setLevel(e.target.value as LearningLevel)}
        >
          {learningLevels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </label>
      {(readiness.error ?? decisions.error) && (
        <p role="alert" className="text-red-700">
          {(readiness.error ?? decisions.error)?.message}
        </p>
      )}
      {readiness.isPending && <p role="status">Checking…</p>}
      {r && (
        <>
          <p className="text-sm font-medium">
            {r.ready ? <><span aria-hidden="true">✅ </span>Ready for your decision.</> : <><span aria-hidden="true">⏳ </span>Not ready yet. Still needed:</>}
          </p>
          <ul className="flex flex-wrap gap-2 text-sm">
            <li className={r.quiz_attempt_id ? 'badge-green' : 'badge-amber'}><span aria-hidden="true">{r.quiz_attempt_id ? '✅' : '⬜'} </span>Quiz passed</li>
            <li className={r.capstone_review_id ? 'badge-green' : 'badge-amber'}><span aria-hidden="true">{r.capstone_review_id ? '✅' : '⬜'} </span>Project reviewed</li>
            {!r.previous_level_awarded && <li className="badge-amber"><span aria-hidden="true">⬜ </span>Previous level first</li>}
            {r.missing_competencies.map((id) => (
              <li key={id} className="badge-amber"><span aria-hidden="true">⬜ </span>{competencies.find((c) => c.id === id)?.title ?? 'Skill'}</li>
            ))}
          </ul>
        </>
      )}
      <form
        aria-label="Record progression decision"
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <label className="field-label">
          <span className="sr-only">Progression decision</span><span aria-hidden="true">Decision</span>
          <select
            className="field-select"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
          >
            <option value="deferred">Keep practising</option>
            <option value="awarded" disabled={!r?.ready}>
              Award this level
            </option>
            <option value="revoked">Take back an award</option>
          </select>
        </label>
        <label className="field-label">
          <span className="sr-only">Decision reason and next steps</span><span aria-hidden="true">Why, and what next</span>
          <textarea
            required
            maxLength={5000}
            className="field-input"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        {save.error && (
          <p role="alert" className="text-red-700">
            {save.error.message}
          </p>
        )}
        {save.isSuccess && <p role="status"><span aria-hidden="true">✅ </span>Saved.</p>}
        <button
          className="btn-primary"
          disabled={save.isPending || readiness.isPending || !!readiness.error}
        >
          {save.isPending ? 'Saving…' : 'Save'}<span className="sr-only"> progression decision</span>
        </button>
      </form>
      {history.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm">History ({history.length})</summary>
          <ol className="list-disc pl-5 mt-3 space-y-2 text-sm">
            {history.map((d) => (
              <li key={d.id}>
                {levelLook[d.level].title}: {outcomeWord[d.outcome] ?? d.outcome} · {new Date(d.decided_at).toLocaleDateString()} · {d.reason}
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}
