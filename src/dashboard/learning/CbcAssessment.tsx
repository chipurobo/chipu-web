import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cbcLevels } from '../../lib/learningFramework';
import { fetchCbcAssessments, fetchCbcSummary, recordCbcAssessment } from '../../lib/learningOutcomes';
import type { ReviewBand } from '../../lib/learningRecords';

const levelTitle = (id: ReviewBand | null | undefined) => cbcLevels.find((level) => level.id === id)?.title ?? 'Not yet assessed';

/**
 * End-of-course assessment on the CBC performance levels. The platform
 * suggests a level from the latest skill ratings (EE 4 · ME 3 · AE 2 · BE 1,
 * rounded average); the teacher chooses the level and writes the comment.
 */
export function CbcAssessment({ studentId }: { studentId: string }) {
  const qc = useQueryClient();
  const summary = useQuery({ queryKey: ['cbc-summary', studentId], queryFn: () => fetchCbcSummary(studentId) });
  const assessments = useQuery({ queryKey: ['cbc-assessments'], queryFn: fetchCbcAssessments });
  const [level, setLevel] = useState<ReviewBand | ''>('');
  const [comment, setComment] = useState('');
  const save = useMutation({
    mutationFn: () => recordCbcAssessment(studentId, chosen as ReviewBand, comment),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['cbc-assessments'] });
      setComment(''); setLevel('');
    },
  });
  const history = assessments.data?.filter((item) => item.student_id === studentId) ?? [];
  const latest = history[0];
  const s = summary.data;
  const chosen = level || s?.suggested_level || '';
  const error = summary.error ?? assessments.error;

  return (
    <section className="space-y-4 border-t border-warm-200 pt-4" aria-labelledby={`cbc-${studentId}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`cbc-${studentId}`}>CBC assessment</h3>
        <p className="text-sm">{latest ? <>Last recorded: <strong>{levelTitle(latest.performance_level)}</strong> · {new Date(latest.decided_at).toLocaleDateString()}</> : 'Not yet recorded'}</p>
      </div>
      {error && <p role="alert" className="text-red-700">{error.message}</p>}
      {summary.isPending && <p role="status">Checking…</p>}
      {s && <p className="text-sm text-gray-700">
        {s.lessons_sent} lesson{s.lessons_sent === 1 ? '' : 's'} sent · {s.projects_sent} big project{s.projects_sent === 1 ? '' : 's'} sent · {s.final_checks_passed} final check{s.final_checks_passed === 1 ? '' : 's'} passed ·
        {' '}suggested from skill ratings: <strong>{s.suggested_level ? levelTitle(s.suggested_level) : 'no ratings yet'}</strong>
      </p>}
      <form aria-label="Record CBC assessment" className="space-y-3" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
        <fieldset>
          <legend className="field-label">Performance level</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {cbcLevels.map((item) => (
              <label key={item.id} className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm ${chosen === item.id ? 'border-teal-700 bg-teal-50' : 'border-warm-200'}`}>
                <input type="radio" name={`cbc-level-${studentId}`} value={item.id} required className="mt-0.5"
                  checked={chosen === item.id} onChange={() => setLevel(item.id)} />
                <span><strong>{item.short} · {item.title}</strong>{s?.suggested_level === item.id && <span className="text-teal-800"> (suggested)</span>}<br />{item.description}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field-label">
          Comment: what went well, and what next
          <textarea required maxLength={5000} rows={3} className="field-input" value={comment} onChange={(event) => setComment(event.target.value)} />
        </label>
        {save.error && <p role="alert" className="text-red-700">{save.error.message}</p>}
        {save.isSuccess && <p role="status">Saved.</p>}
        <button className="btn-primary" disabled={save.isPending || !chosen || !comment.trim()}>
          {save.isPending ? 'Saving…' : 'Save'}<span className="sr-only"> CBC assessment</span>
        </button>
      </form>
      {history.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm">History ({history.length})</summary>
          <ol className="mt-3 list-disc space-y-2 pl-5 text-sm">
            {history.map((item) => <li key={item.id}>{levelTitle(item.performance_level)} · {new Date(item.decided_at).toLocaleDateString()} · {item.comment}</li>)}
          </ol>
        </details>
      )}
    </section>
  );
}

