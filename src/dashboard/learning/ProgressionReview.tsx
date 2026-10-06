import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningLevels, competencies, type LearningLevel } from '../../lib/learningFramework';
import { fetchReadiness, fetchDecisions, decideProgression } from '../../lib/learningOutcomes';

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
      <h3>Level progression</h3>
      <div className="flex gap-2 flex-wrap">
        {learningLevels.map((l) => (
          <span className="badge-gray" key={l.id}>
            {l.title}: {history.find((d) => d.level === l.id)?.outcome ?? 'Not awarded'}
          </span>
        ))}
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
      {readiness.isPending && <p role="status">Checking progression evidence…</p>}
      {r && (
        <>
          <p className="text-sm">
            {r.ready
              ? 'Evidence requirements met. A teacher still needs to review and decide.'
              : 'Complete the activities and reviews below to prepare for this level.'}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              {r.quiz_attempt_id
                ? 'Knowledge check pass recorded'
                : 'Next step: pass a knowledge check at this level'}
            </li>
            <li>
              {r.capstone_review_id
                ? 'Blockly capstone reviewed and demonstrated'
                : 'Next step: submit and obtain a demonstrated capstone review'}
            </li>
            {!r.previous_level_awarded && <li>Previous level must be awarded first.</li>}
            {r.missing_competencies.map((id) => (
              <li key={id}>
                Practise and demonstrate: {competencies.find((c) => c.id === id)?.title ?? id}
              </li>
            ))}
          </ul>
          <div className="flex gap-3 flex-wrap text-sm">
            <Link className="underline" to="/dashboard/quizzes">
              Open knowledge checks
            </Link>
            <Link
              className="underline"
              to="/dashboard/school/lessons"
            >
              Open practical activities
            </Link>
          </div>
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
          Progression decision
          <select
            className="field-select"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
          >
            <option value="deferred">Continue practising</option>
            <option value="awarded" disabled={!r?.ready}>
              Award level
            </option>
            <option value="revoked">Revoke a prior award</option>
          </select>
        </label>
        <label className="field-label">
          Decision reason and next steps
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
        {save.isSuccess && <p role="status">Progression decision saved.</p>}
        <button
          className="btn-primary"
          disabled={save.isPending || readiness.isPending || !!readiness.error}
        >
          {save.isPending ? 'Saving…' : 'Save progression decision'}
        </button>
      </form>
      {history.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm">Decision history</summary>
          <ol className="list-disc pl-5 mt-3 space-y-2 text-sm">
            {history.map((d) => (
              <li key={d.id}>
                {d.level}: {d.outcome} · {new Date(d.decided_at).toLocaleString()} · {d.reason}
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}
