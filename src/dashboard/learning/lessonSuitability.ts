import type { LearningNeed, LessonReviewStatus } from '../../lib/database.types';

export const LEARNING_NEEDS: Array<{ id: LearningNeed; label: string }> = [
  { id: 'hearing support', label: 'Hearing support' },
  { id: 'visual support', label: 'Visual support' },
  { id: 'reading support', label: 'Reading support' },
  { id: 'motor support', label: 'Motor support' },
  { id: 'language support', label: 'Language support' },
  { id: 'step-by-step support', label: 'Step-by-step support' },
];

export const REVIEW_STATUS_LABEL: Record<LessonReviewStatus, string> = {
  draft: 'Draft',
  under_review: 'Under Review',
  approved: 'Approved',
  needs_revision: 'Needs Revision',
  withdrawn: 'Withdrawn',
};
