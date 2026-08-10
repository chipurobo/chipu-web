import { supabase } from '../supabase';
import type {
  School, Product, Order, ClubMember, ProductUnit,
  CertificateTemplate, CertificateIssuance,
  Lesson, LessonCompletion, Project, ProjectTeamMember,
  ProjectJudgment, ChipuEvent, EventSchoolLink, Profile,
  ProgrammeSession, SessionAttendance, SessionActivity, YpnStatus,
  Instrument, InstrumentVersion, InstrumentResponse, InstrumentAnswer,
  ProgrammeAction, Workshop, WorkshopMode, StageKind,
} from '../database.types';

export interface StockOnHandRow {
  school_id:  string;
  product_id: string;
  on_hand:    number;
}

export interface EventAttendanceRow {
  event_id:  string;
  school_id: string;
}

/** Row shape from list_maker_spaces() — deliberately free of contact PII. */
export interface MakerSpaceOption {
  id:     string;
  name:   string;
  county: string | null;
}

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

// ── Lessons (belong to a workshop / events row) ─────────────
// RLS scopes reads: a school lead sees only lessons for workshops their
// school is enrolled in; admins see all.
export async function fetchLessonsForSchool(): Promise<Lesson[]> {
  return unwrap(
    await supabase.from('lessons').select('*')
      .eq('is_active', true)
      .order('position'),
  );
}

export async function fetchLessonsForWorkshop(eventId: string): Promise<Lesson[]> {
  return unwrap(
    await supabase.from('lessons').select('*')
      .eq('event_id', eventId)
      .order('position'),
  );
}

export async function fetchLessonById(id: string): Promise<Lesson | null> {
  const { data, error } = await supabase.from('lessons').select('*')
    .eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Lesson | null;
}

// ── Schools ─────────────────────────────────────────────────
export async function fetchSchools(): Promise<School[]> {
  return unwrap(await supabase.from('schools').select('*').order('name'));
}

export async function fetchSchoolById(id: string): Promise<School | null> {
  const { data, error } = await supabase.from('schools').select('*')
    .eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as School | null;
}

/**
 * Maker spaces a school can route an order to.
 *
 * Backed by the list_maker_spaces() RPC rather than a `schools` select: the
 * old schools_maker_space_directory policy granted whole rows, which handed
 * every authenticated account the contact_name / contact_phone /
 * contact_email of every maker space. The RPC projects only what the
 * dropdown renders. A counterparty's contact details become readable once
 * an order actually links the two schools (schools_order_counterparties).
 */
export async function fetchMakerSpaces(): Promise<MakerSpaceOption[]> {
  const { data, error } = await supabase.rpc('list_maker_spaces');
  if (error) throw new Error(error.message);
  return (data ?? []) as MakerSpaceOption[];
}

export async function fetchSchoolsByCreated(): Promise<School[]> {
  return unwrap(
    await supabase.from('schools').select('*').order('created_at', { ascending: false }),
  );
}

// ── Products ────────────────────────────────────────────────
export async function fetchProducts(): Promise<Product[]> {
  return unwrap(
    await supabase.from('products').select('*').order('created_at', { ascending: false }),
  );
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  return unwrap(await supabase.from('products').select('*').in('id', ids));
}

// ── Orders ──────────────────────────────────────────────────
export async function fetchOrders(): Promise<Order[]> {
  return unwrap(
    await supabase.from('orders').select('*').order('placed_at', { ascending: false }),
  );
}

export async function fetchOrdersPlacedBy(schoolId: string): Promise<Order[]> {
  return unwrap(
    await supabase.from('orders').select('*')
      .eq('placed_by_school_id', schoolId)
      .order('placed_at', { ascending: false }),
  );
}

export async function fetchOrdersFulfilledBy(schoolId: string): Promise<Order[]> {
  return unwrap(
    await supabase.from('orders').select('*')
      .eq('fulfilled_by_school_id', schoolId)
      .order('placed_at', { ascending: false }),
  );
}

