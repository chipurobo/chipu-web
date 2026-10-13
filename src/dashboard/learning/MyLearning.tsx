import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchAssignments, fetchBlocklyLessons, fetchEvidence, fetchSubmissions, startBlocklyLesson } from '../../lib/learningQueries';
import { fetchQuizAttempts } from '../../lib/learningOutcomes';
import { learningLevels, type LearningLevel } from '../../lib/learningFramework';
import { activityStatus, artThemeFor, computeStats, firstName, levelLook, statusLook } from '../../lib/learnerCopy';
import { LearnerPage, Hero, XpBar, LevelChip, StatusChip, FriendlyAlert, Loading, EmptyNote } from './ui/LearnerKit';
import { LessonArt } from './ui/LearnerArt';

const quickLinks = [
  { to: '/dashboard/quizzes',     emoji: '🧠', label: 'Quizzes',  tone: 'from-violet-200 to-fuchsia-100' },
  { to: '/dashboard/my-projects', emoji: '🏗️', label: 'Projects', tone: 'from-amber-200 to-orange-100' },
  { to: '/dashboard/my-progress', emoji: '🗺️', label: 'Journey',  tone: 'from-sky-200 to-cyan-100' },
  { to: '/dashboard/portfolio',   emoji: '🖼️', label: 'Showcase', tone: 'from-pink-200 to-rose-100' },
];

/** One visible word per state; the lesson title follows for screen readers. */
const actionWord = { ready: 'Start', sent: 'Open', replied: 'Feedback' } as const;

