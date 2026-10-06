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
  const error = quizzes.error ?? attempts.error ?? students.error;
  return (
    <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 max-w-6xl space-y-6">
      <h1>Knowledge checks</h1>
      <p className="text-sm">
        Check understanding alongside Blockly practice. A quiz score alone does not award a learning
        level.
      </p>
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
              <p className="text-sm">
                {quiz.level} · Version {quiz.version} · {quiz.questions.length} questions · Pass
                mark {quiz.pass_percent}%
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
        <h2>{learner ? 'My quiz results' : 'Learner quiz results'}</h2>
        {attempts.isPending && <p role="status">Loading quiz results…</p>}
        {!attempts.isPending && !error && !attempts.data?.length && <p>No quiz attempts yet.</p>}
        {attempts.data?.map((attempt) => (
          <article className="card p-5 space-y-3" key={attempt.id}>
            <h3>
              {attempt.question_snapshot.title} · Version {attempt.question_snapshot.version}
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
function QuizForm({ quiz, close }: { quiz: LearningQuiz; close: () => void }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const qc = useQueryClient();
  const submit = useMutation({
    mutationFn: () => submitQuiz(quiz.id, answers),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['quiz-attempts'] });
      void qc.invalidateQueries({ queryKey: ['progression-readiness'] });
      close();
    },
  });
  return (
    <form
      className="card p-5 space-y-5"
      aria-label={`Answer ${quiz.title}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit.mutate();
      }}
    >
      <h2>{quiz.title}</h2>
      <p className="text-sm">
        Choose one answer per question. There is no timer. You can retake the quiz; each attempt is
        kept.
      </p>
      {quiz.questions.map((q, i) => (
        <fieldset key={q.id} className="space-y-2">
          <legend className="font-medium">
            {i + 1}. {q.prompt}
          </legend>
          {q.choices.map((choice, n) => (
            <label key={n} className="flex items-start gap-3 text-sm cursor-pointer">
              <input
                type="radio"
                required
                name={`answer-${q.id}`}
                checked={answers[q.id] === n}
                onChange={() => setAnswers((a) => ({ ...a, [q.id]: n }))}
              />
              {choice}
            </label>
          ))}
        </fieldset>
      ))}
      {submit.error && (
        <p role="alert" className="text-red-700">
          {submit.error.message}
        </p>
      )}
      <div className="flex gap-3">
        <button className="btn-primary" disabled={submit.isPending}>
          {submit.isPending ? 'Submitting…' : 'Submit answers'}
        </button>
        <button className="btn-secondary" type="button" disabled={submit.isPending} onClick={close}>
          Cancel quiz
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