export interface OrderWithJoins extends Order {
  product:              Pick<Product, 'id' | 'name' | 'sku' | 'is_durable'> | null;
  placed_by_school:     Pick<School,  'id' | 'name'> | null;
  fulfilled_by_school:  Pick<School,  'id' | 'name'> | null;
}

export async function fetchOrdersWithJoins(): Promise<OrderWithJoins[]> {
  return unwrap(
    await supabase.from('orders').select(`
      *,
      product:products!orders_product_id_fkey(id, name, sku, is_durable),
      placed_by_school:schools!orders_placed_by_school_id_fkey(id, name),
      fulfilled_by_school:schools!orders_fulfilled_by_school_id_fkey(id, name)
    `).order('placed_at', { ascending: false }),
  ) as OrderWithJoins[];
}

export async function fetchOrdersAdmin(): Promise<OrderWithJoins[]> {
  return unwrap(
    await supabase.from('orders').select(`
      *,
      product:products!orders_product_id_fkey(id, name, sku, is_durable),
      placed_by_school:schools!orders_placed_by_school_id_fkey(id, name),
      fulfilled_by_school:schools!orders_fulfilled_by_school_id_fkey(id, name)
    `).order('placed_at', { ascending: false }).limit(200),
  ) as OrderWithJoins[];
}

export interface AssignmentRowGql extends Order {
  product:          Pick<Product, 'id' | 'name' | 'sku' | 'is_durable'> | null;
  placed_by_school: Pick<School,  'id' | 'name'> | null;
}

export async function fetchConsumableAssignments(): Promise<AssignmentRowGql[]> {
  return unwrap(
    await supabase.from('orders').select(`
      *,
      product:products!orders_product_id_fkey(id, name, sku, is_durable),
      placed_by_school:schools!orders_placed_by_school_id_fkey(id, name)
    `)
      .is('fulfilled_by_school_id', null)
      .order('placed_at', { ascending: false })
      .limit(100),
  ) as AssignmentRowGql[];
}

export interface ProdOrderGql extends Order {
  product: Pick<Product, 'id' | 'name' | 'sku' | 'is_durable'> | null;
  placed_by_school: { id: string; name: string; contact_email: string | null } | null;
  product_units: Pick<ProductUnit, 'id' | 'serial_number' | 'status'>[];
}

export async function fetchOrdersForMakerProduction(schoolId: string): Promise<ProdOrderGql[]> {
  return unwrap(
    await supabase.from('orders').select(`
      *,
      product:products!orders_product_id_fkey(id, name, sku, is_durable),
      placed_by_school:schools!orders_placed_by_school_id_fkey(id, name, contact_email),
      product_units:product_units!product_units_order_id_fkey(id, serial_number, status)
    `)
      .eq('fulfilled_by_school_id', schoolId)
      .in('status', ['placed', 'accepted', 'in_production', 'shipped'])
      .order('placed_at'),
  ) as ProdOrderGql[];
}

// ── Club members (students) ─────────────────────────────────
export async function fetchMembersBySchool(schoolId: string): Promise<ClubMember[]> {
  return unwrap(
    await supabase.from('club_members').select('*')
      .eq('school_id', schoolId)
      .order('full_name'),
  );
}

export async function fetchMembersBySchoolJoinedDesc(schoolId: string): Promise<ClubMember[]> {
  return unwrap(
    await supabase.from('club_members').select('*')
      .eq('school_id', schoolId)
      .order('joined_at', { ascending: false }),
  );
}

export async function fetchMembersBySchoolUnordered(schoolId: string): Promise<ClubMember[]> {
  return unwrap(
    await supabase.from('club_members').select('*').eq('school_id', schoolId),
  );
}

// ── Product units (durables) ────────────────────────────────
export async function fetchUnitsAtSchool(schoolId: string): Promise<ProductUnit[]> {
  return unwrap(
    await supabase.from('product_units').select('*')
      .eq('current_school_id', schoolId)
      .order('fabricated_at', { ascending: false }),
  );
}

