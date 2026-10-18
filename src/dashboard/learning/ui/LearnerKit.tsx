/**
 * Small building blocks shared by learner screens: hero header, chips,
 * progress bar, badges, step cards and a celebration. Presentation only.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { LearningLevel, CompetencyId } from '../../../lib/learningFramework';
import type { ReviewBand } from '../../../lib/learningRecords';
import { levelLook, skillLook, ratingLook, statusLook, stepKindFor, friendlyError, type ActivityStatus, type Badge, type LearnerStats } from '../../../lib/learnerCopy';
import { Mascot, StepIcon } from './LearnerArt';

export function LearnerPage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`learning-zone learner-zone px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-8 max-w-6xl ${className}`}>{children}</div>;
}

export function Hero({ eyebrow, title, blurb, mood = 'happy', children }: {
  eyebrow?: string; title: ReactNode; blurb?: ReactNode; mood?: 'happy' | 'cheer' | 'think'; children?: ReactNode;
}) {
  return (
    <header className="learner-hero">
      <div className="flex items-center gap-4 sm:gap-6">
        <Mascot size={88} mood={mood} className="shrink-0 drop-shadow-md" />
        <div className="min-w-0">
          {eyebrow && <p className="text-xs font-extrabold uppercase tracking-widest text-sky-800/80">{eyebrow}</p>}
          <h1 className="learner-title">{title}</h1>
          {blurb && <p className="sr-only">{blurb}</p>}
        </div>
      </div>
      {children}
    </header>
  );
}

/** Level as a coloured emoji badge. The word is there for screen readers and on hover. */
export function LevelChip({ level, big = false }: { level: LearningLevel | undefined; big?: boolean }) {
  if (!level) return null;
  const look = levelLook[level];
  return (
    <span title={look.title} className={`inline-flex items-center justify-center rounded-full font-bold ring-2 ${look.chip} ${big ? 'h-10 w-10 text-xl' : 'h-7 w-7 text-sm'}`}>
      <span aria-hidden="true">{look.emoji}</span><span className="sr-only">{look.title}</span>
    </span>
  );
}

/** Activity state as an emoji badge; the words are read by screen readers and shown on hover. */
export function StatusChip({ status }: { status: ActivityStatus }) {
  const look = statusLook[status];
  return (
    <span title={look.label} className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${look.color}`}>
      <span aria-hidden="true">{look.emoji}</span><span className="sr-only">{look.label}</span>
    </span>
  );
}

export function SkillChip({ id, band }: { id: CompetencyId; band?: ReviewBand | 'not-observed' }) {
  const skill = skillLook[id];
  const rating = band ? ratingLook[band] : null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${skill.color}`}>
      <span aria-hidden="true">{skill.emoji}</span><span>{skill.label}</span>
      {rating && <span className="ml-1 rounded-full bg-white/70 px-2 py-0.5 text-xs">
        <span aria-hidden="true">{'★'.repeat(rating.stars)}{'☆'.repeat(3 - rating.stars)} </span><span className="sr-only">{rating.stars} of 3 stars, </span>{rating.label}
      </span>}
    </span>
  );
}

export function XpBar({ stats }: { stats: LearnerStats }) {
  const percent = Math.round(stats.progressToNext * 100);
  return (
    <div className="learner-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-3xl shadow-inner" aria-hidden="true">{stats.rank.emoji}</span>
        <div>
          <p className="sr-only">Your rank</p>
          <p className="text-xl font-extrabold text-slate-900">{stats.rank.title}</p>
        </div>
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-baseline justify-between text-sm font-bold text-slate-700">
          <span><span aria-hidden="true">⭐ </span>{stats.xp}<span className="sr-only"> points</span></span>
          {stats.nextRank ? <span>{stats.nextRank.min - stats.xp} <span aria-hidden="true">→ {stats.nextRank.emoji}</span><span className="sr-only">more to reach {stats.nextRank.title}</span></span> : <span aria-hidden="true">🏆</span>}
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={`Progress to ${stats.nextRank?.title ?? 'top rank'}`}>
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 transition-all duration-700" style={{ width: `${Math.max(4, percent)}%` }} />
        </div>
      </div>
    </div>
  );
}

