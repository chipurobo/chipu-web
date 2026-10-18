import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  fetchCurriculumLessons,
  fetchPassedCompletionsWithStudent,
} from '../../lib/gql/queries';
import { useAuth } from '../../lib/auth';
import type { StageKind } from '../../lib/database.types';
import { BookOpen, Laptop, MonitorPlay, FolderKanban, ArrowRight, GraduationCap, Megaphone, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { fetchLearningStudents } from '../../lib/learningQueries';
import { AssignLessonForm } from '../learning/AssignLessonForm';
import { learningLevels, learningPathways } from '../../lib/learningFramework';
import { hasUsableLearningPlan } from '../../lib/learningRecords';
import { levelLook } from '../../lib/learnerCopy';
import type { Lesson, LearningNeed } from '../../lib/database.types';
import { SkeletonCards } from '../components/Skeletons';
import { safeHttpUrl } from '../../lib/safeUrl';
import { LevelFilter } from '../components/LevelFilter';
import { matchesLevel, LEVEL_LABEL, type LevelChoice } from '../components/levels';
import { LessonSuitabilityTags } from '../learning/LessonSuitabilityTags';
import { LEARNING_NEEDS } from '../learning/lessonSuitability';

// =============================================================
// /dashboard/school/lessons
//
// The curriculum. Lessons stand alone — a school no longer has to be
// list). Each lesson shows title · kind · points · how many students have
// passed. Click in to tick off completions on the full class list.
// =============================================================

const STAGE_KIND_LABEL: Record<StageKind, string> = {
  outreach:          'Outreach',
  bootcamp_physical: 'Bootcamp (Physical)',
  bootcamp_virtual:  'Bootcamp (Virtual)',
  lesson:            'Lesson',
  async_track:       'Self-paced track',
  project:           'Project',
};

const STAGE_KIND_ICON: Record<StageKind, typeof BookOpen> = {
  outreach:          Megaphone,
  bootcamp_physical: Laptop,
  bootcamp_virtual:  MonitorPlay,
  lesson:            BookOpen,
  async_track:       LinkIcon,
  project:           FolderKanban,
};

const STAGE_KIND_BADGE: Record<StageKind, string> = {
  outreach:          'badge-terra',
  bootcamp_physical: 'badge-amber',
  bootcamp_virtual:  'badge-teal',
  lesson:            'badge-teal',
  async_track:       'badge-amber',
  project:           'badge-terra',
};

interface CompletionCountRow {
  lesson_id: string;
  student_id: string;
}

export function SchoolLessons() {
  const [assignFor, setAssignFor] = useState<Lesson | null>(null);
  const [level, setLevel] = useState<LevelChoice>('all');
  const [learnLevel, setLearnLevel] = useState<'all' | 'beginner' | 'intermediate' | 'expert'>('all');
  const [learnerAge, setLearnerAge] = useState('all');
  const [learnerGrade, setLearnerGrade] = useState('all');
  const [learningNeed, setLearningNeed] = useState<'all' | LearningNeed>('all');
  const { school, profile } = useAuth();
  const schoolId = school?.id ?? null;

  // The whole active curriculum. Request training on any of it via Workshops.
  const lessonsQuery = useQuery({
    queryKey: ['lessons', 'school', schoolId],
    queryFn: fetchCurriculumLessons,
    enabled: !!schoolId,
  });

  // Students at the school — used to scope the "students passed" count
  // because RLS will hand us back rows from any school we can read, and
  // we always want the count to be of THIS school's students.
  const studentsQuery = useQuery({
    queryKey: ['learning-students', schoolId],
    queryFn: () => fetchLearningStudents(schoolId!),
    enabled: !!schoolId,
  });

  // Lesson completions touching this school's students.
  const completionsQuery = useQuery({
    queryKey: ['lesson-completions', 'school', schoolId],
    queryFn: async (): Promise<CompletionCountRow[]> => {
      // Pull (lesson_id, student_id) for every passed completion belonging
      // to one of our students.
      const all = await fetchPassedCompletionsWithStudent();
      return all
        .filter((r) => r.student?.school_id === schoolId)
        .map((r) => ({ lesson_id: r.lesson_id, student_id: r.student_id }));
    },
    enabled: !!schoolId,
  });

  const isTeacher = profile?.role === 'teacher';
  const [showAll, setShowAll] = useState(false);
  // Teachers assign learning lessons; the wider curriculum catalogue only adds noise for them.
  const lessons      = lessonsQuery.data
    ? (isTeacher && !showAll ? lessonsQuery.data.filter((l) => hasUsableLearningPlan(l.learning_plan)) : lessonsQuery.data)
    : null;
  const students     = studentsQuery.data ?? null;
  const completions  = completionsQuery.data ?? null;

  const passedByLesson = useMemo(() => {
    const m = new Map<string, number>();
    if (!completions) return m;
    completions.forEach((c) => m.set(c.lesson_id, (m.get(c.lesson_id) ?? 0) + 1));
    return m;
  }, [completions]);

  const activeStudentCount = students?.filter((s) => s.is_active).length ?? 0;

  const err =
    lessonsQuery.error?.message
    ?? studentsQuery.error?.message
    ?? completionsQuery.error?.message
    ?? null;

  const visibleLessons = lessons?.filter((lesson) => {
    if (!isTeacher) return matchesLevel(lesson.level, level);
    const age = learnerAge === 'all' ? null : Number(learnerAge);
    const grade = learnerGrade === 'all' ? null : Number(learnerGrade);
    return (learnLevel === 'all' || lesson.learning_plan?.level === learnLevel)
      && (age === null || ((lesson.minimum_age === null || lesson.minimum_age <= age) && (lesson.maximum_age === null || lesson.maximum_age >= age)))
      && (grade === null || ((lesson.minimum_grade === null || lesson.minimum_grade <= grade) && (lesson.maximum_grade === null || lesson.maximum_grade >= grade)))
      && (learningNeed === 'all' || (lesson.learning_needs ?? []).includes(learningNeed));
  });

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
          {school?.name ?? 'Your school'}
        </p>
        <h1>Lessons</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          {isTeacher ? 'Pick a lesson and assign it to your learners.' : 'Assign lessons to your students, review their work and record evidence of learning.'}
        </p>
        {isTeacher && <p className="mt-1 text-xs font-medium text-teal-800">Only reviewed and approved lessons are shown.</p>}
        {activeStudentCount > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {activeStudentCount} active student{activeStudentCount === 1 ? '' : 's'} on the roster.
          </p>
        )}
      </div>

      {assignFor && <AssignLessonForm key={assignFor.id} lesson={assignFor} onClose={() => setAssignFor(null)} />}

      {isTeacher ? (
        <div className="card space-y-4 p-4" aria-label="Curate lessons">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Learning level</legend>
            {([{ id: 'all', emoji: '✨', title: 'All' }, ...learningLevels.map((item) => ({ id: item.id, emoji: levelLook[item.id].emoji, title: item.title }))]).map((option) => (
              <label key={option.id} className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-sm ${learnLevel === option.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700'}`}>
                <input type="radio" name="teacher-lesson-level" className="sr-only" value={option.id} checked={learnLevel === option.id} onChange={() => setLearnLevel(option.id as typeof learnLevel)} />
                <span aria-hidden="true">{option.emoji}</span>{option.title}
              </label>
            ))}
            </fieldset>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={showAll} onChange={(event) => setShowAll(event.target.checked)} />Show the full curriculum</label>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm text-gray-700">Learner age
              <select className="field-input mt-1" value={learnerAge} onChange={(event) => setLearnerAge(event.target.value)}>
                <option value="all">All ages</option>
                {Array.from({ length: 22 }, (_, index) => index + 4).map((age) => <option key={age} value={age}>{age} years</option>)}
              </select>
            </label>
            <label className="text-sm text-gray-700">Grade
              <select className="field-input mt-1" value={learnerGrade} onChange={(event) => setLearnerGrade(event.target.value)}>
                <option value="all">All grades</option>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((grade) => <option key={grade} value={grade}>Grade {grade}</option>)}
              </select>
            </label>
            <label className="text-sm text-gray-700">Learning need
              <select className="field-input mt-1" value={learningNeed} onChange={(event) => setLearningNeed(event.target.value as 'all' | LearningNeed)}>
                <option value="all">All learning needs</option>
                {LEARNING_NEEDS.map((need) => <option key={need.id} value={need.id}>{need.label}</option>)}
              </select>
            </label>
          </div>
        </div>
      ) : (
      <LevelFilter
        value={level}
        onChange={setLevel}
        counts={{
          all: lessons?.length,
          primary: lessons?.filter((l) => matchesLevel(l.level, 'primary')).length,
          secondary: lessons?.filter((l) => matchesLevel(l.level, 'secondary')).length,
        }}
      />
      )}

      {err && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {!lessons && <SkeletonCards count={3} label="Loading lessons" />}

      {visibleLessons && visibleLessons.length === 0 && (
        <div className="card p-8 text-center">
          <BookOpen className="h-7 w-7 text-gray-300 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-gray-600">{lessons?.length ? 'No lessons match these filters.' : 'No lessons yet.'}</p>
          <p className="text-xs text-gray-500 mt-1">
            {lessons?.length ? 'Try a different age, grade, competency level or learning need.' : 'No lessons published yet. Once ChipuRobo adds them you can request a workshop on any of them.'}
          </p>
        </div>
      )}

      {visibleLessons && visibleLessons.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {visibleLessons.map((s) => {
            const Icon = STAGE_KIND_ICON[s.kind];
            const badge = STAGE_KIND_BADGE[s.kind];
            const passed = passedByLesson.get(s.id) ?? 0;
            const contribution = passed * s.points;
            return (
              <article key={s.id} className="card p-4 flex flex-col">
                <div className="flex items-start gap-3 mb-2 min-w-0">
                  <div className="p-2 rounded-md bg-warm-100 flex-shrink-0">
                    <Icon className="h-5 w-5 text-gray-700" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="m-0 text-sm">{s.title}</h2>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {!isTeacher && <span className={`${badge}`}>{STAGE_KIND_LABEL[s.kind]}</span>}
                      {!isTeacher && <span className="text-xs text-gray-500">{s.points} pt{s.points === 1 ? '' : 's'}</span>}
                      {!isTeacher && <span className="badge-gray">{LEVEL_LABEL[s.level]}</span>}
                      {s.learning_plan && <span className="badge-teal">{s.learning_plan.activityKind === 'capstone' ? '🏗️ ' : ''}{learningLevels.find((level) => level.id === s.learning_plan?.level)?.title}</span>}
                      {!isTeacher && s.required_for_certificate && (
                        <span className="badge-amber inline-flex items-center">
                          <GraduationCap className="h-3 w-3 mr-1" aria-hidden="true" />
                          required
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {s.description && (
                  <p className="text-sm text-gray-700 mb-2">{s.description}</p>
                )}

                {s.learning_plan && !isTeacher && <p className="text-sm text-gray-600 mb-2">
                  {learningPathways.find((path) => path.id === s.learning_plan?.pathwayId)?.title} · {s.learning_plan.competencyIds.length} competencies
                </p>}

                {isTeacher && <div className="mb-3"><LessonSuitabilityTags lesson={s} /></div>}

                {/* The resource is the lesson, for a self-paced track. Rendered
                    through safeHttpUrl so a non-http(s) value is refused rather
                    than turned into an href. */}
                {safeHttpUrl(s.resource_url) && (
                  <a
                    href={safeHttpUrl(s.resource_url)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-700 hover:underline inline-flex items-center gap-1 mb-3 break-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    Open the resource
                  </a>
                )}

                <div className="mt-auto pt-3 border-t border-warm-200 flex items-center justify-between gap-3">
                  {profile?.role !== 'teacher' && <div className="text-xs text-gray-600">
                    <span className="font-medium text-gray-900">{passed}</span> passed
                    {s.points > 0 && (
                      <> · <span className="font-medium text-gray-900">{contribution}</span> pt{contribution === 1 ? '' : 's'} earned</>
                    )}
                  </div>}
                  <div className="flex gap-3 items-center flex-wrap">
                  <button type="button" className="btn-secondary !text-xs" disabled={!hasUsableLearningPlan(s.learning_plan)}
                    onClick={() => setAssignFor(s)} title={!s.learning_plan ? 'Learning outcomes must be set first' : undefined}>Assign lesson</button>
                  <Link
                    to={`/dashboard/school/lessons/${s.id}`}
                    className="text-xs text-teal-700 hover:underline inline-flex items-center"
                  >
                    Open lesson
                    <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
                  </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
