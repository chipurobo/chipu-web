import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchCurriculumLessons } from '../../lib/gql/queries';
import { hasUsableLearningPlan } from '../../lib/learningRecords';
import type { Lesson } from '../../lib/database.types';
import { AssignLessonForm } from './AssignLessonForm';

export function TeacherHomeActions() {
  const { school } = useAuth();
  const [assignFor, setAssignFor] = useState<Lesson | null>(null);
  const lessons = useQuery({
    queryKey: ['lessons', 'school', school?.id],
    queryFn: fetchCurriculumLessons,
    enabled: !!school,
  });
  const error = lessons.error;
  const visibleLessons = lessons.data
    ?.filter((lesson) => hasUsableLearningPlan(lesson.learning_plan))
    .slice(0, 6);
  const closeAssign = () => {
    const lessonId = assignFor?.id;
    setAssignFor(null);
    if (lessonId) requestAnimationFrame(() => document.getElementById(`home-assign-${lessonId}`)?.focus());
  };

  return (
    <section aria-label="Quick lesson actions">
      {error && (
        <p role="alert" className="text-red-700 text-sm">
          {error.message}
        </p>
      )}
      <details id="assign-lesson" className="learner-card scroll-mt-4 overflow-hidden">
        <summary className="cursor-pointer px-5 py-4 text-lg font-extrabold text-slate-900"><span aria-hidden="true">➕ </span>Assign lesson</summary>
        <div className="space-y-4 border-t border-slate-200 p-5">
          {lessons.isPending && <p role="status">Loading…</p>}
          <ul className="divide-y divide-slate-200">
            {visibleLessons?.map((lesson) => (
              <li key={lesson.id} className="py-4">
                <article className="space-y-3" aria-label={lesson.title}>
                  <div className="flex items-center gap-3">
                    <h3>{lesson.title}</h3>
                    {lesson.description && <p className="sr-only">{lesson.description}</p>}
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button id={`home-assign-${lesson.id}`} className="btn-primary" onClick={() => setAssignFor(lesson)} aria-label={`Assign ${lesson.title}`}>
                      Assign
                    </button>
                    <Link className="btn-secondary" to={`/dashboard/school/lessons/${lesson.id}`} aria-label={`Open ${lesson.title}`}>
                      Open
                    </Link>
                  </div>
                  {assignFor?.id === lesson.id && <AssignLessonForm key={lesson.id} lesson={lesson} onClose={closeAssign} />}
                </article>
              </li>
            ))}
          </ul>
          {!lessons.isPending && !error && !visibleLessons?.length && <p>None yet.</p>}
          <Link className="text-sm font-bold text-teal-700 underline" to="/dashboard/school/lessons">
            All lessons
          </Link>
        </div>
      </details>
    </section>
  );
}
