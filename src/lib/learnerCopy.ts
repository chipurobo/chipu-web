/**
 * Learner-facing vocabulary and playful progress helpers.
 *
 * The learning framework (learningFramework.ts) keeps its formal wording for
 * teachers, curriculum staff and reports. Learners see the same data through
 * this file: shorter words, an icon for every idea, and points and badges that
 * are DERIVED from existing records. Nothing here writes to the database or
 * changes how work is reviewed.
 */
import type { CompetencyId, LearningLevel } from './learningFramework';
import type { ReviewBand, LearningAssignment, LearningSubmission, CompetencyEvidence } from './learningRecords';
import type { QuizAttempt } from './learningOutcomes';

export interface LevelLook {
  emoji: string;
  title: string;
  nickname: string;
  blurb: string;
  chip: string;
  ring: string;
  gradient: string;
}

export const levelLook: Record<LearningLevel, LevelLook> = {
  beginner: {
    emoji: '🌱', title: 'Beginner', nickname: 'Explorer',
    blurb: 'Try ideas, follow the steps and say what happened.',
    chip: 'bg-lime-100 text-lime-900 ring-lime-300', ring: '#65a30d',
    gradient: 'from-lime-200 via-emerald-100 to-teal-100',
  },
  intermediate: {
    emoji: '🔧', title: 'Intermediate', nickname: 'Builder',
    blurb: 'Mix ideas together, test different ways and explain your choices.',
    chip: 'bg-sky-100 text-sky-900 ring-sky-300', ring: '#0284c7',
    gradient: 'from-sky-200 via-cyan-100 to-blue-100',
  },
  expert: {
    emoji: '🚀', title: 'Expert', nickname: 'Inventor',
    blurb: 'Design your own solution, test it hard and make it better.',
    chip: 'bg-violet-100 text-violet-900 ring-violet-300', ring: '#7c3aed',
    gradient: 'from-violet-200 via-fuchsia-100 to-pink-100',
  },
};

export const levelOrder: LearningLevel[] = ['beginner', 'intermediate', 'expert'];

export interface SkillLook { emoji: string; label: string; blurb: string; color: string }

export const skillLook: Record<CompetencyId, SkillLook> = {
  algorithms:    { emoji: '🗺️', label: 'Planning',   blurb: 'Work out the steps before you build.',       color: 'bg-amber-100 text-amber-900' },
  programming:   { emoji: '🧩', label: 'Coding',     blurb: 'Snap blocks together to make things happen.', color: 'bg-sky-100 text-sky-900' },
  debugging:     { emoji: '🐞', label: 'Bug fixing', blurb: 'Find what went wrong and fix it.',           color: 'bg-rose-100 text-rose-900' },
  robotics:      { emoji: '🤖', label: 'Robots',     blurb: 'Make code control real things.',             color: 'bg-teal-100 text-teal-900' },
  design:        { emoji: '💡', label: 'Inventing',  blurb: 'Dream up a solution and improve it.',        color: 'bg-violet-100 text-violet-900' },
  communication: { emoji: '💬', label: 'Sharing',    blurb: 'Explain what you made and work with others.', color: 'bg-orange-100 text-orange-900' },
};

export const ratingLook: Record<ReviewBand | 'not-observed', { emoji: string; label: string; stars: number; color: string }> = {
  'not-observed': { emoji: '👀', label: 'Not seen yet',   stars: 0, color: 'bg-gray-100 text-gray-700' },
  developing:     { emoji: '🌤️', label: 'Getting there',  stars: 1, color: 'bg-amber-100 text-amber-900' },
  demonstrated:   { emoji: '⭐', label: 'Got it!',        stars: 2, color: 'bg-emerald-100 text-emerald-900' },
  extending:      { emoji: '🌟', label: 'Going further',  stars: 3, color: 'bg-violet-100 text-violet-900' },
};

/** What each skill looks like at each level, in the learner's own voice. */
export const skillGoals: Record<CompetencyId, Record<LearningLevel, string>> = {
  algorithms: {
    beginner: 'I can write the steps for a small task in the right order.',
    intermediate: 'I can use repeats and choices when I plan how to solve something.',
    expert: 'I can compare two ways of solving a problem and say which is better and why.',
  },
  programming: {
    beginner: 'I can build a short program and say what runs first, next and last.',
    intermediate: 'I can mix events, repeats and choices to make a program that reacts.',
    expert: 'I can split a big program into parts I can reuse, and explain how it works.',
  },
  debugging: {
    beginner: 'I can spot when the result is not what I expected and fix a small mistake.',
    intermediate: 'I can try different tests to find a bug and check that my fix works.',
    expert: 'I can plan my tests, track down tricky bugs and say what still needs work.',
  },
  robotics: {
    beginner: 'I can point out the input, the thinking part and the output in a gadget.',
    intermediate: 'I can show and test how an input changes an output.',
    expert: 'I can build a gadget and check that it is safe and works well.',
  },
  design: {
    beginner: 'I can say what someone needs and suggest a simple idea to help.',
    intermediate: 'I can build a first version and make it better using feedback.',
    expert: 'I can weigh up different choices and explain why I changed my design.',
  },
  communication: {
    beginner: 'I can explain what I made and which part I did.',
    intermediate: 'I can explain my choices and say who did what in a team.',
    expert: 'I can show my work to others, say what could be better, and use their ideas.',
  },
};

