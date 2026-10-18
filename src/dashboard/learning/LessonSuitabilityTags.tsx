import type { Lesson } from '../../lib/database.types';
import { learningLevels } from '../../lib/learningFramework';
import { LEARNING_NEEDS } from './lessonSuitability';

function rangeLabel(prefix: string, minimum: number | null, maximum: number | null) {
  if (minimum !== null && maximum !== null) return `${prefix} ${minimum}–${maximum}`;
  if (minimum !== null) return `${prefix} ${minimum}+`;
  if (maximum !== null) return `${prefix} up to ${maximum}`;
  return null;
}

export function LessonSuitabilityTags({ lesson }: { lesson: Lesson }) {
  const age = rangeLabel('Ages', lesson.minimum_age, lesson.maximum_age);
  const grade = rangeLabel('Grades', lesson.minimum_grade, lesson.maximum_grade);
  const competency = learningLevels.find((item) => item.id === lesson.learning_plan?.level)?.title;
  const tags = [age, grade, competency, ...(lesson.learning_needs ?? []).map((need) =>
    LEARNING_NEEDS.find((item) => item.id === need)?.label ?? need)];

  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Lesson suitability">
      {tags.filter(Boolean).map((tag) => <span key={tag} className="badge-gray">{tag}</span>)}
      {!tags.some(Boolean) && <span className="text-xs text-gray-500">Suitable for all learners</span>}
    </div>
  );
}
