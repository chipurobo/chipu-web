import { supabase } from './supabase';
import type { CompetencyId, LearningLevel } from './learningFramework';
import type { ReviewBand } from './learningRecords';
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
  /** Where the check sits inside its lesson; null for level practice quizzes. */
  stage: QuizStage | null;
  pass_percent: number;
  questions: QuizQuestion[];
}
export type QuizStage = 'pre' | 'mid' | 'end';
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
/** CBC end-of-course assessment: one overall performance level and a comment. */
export interface CbcAssessment {
  id: string;
  student_id: string;
  performance_level: ReviewBand;
  comment: string;
  decided_at: string;
  summary_snapshot: CbcSummary;
}
/** What the teacher sees before deciding. The suggestion is a guide only. */
export interface CbcSummary {
  skills: Partial<Record<CompetencyId, ReviewBand>>;
  suggested_level: ReviewBand | null;
  lessons_sent: number;
  projects_sent: number;
  final_checks_passed: number;
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
  stage?: QuizStage | '';
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
    p_stage: input.stage || null,
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
export const fetchCbcAssessments = () =>
  rows<CbcAssessment>('learning_cbc_assessments', 'decided_at');
export const fetchCbcSummary = (student: string) =>
  rpc<CbcSummary>('learning_cbc_summary', { p_student_id: student });
export const recordCbcAssessment = (student: string, level: ReviewBand, comment: string) =>
  rpc<string>('record_cbc_assessment', { p_student_id: student, p_level: level, p_comment: comment });
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
