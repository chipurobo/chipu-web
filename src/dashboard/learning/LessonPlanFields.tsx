import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { competencies, learningLevels, learningPathways, learningFramework, type LearningLevel } from '../../lib/learningFramework';
import { cleanLearningPlan, hasUsableLearningPlan, newLearningPlan, type LessonLearningPlan } from '../../lib/learningRecords';
import type { Lesson } from '../../lib/database.types';
import { updateLesson } from '../../lib/gql/queries';

export function LessonPlanFields({ value, onChange, id }: {
  value: LessonLearningPlan | null; onChange: (value: LessonLearningPlan | null) => void; id: string;
}) {
  if (!value) return (
    <button type="button" className="btn-secondary" onClick={() => onChange(newLearningPlan())}>
      Add learning outcomes
    </button>
  );
  return (
    <fieldset className="learning-zone border border-warm-200 rounded-lg p-4 space-y-4 min-w-0">
      <legend className="text-sm font-semibold px-1">Learning outcomes</legend>
      <p className="text-sm text-gray-600">KICD Grade 10 reference · ChipuRobo mapping awaiting review.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor={`${id}-pathway`}>Learning pathway</label>
          <select id={`${id}-pathway`} className="field-input" value={value.pathwayId}
            onChange={(e) => onChange({ ...value, pathwayId: e.target.value })}>
            {learningPathways.map((path) => <option key={path.id} value={path.id}>{path.title}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor={`${id}-stage`}>Learning level</label>
          <select id={`${id}-stage`} className="field-input" value={value.level}
            onChange={(e) => onChange({ ...value, level: e.target.value as LearningLevel })}>
            {learningLevels.map((level) => <option key={level.id} value={level.id}>{level.title}</option>)}
          </select>
        </div>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold mb-2">Competencies to practise</legend>
        {competencies.map((competency) => (
          <label key={competency.id} className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" className="mt-1" checked={value.competencyIds.includes(competency.id)}
              onChange={(e) => onChange({ ...value, competencyIds: e.target.checked
                ? [...value.competencyIds, competency.id] : value.competencyIds.filter((item) => item !== competency.id) })} />
            <span><span className="font-semibold">{competency.title}</span><br />{competency.outcomes[value.level]}</span>
          </label>
        ))}
      </fieldset>
      <div>
        <label className="field-label" htmlFor={`${id}-steps`}>Activity steps (one per line)</label>
        <textarea id={`${id}-steps`} rows={4} className="field-input" required maxLength={10000}
          value={value.steps.join('\n')} onChange={(e) => onChange({ ...value, steps: e.target.value.split('\n') })} />
      </div>
      <div>
        <label className="field-label" htmlFor={`${id}-evidence`}>What evidence should the learner show?</label>
        <textarea id={`${id}-evidence`} rows={2} className="field-input" required maxLength={5000}
          value={value.evidenceBrief} onChange={(e) => onChange({ ...value, evidenceBrief: e.target.value })} />
      </div>
      <details className="text-sm text-gray-600">
        <summary className="cursor-pointer text-teal-700">Curriculum source and review status</summary>
        <p className="mt-2">{learningFramework.source.verification}</p>
        <a className="text-teal-700 underline" href={learningFramework.source.listingUrl} target="_blank" rel="noopener noreferrer">KICD Grade 10 designs (opens in a new tab)</a>
      </details>
      <button type="button" className="text-sm text-gray-600 underline" onClick={() => onChange(null)}>Remove learning outcomes</button>
    </fieldset>
  );
}

export function LessonPlanEditor({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const [plan, setPlan] = useState<LessonLearningPlan | null>(lesson.learning_plan ?? newLearningPlan());
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => updateLesson(lesson.id, { learning_plan: plan ? cleanLearningPlan(plan) : null }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['lessons'] }); onClose(); },
  });
  function submit(event: FormEvent) { event.preventDefault(); mutation.mutate(); }
  return (
    <form onSubmit={submit} className="card p-4 space-y-4 learning-zone" aria-label={`Learning plan for ${lesson.title}`}>
      <h2 className="text-sm">Learning plan: {lesson.title}</h2>
      <LessonPlanFields id={`plan-${lesson.id}`} value={plan} onChange={setPlan} />
      {mutation.error && <p role="alert" className="text-sm text-red-700">{mutation.error.message}</p>}
      <div className="flex gap-3 flex-wrap">
        <button type="submit" className="btn-primary" disabled={mutation.isPending || (!!plan && !hasUsableLearningPlan(plan))}>
          {mutation.isPending ? 'Saving…' : 'Save learning plan'}
        </button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}
