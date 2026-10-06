import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchCurriculumLessons } from '../../lib/gql/queries';
import { fetchAssignments } from '../../lib/learningQueries';
import { learningLevels, type LearningLevel } from '../../lib/learningFramework';
import { hasUsableLearningPlan } from '../../lib/learningRecords';
import type { Lesson } from '../../lib/database.types';
import { AssignLessonForm } from './AssignLessonForm';

export function TeacherHomeActions() {
  const { school } = useAuth();
  const [level, setLevel] = useState<LearningLevel | 'all'>('all');
  const [assignFor, setAssignFor] = useState<Lesson | null>(null);
  const lessons = useQuery({
    queryKey: ['lessons', 'school', school?.id],
    queryFn: fetchCurriculumLessons,
    enabled: !!school,
  });
  const assignments = useQuery({
    queryKey: ['learning-assignments'],
    queryFn: () => fetchAssignments(),
    enabled: !!school,
  });
  const error = lessons.error ?? assignments.error;
  return (
    <div className="learning-zone space-y-6 mt-8">
      {assignFor && (
        <AssignLessonForm
          key={assignFor.id}
          lesson={assignFor}
          onClose={() => setAssignFor(null)}
        />
      )}
      {error && (
        <p role="alert" className="text-red-700 text-sm">
          {error.message}
        </p>
      )}
      <section aria-label="Quick lesson actions" className="space-y-4">
        <div className="flex justify-between gap-3 flex-wrap items-end">
          <h2>Assign a lesson</h2>
          <label className="text-sm">
            Learning level
            <select
              className="field-select mt-1"
              value={level}
              onChange={(e) => setLevel(e.target.value as LearningLevel | 'all')}
            >
              <option value="all">All learning levels</option>
              {learningLevels.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        {lessons.isPending && <p role="status">Loading lesson actions…</p>}
        <div className="grid sm:grid-cols-2 gap-4">
          {lessons.data
            ?.filter(
              (lesson) =>
                hasUsableLearningPlan(lesson.learning_plan) &&
                (level === 'all' || lesson.learning_plan.level === level),
            )
            .slice(0, 6)
            .map((lesson) => (
              <article key={lesson.id} className="card p-5 space-y-3" aria-label={lesson.title}>
                <span className="badge-teal">
                  {learningLevels.find((item) => item.id === lesson.learning_plan?.level)?.title}
                </span>
                <h3>{lesson.title}</h3>
                <p className="text-sm">{lesson.description}</p>
                <div className="flex gap-3 flex-wrap">
                  <button className="btn-primary" onClick={() => setAssignFor(lesson)}>
                    Assign lesson
                  </button>
                  <Link className="btn-secondary" to={`/dashboard/school/lessons/${lesson.id}`}>
                    Open lesson
                  </Link>
                </div>
              </article>
            ))}
        </div>
        {!lessons.isPending &&
          !error &&
          !lessons.data?.some((lesson) => hasUsableLearningPlan(lesson.learning_plan)) && (
            <p>No lessons with learning outcomes are published yet.</p>
          )}
        <Link className="text-teal-700 underline text-sm" to="/dashboard/school/lessons">
          Browse all lessons and capstones
        </Link>
      </section>
      <section aria-label="Recent assignments" className="card p-5 space-y-3">
        <h2>Review assigned work</h2>
        {assignments.isPending && <p role="status">Loading assignments…</p>}
        {!assignments.isPending && !error && !assignments.data?.length && (
          <p className="text-sm">Assign a lesson to start collecting learner work.</p>
        )}
        <ul className="list-none m-0 p-0 space-y-3">
          {assignments.data?.slice(0, 5).map((item) => (
            <li key={item.id} className="flex justify-between gap-3 flex-wrap text-sm">
              <span>{item.title}</span>
              <Link className="underline" to={`/dashboard/assignments/${item.id}`}>
                Review assignment
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
