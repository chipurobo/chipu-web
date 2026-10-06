import { supabase } from './supabase';
import type { LearningLevel } from './learningFramework';
export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
}
export interface LearningQuiz {
  id: string;
  slug: string;
  version: number;
  title: string;
  level: LearningLevel;
  lesson_id: string | null;
  pass_percent: number;
  questions: QuizQuestion[];
}
export interface QuizAttempt {
  id: string;
  student_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  submitted_at: string;
  question_snapshot: {
    title: string;
    level: LearningLevel;
    version: number;
    pass_percent: number;
    questions: QuizQuestion[];
  };
  feedback: { id: string; correct: boolean; explanation: string }[];
}
export interface PortfolioItem {
  id: string;
  student_id: string;
  submission_id: string;
  title: string;
  reflection: string;
  created_at: string;
}
export interface ProgressionDecision {
  id: string;
  student_id: string;
  level: LearningLevel;
  outcome: 'awarded' | 'deferred' | 'revoked';
  reason: string;
  decided_at: string;
  policy_id: string;
}
export interface ProgressionPolicy {
  id: string;
  name: string;
  framework_version: string;
  approved: boolean;
  review_notes: string;
  required_competencies: Record<LearningLevel, string[]>;
}
export interface ProgressionReadiness {
  ready: boolean;
  policy_approved: boolean;
  missing_competencies: string[];
  quiz_attempt_id: string | null;
  capstone_review_id: string | null;
  previous_level_awarded: boolean;
}
export interface PilotReport {
  from: string;
  to: string;
  timezone: string;
  cohort: string;
  [metric: string]: string | number;
}
async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}
async function rows<T>(table: string, order: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*').order(order, { ascending: false });
  if (error) throw new Error(error.message);
  return data as T[];
}
export const listQuizzes = () => rpc<LearningQuiz[]>('list_learning_quizzes');
export const fetchQuizAttempts = () => rows<QuizAttempt>('learning_quiz_attempts', 'submitted_at');
export const submitQuiz = (quiz: string, answers: Record<string, number>) =>
  rpc<string>('submit_learning_quiz', { p_quiz_id: quiz, p_answers: answers });
export const publishQuiz = (input: {
  slug: string;
  title: string;
  level: LearningLevel;
  lesson: string;
  pass: number;
  questions: QuizQuestion[];
  solutions: Record<string, { correct: number; explanation: string }>;
}) =>
  rpc<string>('publish_learning_quiz', {
    p_slug: input.slug,
    p_title: input.title,
    p_level: input.level,
    p_lesson_id: input.lesson || null,
    p_pass_percent: input.pass,
    p_questions: input.questions,
    p_solutions: input.solutions,
  });
export const fetchPortfolio = () => rows<PortfolioItem>('learning_portfolio_items', 'created_at');
export const savePortfolio = (submission: string, title: string, reflection: string) =>
  rpc<string>('save_learning_portfolio_item', {
    p_submission_id: submission,
    p_title: title,
    p_reflection: reflection,
  });
export const removePortfolio = (item: string) =>
  rpc<void>('remove_learning_portfolio_item', { p_item_id: item });
export const fetchDecisions = () =>
  rows<ProgressionDecision>('learning_progression_decisions', 'decided_at');
export const fetchReadiness = (student: string, level: LearningLevel) =>
  rpc<ProgressionReadiness>('learning_progression_readiness', {
    p_student_id: student,
    p_level: level,
  });
export const decideProgression = (
  student: string,
  level: LearningLevel,
  outcome: string,
  reason: string,
) =>
  rpc<string>('record_learning_progression', {
    p_student_id: student,
    p_level: level,
    p_outcome: outcome,
    p_reason: reason,
  });
export const fetchPilotReport = (school: string, from: string, to: string) =>
  rpc<PilotReport>('learning_pilot_report', { p_school_id: school, p_from: from, p_to: to });
export const observeTask = (student: string, task: string, independent: boolean, barrier: string) =>
  rpc<void>('record_learning_task_observation', {
    p_student_id: student,
    p_task: task,
    p_independent: independent,
    p_barrier: barrier,
  });
export function trackLearningActivity(
  kind: 'login' | 'resource_open' | 'dashboard_open',
  lesson?: string,
) {
  void rpc<void>('record_learning_activity', { p_kind: kind, p_lesson_id: lesson || null }).catch(
    () => {
      /* Telemetry must never block a learning action. */
    },
  );
}
export function downloadArtifact(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
export const saveAttendance = (school: string, date: string, attendance: Record<string, boolean>) =>
  rpc<string>('record_learning_attendance', {
    p_school_id: school,
    p_date: date,
    p_lesson_id: null,
    p_attendance: attendance,
  });