export interface UnitWithJoins extends ProductUnit {
  product: Pick<Product, 'id' | 'name' | 'sku'> | null;
  current_member: Pick<ClubMember, 'id' | 'full_name' | 'in_club'> | null;
}

export async function fetchUnitsAtSchoolWithJoins(schoolId: string): Promise<UnitWithJoins[]> {
  return unwrap(
    await supabase.from('product_units').select(`
      *,
      product:products!product_units_product_id_fkey(id, name, sku),
      current_member:club_members!product_units_current_member_id_fkey(id, full_name, in_club)
    `)
      .eq('current_school_id', schoolId)
      .order('fabricated_at', { ascending: false }),
  ) as UnitWithJoins[];
}

// ── Lesson completions ──────────────────────────────────────
export async function fetchCompletionsForLesson(lessonId: string): Promise<LessonCompletion[]> {
  return unwrap(
    await supabase.from('lesson_completions').select('*').eq('lesson_id', lessonId),
  );
}

export interface PassedCompletionWithStudent {
  lesson_id:  string;
  student_id: string;
  passed:     boolean;
  student:    { school_id: string } | null;
}

export async function fetchPassedCompletionsWithStudent(): Promise<PassedCompletionWithStudent[]> {
  return unwrap(
    await supabase.from('lesson_completions')
      .select('lesson_id, student_id, passed, student:club_members!lesson_completions_student_id_fkey(school_id)')
      .eq('passed', true),
  ) as PassedCompletionWithStudent[];
}

// ── Stock on hand ───────────────────────────────────────────
export async function fetchStockOnHandBySchool(schoolId: string): Promise<StockOnHandRow[]> {
  return unwrap(
    await supabase.from('stock_on_hand').select('*').eq('school_id', schoolId),
  ) as StockOnHandRow[];
}

// ── Projects (free-standing, one per school) ────────────────
export async function fetchProjectForSchool(schoolId: string): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').select('*')
    .eq('school_id', schoolId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Project | null;
}

export async function fetchAllProjects(): Promise<Project[]> {
  return unwrap(
    await supabase.from('projects').select('*').order('updated_at', { ascending: false }),
  );
}

export async function fetchProjectTeam(projectId: string): Promise<ProjectTeamMember[]> {
  return unwrap(
    await supabase.from('project_team_members').select('*').eq('project_id', projectId),
  );
}

export interface ProjectTeamMemberWithStudent extends ProjectTeamMember {
  student: Pick<ClubMember, 'id' | 'full_name' | 'grade'> | null;
}

export async function fetchProjectTeamWithStudent(
  projectId: string,
): Promise<ProjectTeamMemberWithStudent[]> {
  return unwrap(
    await supabase.from('project_team_members')
      .select('*, student:club_members!project_team_members_student_id_fkey(id, full_name, grade)')
      .eq('project_id', projectId),
  ) as ProjectTeamMemberWithStudent[];
}

export async function fetchProjectJudgment(projectId: string): Promise<ProjectJudgment | null> {
  const { data, error } = await supabase.from('project_judgments').select('*')
    .eq('project_id', projectId).maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProjectJudgment | null;
}

export async function fetchAllProjectJudgments(): Promise<ProjectJudgment[]> {
  return unwrap(await supabase.from('project_judgments').select('*'));
}

export interface ProjectWithJoins extends Project {
  school: Pick<School, 'id' | 'name' | 'county'> | null;
}

