import { supabase } from './supabase';
import type { AssignmentRecipient, CompetencyEvidence, LearningAssignment, ReviewBand } from './learningRecords';
import type { CompetencyId } from './learningFramework';

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export async function fetchAssignments(lessonId?: string): Promise<LearningAssignment[]> {
  let query = supabase.from('learning_assignments').select('*').order('created_at', { ascending: false });
  if (lessonId) query = query.eq('lesson_id', lessonId);
  return unwrap(await query);
}

export async function fetchAssignment(id: string): Promise<LearningAssignment | null> {
  return unwrap(await supabase.from('learning_assignments').select('*').eq('id', id).maybeSingle());
}

export async function fetchRecipients(assignmentId?: string): Promise<AssignmentRecipient[]> {
  let query = supabase.from('learning_assignment_recipients').select('*');
  if (assignmentId) query = query.eq('assignment_id', assignmentId);
  return unwrap(await query);
}

export async function fetchEvidence(assignmentId?: string): Promise<CompetencyEvidence[]> {
  let query = supabase.from('competency_evidence').select('*').order('recorded_at', { ascending: false });
  if (assignmentId) query = query.eq('assignment_id', assignmentId);
  return unwrap(await query);
}

export async function assignLesson(input: {
  lessonId: string; schoolId: string; studentIds: string[]; instructions: string; dueDate: string;
}): Promise<string> {
  return unwrap(await supabase.rpc('assign_learning_lesson', {
    p_lesson_id: input.lessonId, p_school_id: input.schoolId,
    p_student_ids: input.studentIds, p_instructions: input.instructions.trim(),
    p_due_date: input.dueDate || null,
  }));
}

export async function recordCompetencyEvidence(input: {
  assignmentId: string; studentId: string; evidenceText: string; evidenceUrl: string;
  feedback: string; reviews: Partial<Record<CompetencyId, ReviewBand>>;
}): Promise<string> {
  return unwrap(await supabase.rpc('record_competency_evidence', {
    p_assignment_id: input.assignmentId, p_student_id: input.studentId,
    p_evidence_text: input.evidenceText.trim(), p_evidence_url: input.evidenceUrl.trim() || null,
    p_feedback: input.feedback.trim(), p_reviews: input.reviews,
  }));
}