export function MyLearning() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [level, setLevel] = useState<LearningLevel | 'all'>('all');
  const lessons = useQuery({ queryKey: ['blockly-lessons'], queryFn: fetchBlocklyLessons });
  const start = useMutation({ mutationFn: startBlocklyLesson, onSuccess: (id) => {
    void qc.invalidateQueries({ queryKey: ['learning-assignments'] }); navigate(`/dashboard/assignments/${id}`);
  } });
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions() });
  const reviews = useQuery({ queryKey: ['competency-evidence'], queryFn: () => fetchEvidence() });
  const attempts = useQuery({ queryKey: ['quiz-attempts'], queryFn: fetchQuizAttempts });
  const error = assignments.error ?? submissions.error ?? reviews.error ?? lessons.error;
  const loading = assignments.isPending || submissions.isPending || reviews.isPending;
  const stats = computeStats({ assignments: assignments.data, submissions: submissions.data, evidence: reviews.data, attempts: attempts.data });
  const activities = assignments.data ?? [];
  const featuredId = activities.find((item) => activityStatus(item.id, submissions.data, reviews.data) === 'ready')?.id ?? activities[0]?.id;
  const catalogue = lessons.data?.filter((lesson) => lesson.learning_plan?.delivery === 'blockly' && (level === 'all' || lesson.learning_plan.level === level)) ?? [];

  return (
    <LearnerPage>
      <Hero title={<>Hi, {firstName(profile?.full_name)}! <span aria-hidden="true">👋</span></>}>
        <XpBar stats={stats} />
        <nav aria-label="Quick links" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickLinks.map((item) => (
            <Link key={item.to} to={item.to} className={`learner-card learner-card-hover flex flex-col items-center gap-1 bg-gradient-to-br p-3 text-center ${item.tone}`}>
              <span className="text-4xl" aria-hidden="true">{item.emoji}</span>
              <span className="text-sm font-extrabold text-slate-900">{item.label}</span>
            </Link>
          ))}
        </nav>
      </Hero>

      <FriendlyAlert error={error} />
      {loading && <Loading>Loading your lessons</Loading>}

      {!loading && !error && (
        <section aria-label="My activities" className="space-y-4">
          <h2><span aria-hidden="true">🎒 </span>Working on</h2>
          {!activities.length && <EmptyNote emoji="🧩" title="Pick a lesson below" body="Anything your teacher sets for you will show up here too." />}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((assignment) => {
              const status = activityStatus(assignment.id, submissions.data, reviews.data);
              const featured = assignment.id === featuredId;
              const theme = artThemeFor(assignment.title, { pathwayId: assignment.learning_plan.pathwayId, capstone: assignment.learning_plan.activityKind === 'capstone' });
              return (
                <article key={assignment.id} aria-label={assignment.title}
                  className={`learner-card learner-card-hover flex flex-col overflow-hidden ${featured ? 'sm:col-span-2 lg:col-span-2 lg:flex-row' : ''}`}>
                  <LessonArt theme={theme} className={featured ? 'w-full lg:w-2/5 shrink-0' : 'w-full'} />
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-center gap-2"><LevelChip level={assignment.learning_plan.level} /><StatusChip status={status} />
                      {assignment.due_date && <span className="text-sm font-bold text-slate-600"><span aria-hidden="true">📅 </span><span className="sr-only">Due </span>{assignment.due_date}</span>}</div>
                    <h3>{assignment.title}</h3>
                    <Link className={`${status === 'ready' ? 'btn-play' : 'btn-primary'} mt-auto self-start`} to={`/dashboard/assignments/${assignment.id}`} title={statusLook[status].action}>
                      {actionWord[status]}<span className="sr-only"> {assignment.title}</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-4" aria-label="Blockly lessons">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2><span aria-hidden="true">🧩 </span>Lessons</h2>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Learning level</legend>
            {([{ id: 'all' as const, emoji: '✨', title: 'All' }, ...learningLevels.map((item) => ({ id: item.id, emoji: levelLook[item.id].emoji, title: item.title }))]).map((option) => (
              <label key={option.id} className="learner-pill text-xl" title={option.title}>
                <input type="radio" name="lesson-level" value={option.id} checked={level === option.id} onChange={() => setLevel(option.id)} />
                <span aria-hidden="true">{option.emoji}</span><span className="sr-only">{option.title}</span>
              </label>
            ))}
          </fieldset>
        </div>
        {lessons.isPending && <Loading>Loading lessons</Loading>}
        <FriendlyAlert error={start.error} />
        {!lessons.isPending && !catalogue.length && <EmptyNote emoji="🔍" title="None here" body="Try a different level above." />}
        <div className="lesson-path">
          {catalogue.map((lesson, index) => {
            const existing = activities.find((assignment) => assignment.lesson_id === lesson.id);
            const lessonLevel = lesson.learning_plan?.level ?? 'beginner';
            const status = existing ? activityStatus(existing.id, submissions.data, reviews.data) : null;
            return (
              <article key={lesson.id} aria-label={`Blockly lesson: ${lesson.title}`}
                className={`learner-card learner-card-hover flex flex-col overflow-hidden bg-gradient-to-b ${levelLook[lessonLevel].gradient}`}>
                <div className="relative">
                  <LessonArt theme={artThemeFor(lesson.title)} className="w-full" />
                  <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-extrabold text-white shadow" aria-hidden="true">{index + 1}</span>
                  <span className="absolute right-3 top-3 flex gap-1"><LevelChip level={lessonLevel} />{status && <StatusChip status={status} />}</span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <h3><span className="sr-only">Lesson {index + 1} of {catalogue.length}: </span>{lesson.title}</h3>
                  <p className="sr-only">{lesson.description}</p>
                  {existing ? <Link className="btn-primary mt-auto self-start" to={`/dashboard/assignments/${existing.id}`}>Continue<span className="sr-only"> {lesson.title}</span></Link>
                    : <button type="button" className="btn-play mt-auto self-start" disabled={start.isPending || assignments.isPending || !!assignments.error} onClick={() => start.mutate(lesson.id)}>
                      {start.isPending && start.variables === lesson.id ? 'Starting…' : <>Start<span className="sr-only"> {lesson.title}</span></>}</button>}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </LearnerPage>
  );
}
