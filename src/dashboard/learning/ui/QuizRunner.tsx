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
  const [nudge, setNudge] = useState('');
  const [picked, setPicked] = useState('');
  const focus = useRef<HTMLHeadingElement>(null);
  const group = useRef<HTMLParagraphElement>(null);
  const submit = useMutation({
    mutationFn: () => submitQuiz(quiz!.id, answers),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['quiz-attempts'] }); setAgain(false); setAnswers({}); setQ(0); },
  });
  const showResult = !!latest && !again;
  // A new question or the score replaces what had focus: move focus to its
  // heading so a screen reader reads it straight away.
  // The step heading has focus when the quiz opens, so a screen reader first
  // hears which step this is; focus moves here only after that.
  const shown = useRef({ q, showResult });
  useEffect(() => {
    if (shown.current.q === q && shown.current.showResult === showResult) return;
    shown.current = { q, showResult };
    setPicked('');
    (showResult ? focus.current : group.current)?.focus();
  }, [q, showResult]);

  if (quizzes.isPending || attempts.isPending) return <>{bar({ back: onBack })}</>;
  if (!quiz) return <>{bar({ back: onBack, next: onDone ?? undefined })}</>;

  if (showResult) {
    const score = latest.feedback.filter((item) => item.correct).length;
    const total = latest.feedback.length;
    return <>
      <Confetti show={submit.isSuccess && stage === 'end'} />
      <div className="learner-card flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-5xl tracking-widest" aria-hidden="true">{'⭐'.repeat(score)}{'☆'.repeat(total - score)}</p>
        <h3 ref={focus} tabIndex={0} className="quiz-big">
          {score === total ? 'Perfect! ' : 'Nice try! '}You got {score} of {total}!
        </h3>
        {doneText && <p tabIndex={0} className="text-xl font-bold text-slate-900"><span aria-hidden="true">🏆 </span>{doneText}</p>}
        <button type="button" className="btn-secondary" onClick={() => setAgain(true)}>Try again</button>
      </div>
      {bar({ back: onBack, next: onDone ?? undefined })}
    </>;
  }

  const question = quiz.questions[q];
  const goOn = () => {
    if (submit.isPending) return;
    if (answers[question.id] === undefined) { setNudge('Pick an answer first.'); return; }
    if (q === quiz.questions.length - 1) submit.mutate(); else setQ(q + 1);
  };
  const last = q === quiz.questions.length - 1;
  return <>
    {/* Tab reaches every part, in order: the question, then each answer.
        Answers are plain buttons (NVDA says "button", not "radio button");
        Space or Enter picks one and NVDA says "You picked: …". */}
    <div className="learner-card space-y-5 p-6">
      <span className="stage-pill" aria-hidden="true">Question {q + 1} of {quiz.questions.length}</span>
      <p ref={group} tabIndex={0} className="quiz-big"><span className="sr-only">Question {q + 1} of {quiz.questions.length}: </span>{question.prompt}</p>
      <div className="grid gap-3">
        {question.choices.map((choice, n) => {
          const chosen = answers[question.id] === n;
          return (
            <button key={n} type="button" className="quiz-tile w-full text-left" data-chosen={chosen || undefined}
              onClick={() => { setNudge(''); setAnswers((current) => ({ ...current, [question.id]: n })); setPicked(''); setTimeout(() => setPicked(`You picked: ${choice}`), 50); }}>
              <span className="quiz-shape" aria-hidden="true">{shapes[n % shapes.length]}</span>
              <span>{choice}</span>
              {chosen && <span className="sr-only">, your answer</span>}
            </button>
          );
        })}
      </div>
    </div>
    <p role="status" className="sr-only">{picked}</p>
    <FriendlyAlert error={submit.error} />
    {/* Next is never greyed out: a disabled button is skipped by Tab, so JAWS
        and NVDA users would not find it. Without an answer it says so. */}
    <p role="alert" className={nudge ? 'text-xl font-bold text-slate-900' : 'sr-only'}>{nudge}</p>
    {bar({
      back: q > 0 ? () => { setNudge(''); setQ(q - 1); } : onBack,
      next: goOn,
      nextLabel: last ? (submit.isPending ? 'Checking…' : 'Check') : 'Next',
    })}
  </>;
}
