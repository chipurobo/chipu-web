import type { LessonLevel } from '../../lib/database.types';

// =============================================================
// Primary / secondary helpers.
//
// Plain constants and a predicate, kept out of the component file so fast
// refresh keeps working — react-refresh only handles modules that export
// components alone.
// =============================================================

export type LevelChoice = 'all' | LessonLevel;

export const LEVEL_LABEL: Record<LessonLevel, string> = {
  primary:   'Primary',
  secondary: 'Secondary',
  both:      'Primary & secondary',
};

export const LEVEL_CHOICE_LABEL: Record<LevelChoice, string> = {
  all:       'All levels',
  primary:   'Primary',
  secondary: 'Secondary',
  both:      'Primary & secondary',
};

/**
 * A lesson shows under a chosen level if it is that level, or suits both.
 * Excluding 'both' would hide most of the curriculum from everyone, which is
 * the opposite of what the filter is for.
 */
export function matchesLevel(lessonLevel: LessonLevel, choice: LevelChoice): boolean {
  if (choice === 'all') return true;
  return lessonLevel === choice || lessonLevel === 'both';
}
