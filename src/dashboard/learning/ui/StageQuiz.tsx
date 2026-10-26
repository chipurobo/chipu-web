/**
 * A short check inside a lesson: before it starts, during it, or at the end.
 * Uses the same quiz records and server-side marking as the Quizzes page.
 * Answers are marked right away, with the reason for each one, and the
 * learner can always try again.
 */
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchQuizAttempts, listQuizzes, submitQuiz, type QuizStage } from '../../../lib/learningOutcomes';
import { FriendlyAlert } from './LearnerKit';

const shapes = ['▲', '◆', '●', '■', '★', '♥'];

export function StageQuiz({ lessonId, stage, title }: { lessonId: string; stage: QuizStage; title: string }) {
  const qc = useQueryClient();
  const quizzes = useQuery({ queryKey: ['learning-quizzes'], queryFn: listQuizzes });
  const attempts = useQuery({ queryKey: ['quiz-attempts'], queryFn: fetchQuizAttempts });
  const quiz = quizzes.data?.find((item) => item.lesson_id === lessonId && item.stage === stage);
  const latest = quiz ? attempts.data?.find((attempt) => attempt.quiz_id === quiz.id) : undefined;
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [again, setAgain] = useState(false);
  // Checking or retrying swaps the form for the result (or back), which
  // removes the button that had focus. Move focus to what replaced it so
  // VoiceOver, NVDA and JAWS read the score, or the quiz again, straight away.
  const [focusTarget, setFocusTarget] = useState<'result' | 'heading' | null>(null);
  const result = useRef<HTMLParagraphElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const submit = useMutation({
    mutationFn: () => submitQuiz(quiz!.id, answers),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['quiz-attempts'] }); setAgain(false); setAnswers({}); setFocusTarget('result'); },
  });
  useEffect(() => {
    if (!focusTarget) return;
    (focusTarget === 'result' ? result : heading).current?.focus();
    setFocusTarget(null);
  });
  if (!quiz) return null;
  const showResult = !!latest && !again;
  const score = latest?.feedback.filter((item) => item.correct).length ?? 0;
  const headingId = `check-${stage}`;

  return (
    <section aria-labelledby={headingId} className="learner-card space-y-4 p-5">
      <h3 id={headingId} ref={heading} tabIndex={-1} className="focus:outline-none"><span aria-hidden="true">{stage === 'end' ? '🏁 ' : '❓ '}</span>{title}</h3>
      {showResult ? (
        <div className="space-y-3">
          <p ref={result} tabIndex={-1} className="text-lg font-extrabold text-slate-900 focus:outline-none">
            {score === latest.feedback.length ? 'Brilliant! ' : score ? 'Nice try! ' : 'Good effort! '}
            You got {score} of {latest.feedback.length} right.
          </p>
          <ol className="space-y-2">
            {latest.feedback.map((item, index) => (
              <li key={item.id} className={`rounded-2xl p-3 text-sm ${item.correct ? 'bg-teal-50 text-teal-950' : 'bg-slate-100 text-slate-900'}`}>
                <p className="font-bold">{index + 1}. {latest.question_snapshot.questions.find((question) => question.id === item.id)?.prompt}</p>
                <p className="mt-1">
                  <span aria-hidden="true">{item.correct ? '✅ ' : '💡 '}</span>
                  <span className="sr-only">{item.correct ? 'Yes, that’s right! ' : 'Not quite. Here’s a tip: '}</span>{item.explanation}
                </p>
              </li>
            ))}
          </ol>
          <button type="button" className="btn-secondary" onClick={() => { setAgain(true); setFocusTarget('heading'); }}>Try again</button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); submit.mutate(); }}>
          {quiz.questions.map((question, index) => (
            <fieldset key={question.id} className="space-y-3">
              <legend className="text-base font-extrabold text-slate-900">
                <span className="sr-only">Question {index + 1} of {quiz.questions.length}: </span>{question.prompt}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.choices.map((choice, n) => (
                  <label key={n} className="quiz-tile">
                    <input type="radio" required name={`${quiz.id}-${question.id}`} checked={answers[question.id] === n}
                      onChange={() => setAnswers((current) => ({ ...current, [question.id]: n }))} />
                    <span className="quiz-shape" aria-hidden="true">{shapes[n % shapes.length]}</span>
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <FriendlyAlert error={submit.error} />
          <button className="btn-primary" disabled={submit.isPending}>{submit.isPending ? 'Checking…' : 'Check my answers'}</button>
        </form>
      )}
    </section>
  );
}
