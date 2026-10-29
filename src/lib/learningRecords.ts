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
  /** Learner stages: the real-life problem that opens the lesson… */
  problem?: string;
  /** …and the short ideas to learn before building. */
  ideas?: { title: string; body: string }[];
  /** A short story the learner reads (or hears) before the quiz: what we are
   *  about to do, in words a small child understands, one sentence per line. */
  story?: string[];
}

export function newLearningPlan(): LessonLearningPlan {
  return { frameworkVersion: '0.1', pathwayId: 'creative-coding', level: 'beginner',
    competencyIds: ['algorithms'], steps: [], evidenceBrief: '' };
}

export function cleanLearningPlan(plan: LessonLearningPlan): LessonLearningPlan {
  const story = plan.story?.map((line) => line.trim()).filter(Boolean);
  return { ...plan, steps: plan.steps.map((step) => step.trim()).filter(Boolean),
    evidenceBrief: plan.evidenceBrief.trim(), ...(story?.length ? { story } : { story: undefined }) };
}

export function hasUsableLearningPlan(plan: LessonLearningPlan | null | undefined): plan is LessonLearningPlan {
  return !!plan && plan.competencyIds.length > 0 && plan.steps.some((step) => step.trim())
    && !!plan.evidenceBrief.trim();
}

/** CBC performance levels: Below (BE), Approaching (AE), Meeting (ME) and Exceeding (EE) expectations. */
export type ReviewBand = 'below' | 'approaching' | 'meeting' | 'exceeding';
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
  /** True when the learner opened it from the lesson path; false when a teacher set it. */
  self_started?: boolean;
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
  admission_number?: string | null;
}