export async function fetchProjectsWithJoins(): Promise<ProjectWithJoins[]> {
  return unwrap(
    await supabase.from('projects').select(`
      *,
      school:schools!projects_school_id_fkey(id, name, county)
    `)
      .order('submitted_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
  ) as ProjectWithJoins[];
}

// ── Certificates ────────────────────────────────────────────
export async function fetchCertificateTemplates(): Promise<CertificateTemplate[]> {
  return unwrap(
    await supabase.from('certificate_templates').select('*').order('title'),
  );
}

export async function fetchRecentIssuances(limit = 30): Promise<CertificateIssuance[]> {
  return unwrap(
    await supabase.from('certificate_issuances').select('*')
      .order('issued_at', { ascending: false })
      .limit(limit),
  );
}

export async function fetchIssuancesBySchool(schoolId: string): Promise<CertificateIssuance[]> {
  return unwrap(
    await supabase.from('certificate_issuances').select('*')
      .eq('school_id', schoolId)
      .order('issued_at', { ascending: false }),
  );
}

export async function fetchIssuanceById(id: string): Promise<CertificateIssuance | null> {
  const { data, error } = await supabase.from('certificate_issuances').select('*')
    .eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as CertificateIssuance | null;
}

export interface IssuanceWithJoins extends CertificateIssuance {
  template: CertificateTemplate | null;
  school:   Pick<School, 'id' | 'name' | 'county'> | null;
  student:  Pick<ClubMember, 'id' | 'full_name' | 'grade'> | null;
}

export async function fetchIssuanceByIdWithJoins(id: string): Promise<IssuanceWithJoins | null> {
  const { data, error } = await supabase.from('certificate_issuances').select(`
    *,
    template:certificate_templates!certificate_issuances_template_id_fkey(*),
    school:schools!certificate_issuances_school_id_fkey(id, name, county),
    student:club_members!certificate_issuances_student_id_fkey(id, full_name, grade)
  `).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as IssuanceWithJoins | null;
}

export interface IssuanceSchoolRow extends CertificateIssuance {
  template: Pick<CertificateTemplate, 'id' | 'title' | 'audience' | 'programme' | 'hero_color'> | null;
  student:  Pick<ClubMember, 'id' | 'full_name'> | null;
}

export async function fetchIssuancesBySchoolWithJoins(
  schoolId: string,
): Promise<IssuanceSchoolRow[]> {
  return unwrap(
    await supabase.from('certificate_issuances').select(`
      *,
      template:certificate_templates!certificate_issuances_template_id_fkey(id, title, audience, programme, hero_color),
      student:club_members!certificate_issuances_student_id_fkey(id, full_name)
    `)
      .eq('school_id', schoolId)
      .is('revoked_at', null)
      .order('issued_at', { ascending: false }),
  ) as IssuanceSchoolRow[];
}

export interface IssuanceAdminRow extends CertificateIssuance {
  template: Pick<CertificateTemplate, 'id' | 'title' | 'audience'> | null;
  school:   Pick<School, 'id' | 'name'> | null;
  student:  Pick<ClubMember, 'id' | 'full_name'> | null;
}

export async function fetchRecentIssuancesAdmin(): Promise<IssuanceAdminRow[]> {
  return unwrap(
    await supabase.from('certificate_issuances').select(`
      *,
      template:certificate_templates!certificate_issuances_template_id_fkey(id, title, audience),
      school:schools!certificate_issuances_school_id_fkey(id, name),
      student:club_members!certificate_issuances_student_id_fkey(id, full_name)
    `)
      .order('issued_at', { ascending: false })
      .limit(30),
  ) as IssuanceAdminRow[];
}

// ── Events ──────────────────────────────────────────────────
export async function fetchEvents(): Promise<ChipuEvent[]> {
  return unwrap(
    await supabase.from('events').select('*').order('start_at', { ascending: false }),
  );
}

export async function fetchEventSchoolLinks(): Promise<EventSchoolLink[]> {
  return unwrap(await supabase.from('event_schools').select('*'));
}

export interface EventWithSchools extends ChipuEvent {
  event_schools: Array<{
    school_id:   string;
    attended_at: string | null;
    school:      Pick<School, 'id' | 'name'> | null;
  }>;
}

export async function fetchEventsWithSchools(): Promise<EventWithSchools[]> {
  return unwrap(
    await supabase.from('events').select(`
      *,
      event_schools(
        school_id,
        attended_at,
        school:schools!event_schools_school_id_fkey(id, name)
      )
    `).order('start_at', { ascending: false }),
  ) as EventWithSchools[];
}

export async function fetchEventAttendancesEventId(): Promise<{ event_id: string }[]> {
  return unwrap(
    await supabase.from('event_attendances').select('event_id'),
  ) as { event_id: string }[];
}

export async function fetchEventAttendances(): Promise<EventAttendanceRow[]> {
  return unwrap(
    await supabase.from('event_attendances').select('event_id, school_id'),
  ) as EventAttendanceRow[];
}

export interface EventSchoolWithEvent {
  attended_at: string | null;
  event_id:    string;
  school_id:   string;
  event:       ChipuEvent | null;
}

export async function fetchEventSchoolsWithEvent(): Promise<EventSchoolWithEvent[]> {
  return unwrap(
    await supabase.from('event_schools').select(`
      attended_at, event_id, school_id,
      event:events!event_schools_event_id_fkey(*)
    `),
  ) as EventSchoolWithEvent[];
}

// ── Profiles ────────────────────────────────────────────────
export async function fetchProfiles(): Promise<Profile[]> {
  return unwrap(await supabase.from('profiles').select('*'));
}

// ── MERL: sessions and attendance ───────────────────────────
// RLS scopes every read and write below to the caller's school (admins see
// all), so none of these filter by school defensively in the client.

export interface SessionWithLesson extends ProgrammeSession {
  lesson: Pick<Lesson, 'id' | 'title'> | null;
}

export async function fetchSessionsForSchool(schoolId: string): Promise<SessionWithLesson[]> {
  return unwrap(
    await supabase.from('sessions').select(`
      *,
      lesson:lessons!sessions_lesson_id_fkey(id, title)
    `)
      .eq('school_id', schoolId)
      .order('session_date', { ascending: false }),
  ) as SessionWithLesson[];
}

export async function fetchSession(sessionId: string): Promise<SessionWithLesson> {
  return unwrap(
    await supabase.from('sessions').select(`
      *,
      lesson:lessons!sessions_lesson_id_fkey(id, title)
    `).eq('id', sessionId).single(),
  ) as SessionWithLesson;
}

export async function createSession(
  input: Partial<ProgrammeSession> & { school_id: string; activity_type: SessionActivity; session_date: string; delivered: YpnStatus },
): Promise<ProgrammeSession> {
  return unwrap(await supabase.from('sessions').insert(input).select().single());
}

export async function updateSession(
  sessionId: string, patch: Partial<ProgrammeSession>,
): Promise<ProgrammeSession> {
  return unwrap(
    await supabase.from('sessions').update(patch).eq('id', sessionId).select().single(),
  );
}

export async function fetchSessionAttendance(sessionId: string): Promise<SessionAttendance[]> {
  return unwrap(
    await supabase.from('session_attendance').select('*').eq('session_id', sessionId),
  );
}

/** Bulk upsert of only the rows the facilitator actually touched, matching the
 *  dirty-row pattern the lesson roster already uses — a register filled on a
 *  weak connection should not resend the whole class. */
export async function saveSessionAttendance(
  rows: Array<Pick<SessionAttendance, 'session_id' | 'learner_id' | 'teacher_id' | 'present' | 'support_note'>>,
): Promise<void> {
  if (rows.length === 0) return;
  const learners = rows.filter((r) => r.learner_id);
  const teachers = rows.filter((r) => r.teacher_id);
  // Two calls because the unique indexes are partial (one per participant
  // kind); a single upsert cannot name both conflict targets.
  if (learners.length) {
    const res = await supabase.from('session_attendance')
      .upsert(learners, { onConflict: 'session_id,learner_id' });
    if (res.error) throw new Error(res.error.message);
  }
  if (teachers.length) {
    const res = await supabase.from('session_attendance')
      .upsert(teachers, { onConflict: 'session_id,teacher_id' });
    if (res.error) throw new Error(res.error.message);
  }
}

// ── MERL: instruments ───────────────────────────────────────

export async function fetchInstruments(): Promise<Instrument[]> {
  return unwrap(
    await supabase.from('instruments').select('*').eq('is_active', true).order('title'),
  );
}

/** The active version of an instrument with its sections and questions, ready
 *  to render. Ordering is explicit so the form matches the printed document. */
export async function fetchActiveInstrumentVersion(slug: string): Promise<InstrumentVersion> {
  return unwrap(
    await supabase.from('instrument_versions').select(`
      *,
      instruments!inner(*),
      instrument_sections(
        *,
        instrument_questions(*)
      )
    `)
      .eq('instruments.slug', slug)
      .eq('status', 'active')
      .order('position', { referencedTable: 'instrument_sections' })
      .order('position', { referencedTable: 'instrument_sections.instrument_questions' })
      .single(),
  ) as InstrumentVersion;
}

export interface ResponseWithMeta extends InstrumentResponse {
  version: (InstrumentVersion & { instruments: Instrument | null }) | null;
}

export async function fetchResponsesForSchool(schoolId: string): Promise<ResponseWithMeta[]> {
  return unwrap(
    await supabase.from('instrument_responses').select(`
      *,
      version:instrument_versions!instrument_responses_version_id_fkey(
        *, instruments!instrument_versions_instrument_id_fkey(*)
      )
    `)
      .eq('school_id', schoolId)
      .order('collected_at', { ascending: false }),
  ) as ResponseWithMeta[];
}

export async function createResponse(
  input: Partial<InstrumentResponse> & { version_id: string },
): Promise<InstrumentResponse> {
  return unwrap(await supabase.from('instrument_responses').insert(input).select().single());
}

export async function fetchAnswers(responseId: string): Promise<InstrumentAnswer[]> {
  return unwrap(
    await supabase.from('instrument_answers').select('*').eq('response_id', responseId),
  );
}

export async function saveAnswers(
  rows: Array<Omit<InstrumentAnswer, 'id'>>,
): Promise<void> {
  if (rows.length === 0) return;
  const res = await supabase.from('instrument_answers')
    .upsert(rows, { onConflict: 'response_id,question_id' });
  if (res.error) throw new Error(res.error.message);
}

export async function submitResponse(responseId: string): Promise<void> {
  const res = await supabase.from('instrument_responses')
    .update({ status: 'submitted', submitted_at: new Date().toISOString() })
    .eq('id', responseId);
  if (res.error) throw new Error(res.error.message);
}

// ── MERL: programme actions ─────────────────────────────────

export async function fetchActionsForSchool(schoolId: string): Promise<ProgrammeAction[]> {
  return unwrap(
    await supabase.from('programme_actions').select('*')
      .eq('school_id', schoolId)
      .order('status')
      .order('due_date', { nullsFirst: false }),
  );
}

export async function createAction(
  input: Partial<ProgrammeAction> & { school_id: string; description: string },
): Promise<ProgrammeAction> {
  return unwrap(await supabase.from('programme_actions').insert(input).select().single());
}

export async function updateAction(
  actionId: string, patch: Partial<ProgrammeAction>,
): Promise<ProgrammeAction> {
  return unwrap(
    await supabase.from('programme_actions').update(patch).eq('id', actionId).select().single(),
  );
}

/** Attendance rows for a batch of sessions, so a session list can show
 *  present/absent counts without one query per row. */
export async function fetchAttendanceForSessions(sessionIds: string[]): Promise<SessionAttendance[]> {
  if (sessionIds.length === 0) return [];
  return unwrap(
    await supabase.from('session_attendance').select('*').in('session_id', sessionIds),
  );
}

/** School leads at a school — the teachers who can appear on a register.
 *  Admin profiles are excluded: they are staff, not programme participants. */
export async function fetchTeachersAtSchool(schoolId: string): Promise<Profile[]> {
  return unwrap(
    await supabase.from('profiles').select('*')
      .eq('school_id', schoolId)
      .eq('role', 'school_lead')
      .order('full_name'),
  );
}

/** A single response with the frozen version it was collected against —
 *  sections and questions come from that version, never from the instrument's
 *  current wording, so historical answers keep their original meaning. */
export async function fetchResponseWithForm(responseId: string): Promise<ResponseWithForm> {
  return unwrap(
    await supabase.from('instrument_responses').select(`
      *,
      version:instrument_versions!instrument_responses_version_id_fkey(
        *,
        instruments!instrument_versions_instrument_id_fkey(*),
        instrument_sections(*, instrument_questions(*))
      )
    `)
      .eq('id', responseId)
      .order('position', { referencedTable: 'version.instrument_sections' })
      .order('position', { referencedTable: 'version.instrument_sections.instrument_questions' })
      .single(),
  ) as ResponseWithForm;
}

export interface ResponseWithForm extends InstrumentResponse {
  version: (InstrumentVersion & {
    instruments: Instrument | null;
    instrument_sections: Array<{
      id: string; position: number; code: string | null; title: string;
      description: string | null; staff_only: boolean;
      instrument_questions: Array<{
        id: string; position: number; code: string | null; prompt: string;
        help_text: string | null; qtype: string; options: unknown; required: boolean;
      }>;
    }>;
  }) | null;
}

// ── Curriculum lessons ──────────────────────────────────────
// Lessons stand alone now: they are the curriculum, not the contents of a
// workshop. Every signed-in user can read the active set, which is what makes
// "browse the curriculum and request a workshop" possible.

export async function fetchCurriculumLessons(): Promise<Lesson[]> {
  return unwrap(
    await supabase.from('lessons').select('*')
      .eq('is_active', true)
      .order('position'),
  );
}

export async function fetchAllLessonsAdmin(): Promise<Lesson[]> {
  return unwrap(
    await supabase.from('lessons').select('*').order('position'),
  );
}

export async function createLesson(
  input: Partial<Lesson> & { title: string; kind: StageKind; position: number },
): Promise<Lesson> {
  return unwrap(await supabase.from('lessons').insert(input).select().single());
}

export async function updateLesson(id: string, patch: Partial<Lesson>): Promise<Lesson> {
  return unwrap(
    await supabase.from('lessons').update(patch).eq('id', id).select().single(),
  );
}

// ── Workshops ───────────────────────────────────────────────

export interface WorkshopWithJoins extends Workshop {
  lesson: Pick<Lesson, 'id' | 'title' | 'kind'> | null;
  school: Pick<School, 'id' | 'name'> | null;
}

const WORKSHOP_SELECT = `
  *,
  lesson:lessons!workshops_lesson_id_fkey(id, title, kind),
  school:schools!workshops_school_id_fkey(id, name)
`;

/** Every workshop the caller can see. RLS gives a school lead their own
 *  school's rows and an admin the full queue, so this is the same call for
 *  both roles. */
export async function fetchWorkshops(): Promise<WorkshopWithJoins[]> {
  return unwrap(
    await supabase.from('workshops').select(WORKSHOP_SELECT)
      .order('created_at', { ascending: false }),
  ) as WorkshopWithJoins[];
}

export async function fetchWorkshopsForSchool(schoolId: string): Promise<WorkshopWithJoins[]> {
  return unwrap(
    await supabase.from('workshops').select(WORKSHOP_SELECT)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false }),
  ) as WorkshopWithJoins[];
}

/** A school or teacher asking for training on a lesson. Status is left at the
 *  default: a database trigger rejects any non-admin trying to create a
 *  workshop that is already scheduled or delivered. */
export async function requestWorkshop(input: {
  lesson_id: string;
  school_id: string;
  requested_by: string | null;
  mode: WorkshopMode;
  request_note: string | null;
  title: string | null;
}): Promise<Workshop> {
  return unwrap(await supabase.from('workshops').insert(input).select().single());
}

export async function updateWorkshop(id: string, patch: Partial<Workshop>): Promise<Workshop> {
  return unwrap(
    await supabase.from('workshops').update(patch).eq('id', id).select().single(),
  );
}
