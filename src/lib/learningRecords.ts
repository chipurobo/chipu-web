import type { CompetencyId, LearningLevel } from './learningFramework';

/** Persisted with each assignment, so later edits to a lesson cannot rewrite evidence. */
export interface LessonLearningPlan {
  frameworkVersion: '0.1';
  pathwayId: string;
  level: LearningLevel;
  competencyIds: CompetencyId[];
  steps: string[];
  evidenceBrief: string;
  delivery?: 'blockly';
  blocklyLessonId?: string;
  expectedResult?: string;
  contentVersion?: string;
  activityKind?: 'capstone';
  requirements?: string[];
}

export function newLearningPlan(): LessonLearningPlan {
  return { frameworkVersion: '0.1', pathwayId: 'creative-coding', level: 'beginner',
    competencyIds: ['algorithms'], steps: [], evidenceBrief: '' };
}

export function cleanLearningPlan(plan: LessonLearningPlan): LessonLearningPlan {
  return { ...plan, steps: plan.steps.map((step) => step.trim()).filter(Boolean),
    evidenceBrief: plan.evidenceBrief.trim() };
}

export function hasUsableLearningPlan(plan: LessonLearningPlan | null | undefined): plan is LessonLearningPlan {
  return !!plan && plan.competencyIds.length > 0 && plan.steps.some((step) => step.trim())
    && !!plan.evidenceBrief.trim();
}

export type ReviewBand = 'developing' | 'demonstrated' | 'extending';
export interface LearningAssignment {
  id: string;
  school_id: string;
  lesson_id: string;
  title: string;
  instructions: string;
  due_date: string | null;
  learning_plan: LessonLearningPlan;
  assigned_by: string | null;
  created_at: string;
}
export interface AssignmentRecipient {
  assignment_id: string;
  student_id: string;
}
export interface CompetencyEvidence {
  id: string;
  assignment_id: string;
  student_id: string;
  evidence_text: string;
  evidence_url: string | null;
  recorded_by: string | null;
  recorded_at: string;
  reviews: Partial<Record<CompetencyId, ReviewBand>>;
  feedback: string;
  submission_id?: string | null;
}

export interface LearningSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  evidence_text: string;
  evidence_url: string | null;
  reflection: string;
  submitted_at: string;
  blockly_workspace?: Record<string, unknown> | null;
  generated_code?: string | null;
  run_output?: string | null;
}

export interface LearningAccount {
  id: string;
  role: 'teacher' | 'learner';
  full_name: string;
  login: string;
  student_id: string | null;
}
