import { supabase } from './supabase';
import type { AssignmentRecipient, CompetencyEvidence, LearningAssignment, LearningAccount, LearningSubmission, ReviewBand } from './learningRecords';
import type { ClubMember } from './database.types';
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

export async function fetchLearningStudents(schoolId: string): Promise<ClubMember[]> {
  return unwrap(await supabase.rpc('get_my_learning_students', { p_school_id: schoolId }));
}

export async function fetchSubmissions(assignmentId?: string): Promise<LearningSubmission[]> {
  let query = supabase.from('learning_submissions').select('*').order('submitted_at', { ascending: false });
  if (assignmentId) query = query.eq('assignment_id', assignmentId);
  return unwrap(await query);
}

export async function submitLearningWork(input: { assignmentId: string; text: string; url: string; reflection: string }): Promise<string> {
  return unwrap(await supabase.rpc('submit_learning_work', {
    p_assignment_id: input.assignmentId, p_evidence_text: input.text.trim(),
    p_evidence_url: input.url.trim() || null, p_reflection: input.reflection.trim(),
  }));
}

export async function reviewLearningSubmission(submissionId: string, feedback: string, reviews: Partial<Record<CompetencyId, ReviewBand>>): Promise<string> {
  return unwrap(await supabase.rpc('review_learning_submission', {
    p_submission_id: submissionId, p_feedback: feedback.trim(), p_reviews: reviews,
  }));
}

export async function fetchLearningAccounts(schoolId: string): Promise<LearningAccount[]> {
  return unwrap(await supabase.rpc('admin_list_learning_accounts', { p_school_id: schoolId }));
}

export async function createLearningAccount(input: { schoolId: string; role: 'teacher' | 'learner'; login: string; password: string; fullName: string; studentId: string; teacherStudentIds: string[] }): Promise<{ user_id: string; login: string; role: string }> {
  return unwrap(await supabase.rpc('admin_create_learning_account', {
    p_school_id: input.schoolId, p_role: input.role, p_login: input.login.trim(), p_password: input.password,
    p_full_name: input.fullName.trim(), p_student_id: input.role === 'learner' ? input.studentId : null,
    p_teacher_student_ids: input.role === 'teacher' ? input.teacherStudentIds : [],
  }));
}

export async function setTeacherStudents(teacherId: string, studentIds: string[]): Promise<void> {
  unwrap(await supabase.rpc('admin_set_teacher_students', { p_teacher_id: teacherId, p_student_ids: studentIds }));
}