export const pathwayLook: Record<string, { emoji: string; label: string }> = {
  'creative-coding':    { emoji: '🎨', label: 'Creative coding' },
  'physical-computing': { emoji: '🤖', label: 'Robots and gadgets' },
  'project-design':     { emoji: '🛠️', label: 'Invent and share' },
};

export type ActivityStatus = 'ready' | 'sent' | 'replied';

export const statusLook: Record<ActivityStatus, { emoji: string; label: string; color: string; action: string }> = {
  ready:   { emoji: '🚀', label: "Let's go",        color: 'bg-sky-100 text-sky-900',         action: 'Start activity' },
  sent:    { emoji: '📬', label: 'Sent to teacher', color: 'bg-amber-100 text-amber-900',     action: 'See my work' },
  replied: { emoji: '💌', label: 'Teacher replied', color: 'bg-emerald-100 text-emerald-900', action: 'Read my feedback' },
};

/** Pick an illustration theme for a lesson from the words in its title. */
export type ArtTheme = 'loop' | 'decision' | 'variable' | 'print' | 'list' | 'function' | 'robot' | 'plan' | 'design' | 'story' | 'number' | 'project';

export function artThemeFor(title: string, options?: { pathwayId?: string; capstone?: boolean }): ArtTheme {
  const text = title.toLowerCase();
  if (options?.capstone) return 'project';
  if (/\b(loop|repeat|count|times|table|again)\b/.test(text)) return 'loop';
  if (/\b(if|else|decision|decide|compare|choose|choice)\b/.test(text)) return 'decision';
  if (/\b(variable|store|remember|changing|counter|score)\b/.test(text)) return 'variable';
  if (/\b(list|collect|collection|items)\b/.test(text)) return 'list';
  if (/\b(function|reusable|reuse|procedure)\b/.test(text)) return 'function';
  if (/\b(robot|sensor|motor|light|led|physical|input|output|gadget|respond)\b/.test(text)) return 'robot';
  if (/\b(story|greeting|hello|message|talk|interactive)\b/.test(text)) return 'story';
  if (/\b(number|add|sum|multiply|maths|math|arithmetic|random)\b/.test(text)) return 'number';
  if (/\b(design|improve|prototype|need|brief|invent)\b/.test(text)) return 'design';
  if (/\b(print|show|display|output|text)\b/.test(text)) return 'print';
  if (/\b(plan|instruction|sequence|steps|order)\b/.test(text)) return 'plan';
  if (options?.pathwayId === 'physical-computing') return 'robot';
  if (options?.pathwayId === 'project-design') return 'design';
  return 'print';
}

/** Icon hint for a single lesson step, from its verb. */
export type StepKind = 'build' | 'run' | 'test' | 'explain' | 'change' | 'think' | 'save';

export function stepKindFor(step: string): StepKind {
  const text = step.toLowerCase();
  if (/\b(run|play|press|start)\b/.test(text)) return 'run';
  if (/\b(test|check|compare|try|retest|fix|debug)\b/.test(text)) return 'test';
  if (/\b(explain|tell|describe|say|share|write down|present|discuss)\b/.test(text)) return 'explain';
  if (/\b(change|improve|edit|update|replace|swap|adjust|rename)\b/.test(text)) return 'change';
  if (/\b(save|submit|send|keep)\b/.test(text)) return 'save';
  if (/\b(plan|think|decide|predict|imagine|choose|list)\b/.test(text)) return 'think';
  return 'build';
}

/** Turn a raw database or network error into words a learner can act on. */
export function friendlyError(message: string | undefined | null): string {
  const text = (message ?? '').trim();
  if (!text) return 'Oops, something went wrong. Give it another try.';
  if (/jwt|expired|session|refresh token|not authenticated/i.test(text)) return 'You were signed out for a while. Please sign in again.';
  if (/failed to fetch|network|load failed|timeout|timed out/i.test(text)) return "We can't reach the internet right now. Check the connection and try again.";
  if (/row-level security|permission|42501|access required|only your own/i.test(text)) return "This account can't do that. Ask your teacher for help.";
  if (/not found|no longer available|not available/i.test(text)) return "We can't find that right now. Go back and try again.";
  if (/^[A-Za-z]+Error:/.test(text) || /relation|syntax|column|constraint|violates/i.test(text)) return 'Oops, something went wrong. Give it another try.';
  return text.length > 160 ? 'Oops, something went wrong. Give it another try.' : text;
}

