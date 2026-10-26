/**
 * Inline SVG illustrations for learner screens. Hand-drawn shapes, no
 * external image requests, so they work offline and scale on any phone.
 * Every picture is decorative; the words next to it carry the meaning.
 */
import type { ArtTheme, StepKind } from '../../../lib/learnerCopy';
import { Blocks, Play, CheckCircle2, MessageCircle, Wrench, Lightbulb, Save } from 'lucide-react';

export function Mascot({ size = 96, mood = 'happy', className = '' }: { size?: number; mood?: 'happy' | 'cheer' | 'think'; className?: string }) {
  const mouth = mood === 'cheer' ? 'M38 64 Q50 78 62 64' : mood === 'think' ? 'M40 68 L60 68' : 'M38 64 Q50 72 62 64';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className}>
      <circle cx="50" cy="12" r="5" fill="#fbbf24" />
      <rect x="48" y="15" width="4" height="10" rx="2" fill="#94a3b8" />
      <rect x="20" y="24" width="60" height="50" rx="16" fill="#38bdf8" />
      <rect x="27" y="32" width="46" height="26" rx="10" fill="#0f172a" />
      <circle cx="40" cy="45" r="6" fill="#f8fafc" />
      <circle cx="60" cy="45" r="6" fill="#f8fafc" />
      <circle cx="41.5" cy="46" r="3" fill="#0f172a" />
      <circle cx="61.5" cy="46" r="3" fill="#0f172a" />
      <path d={mouth} stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" fill="none" />
      <rect x="8" y="40" width="12" height="20" rx="6" fill="#0ea5e9" />
      <rect x="80" y="40" width="12" height="20" rx="6" fill="#0ea5e9" />
      <rect x="32" y="74" width="14" height="14" rx="5" fill="#0ea5e9" />
      <rect x="54" y="74" width="14" height="14" rx="5" fill="#0ea5e9" />
      {mood === 'cheer' && <>
        <path d="M10 20 l4 -8 l4 8" stroke="#f472b6" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M82 18 l4 -8 l4 8" stroke="#a78bfa" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="6" cy="34" r="3" fill="#fbbf24" />
        <circle cx="94" cy="30" r="3" fill="#34d399" />
      </>}
    </svg>
  );
}

const palette = {
  loop:     { bg: '#fef3c7', a: '#f59e0b', b: '#d97706' },
  decision: { bg: '#ede9fe', a: '#8b5cf6', b: '#6d28d9' },
  variable: { bg: '#ffedd5', a: '#fb923c', b: '#c2410c' },
  print:    { bg: '#dcfce7', a: '#22c55e', b: '#15803d' },
  list:     { bg: '#fce7f3', a: '#ec4899', b: '#be185d' },
  function: { bg: '#e0e7ff', a: '#6366f1', b: '#4338ca' },
  robot:    { bg: '#ccfbf1', a: '#14b8a6', b: '#0f766e' },
  plan:     { bg: '#fef9c3', a: '#eab308', b: '#a16207' },
  design:   { bg: '#fee2e2', a: '#f87171', b: '#b91c1c' },
  story:    { bg: '#e0f2fe', a: '#38bdf8', b: '#0369a1' },
  number:   { bg: '#dbeafe', a: '#3b82f6', b: '#1d4ed8' },
  project:  { bg: '#fae8ff', a: '#d946ef', b: '#a21caf' },
} as const;

const artLabels: Record<ArtTheme, string> = {
  loop: 'An arrow going round in a circle, three times',
  decision: 'A signpost with a yes path and a no path',
  variable: 'A labelled box called score holding the number 42',
  print: 'A speech bubble with lines of text',
  list: 'A list of three items',
  function: 'Two gears turning together',
  robot: 'A friendly robot with a light on its head',
  plan: 'Three numbered steps in order',
  design: 'A glowing light bulb',
  story: 'Two speech bubbles saying hi and hello',
  number: 'The sum seven plus five',
  project: 'A big gold star',
};

/** A picture for a lesson card. `theme` comes from artThemeFor(). Screen
 * readers get a one-line description so the picture is shared, not skipped. */
export function LessonArt({ theme, className = '' }: { theme: ArtTheme; className?: string }) {
  const colours = palette[theme];
  return (
    <svg viewBox="0 0 160 100" role="img" aria-label={artLabels[theme]} focusable="false" className={className}>
      <rect width="160" height="100" rx="18" fill={colours.bg} />
      {/* The words drawn in the picture are decoration; the label above says what it shows. */}
      <g aria-hidden="true">{scene(theme, colours.a, colours.b)}</g>
    </svg>
  );
}

