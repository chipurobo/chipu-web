import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { learningLevels, type LearningLevel } from '../../lib/learningFramework';
import {
  listQuizzes,
  fetchQuizAttempts,
  submitQuiz,
  publishQuiz,
  trackLearningActivity,
  type LearningQuiz,
  type QuizQuestion,
} from '../../lib/learningOutcomes';
import { fetchLearningStudents } from '../../lib/learningQueries';
import { fetchCurriculumLessons } from '../../lib/gql/queries';
import { levelLook, friendlyDate } from '../../lib/learnerCopy';
import { LearnerPage, Hero, LevelChip, FriendlyAlert, Loading, EmptyNote, Confetti, Cheer } from './ui/LearnerKit';
import { LessonArt } from './ui/LearnerArt';

export function LearningQuizzes() {
  const { profile, school } = useAuth();
  const students = useQuery({
    queryKey: ['learning-students', school?.id],
    queryFn: () => fetchLearningStudents(school!.id),
    enabled: !!school,
  });
  const learner = profile?.role === 'learner';
  const admin = profile?.role === 'admin';
  const quizzes = useQuery({ queryKey: ['learning-quizzes'], queryFn: listQuizzes });
  const attempts = useQuery({ queryKey: ['quiz-attempts'], queryFn: fetchQuizAttempts });
  const [selected, setSelected] = useState<LearningQuiz | null>(null);
  const [params] = useSearchParams();
  const initialLevel = params.get('level');
  const [level, setLevel] = useState<LearningLevel | 'all'>(
    learningLevels.some((l) => l.id === initialLevel) ? (initialLevel as LearningLevel) : 'all',
  );
  const [editing, setEditing] = useState(false);
  const [justFinished, setJustFinished] = useState(false);
  const error = quizzes.error ?? attempts.error ?? students.error;
  const visible = quizzes.data?.filter((q) => level === 'all' || q.level === level) ?? [];
  const latest = attempts.data?.[0];
  if (learner) {
    return (
      <LearnerPage>
        <Confetti show={justFinished && !!latest?.passed} />
        <Hero title={<>Quizzes <span aria-hidden="true">🧠</span></>} blurb="No timer, and you can always have another go.">
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Learning level</legend>
            {([{ id: 'all' as const, emoji: '✨', title: 'All' }, ...learningLevels.map((item) => ({ id: item.id, emoji: levelLook[item.id].emoji, title: item.title }))]).map((option) => (
              <label key={option.id} className="learner-pill text-xl" title={option.title}>
                <input type="radio" name="quiz-level" value={option.id} checked={level === option.id} onChange={() => setLevel(option.id)} />
                <span aria-hidden="true">{option.emoji}</span><span className="sr-only">{option.title}</span>
              </label>
            ))}
          </fieldset>
        </Hero>
        <FriendlyAlert error={error} />
        {justFinished && latest && (latest.passed
          ? <Cheer title={`${latest.score}%`} body={`You passed with ${latest.score} percent. Scroll down to see each answer.`} />
          : <Cheer title={`${latest.score}%`} emoji="💪" body={`You scored ${latest.score} percent. Peek at the answers below, then have another go.`} />)}
        {quizzes.isPending && <Loading>Loading quizzes</Loading>}
        {!quizzes.isPending && !error && !visible.length && <EmptyNote emoji="🔍" title="None here" body="Try another level, or come back after your next lesson." />}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((quiz) => {
            const best = attempts.data?.filter((a) => a.quiz_id === quiz.id).reduce<number | null>((top, a) => (top === null || a.score > top ? a.score : top), null);
            return (
              <article className={`learner-card learner-card-hover flex flex-col overflow-hidden bg-gradient-to-b ${levelLook[quiz.level].gradient}`} key={quiz.id} aria-label={quiz.title}>
                <LessonArt theme="decision" className="w-full" />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center gap-2"><LevelChip level={quiz.level} /><h2>{quiz.title}</h2></div>
                  <p className="text-sm font-semibold text-slate-700"><span aria-hidden="true">❓ </span>{quiz.questions.length}<span className="sr-only"> questions</span> · <span aria-hidden="true">🎯 </span>{quiz.pass_percent}%<span className="sr-only"> to pass</span>{best !== null && <> · <span aria-hidden="true">🏅 </span><span className="sr-only">best </span>{best}%</>}</p>
                  <button className="btn-play mt-auto self-start" onClick={() => { setJustFinished(false); setSelected(quiz); trackLearningActivity('resource_open', quiz.lesson_id ?? undefined); }}>
                    <span aria-hidden="true">▶</span> Play<span className="sr-only"> {quiz.title}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {selected && <QuizForm key={selected.id} quiz={selected} close={() => setSelected(null)} onFinished={() => setJustFinished(true)} />}
        <section className="space-y-4" aria-label="Quiz results">
          <h2><span aria-hidden="true">🏆 </span>Scores</h2>
          {attempts.isPending && <Loading>Loading your scores</Loading>}
          {!attempts.isPending && !error && !attempts.data?.length && <p className="text-sm text-slate-600"><span aria-hidden="true">— </span>None yet<span className="sr-only">. Play a quiz to get your first score.</span></p>}
          {attempts.data?.map((attempt) => (
            <article className={`learner-card p-5 space-y-3 ${attempt.passed ? 'border-emerald-300' : ''}`} key={attempt.id}>
              <div className="flex items-center gap-3">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold ${attempt.passed ? 'bg-emerald-700 text-white' : 'bg-amber-200 text-amber-900'}`}>{attempt.score}%</span>
                <div>
                  <h3>{attempt.question_snapshot.title}</h3>
                  <p className="text-sm font-semibold text-slate-600">{friendlyDate(attempt.submitted_at)} · {attempt.score}% · {attempt.passed ? <><span aria-hidden="true">🎉</span><span className="sr-only">Passed</span></> : <><span aria-hidden="true">💪</span><span className="sr-only">Not passed yet, keep practising</span></>}</p>
                </div>
              </div>
              <details>
                <summary className="cursor-pointer font-extrabold text-slate-900"><span aria-hidden="true">🔎 </span><span>Answers</span></summary>
                <ol className="mt-3 space-y-3">
                  {attempt.feedback.map((f, index) => (
                    <li key={f.id} className={`rounded-2xl p-3 text-sm ${f.correct ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                      <p className="font-bold text-slate-900">{index + 1}. {attempt.question_snapshot.questions.find((q) => q.id === f.id)?.prompt}</p>
                      <p className="mt-1 text-slate-800">{f.correct ? <><span aria-hidden="true">✅ </span><span className="sr-only">Correct. </span></> : <><span aria-hidden="true">❌ </span><span className="sr-only">Not quite. </span></>}{f.explanation}</p>
                    </li>
                  ))}
                </ol>
              </details>
            </article>
          ))}
        </section>
      </LearnerPage>
    );
  }
  return (
    <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 max-w-6xl space-y-6">
      <h1>{admin ? 'Knowledge checks' : 'Quizzes'}</h1>
      <p className="text-sm text-gray-600">{admin ? 'Check understanding alongside Blockly practice. A quiz score alone does not award a learning level.' : 'Quizzes your learners can play, and their scores.'}</p>
      {admin && (
        <button className="btn-primary" onClick={() => setEditing(!editing)}>
          {editing ? 'Close quiz builder' : 'Publish a quiz version'}
        </button>
      )}
      {editing && <QuizBuilder />}
      {error && (
        <p role="alert" className="text-red-700">
          {error.message}
        </p>
      )}
      <label className="field-label">
        Learning level
        <select
          className="field-select max-w-xs"
          value={level}
          onChange={(e) => setLevel(e.target.value as LearningLevel | 'all')}
        >
          <option value="all">All levels</option>
          {learningLevels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </label>
      {quizzes.isPending && <p role="status">Loading knowledge checks…</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        {quizzes.data
          ?.filter((q) => level === 'all' || q.level === level)
          .map((quiz) => (
            <article className="card p-5 space-y-3" key={quiz.id}>
              <h2>{quiz.title}</h2>
              <p className="text-sm text-gray-600">
                {learningLevels.find((l) => l.id === quiz.level)?.title ?? quiz.level} · {quiz.questions.length} questions · pass at {quiz.pass_percent}%{admin && <> · v{quiz.version}</>}
              </p>
              {quiz.lesson_id && (
                <Link
                  className="underline text-sm"
                  to={
                    learner
                      ? '/dashboard/my-learning'
                      : `/dashboard/school/lessons/${quiz.lesson_id}`
                  }
                >
                  Open lesson activities
                </Link>
              )}
              {learner && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    setSelected(quiz);
                    trackLearningActivity('resource_open', quiz.lesson_id ?? undefined);
                  }}
                >
                  Start knowledge check
                </button>
              )}
            </article>
          ))}
      </div>
      {!quizzes.isPending && !error && !quizzes.data?.length && (
        <p>No knowledge checks have been published yet.</p>
      )}
      {selected && <QuizForm key={selected.id} quiz={selected} close={() => setSelected(null)} />}
      <section className="space-y-4" aria-label="Quiz results">
        <h2>{learner ? 'My quiz results' : 'Scores'}</h2>
        {attempts.isPending && <p role="status">Loading quiz results…</p>}
        {!attempts.isPending && !error && !attempts.data?.length && <p>No quiz attempts yet.</p>}
        {attempts.data?.map((attempt) => (
          <article className="card p-5 space-y-3" key={attempt.id}>
            <h3>
              {attempt.question_snapshot.title}{admin && <> · v{attempt.question_snapshot.version}</>}
            </h3>
            {!learner && (
              <p className="text-sm font-medium">
                Learner:{' '}
                {students.data?.find((student) => student.id === attempt.student_id)?.full_name ??
                  'Learner record unavailable in this school'}
              </p>
            )}
            <p className="text-sm">
              {new Date(attempt.submitted_at).toLocaleString()} · {attempt.score}% ·{' '}
              {attempt.passed ? 'Pass mark met' : 'Keep practising'}
            </p>
            <details>
              <summary className="cursor-pointer">Question feedback</summary>
              <ol className="list-decimal pl-5 space-y-3 mt-3">
                {attempt.feedback.map((f) => (
                  <li key={f.id}>
                    <p>{attempt.question_snapshot.questions.find((q) => q.id === f.id)?.prompt}</p>
                    <p>
                      {f.correct ? 'Correct.' : 'Review this idea.'} {f.explanation}
                    </p>
                  </li>
                ))}
              </ol>
            </details>
          </article>
        ))}
      </section>
    </div>
  );
}
const tileShapes = ['▲', '◆', '●', '■', '★', '♥'];
function QuizForm({ quiz, close, onFinished }: { quiz: LearningQuiz; close: () => void; onFinished?: () => void }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const qc = useQueryClient();
  const submit = useMutation({
    mutationFn: () => submitQuiz(quiz.id, answers),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['quiz-attempts'] });
      void qc.invalidateQueries({ queryKey: ['progression-readiness'] });
      onFinished?.();
      close();
    },
  });
  const answered = Object.keys(answers).length;
  return (
    <form
      className="learner-card p-5 space-y-6"
      aria-label={`Answer ${quiz.title}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit.mutate();
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2>{quiz.title}</h2>
        <p className="text-sm font-extrabold text-slate-600">{answered}/{quiz.questions.length}<span className="sr-only"> answered</span></p>
      </div>
      <p className="sr-only">Tap one answer for each question. Take your time. If you do not pass, you can play again.</p>
      {quiz.questions.map((q, i) => (
        <fieldset key={q.id} className="space-y-3">
          <legend className="text-lg font-extrabold text-slate-900">
            <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm text-white" aria-hidden="true">{i + 1}</span>
            {q.prompt}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {q.choices.map((choice, n) => (
              <label key={n} className={`quiz-tile quiz-tile-${n % tileShapes.length}`}>
                <input
                  type="radio"
                  required
                  name={`answer-${q.id}`}
                  checked={answers[q.id] === n}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: n }))}
                />
                <span className="quiz-shape" aria-hidden="true">{tileShapes[n % tileShapes.length]}</span>
                <span>{choice}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <FriendlyAlert error={submit.error} />
      <div className="flex flex-wrap gap-3">
        <button className="btn-play" disabled={submit.isPending}>
          <span aria-hidden="true">✅ </span>{submit.isPending ? 'Checking…' : 'Check'}<span className="sr-only"> my answers</span>
        </button>
        <button className="btn-secondary" type="button" disabled={submit.isPending} onClick={close}>
          <span aria-hidden="true">✖ </span>Close<span className="sr-only"> this quiz</span>
        </button>
      </div>
    </form>
  );
}
function QuizBuilder() {
  const qc = useQueryClient();
  const lessons = useQuery({ queryKey: ['quiz-lessons'], queryFn: fetchCurriculumLessons });
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [level, setLevel] = useState<LearningLevel>('beginner');
  const [lesson, setLesson] = useState('');
  const [pass, setPass] = useState(80);
  const [questions, setQuestions] = useState([
    { prompt: '', choices: ['', ''], correct: 0, explanation: '' },
  ]);
  const publish = useMutation({
    mutationFn: () =>
      publishQuiz({
        slug,
        title,
        level,
        lesson,
        pass,
        questions: questions.map(
          (q, i): QuizQuestion => ({ id: `q${i + 1}`, prompt: q.prompt, choices: q.choices }),
        ),
        solutions: Object.fromEntries(
          questions.map((q, i) => [
            `q${i + 1}`,
            { correct: q.correct, explanation: q.explanation },
          ]),
        ),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['learning-quizzes'] });
    },
  });
  const update = (i: number, value: Partial<(typeof questions)[number]>) =>
    setQuestions((q) => q.map((item, n) => (n === i ? { ...item, ...value } : item)));
  return (
    <form
      aria-label="Quiz builder"
      className="card p-5 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        publish.mutate();
      }}
    >
      <h2>Publish a quiz version</h2>
      <p className="text-sm">
        Use the same quiz identifier to publish a replacement. Previous attempts retain their
        questions and grading.
      </p>
      <label className="field-label">
        Quiz identifier
        <input
          required
          pattern="[a-z0-9][a-z0-9-]{2,79}"
          className="field-input"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </label>
      <label className="field-label">
        Quiz title
        <input
          required
          maxLength={200}
          className="field-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="field-label">
        Quiz level
        <select
          className="field-select"
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
      <label className="field-label">
        Related lesson
        <select className="field-select" value={lesson} onChange={(e) => setLesson(e.target.value)}>
          <option value="">Level-wide knowledge check</option>
          {lessons.data?.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </label>
      <label className="field-label">
        Pass mark (%)
        <input
          type="number"
          min={1}
          max={100}
          required
          className="field-input"
          value={pass}
          onChange={(e) => setPass(Number(e.target.value))}
        />
      </label>
      {questions.map((q, i) => (
        <fieldset className="border rounded-md p-4 space-y-3" key={i}>
          <legend>Question {i + 1}</legend>
          <label className="field-label">
            Question text
            <textarea
              required
              maxLength={2000}
              className="field-input"
              value={q.prompt}
              onChange={(e) => update(i, { prompt: e.target.value })}
            />
          </label>
          {q.choices.map((choice, n) => (
            <label className="field-label" key={n}>
              Answer choice {n + 1}
              <input
                required
                maxLength={1000}
                className="field-input"
                value={choice}
                onChange={(e) =>
                  update(i, { choices: q.choices.map((c, k) => (k === n ? e.target.value : c)) })
                }
              />
            </label>
          ))}
          <button
            type="button"
            className="btn-secondary"
            disabled={q.choices.length === 6}
            onClick={() => update(i, { choices: [...q.choices, ''] })}
          >
            Add answer choice
          </button>
          <label className="field-label">
            Correct answer
            <select
              className="field-select"
              value={q.correct}
              onChange={(e) => update(i, { correct: Number(e.target.value) })}
            >
              {q.choices.map((_, n) => (
                <option key={n} value={n}>
                  Choice {n + 1}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Feedback explanation
            <textarea
              required
              maxLength={2000}
              className="field-input"
              value={q.explanation}
              onChange={(e) => update(i, { explanation: e.target.value })}
            />
          </label>
        </fieldset>
      ))}
      <button
        className="btn-secondary"
        type="button"
        disabled={questions.length === 30}
        onClick={() =>
          setQuestions((q) => [
            ...q,
            { prompt: '', choices: ['', ''], correct: 0, explanation: '' },
          ])
        }
      >
        Add question
      </button>
      {publish.error && (
        <p role="alert" className="text-red-700">
          {publish.error.message}
        </p>
      )}
      {publish.isSuccess && <p role="status">Quiz version published.</p>}
      <button className="btn-primary" disabled={publish.isPending}>
        {publish.isPending ? 'Publishing…' : 'Publish quiz'}
      </button>
    </form>
  );
}
