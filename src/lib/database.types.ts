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
  programme_id: string | null;
  created_at: string;
  updated_at: string;
}

// === Programme pipeline ===

export type StageKind =
  | 'outreach'
  | 'bootcamp_physical'
  | 'bootcamp_virtual'
  | 'lesson'
  | 'project';

export type ProjectStatus = 'draft' | 'submitted' | 'judged';

export interface Programme {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProgrammeStage {
  id: string;
  programme_id: string;
  position: number;
  title: string;
  description: string | null;
  kind: StageKind;
  /** Points awarded per student per completion. Project stages typically
   *  carry 0 — the project's 0–100 judgment score is added separately. */
  points: number;
  required_for_certificate: boolean;
  is_active: boolean;
  created_at: string;
}

export interface LessonCompletion {
  id: string;
  stage_id: string;
  student_id: string;
  confidence: number | null;   // 1–5
  passed: boolean;
  recorded_by: string | null;
  recorded_at: string;
}

export interface Project {
  id: string;
  school_id: string;
  programme_id: string;
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

/** Row shape from public.school_leaderboard view. Order: total_pts desc. */
export interface LeaderboardRow {
  school_id: string;
  school_name: string;
  county: string | null;
  programme_id: string | null;
  programme_name: string | null;
  lesson_pts: number;
  project_pts: number;
  total_pts: number;
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
  created_at: string;
}

// Despite the name (kept for backwards-compat with the table), this is
// the canonical "person at this school we can assign equipment to" row.
// in_club distinguishes the code-club roster from other students.
export interface ClubMember {
  id: string;
  school_id: string;
  full_name: string;
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