function scene(theme: ArtTheme, a: string, b: string) {
  switch (theme) {
    case 'loop':
      return <>
        <path d="M50 50 a30 30 0 1 1 8 20" stroke={a} strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M58 60 l10 12 l-16 2 z" fill={b} />
        <text x="104" y="60" fontSize="30" fontWeight="800" fill={b}>×3</text>
      </>;
    case 'decision':
      return <>
        <rect x="74" y="40" width="12" height="50" rx="4" fill={b} />
        <path d="M80 10 l28 14 l-28 14 l-28 -14 z" fill={a} />
        <rect x="22" y="56" width="44" height="14" rx="7" fill={a} />
        <rect x="94" y="56" width="44" height="14" rx="7" fill={a} />
        <text x="33" y="67" fontSize="10" fontWeight="800" fill="#fff">YES</text>
        <text x="108" y="67" fontSize="10" fontWeight="800" fill="#fff">NO</text>
      </>;
    case 'variable':
      return <>
        <rect x="40" y="34" width="80" height="54" rx="10" fill={a} />
        <rect x="40" y="26" width="80" height="14" rx="6" fill={b} />
        <text x="80" y="72" fontSize="26" fontWeight="800" fill="#fff" textAnchor="middle">42</text>
        <text x="80" y="20" fontSize="11" fontWeight="800" fill={b} textAnchor="middle">score</text>
      </>;
    case 'print':
      return <>
        <path d="M30 24 h78 a10 10 0 0 1 10 10 v30 a10 10 0 0 1 -10 10 h-50 l-18 14 v-14 h-10 a10 10 0 0 1 -10 -10 v-30 a10 10 0 0 1 10 -10 z" fill="#fff" stroke={a} strokeWidth="5" />
        <rect x="42" y="38" width="56" height="7" rx="3.5" fill={a} />
        <rect x="42" y="52" width="36" height="7" rx="3.5" fill={b} />
      </>;
    case 'list':
      return <>
        {[0, 1, 2].map((row) => <g key={row}>
          <circle cx="38" cy={26 + row * 24} r="7" fill={b} />
          <rect x="54" y={20 + row * 24} width={76 - row * 14} height="12" rx="6" fill={a} />
        </g>)}
      </>;
    case 'function':
      return <>
        <circle cx="58" cy="50" r="22" fill="none" stroke={a} strokeWidth="10" strokeDasharray="12 8" />
        <circle cx="102" cy="50" r="16" fill="none" stroke={b} strokeWidth="8" strokeDasharray="9 6" />
        <circle cx="58" cy="50" r="7" fill={b} />
        <circle cx="102" cy="50" r="5" fill={a} />
      </>;
    case 'robot':
      return <>
        <rect x="50" y="30" width="60" height="44" rx="12" fill={a} />
        <rect x="58" y="38" width="44" height="20" rx="8" fill="#0f172a" />
        <circle cx="70" cy="48" r="5" fill="#fff" />
        <circle cx="90" cy="48" r="5" fill="#fff" />
        <rect x="36" y="42" width="12" height="18" rx="6" fill={b} />
        <rect x="112" y="42" width="12" height="18" rx="6" fill={b} />
        <rect x="76" y="18" width="8" height="12" rx="4" fill={b} />
        <circle cx="80" cy="14" r="5" fill="#fbbf24" />
        <rect x="60" y="76" width="14" height="12" rx="5" fill={b} />
        <rect x="86" y="76" width="14" height="12" rx="5" fill={b} />
      </>;
    case 'plan':
      return <>
        {[0, 1, 2].map((row) => <g key={row}>
          <rect x="34" y={22 + row * 22} width="22" height="16" rx="5" fill={b} />
          <text x="45" y={34 + row * 22} fontSize="11" fontWeight="800" fill="#fff" textAnchor="middle">{row + 1}</text>
          <rect x="64" y={24 + row * 22} width={66 - row * 10} height="12" rx="6" fill={a} />
        </g>)}
      </>;
    case 'design':
      return <>
        <path d="M80 18 a24 24 0 0 1 14 44 v8 h-28 v-8 a24 24 0 0 1 14 -44 z" fill="#fde047" stroke={a} strokeWidth="5" />
        <rect x="68" y="72" width="24" height="8" rx="4" fill={b} />
        <rect x="72" y="82" width="16" height="6" rx="3" fill={b} />
        <path d="M30 30 l6 6 M130 30 l-6 6 M28 60 h8 M124 60 h8" stroke={a} strokeWidth="4" strokeLinecap="round" />
      </>;
    case 'story':
      return <>
        <path d="M22 26 h60 a8 8 0 0 1 8 8 v18 a8 8 0 0 1 -8 8 h-36 l-14 10 v-10 h-10 a8 8 0 0 1 -8 -8 v-18 a8 8 0 0 1 8 -8 z" fill="#fff" stroke={a} strokeWidth="4" />
        <path d="M138 44 h-56 a8 8 0 0 0 -8 8 v18 a8 8 0 0 0 8 8 h36 l14 10 v-10 h6 a8 8 0 0 0 8 -8 v-18 a8 8 0 0 0 -8 -8 z" fill={a} />
        <text x="52" y="47" fontSize="13" fontWeight="800" fill={b} textAnchor="middle">Hi!</text>
        <text x="108" y="66" fontSize="13" fontWeight="800" fill="#fff" textAnchor="middle">Hello!</text>
      </>;
    case 'number':
      return <>
        <text x="40" y="66" fontSize="40" fontWeight="800" fill={a}>7</text>
        <text x="70" y="66" fontSize="34" fontWeight="800" fill={b}>+</text>
        <text x="96" y="66" fontSize="40" fontWeight="800" fill={a}>5</text>
      </>;
    case 'project':
      return <>
        <path d="M80 14 l12 24 l26 3 l-19 18 l5 26 l-24 -13 l-24 13 l5 -26 l-19 -18 l26 -3 z" fill="#fde047" stroke={a} strokeWidth="5" strokeLinejoin="round" />
        <circle cx="26" cy="24" r="4" fill={b} />
        <circle cx="136" cy="78" r="4" fill={b} />
        <circle cx="140" cy="22" r="3" fill={a} />
      </>;
  }
}

const stepIcons = { build: Blocks, run: Play, test: CheckCircle2, explain: MessageCircle, change: Wrench, think: Lightbulb, save: Save } as const;
const stepColours = {
  build: 'bg-sky-500', run: 'bg-emerald-500', test: 'bg-amber-500', explain: 'bg-pink-500',
  change: 'bg-orange-500', think: 'bg-violet-500', save: 'bg-teal-500',
} as const;

export function StepIcon({ kind }: { kind: StepKind }) {
  const Icon = stepIcons[kind];
  return (
    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ${stepColours[kind]}`} aria-hidden="true">
      <Icon className="h-5 w-5" />
    </span>
  );
}
