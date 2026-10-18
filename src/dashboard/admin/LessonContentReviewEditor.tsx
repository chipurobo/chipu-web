import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, X } from 'lucide-react';
import type { Lesson, LearningNeed, LessonReviewStatus } from '../../lib/database.types';
import { reviewLessonContent, updateLesson } from '../../lib/gql/queries';
import { useNotifications } from '../../lib/notifications';
import { LEARNING_NEEDS, REVIEW_STATUS_LABEL } from '../learning/lessonSuitability';

function toInput(value: number | null | undefined) { return value == null ? '' : String(value); }
function toNumber(value: string) { return value === '' ? null : Number(value); }

export function LessonContentReviewEditor({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const { notify } = useNotifications();
  const queryClient = useQueryClient();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [minimumAge, setMinimumAge] = useState(toInput(lesson.minimum_age));
  const [maximumAge, setMaximumAge] = useState(toInput(lesson.maximum_age));
  const [minimumGrade, setMinimumGrade] = useState(toInput(lesson.minimum_grade));
  const [maximumGrade, setMaximumGrade] = useState(toInput(lesson.maximum_grade));
  const [learningNeeds, setLearningNeeds] = useState<LearningNeed[]>(lesson.learning_needs ?? []);
  const [status, setStatus] = useState<LessonReviewStatus>(lesson.review_status ?? 'draft');
  const [notes, setNotes] = useState(lesson.review_notes ?? '');
  const databaseReady = ['review_status', 'minimum_age', 'learning_needs']
    .every((field) => Object.prototype.hasOwnProperty.call(lesson, field));

  useEffect(() => {
    const frame = requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, []);

  const minimumAgeNumber = toNumber(minimumAge);
  const maximumAgeNumber = toNumber(maximumAge);
  const minimumGradeNumber = toNumber(minimumGrade);
  const maximumGradeNumber = toNumber(maximumGrade);
  const rangesValid = (minimumAgeNumber === null || maximumAgeNumber === null || minimumAgeNumber <= maximumAgeNumber)
    && (minimumGradeNumber === null || maximumGradeNumber === null || minimumGradeNumber <= maximumGradeNumber);

  const save = useMutation({
    mutationFn: async () => {
      await updateLesson(lesson.id, {
        minimum_age: minimumAgeNumber,
        maximum_age: maximumAgeNumber,
        minimum_grade: minimumGradeNumber,
        maximum_grade: maximumGradeNumber,
        learning_needs: learningNeeds,
      });
      return reviewLessonContent(lesson.id, status, notes);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['lessons'] });
      notify('success', 'Content review saved', status === 'approved'
        ? 'The lesson is approved and published to teachers.'
        : 'The lesson is not visible in the teacher curriculum.');
      onClose();
    },
    onError: (error: Error) => notify('warning', 'Could not save content review', error.message),
  });

  const toggleNeed = (need: LearningNeed) => setLearningNeeds((current) =>
    current.includes(need) ? current.filter((item) => item !== need) : [...current, need]);

  return (
    <form
      className="card max-w-4xl scroll-mt-4 space-y-5 border-violet-200 p-5"
      aria-label={`Content review for ${lesson.title}`}
      onSubmit={(event: FormEvent) => { event.preventDefault(); if (rangesValid) save.mutate(); }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-violet-700">Content appropriateness</p>
          <h2 ref={titleRef} tabIndex={-1} className="rounded-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50">{lesson.title}</h2>
          <p className="mt-1 text-sm text-gray-600">Tag the intended learners, then choose the editorial status. Only Approved lessons are published.</p>
        </div>
        <button type="button" className="p-2 text-gray-500 hover:text-gray-900" onClick={onClose} aria-label={`Close content review for ${lesson.title}`}><X className="h-5 w-5" aria-hidden="true" /></button>
      </div>

      <SuitabilityFields
        id={`review-${lesson.id}`}
        minimumAge={minimumAge} maximumAge={maximumAge}
        minimumGrade={minimumGrade} maximumGrade={maximumGrade}
        setMinimumAge={setMinimumAge} setMaximumAge={setMaximumAge}
        setMinimumGrade={setMinimumGrade} setMaximumGrade={setMaximumGrade}
        learningNeeds={learningNeeds} toggleNeed={toggleNeed}
      />
      {!databaseReady && (
        <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
          Content review is waiting for the latest database migration. Apply the pending Supabase migrations before saving an approval.
        </p>
      )}
      {!rangesValid && <p role="alert" className="text-sm font-medium text-red-700">The minimum cannot be higher than the maximum.</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor={`review-status-${lesson.id}`}>Review status</label>
          <select id={`review-status-${lesson.id}`} className="field-input" value={status} aria-describedby={`review-status-help-${lesson.id}`} onChange={(event) => setStatus(event.target.value as LessonReviewStatus)}>
            {(Object.keys(REVIEW_STATUS_LABEL) as LessonReviewStatus[]).map((value) => <option key={value} value={value}>{REVIEW_STATUS_LABEL[value]}</option>)}
          </select>
          <p id={`review-status-help-${lesson.id}`} role="status" aria-live="polite" className="mt-1 text-xs text-gray-600">
            {status === 'approved'
              ? 'Approved lessons are published and visible to teachers.'
              : `${REVIEW_STATUS_LABEL[status]} lessons are not visible to teachers.`}
          </p>
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor={`review-notes-${lesson.id}`}>Review notes</label>
          <textarea id={`review-notes-${lesson.id}`} className="field-input" rows={3} maxLength={5000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What was checked, or what should be revised?" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary" disabled={!databaseReady || !rangesValid || save.isPending}>
          <ClipboardCheck className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {save.isPending ? 'Saving…' : 'Save review'}
        </button>
        <button type="button" className="btn-secondary" onClick={onClose} aria-label={`Cancel review for ${lesson.title}`}>Cancel</button>
      </div>
    </form>
  );
}

function SuitabilityFields({
  id, minimumAge, maximumAge, minimumGrade, maximumGrade,
  setMinimumAge, setMaximumAge, setMinimumGrade, setMaximumGrade,
  learningNeeds, toggleNeed,
}: {
  id: string;
  minimumAge: string; maximumAge: string; minimumGrade: string; maximumGrade: string;
  setMinimumAge: (value: string) => void; setMaximumAge: (value: string) => void;
  setMinimumGrade: (value: string) => void; setMaximumGrade: (value: string) => void;
  learningNeeds: LearningNeed[]; toggleNeed: (need: LearningNeed) => void;
}) {
  return (
    <fieldset className="rounded-xl border border-violet-200 bg-violet-50 p-4 space-y-4">
      <legend className="px-2 font-semibold text-violet-950">Intended learners</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div><label className="field-label" htmlFor={`${id}-minimum-age`}>Minimum age</label><input id={`${id}-minimum-age`} className="field-input" type="number" min={4} max={25} value={minimumAge} onChange={(event) => setMinimumAge(event.target.value)} placeholder="e.g. 9" /></div>
        <div><label className="field-label" htmlFor={`${id}-maximum-age`}>Maximum age</label><input id={`${id}-maximum-age`} className="field-input" type="number" min={4} max={25} value={maximumAge} onChange={(event) => setMaximumAge(event.target.value)} placeholder="e.g. 12" /></div>
        <div><label className="field-label" htmlFor={`${id}-minimum-grade`}>Minimum grade</label><input id={`${id}-minimum-grade`} className="field-input" type="number" min={1} max={12} value={minimumGrade} onChange={(event) => setMinimumGrade(event.target.value)} placeholder="e.g. 4" /></div>
        <div><label className="field-label" htmlFor={`${id}-maximum-grade`}>Maximum grade</label><input id={`${id}-maximum-grade`} className="field-input" type="number" min={1} max={12} value={maximumGrade} onChange={(event) => setMaximumGrade(event.target.value)} placeholder="e.g. 6" /></div>
      </div>
      <fieldset>
        <legend className="field-label">Supported learning needs</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_NEEDS.map((need) => (
            <label key={need.id} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={learningNeeds.includes(need.id)} onChange={() => toggleNeed(need.id)} />
              {need.label}
            </label>
          ))}
        </div>
      </fieldset>
    </fieldset>
  );
}

export { SuitabilityFields };