/* ───────────────────────── points and badges ───────────────────────── */

export interface Badge {
  id: string;
  emoji: string;
  title: string;
  hint: string;
  earned: boolean;
}

export interface Rank { title: string; emoji: string; min: number }

export const ranks: Rank[] = [
  { title: 'Rookie',   emoji: '🐣', min: 0 },
  { title: 'Explorer', emoji: '🌱', min: 60 },
  { title: 'Builder',  emoji: '🔧', min: 200 },
  { title: 'Inventor', emoji: '🚀', min: 450 },
  { title: 'Legend',   emoji: '🏆', min: 900 },
];

export interface LearnerStats {
  xp: number;
  rank: Rank;
  nextRank: Rank | null;
  progressToNext: number;
  started: number;
  sent: number;
  replied: number;
  gotIt: number;
  quizPasses: number;
  projectsStarted: number;
  badges: Badge[];
}

export const XP = { start: 10, send: 25, reply: 15, gotIt: 40, quizTry: 10, quizPass: 30 } as const;

/** Points and badges are a view over existing records; nothing is stored. */
export function computeStats(input: {
  assignments?: LearningAssignment[]; submissions?: LearningSubmission[];
  evidence?: CompetencyEvidence[]; attempts?: QuizAttempt[];
}): LearnerStats {
  const assignments = input.assignments ?? [];
  const submissions = input.submissions ?? [];
  const evidence = input.evidence ?? [];
  const attempts = input.attempts ?? [];
  const sentIds = new Set(submissions.map((item) => item.assignment_id));
  const repliedIds = new Set(evidence.filter((item) => item.feedback?.trim()).map((item) => item.assignment_id));
  const gotIt = evidence.filter((item) => Object.values(item.reviews).some((band) => band === 'demonstrated' || band === 'extending')).length;
  const quizPasses = attempts.filter((item) => item.passed).length;
  const projectsStarted = assignments.filter((item) => item.learning_plan.activityKind === 'capstone').length;
  const levelsSent = new Set(assignments.filter((item) => sentIds.has(item.id)).map((item) => item.learning_plan.level));
  const xp = assignments.length * XP.start + submissions.length * XP.send + repliedIds.size * XP.reply
    + gotIt * XP.gotIt + attempts.length * XP.quizTry + quizPasses * XP.quizPass;
  const rankIndex = ranks.reduce((found, rank, index) => (xp >= rank.min ? index : found), 0);
  const rank = ranks[rankIndex];
  const nextRank = ranks[rankIndex + 1] ?? null;
  const progressToNext = nextRank ? Math.min(1, (xp - rank.min) / (nextRank.min - rank.min)) : 1;
  const badges: Badge[] = [
    { id: 'first-steps',  emoji: '👟', title: 'First steps',    hint: 'Start your first lesson.',                 earned: assignments.length > 0 },
    { id: 'sent-it',      emoji: '📬', title: 'Sent it!',       hint: 'Send your first piece of work to your teacher.', earned: submissions.length > 0 },
    { id: 'quiz-whiz',    emoji: '🧠', title: 'Quiz whiz',      hint: 'Pass a quiz.',                             earned: quizPasses > 0 },
    { id: 'teacher-star', emoji: '⭐', title: "Teacher's star", hint: 'Get a "Got it!" from your teacher.',       earned: gotIt > 0 },
    { id: 'high-five',    emoji: '🖐️', title: 'High five',      hint: 'Send work for five different lessons.',    earned: sentIds.size >= 5 },
    { id: 'project-pro',  emoji: '🏗️', title: 'Project pro',    hint: 'Start a big project.',                     earned: projectsStarted > 0 },
    { id: 'all-rounder',  emoji: '🌈', title: 'All-rounder',    hint: 'Send work at every level.',                earned: levelsSent.size >= 3 },
    { id: 'ten-up',       emoji: '🔟', title: 'Ten up',         hint: 'Send ten pieces of work.',                 earned: submissions.length >= 10 },
  ];
  return { xp, rank, nextRank, progressToNext, started: assignments.length, sent: sentIds.size, replied: repliedIds.size,
    gotIt, quizPasses, projectsStarted, badges };
}

export function activityStatus(assignmentId: string, submissions: LearningSubmission[] | undefined, evidence: CompetencyEvidence[] | undefined): ActivityStatus {
  const submission = submissions?.find((item) => item.assignment_id === assignmentId);
  const review = evidence?.find((item) => item.assignment_id === assignmentId && item.feedback?.trim());
  if (review && (!submission || submission.submitted_at <= review.recorded_at)) return 'replied';
  if (submission) return 'sent';
  return 'ready';
}

export function firstName(fullName: string | null | undefined): string {
  return fullName?.trim().split(/\s+/)[0] || 'there';
}

export function friendlyDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