export function StatTile({ emoji, label, value, tone }: { emoji: string; label: string; value: number | string; tone: string }) {
  return (
    <li className={`learner-card flex items-center gap-3 p-4 ${tone}`}>
      <span className="text-3xl" aria-hidden="true">{emoji}</span>
      <div><p className="text-2xl font-extrabold leading-none text-slate-900">{value}</p><p className="mt-1 text-sm font-semibold text-slate-700">{label}</p></div>
    </li>
  );
}

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Badges">
      {badges.map((badge) => (
        <li key={badge.id} className={`learner-card flex flex-col items-center p-4 text-center ${badge.earned ? '' : 'border-dashed bg-slate-50'}`}>
          {/* Locked badges dim the icon only; the words keep full contrast so they stay readable. */}
          <span className={`flex h-14 w-14 items-center justify-center rounded-full text-3xl ${badge.earned ? 'bg-gradient-to-br from-yellow-200 to-amber-400 shadow-md' : 'bg-slate-200 opacity-70 grayscale'}`} aria-hidden="true">{badge.earned ? badge.emoji : '🔒'}</span>
          <p className="mt-2 font-extrabold text-slate-900"><span className="sr-only">{badge.earned ? 'Earned badge: ' : 'Locked badge: '}</span>{badge.title}</p>
          <p className="sr-only">{badge.earned ? 'You got it!' : `To earn it: ${badge.hint}`}</p>
        </li>
      ))}
    </ul>
  );
}

export function StepCards({ steps }: { steps: string[] }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2" aria-label="Steps">
      {steps.map((step, index) => (
        <li key={index} className="learner-card flex items-start gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-extrabold text-white" aria-hidden="true">{index + 1}</span>
          <StepIcon kind={stepKindFor(step)} />
          <p className="pt-1.5 text-base font-semibold text-slate-800"><span className="sr-only">Step {index + 1}: </span>{step}</p>
        </li>
      ))}
    </ol>
  );
}

export function FriendlyAlert({ error }: { error: { message: string } | null | undefined }) {
  if (!error) return null;
  return <p role="alert" className="learner-card border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-900"><span aria-hidden="true">😬 </span>{friendlyError(error.message)}</p>;
}

export function Loading({ children }: { children: ReactNode }) {
  return <p role="status" className="flex items-center gap-2 text-base font-semibold text-slate-600"><span className="learner-spinner" aria-hidden="true" /><span className="sr-only">{children}</span></p>;
}

export function EmptyNote({ emoji, title, body, children }: { emoji: string; title: string; body?: string; children?: ReactNode }) {
  return (
    <div className="learner-card flex flex-col items-center gap-2 p-6 text-center">
      <span className="text-4xl" aria-hidden="true">{emoji}</span>
      <h2 className="text-lg font-extrabold">{title}</h2>
      {body && <p className="sr-only">{body}</p>}
      {children}
    </div>
  );
}

/** Confetti burst. Pure CSS; disabled automatically by prefers-reduced-motion. */
export function Confetti({ show }: { show: boolean }) {
  const [pieces, setPieces] = useState<{ left: number; delay: number; colour: string; size: number }[]>([]);
  useEffect(() => {
    if (!show) { setPieces([]); return; }
    const colours = ['#f59e0b', '#ec4899', '#8b5cf6', '#22c55e', '#38bdf8', '#f97316'];
    setPieces(Array.from({ length: 40 }, (_, index) => ({ left: (index * 37) % 100, delay: (index % 10) * 0.08, colour: colours[index % colours.length], size: 8 + (index % 3) * 4 })));
    const timer = setTimeout(() => setPieces([]), 2800);
    return () => clearTimeout(timer);
  }, [show]);
  if (!pieces.length) return null;
  return (
    <div className="learner-confetti" aria-hidden="true">
      {pieces.map((piece, index) => <span key={index} style={{ left: `${piece.left}%`, animationDelay: `${piece.delay}s`, background: piece.colour, width: piece.size, height: piece.size * 1.4 }} />)}
    </div>
  );
}

export function Cheer({ title, body, emoji = '🎉' }: { title: string; body?: string; emoji?: string }) {
  return (
    <div role="status" aria-live="polite" className="learner-card flex items-center gap-4 border-emerald-300 bg-gradient-to-r from-emerald-50 to-lime-50 p-4">
      <Mascot size={56} mood="cheer" />
      <div>
        <p className="text-lg font-extrabold text-emerald-900">{title} <span aria-hidden="true">{emoji}</span></p>
        {body && <p className="mt-1 text-sm font-semibold text-emerald-950">{body}</p>}
      </div>
    </div>
  );
}

/**
 * Reads a passage out loud with the browser's own voice. A second way to take
 * in the mission for learners with low vision, tired eyes or a reading
 * difficulty who are not using a full screen reader. Hidden when the browser
 * cannot speak.
 */
export function ReadAloud({ text, label = 'Read this to me' }: { text: string; label?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);
  if (!supported) return null;
  function toggle() {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const next = new SpeechSynthesisUtterance(text);
    next.rate = 0.95;
    next.onend = () => setSpeaking(false);
    next.onerror = () => setSpeaking(false);
    utterance.current = next;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(next);
    setSpeaking(true);
  }
  return (
    <button type="button" className="btn-secondary" onClick={toggle} aria-pressed={speaking} title={speaking ? 'Stop reading' : label}>
      <span aria-hidden="true" className="text-xl">{speaking ? '⏹' : '🔊'}</span><span className="sr-only">{speaking ? 'Stop reading' : label}</span>
    </button>
  );
}
