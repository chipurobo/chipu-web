import { supabase } from '../supabase';
import type {
  School, Programme, Product, Order, ClubMember, ProductUnit,
  CertificateTemplate, CertificateIssuance, LeaderboardRow,
  ProgrammeStage, LessonCompletion, Project, ProjectTeamMember,
  ProjectJudgment, ChipuEvent, EventSchoolLink, Profile,
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

// ── Leaderboard ─────────────────────────────────────────────
export async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.rpc('get_school_leaderboard');
  if (error) throw new Error(error.message);
  return (data ?? []) as LeaderboardRow[];
}

// ── Programmes ──────────────────────────────────────────────
export async function fetchProgrammes(): Promise<Programme[]> {
  return unwrap(await supabase.from('programmes').select('*').order('name'));
}

export async function fetchProgrammesByCreated(): Promise<Programme[]> {
  return unwrap(await supabase.from('programmes').select('*').order('created_at'));
}

// ── Programme stages ────────────────────────────────────────
export async function fetchProgrammeStages(programmeId: string): Promise<ProgrammeStage[]> {
  return unwrap(
    await supabase.from('programme_stages').select('*')
      .eq('programme_id', programmeId)
      .order('position'),
  );
}

export async function fetchActiveProgrammeStages(programmeId: string): Promise<ProgrammeStage[]> {
  return unwrap(
    await supabase.from('programme_stages').select('*')
      .eq('programme_id', programmeId)
      .eq('is_active', true)
      .order('position'),
  );
}

export async function fetchProgrammeStageById(id: string): Promise<ProgrammeStage | null> {
  const { data, error } = await supabase.from('programme_stages').select('*')
    .eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProgrammeStage | null;
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
export async function fetchCompletionsForStage(stageId: string): Promise<LessonCompletion[]> {
  return unwrap(
    await supabase.from('lesson_completions').select('*').eq('stage_id', stageId),
  );
}

export interface PassedCompletionWithStudent {
  stage_id:   string;
  student_id: string;
  passed:     boolean;
  student:    { school_id: string } | null;
}

export async function fetchPassedCompletionsWithStudent(): Promise<PassedCompletionWithStudent[]> {
  return unwrap(
    await supabase.from('lesson_completions')
      .select('stage_id, student_id, passed, student:club_members!lesson_completions_student_id_fkey(school_id)')
      .eq('passed', true),
  ) as PassedCompletionWithStudent[];
}

// ── Stock on hand ───────────────────────────────────────────
export async function fetchStockOnHandBySchool(schoolId: string): Promise<StockOnHandRow[]> {
  return unwrap(
    await supabase.from('stock_on_hand').select('*').eq('school_id', schoolId),
  ) as StockOnHandRow[];
}

// ── Projects ────────────────────────────────────────────────
export async function fetchProjectForSchool(
  schoolId: string,
  programmeId: string,
): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').select('*')
    .eq('school_id', schoolId)
    .eq('programme_id', programmeId)
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
  school:    Pick<School,    'id' | 'name' | 'county'> | null;
  programme: Pick<Programme, 'id' | 'name'> | null;
}

export async function fetchProjectsWithJoins(): Promise<ProjectWithJoins[]> {
  return unwrap(
    await supabase.from('projects').select(`
      *,
      school:schools!projects_school_id_fkey(id, name, county),
      programme:programmes!projects_programme_id_fkey(id, name)
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
