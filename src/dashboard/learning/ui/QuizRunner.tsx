/**
 * A lesson quiz the Duolingo way: one question per screen, big answer tiles,
 * and the bottom bar's Next moves on (Check on the last question). The result
 * is one short line with stars. Marking happens on the server, as before.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchQuizAttempts, listQuizzes, submitQuiz, type QuizStage } from '../../../lib/learningOutcomes';
import { Confetti, FriendlyAlert } from './LearnerKit';

const shapes = ['▲', '◆', '●', '■', '★', '♥'];

export interface BarProps { back?: () => void; next?: () => void; nextLabel?: string; nextDisabled?: boolean }

export function QuizRunner({ lessonId, stage, onBack, onDone, doneText, bar }: {
  lessonId: string; stage: QuizStage;
  onBack?: () => void; onDone: (() => void) | null;
  /** Extra words under the score, e.g. on the last quiz of the lesson. */
  doneText?: string;
  bar: (props: BarProps) => ReactNode;
}) {
  const qc = useQueryClient();
  const quizzes = useQuery({ queryKey: ['learning-quizzes'], queryFn: listQuizzes });
  const attempts = useQuery({ queryKey: ['quiz-attempts'], queryFn: fetchQuizAttempts });
  const quiz = quizzes.data?.find((item) => item.lesson_id === lessonId && item.stage === stage);
  const latest = quiz ? attempts.data?.find((attempt) => attempt.quiz_id === quiz.id) : undefined;
  const [q, setQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [again, setAgain] = useState(false);
  const focus = useRef<HTMLHeadingElement>(null);
  const submit = useMutation({
    mutationFn: () => submitQuiz(quiz!.id, answers),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['quiz-attempts'] }); setAgain(false); setAnswers({}); setQ(0); },
  });
  const showResult = !!latest && !again;
  // A new question or the score replaces what had focus: move focus to its
  // heading so a screen reader reads it straight away.
  useEffect(() => { focus.current?.focus(); }, [q, showResult]);

  if (quizzes.isPending || attempts.isPending) return <>{bar({ back: onBack })}</>;
  if (!quiz) return <>{bar({ back: onBack, next: onDone ?? undefined })}</>;

  if (showResult) {
    const score = latest.feedback.filter((item) => item.correct).length;
    const total = latest.feedback.length;
    return <>
      <Confetti show={submit.isSuccess && stage === 'end'} />
      <div className="learner-card flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-5xl tracking-widest" aria-hidden="true">{'⭐'.repeat(score)}{'☆'.repeat(total - score)}</p>
        <h3 ref={focus} tabIndex={-1} className="quiz-big focus:outline-none">
          {score === total ? 'Perfect! ' : 'Nice try! '}You got {score} of {total}!
        </h3>
        {doneText && <p className="text-xl font-bold text-slate-900">{doneText}</p>}
        <button type="button" className="btn-secondary" onClick={() => setAgain(true)}>Try again</button>
      </div>
      {bar({ back: onBack, next: onDone ?? undefined })}
    </>;
  }

  const question = quiz.questions[q];
  const last = q === quiz.questions.length - 1;
  const picked = answers[question.id] !== undefined;
  return <>
    <fieldset className="learner-card space-y-5 p-6">
      <legend className="sr-only">Question {q + 1} of {quiz.questions.length}</legend>
      <span className="stage-pill" aria-hidden="true">Question {q + 1} of {quiz.questions.length}</span>
      <h3 ref={focus} tabIndex={-1} className="quiz-big focus:outline-none">{question.prompt}</h3>
      <div className="grid gap-3">
        {question.choices.map((choice, n) => (
          <label key={n} className="quiz-tile">
            <input type="radio" name={`${quiz.id}-${question.id}`} checked={answers[question.id] === n}
              onChange={() => setAnswers((current) => ({ ...current, [question.id]: n }))} />
            <span className="quiz-shape" aria-hidden="true">{shapes[n % shapes.length]}</span>
            <span>{choice}</span>
          </label>
        ))}
      </div>
    </fieldset>
    <FriendlyAlert error={submit.error} />
    {bar({
      back: q > 0 ? () => setQ(q - 1) : onBack,
      next: last ? () => submit.mutate() : () => setQ(q + 1),
      nextLabel: last ? (submit.isPending ? 'Checking…' : 'Check') : 'Next',
      nextDisabled: !picked || submit.isPending,
    })}
  </>;
}
