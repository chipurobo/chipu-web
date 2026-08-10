// Hand-written types that mirror supabase/migrations/20260601000000_init.sql.
//
// When the schema changes meaningfully, regenerate properly with:
//   npx supabase gen types typescript --local > src/lib/database.types.ts
// (you'll lose the human-friendly comments, but it'll always be in sync).

export type SchoolType = 'special' | 'integrated' | 'mainstream';
export type UserRole = 'admin' | 'school_lead';
export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
export type UnitStatus =
  | 'with_maker'
  | 'in_transit'
  | 'with_school'
  | 'with_user'
  | 'returned'
  | 'retired';

export type EventType = 'outreach' | 'bootcamp_physical' | 'bootcamp_webinar';
export type CertAudience = 'student' | 'teacher';

export interface CertificateTemplate {
  id: string;
  title: string;
  description: string | null;
  programme: string | null;
  audience: CertAudience;
  duration_text: string | null;
  criteria_text: string | null;
  hero_color: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CertificateIssuance {
  id: string;
  template_id: string;
  student_id: string | null;
  teacher_id: string | null;
  school_id: string;
  notes: string | null;
  issued_at: string;
  issued_by: string | null;
  revoked_at: string | null;
}

export interface ChipuEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  start_at: string;
  end_at: string | null;
  location: string | null;
  url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface EventSchoolLink {
  event_id: string;
  school_id: string;
  attended_at: string | null;
  created_at: string;
}

export interface EventAttendance {
  id: string;
  event_id: string;
  school_id: string;
  student_id: string;
  attended_at: string;
}

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  is_maker_space: boolean;
  county: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

// === Lessons (belong to a workshop / events row) ===

export type StageKind =
  | 'outreach'
  | 'bootcamp_physical'
  | 'bootcamp_virtual'
  | 'lesson'
  | 'async_track'
  | 'project';

export type ProjectStatus = 'draft' | 'submitted' | 'judged';

export interface Lesson {
  id: string;
  /** The workshop (events row) this lesson belongs to. */
  event_id: string;
  position: number;
  title: string;
  description: string | null;
  kind: StageKind;
  /** Points awarded per student per completion. */
  points: number;
  required_for_certificate: boolean;
  is_active: boolean;
  created_at: string;
}

export interface LessonCompletion {
  id: string;
  lesson_id: string;
  student_id: string;
  confidence: number | null;   // 1–5
  passed: boolean;
  recorded_by: string | null;
  recorded_at: string;
  /** Public URL proving the completion, e.g. a freeCodeCamp certification
   *  verification link. http(s) only — enforced by a DB check constraint. */
  evidence_url: string | null;
}

export interface Project {
  id: string;
  school_id: string;
  title: string;
  description: string | null;
  repo_url: string | null;
  video_url: string | null;
  image_url: string | null;
  status: ProjectStatus;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectTeamMember {
  project_id: string;
  student_id: string;
  role: string | null;
}

export interface ProjectJudgment {
  project_id: string;
  score: number;               // 0–100
  comment: string | null;
  judged_by: string;
  judged_at: string;
}

// Row shape returned by the public.public_schools_map view — visible to
// anonymous visitors for the marketing-site map. Any school with
// coordinates appears; is_maker_space tells the marker popup whether to
// show the maker-space badge.
export interface PublicSchoolPin {
  id: string;
  name: string;
  county: string | null;
  latitude: number;
  longitude: number;
  is_maker_space: boolean;
}

export interface CodeClub {
  id: string;
  school_id: string;
  registered_by: string;
  roster_image_path: string | null;
  member_count: number;
  registered_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  school_id: string | null;
  // Non-identifying code required by the MERL Plan for analysis and shared
  // reports. Issued to school leads only; null on admin accounts.
  teacher_code: string | null;
  created_at: string;
}

// Despite the name (kept for backwards-compat with the table), this is
// the canonical "person at this school we can assign equipment to" row.
// in_club distinguishes the code-club roster from other students.
export interface ClubMember {
  id: string;
  school_id: string;
  full_name: string;
  // Non-identifying analysis code. Use this, never full_name, in exports and
  // anything shared outside the school that owns the roster.
  learner_code: string | null;
  grade: string | null;
  is_active: boolean;
  in_club: boolean;
  has_disability: boolean;
  disability_notes: string | null;
  joined_at: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  is_durable: boolean;
  sku: string | null;
  designed_by_school_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  placed_by_school_id: string;
  fulfilled_by_school_id: string | null;
  product_id: string;
  quantity: number;
  status: OrderStatus;
  notes: string | null;
  expected_delivery: string | null;
  placed_at: string;
  accepted_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface ProductUnit {
  id: string;
  serial_number: string;
  product_id: string;
  order_id: string | null;
  fabricated_by_school_id: string;
  current_school_id: string | null;
  current_member_id: string | null;
  status: UnitStatus;
  fabricated_at: string;
  assigned_at: string | null;
  notes: string | null;
}

export interface StockLedgerEntry {
  id: string;
  school_id: string;
  product_id: string;
  delta: number;
  order_id: string | null;
  recorded_by: string;
  recorded_at: string;
  note: string | null;
}

// RPC return types
export interface RegisterSchoolWithClubArgs {
  p_school_name: string;
  p_county: string;
  p_school_type: SchoolType;
  p_is_maker_space: boolean;
  p_member_count: number;
  p_full_name: string;
  p_phone: string;
  p_contact_email?: string | null;
}

// ============================================================================
// MERL — sessions, attendance, instruments and actions
// (migrations 20260810000000 – 20260810000002)
// ============================================================================

export type SessionActivity =
  | 'weekly_code_club'
  | 'teacher_support'
  | 'bootcamp'
  | 'hackathon'
  | 'webinar'
  | 'other';

/** "Yes / Partly / No" — the recurring three-state answer in the MERL forms. */
export type YpnStatus = 'yes' | 'partly' | 'no';

// One delivered (or attempted) activity. Carries the weekly monitoring form's
// narrative fields; `delivered` is the signal that separates "taught it" from
// "could not teach it", which used to be indistinguishable.
export interface ProgrammeSession {
  id: string;
  school_id: string;
  activity_type: SessionActivity;
  activity_other: string | null;
  session_date: string;
  week_ending: string | null;
  lesson_id: string | null;
  facilitators: string | null;
  delivered: YpnStatus;
  delivery_note: string | null;
  focus: string | null;
  learner_activity: string | null;
  evidence_observed: string | null;
  inclusion_supports: string | null;
  resources_adequate: YpnStatus | null;
  resources_note: string | null;
  notable_pattern: string | null;
  new_participants: number | null;
  recorded_by: string | null;
  recorded_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// Exactly one of learner_id / teacher_id is set — enforced by a check
// constraint, so teachers attending their own training are recordable.
export interface SessionAttendance {
  id: string;
  session_id: string;
  learner_id: string | null;
  teacher_id: string | null;
  present: boolean;
  support_note: string | null;
  created_at: string;
}

export type InstrumentSubject = 'teacher' | 'learner' | 'school' | 'participant';
export type InstrumentRound = 'baseline' | 'endline' | 'adhoc';
export type ResponseStatus = 'draft' | 'submitted';
export type AssessorMode = 'self' | 'assessor';
export type QuestionType =
  | 'scale'
  | 'single_select'
  | 'multi_select'
  | 'short_text'
  | 'long_text'
  | 'boolean'
  | 'integer'
  | 'date';

/** One option on a scale/select question. `score` is null for opt-outs
 *  ("Not sure", "Not applicable") so they stay out of any mean. */
export interface QuestionOption {
  value: string;
  label: string;
  score?: number | null;
}

export interface Instrument {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  subject_type: InstrumentSubject;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface InstrumentQuestion {
  id: string;
  section_id: string;
  position: number;
  code: string | null;
  prompt: string;
  help_text: string | null;
  qtype: QuestionType;
  options: QuestionOption[] | null;
  required: boolean;
}

export interface InstrumentSection {
  id: string;
  version_id: string;
  position: number;
  code: string | null;
  title: string;
  description: string | null;
  // "Completed by programme team" — never rendered to a self-administering
  // respondent.
  staff_only: boolean;
  instrument_questions?: InstrumentQuestion[];
}

export interface InstrumentVersion {
  id: string;
  instrument_id: string;
  version: number;
  status: 'draft' | 'active' | 'retired';
  notes: string | null;
  published_at: string | null;
  instruments?: Instrument;
  instrument_sections?: InstrumentSection[];
}

export interface InstrumentResponse {
  id: string;
  version_id: string;
  school_id: string | null;
  learner_id: string | null;
  teacher_id: string | null;
  is_anonymous: boolean;
  round: InstrumentRound;
  matched_response_id: string | null;
  consent_confirmed: boolean;
  consent_note: string | null;
  assessor_mode: AssessorMode;
  status: ResponseStatus;
  collected_at: string;
  collected_by: string | null;
  submitted_at: string | null;
  created_at: string;
}

export interface InstrumentAnswer {
  id: string;
  response_id: string;
  question_id: string;
  value_number: number | null;
  value_text: string | null;
  value_bool: boolean | null;
  value_options: string[] | null;
}

export type ActionStatus = 'open' | 'closed';
export type ActionSource =
  | 'weekly_session'
  | 'school_baseline'
  | 'school_visit'
  | 'other';

// The action/owner/due-date/status tracker that appears three times in the
// paper toolkit, modelled once.
export interface ProgrammeAction {
  id: string;
  school_id: string;
  source: ActionSource;
  session_id: string | null;
  response_id: string | null;
  description: string;
  owner_profile_id: string | null;
  owner_name: string | null;
  due_date: string | null;
  status: ActionStatus;
  closed_at: string | null;
  closed_note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Workshops — training requested against a lesson
// (migration 20260810000003)
//
// The relationship runs lesson → workshop, not the reverse. A lesson is
// curriculum and stands alone; a workshop is a school's request for training
// on that lesson, delivered physically or virtually.
// ============================================================================

export type WorkshopMode = 'physical' | 'virtual';
export type WorkshopStatus =
  | 'requested'
  | 'scheduled'
  | 'delivered'
  | 'declined'
  | 'cancelled';

export interface Workshop {
  id: string;
  /** Null only on rows migrated from bootcamp events that taught zero or
   *  several lessons — new requests always carry one. */
  lesson_id: string | null;
  school_id: string;
  requested_by: string | null;
  title: string | null;
  mode: WorkshopMode;
  status: WorkshopStatus;
  request_note: string | null;
  scheduled_for: string | null;
  facilitator: string | null;
  delivered_at: string | null;
  decline_reason: string | null;
  /** Provenance for rows migrated out of events; attendance still resolves
   *  through the original event row, which was not deleted. */
  source_event_id: string | null;
  created_at: string;
  updated_at: string;
}
