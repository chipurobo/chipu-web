import type { LessonLevel } from '../../lib/database.types';

// =============================================================
// The two delivery tracks from the Theory of Change.
//
//   Primary track    robotics concepts, problem-solving, introductory coding
//   Secondary track  coding, AI, and 3D design and print
//
// A lesson's level says which track it belongs to, not how hard it is —
// difficulty is a separate axis, and 20260810000011 re-derived every level
// after the two were conflated.
//
// Plain constants and a predicate, kept out of the component file so fast
// refresh keeps working — react-refresh only handles modules that export
// components alone.
// =============================================================

export type LevelChoice = 'all' | LessonLevel;

export const LEVEL_LABEL: Record<LessonLevel, string> = {
  primary:   'Primary track',
  secondary: 'Secondary track',
  both:      'Both tracks',
};

export const LEVEL_CHOICE_LABEL: Record<LevelChoice, string> = {
  all:       'All tracks',
  primary:   'Primary track',
  secondary: 'Secondary track',
  both:      'Both tracks',
};

/**
 * A lesson shows under a chosen track if it belongs to that track, or to both.
 * Excluding 'both' would hide a third of the curriculum from everyone, which
 * is the opposite of what the filter is for.
 */
export function matchesLevel(lessonLevel: LessonLevel, choice: LevelChoice): boolean {
  if (choice === 'all') return true;
  return lessonLevel === choice || lessonLevel === 'both';
}
