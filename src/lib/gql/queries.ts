// =============================================================
// Hand-typed GraphQL operations for Supabase pg_graphql.
//
// These mirror the shape of the typed SDK that `npm run codegen` will
// generate at src/lib/gql/sdk.ts. Until codegen has been run, every
// dashboard page imports these helpers. After codegen, you can swap
// any individual helper to call `sdk.OperationName()` instead — the
// return shapes are identical.
//
// pg_graphql conventions:
//   • Every table becomes a `<table>Collection` query returning
//     { edges: [{ node: { ...row } }] }. We unwrap edges → rows in
//     the helpers so callers see plain arrays.
//   • Filtering uses { filter: { col: { eq: "..." } } }.
//   • Ordering uses [{ col: AscNullsLast }] etc.
//   • Foreign-key joins follow the relation name set by Postgres.
// =============================================================

import { gqlClient } from '../graphqlClient';
import { supabase } from '../supabase';
import type {
  School, Programme, Product, Order, ClubMember, ProductUnit,
  CertificateTemplate, CertificateIssuance, LeaderboardRow,
  ProgrammeStage, LessonCompletion, Project, ProjectTeamMember,
  ProjectJudgment, ChipuEvent, EventSchoolLink, Profile,
} from '../database.types';

// ─────────────────────────────────────────────────────────────
// Stock view row — mirrors public.stock_on_hand (school_id, product_id, on_hand).
// Not declared in database.types.ts because the view has no row-shape there.
// ─────────────────────────────────────────────────────────────
export interface StockOnHandRow {
  school_id:  string;
  product_id: string;
  on_hand:    number;
}

// ─────────────────────────────────────────────────────────────
// EventAttendance row — light shape used by callers that only care
// about per-school / per-event tallies (event_id, school_id).
// ─────────────────────────────────────────────────────────────
export interface EventAttendanceRow {
  event_id:  string;
  school_id: string;
}

// ─────────────────────────────────────────────────────────────
// Generic edges → rows unwrapper
// ─────────────────────────────────────────────────────────────
interface EdgeBag<T> {
  edges: { node: T }[];
}
function rows<T>(bag: EdgeBag<T> | null | undefined): T[] {
  return (bag?.edges ?? []).map((e) => e.node);
}

// ─────────────────────────────────────────────────────────────
// Leaderboard
// ─────────────────────────────────────────────────────────────
// The leaderboard is an intentional cross-school aggregate, served by the
// SECURITY DEFINER RPC get_school_leaderboard() (authenticated only). It
// replaced the school_leaderboard view — a definer view is flagged by the
// Supabase Security Advisor, a definer function with pinned search_path
// is the sanctioned pattern. Rows arrive pre-sorted by total_pts desc.
export async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.rpc('get_school_leaderboard');
  if (error) throw new Error(error.message);
  return (data ?? []) as LeaderboardRow[];
}

// ─────────────────────────────────────────────────────────────
// Programmes
// ─────────────────────────────────────────────────────────────
const PROGRAMMES_QUERY = /* GraphQL */ `
  query GetProgrammes {
    programmesCollection(orderBy: [{ name: AscNullsLast }]) {
      edges {
        node {
          id
          slug
          name
          description
          is_active
          created_at
        }
      }
    }
  }
`;
export async function fetchProgrammes(): Promise<Programme[]> {
  const data = await gqlClient.request<{
    programmesCollection: EdgeBag<Programme>;
  }>(PROGRAMMES_QUERY);
  return rows(data.programmesCollection);
}

// ─────────────────────────────────────────────────────────────
// Programme stages — used by school-side Lessons + LessonStage
// ─────────────────────────────────────────────────────────────
const PROGRAMME_STAGES_QUERY = /* GraphQL */ `
  query GetProgrammeStages($programmeId: UUID!) {
    programme_stagesCollection(
      filter: { programme_id: { eq: $programmeId } }
      orderBy: [{ position: AscNullsLast }]
    ) {
      edges {
        node {
          id
          programme_id
          position
          title
          description
          kind
          points
          required_for_certificate
          is_active
          created_at
        }
      }
    }
  }
`;
export async function fetchProgrammeStages(programmeId: string): Promise<ProgrammeStage[]> {
  const data = await gqlClient.request<{
    programme_stagesCollection: EdgeBag<ProgrammeStage>;
  }>(PROGRAMME_STAGES_QUERY, { programmeId });
  return rows(data.programme_stagesCollection);
}

// ─────────────────────────────────────────────────────────────
// Schools
// ─────────────────────────────────────────────────────────────
const SCHOOLS_QUERY = /* GraphQL */ `
  query GetSchools {
    schoolsCollection(orderBy: [{ name: AscNullsLast }]) {
      edges {
        node {
          id
          name
          type
          is_maker_space
          county
          contact_name
          contact_phone
          contact_email
          latitude
          longitude
          programme_id
          created_at
          updated_at
        }
      }
    }
  }
`;
export async function fetchSchools(): Promise<School[]> {
  const data = await gqlClient.request<{ schoolsCollection: EdgeBag<School> }>(SCHOOLS_QUERY);
  return rows(data.schoolsCollection);
}

const SCHOOL_BY_ID_QUERY = /* GraphQL */ `
  query GetSchoolById($id: UUID!) {
    schoolsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          name
          type
          is_maker_space
          county
          contact_name
          contact_phone
          contact_email
          latitude
          longitude
          programme_id
          created_at
          updated_at
        }
      }
    }
  }
`;
export async function fetchSchoolById(id: string): Promise<School | null> {
  const data = await gqlClient.request<{ schoolsCollection: EdgeBag<School> }>(
    SCHOOL_BY_ID_QUERY,
    { id },
  );
  return rows(data.schoolsCollection)[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────
const PRODUCTS_QUERY = /* GraphQL */ `
  query GetProducts {
    productsCollection(orderBy: [{ created_at: DescNullsLast }]) {
      edges {
        node {
          id
          name
          description
          category
          is_durable
          sku
          designed_by_school_id
          is_active
          created_at
        }
      }
    }
  }
`;
export async function fetchProducts(): Promise<Product[]> {
  const data = await gqlClient.request<{ productsCollection: EdgeBag<Product> }>(PRODUCTS_QUERY);
  return rows(data.productsCollection);
}

// ─────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────
const ORDERS_QUERY = /* GraphQL */ `
  query GetOrders {
    ordersCollection(orderBy: [{ placed_at: DescNullsLast }]) {
      edges {
        node {
          id
          placed_by_school_id
          fulfilled_by_school_id
          product_id
          quantity
          status
          notes
          expected_delivery
          placed_at
          accepted_at
          shipped_at
          delivered_at
        }
      }
    }
  }
`;
export async function fetchOrders(): Promise<Order[]> {
  const data = await gqlClient.request<{ ordersCollection: EdgeBag<Order> }>(ORDERS_QUERY);
  return rows(data.ordersCollection);
}

const ORDERS_PLACED_BY_QUERY = /* GraphQL */ `
  query GetOrdersPlacedBy($schoolId: UUID!) {
    ordersCollection(
      filter: { placed_by_school_id: { eq: $schoolId } }
      orderBy: [{ placed_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          placed_by_school_id
          fulfilled_by_school_id
          product_id
          quantity
          status
          notes
          expected_delivery
          placed_at
          accepted_at
          shipped_at
          delivered_at
        }
      }
    }
  }
`;
export async function fetchOrdersPlacedBy(schoolId: string): Promise<Order[]> {
  const data = await gqlClient.request<{ ordersCollection: EdgeBag<Order> }>(
    ORDERS_PLACED_BY_QUERY,
    { schoolId },
  );
  return rows(data.ordersCollection);
}

const ORDERS_FULFILLED_BY_QUERY = /* GraphQL */ `
  query GetOrdersFulfilledBy($schoolId: UUID!) {
    ordersCollection(
      filter: { fulfilled_by_school_id: { eq: $schoolId } }
      orderBy: [{ placed_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          placed_by_school_id
          fulfilled_by_school_id
          product_id
          quantity
          status
          notes
          expected_delivery
          placed_at
          accepted_at
          shipped_at
          delivered_at
        }
      }
    }
  }
`;
export async function fetchOrdersFulfilledBy(schoolId: string): Promise<Order[]> {
  const data = await gqlClient.request<{ ordersCollection: EdgeBag<Order> }>(
    ORDERS_FULFILLED_BY_QUERY,
    { schoolId },
  );
  return rows(data.ordersCollection);
}

// ─────────────────────────────────────────────────────────────
// Club members (students)
// ─────────────────────────────────────────────────────────────
const MEMBERS_BY_SCHOOL_QUERY = /* GraphQL */ `
  query GetMembersBySchool($schoolId: UUID!) {
    club_membersCollection(
      filter: { school_id: { eq: $schoolId } }
      orderBy: [{ full_name: AscNullsLast }]
    ) {
      edges {
        node {
          id
          school_id
          full_name
          grade
          is_active
          in_club
          has_disability
          disability_notes
          joined_at
          created_at
        }
      }
    }
  }
`;
export async function fetchMembersBySchool(schoolId: string): Promise<ClubMember[]> {
  const data = await gqlClient.request<{ club_membersCollection: EdgeBag<ClubMember> }>(
    MEMBERS_BY_SCHOOL_QUERY,
    { schoolId },
  );
  return rows(data.club_membersCollection);
}

// ─────────────────────────────────────────────────────────────
// Product units (durables)
// ─────────────────────────────────────────────────────────────
const UNITS_AT_SCHOOL_QUERY = /* GraphQL */ `
  query GetUnitsAtSchool($schoolId: UUID!) {
    product_unitsCollection(
      filter: { current_school_id: { eq: $schoolId } }
      orderBy: [{ fabricated_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          serial_number
          product_id
          order_id
          fabricated_by_school_id
          current_school_id
          current_member_id
          status
          fabricated_at
          assigned_at
          notes
        }
      }
    }
  }
`;
export async function fetchUnitsAtSchool(schoolId: string): Promise<ProductUnit[]> {
  const data = await gqlClient.request<{ product_unitsCollection: EdgeBag<ProductUnit> }>(
    UNITS_AT_SCHOOL_QUERY,
    { schoolId },
  );
  return rows(data.product_unitsCollection);
}

// ─────────────────────────────────────────────────────────────
// Lesson completions for a single stage (school side)
// ─────────────────────────────────────────────────────────────
const COMPLETIONS_FOR_STAGE_QUERY = /* GraphQL */ `
  query GetCompletionsForStage($stageId: UUID!) {
    lesson_completionsCollection(filter: { stage_id: { eq: $stageId } }) {
      edges {
        node {
          id
          stage_id
          student_id
          confidence
          passed
          recorded_by
          recorded_at
        }
      }
    }
  }
`;
export async function fetchCompletionsForStage(stageId: string): Promise<LessonCompletion[]> {
  const data = await gqlClient.request<{
    lesson_completionsCollection: EdgeBag<LessonCompletion>;
  }>(COMPLETIONS_FOR_STAGE_QUERY, { stageId });
  return rows(data.lesson_completionsCollection);
}

// ─────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────
const PROJECT_FOR_SCHOOL_QUERY = /* GraphQL */ `
  query GetProjectForSchool($schoolId: UUID!, $programmeId: UUID!) {
    projectsCollection(
      filter: {
        and: [
          { school_id: { eq: $schoolId } }
          { programme_id: { eq: $programmeId } }
        ]
      }
    ) {
      edges {
        node {
          id
          school_id
          programme_id
          title
          description
          repo_url
          video_url
          image_url
          status
          submitted_at
          created_at
          updated_at
        }
      }
    }
  }
`;
export async function fetchProjectForSchool(
  schoolId: string,
  programmeId: string,
): Promise<Project | null> {
  const data = await gqlClient.request<{ projectsCollection: EdgeBag<Project> }>(
    PROJECT_FOR_SCHOOL_QUERY,
    { schoolId, programmeId },
  );
  return rows(data.projectsCollection)[0] ?? null;
}

const PROJECTS_ALL_QUERY = /* GraphQL */ `
  query GetAllProjects {
    projectsCollection(orderBy: [{ updated_at: DescNullsLast }]) {
      edges {
        node {
          id
          school_id
          programme_id
          title
          description
          repo_url
          video_url
          image_url
          status
          submitted_at
          created_at
          updated_at
        }
      }
    }
  }
`;
export async function fetchAllProjects(): Promise<Project[]> {
  const data = await gqlClient.request<{ projectsCollection: EdgeBag<Project> }>(PROJECTS_ALL_QUERY);
  return rows(data.projectsCollection);
}

const PROJECT_TEAM_QUERY = /* GraphQL */ `
  query GetProjectTeam($projectId: UUID!) {
    project_team_membersCollection(filter: { project_id: { eq: $projectId } }) {
      edges {
        node {
          project_id
          student_id
          role
        }
      }
    }
  }
`;
export async function fetchProjectTeam(projectId: string): Promise<ProjectTeamMember[]> {
  const data = await gqlClient.request<{
    project_team_membersCollection: EdgeBag<ProjectTeamMember>;
  }>(PROJECT_TEAM_QUERY, { projectId });
  return rows(data.project_team_membersCollection);
}

const PROJECT_JUDGMENT_QUERY = /* GraphQL */ `
  query GetProjectJudgment($projectId: UUID!) {
    project_judgmentsCollection(filter: { project_id: { eq: $projectId } }) {
      edges {
        node {
          project_id
          score
          comment
          judged_by
          judged_at
        }
      }
    }
  }
`;
export async function fetchProjectJudgment(projectId: string): Promise<ProjectJudgment | null> {
  const data = await gqlClient.request<{ project_judgmentsCollection: EdgeBag<ProjectJudgment> }>(
    PROJECT_JUDGMENT_QUERY,
    { projectId },
  );
  return rows(data.project_judgmentsCollection)[0] ?? null;
}

const PROJECT_JUDGMENTS_ALL_QUERY = /* GraphQL */ `
  query GetAllJudgments {
    project_judgmentsCollection {
      edges {
        node {
          project_id
          score
          comment
          judged_by
          judged_at
        }
      }
    }
  }
`;
export async function fetchAllProjectJudgments(): Promise<ProjectJudgment[]> {
  const data = await gqlClient.request<{ project_judgmentsCollection: EdgeBag<ProjectJudgment> }>(
    PROJECT_JUDGMENTS_ALL_QUERY,
  );
  return rows(data.project_judgmentsCollection);
}

// ─────────────────────────────────────────────────────────────
// Certificates
// ─────────────────────────────────────────────────────────────
const CERT_TEMPLATES_QUERY = /* GraphQL */ `
  query GetCertificateTemplates {
    certificate_templatesCollection(orderBy: [{ title: AscNullsLast }]) {
      edges {
        node {
          id
          title
          description
          programme
          audience
          duration_text
          criteria_text
          hero_color
          is_active
          created_at
        }
      }
    }
  }
`;
export async function fetchCertificateTemplates(): Promise<CertificateTemplate[]> {
  const data = await gqlClient.request<{
    certificate_templatesCollection: EdgeBag<CertificateTemplate>;
  }>(CERT_TEMPLATES_QUERY);
  return rows(data.certificate_templatesCollection);
}

const CERT_ISSUANCES_RECENT_QUERY = /* GraphQL */ `
  query GetRecentIssuances($limit: Int) {
    certificate_issuancesCollection(
      orderBy: [{ issued_at: DescNullsLast }]
      first: $limit
    ) {
      edges {
        node {
          id
          template_id
          student_id
          teacher_id
          school_id
          notes
          issued_at
          issued_by
          revoked_at
        }
      }
    }
  }
`;
export async function fetchRecentIssuances(limit = 30): Promise<CertificateIssuance[]> {
  const data = await gqlClient.request<{
    certificate_issuancesCollection: EdgeBag<CertificateIssuance>;
  }>(CERT_ISSUANCES_RECENT_QUERY, { limit });
  return rows(data.certificate_issuancesCollection);
}

const CERT_ISSUANCES_BY_SCHOOL_QUERY = /* GraphQL */ `
  query GetIssuancesBySchool($schoolId: UUID!) {
    certificate_issuancesCollection(
      filter: { school_id: { eq: $schoolId } }
      orderBy: [{ issued_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          template_id
          student_id
          teacher_id
          school_id
          notes
          issued_at
          issued_by
          revoked_at
        }
      }
    }
  }
`;
export async function fetchIssuancesBySchool(schoolId: string): Promise<CertificateIssuance[]> {
  const data = await gqlClient.request<{
    certificate_issuancesCollection: EdgeBag<CertificateIssuance>;
  }>(CERT_ISSUANCES_BY_SCHOOL_QUERY, { schoolId });
  return rows(data.certificate_issuancesCollection);
}

const CERT_ISSUANCE_BY_ID_QUERY = /* GraphQL */ `
  query GetIssuanceById($id: UUID!) {
    certificate_issuancesCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          template_id
          student_id
          teacher_id
          school_id
          notes
          issued_at
          issued_by
          revoked_at
        }
      }
    }
  }
`;
export async function fetchIssuanceById(id: string): Promise<CertificateIssuance | null> {
  const data = await gqlClient.request<{
    certificate_issuancesCollection: EdgeBag<CertificateIssuance>;
  }>(CERT_ISSUANCE_BY_ID_QUERY, { id });
  return rows(data.certificate_issuancesCollection)[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
// Events / event_schools / event_attendances
// ─────────────────────────────────────────────────────────────
const EVENTS_QUERY = /* GraphQL */ `
  query GetEvents {
    eventsCollection(orderBy: [{ start_at: DescNullsLast }]) {
      edges {
        node {
          id
          title
          description
          event_type
          start_at
          end_at
          location
          url
          created_by
          created_at
        }
      }
    }
  }
`;
export async function fetchEvents(): Promise<ChipuEvent[]> {
  const data = await gqlClient.request<{ eventsCollection: EdgeBag<ChipuEvent> }>(EVENTS_QUERY);
  return rows(data.eventsCollection);
}

const EVENT_SCHOOLS_QUERY = /* GraphQL */ `
  query GetEventSchools {
    event_schoolsCollection {
      edges {
        node {
          event_id
          school_id
          attended_at
          created_at
        }
      }
    }
  }
`;
export async function fetchEventSchoolLinks(): Promise<EventSchoolLink[]> {
  const data = await gqlClient.request<{
    event_schoolsCollection: EdgeBag<EventSchoolLink>;
  }>(EVENT_SCHOOLS_QUERY);
  return rows(data.event_schoolsCollection);
}

const PROFILES_QUERY = /* GraphQL */ `
  query GetProfiles {
    profilesCollection {
      edges {
        node {
          id
          full_name
          phone
          role
          school_id
          created_at
        }
      }
    }
  }
`;
export async function fetchProfiles(): Promise<Profile[]> {
  const data = await gqlClient.request<{ profilesCollection: EdgeBag<Profile> }>(PROFILES_QUERY);
  return rows(data.profilesCollection);
}

// =============================================================
// Additional helpers added in part 2 of the GraphQL migration —
// one per dashboard read that needed a shape the original helpers
// didn't cover. Naming/ordering mirrors the existing supabase-js
// query so the visible page behaviour is preserved.
// =============================================================

// ─────────────────────────────────────────────────────────────
// Schools — ordered by created_at desc (admin Schools listing)
// ─────────────────────────────────────────────────────────────
const SCHOOLS_BY_CREATED_QUERY = /* GraphQL */ `
  query GetSchoolsByCreated {
    schoolsCollection(orderBy: [{ created_at: DescNullsLast }]) {
      edges {
        node {
          id
          name
          type
          is_maker_space
          county
          contact_name
          contact_phone
          contact_email
          latitude
          longitude
          programme_id
          created_at
          updated_at
        }
      }
    }
  }
`;
export async function fetchSchoolsByCreated(): Promise<School[]> {
  const data = await gqlClient.request<{ schoolsCollection: EdgeBag<School> }>(
    SCHOOLS_BY_CREATED_QUERY,
  );
  return rows(data.schoolsCollection);
}

// ─────────────────────────────────────────────────────────────
// Programmes — ordered by created_at asc (admin Programmes listing)
// ─────────────────────────────────────────────────────────────
const PROGRAMMES_BY_CREATED_QUERY = /* GraphQL */ `
  query GetProgrammesByCreated {
    programmesCollection(orderBy: [{ created_at: AscNullsLast }]) {
      edges {
        node {
          id
          slug
          name
          description
          is_active
          created_at
        }
      }
    }
  }
`;
export async function fetchProgrammesByCreated(): Promise<Programme[]> {
  const data = await gqlClient.request<{
    programmesCollection: EdgeBag<Programme>;
  }>(PROGRAMMES_BY_CREATED_QUERY);
  return rows(data.programmesCollection);
}

// ─────────────────────────────────────────────────────────────
// Programme stages — only is_active=true, ordered by position
// (school-side Lessons page)
// ─────────────────────────────────────────────────────────────
const ACTIVE_PROGRAMME_STAGES_QUERY = /* GraphQL */ `
  query GetActiveProgrammeStages($programmeId: UUID!) {
    programme_stagesCollection(
      filter: {
        and: [
          { programme_id: { eq: $programmeId } }
          { is_active:    { eq: true } }
        ]
      }
      orderBy: [{ position: AscNullsLast }]
    ) {
      edges {
        node {
          id
          programme_id
          position
          title
          description
          kind
          points
          required_for_certificate
          is_active
          created_at
        }
      }
    }
  }
`;
export async function fetchActiveProgrammeStages(programmeId: string): Promise<ProgrammeStage[]> {
  const data = await gqlClient.request<{
    programme_stagesCollection: EdgeBag<ProgrammeStage>;
  }>(ACTIVE_PROGRAMME_STAGES_QUERY, { programmeId });
  return rows(data.programme_stagesCollection);
}

// ─────────────────────────────────────────────────────────────
// One programme stage by id — school-side LessonStage page
// ─────────────────────────────────────────────────────────────
const PROGRAMME_STAGE_BY_ID_QUERY = /* GraphQL */ `
  query GetProgrammeStageById($id: UUID!) {
    programme_stagesCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          programme_id
          position
          title
          description
          kind
          points
          required_for_certificate
          is_active
          created_at
        }
      }
    }
  }
`;
export async function fetchProgrammeStageById(id: string): Promise<ProgrammeStage | null> {
  const data = await gqlClient.request<{
    programme_stagesCollection: EdgeBag<ProgrammeStage>;
  }>(PROGRAMME_STAGE_BY_ID_QUERY, { id });
  return rows(data.programme_stagesCollection)[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
// Club members for a school, ordered by joined_at desc
// (school Members page — same cache key as fetchMembersBySchool;
//  the previous supabase-js code ordered by joined_at desc here)
// ─────────────────────────────────────────────────────────────
const MEMBERS_BY_SCHOOL_JOINED_DESC_QUERY = /* GraphQL */ `
  query GetMembersBySchoolJoinedDesc($schoolId: UUID!) {
    club_membersCollection(
      filter: { school_id: { eq: $schoolId } }
      orderBy: [{ joined_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          school_id
          full_name
          grade
          is_active
          in_club
          has_disability
          disability_notes
          joined_at
          created_at
        }
      }
    }
  }
`;
export async function fetchMembersBySchoolJoinedDesc(schoolId: string): Promise<ClubMember[]> {
  const data = await gqlClient.request<{ club_membersCollection: EdgeBag<ClubMember> }>(
    MEMBERS_BY_SCHOOL_JOINED_DESC_QUERY,
    { schoolId },
  );
  return rows(data.club_membersCollection);
}

// ─────────────────────────────────────────────────────────────
// Club members for a school — no order (school Lessons page)
// ─────────────────────────────────────────────────────────────
const MEMBERS_BY_SCHOOL_UNORDERED_QUERY = /* GraphQL */ `
  query GetMembersBySchoolUnordered($schoolId: UUID!) {
    club_membersCollection(filter: { school_id: { eq: $schoolId } }) {
      edges {
        node {
          id
          school_id
          full_name
          grade
          is_active
          in_club
          has_disability
          disability_notes
          joined_at
          created_at
        }
      }
    }
  }
`;
export async function fetchMembersBySchoolUnordered(schoolId: string): Promise<ClubMember[]> {
  const data = await gqlClient.request<{ club_membersCollection: EdgeBag<ClubMember> }>(
    MEMBERS_BY_SCHOOL_UNORDERED_QUERY,
    { schoolId },
  );
  return rows(data.club_membersCollection);
}

// ─────────────────────────────────────────────────────────────
// Passed lesson completions — every row + its student.school_id,
// so the school Lessons page can scope counts to its own students.
// (The original supabase-js select did the same join.)
// ─────────────────────────────────────────────────────────────
export interface PassedCompletionWithStudent {
  stage_id:   string;
  student_id: string;
  passed:     boolean;
  student:    { school_id: string } | null;
}
const PASSED_COMPLETIONS_WITH_STUDENT_QUERY = /* GraphQL */ `
  query GetPassedCompletionsWithStudent {
    lesson_completionsCollection(filter: { passed: { eq: true } }) {
      edges {
        node {
          stage_id
          student_id
          passed
          student {
            school_id
          }
        }
      }
    }
  }
`;
export async function fetchPassedCompletionsWithStudent(): Promise<PassedCompletionWithStudent[]> {
  const data = await gqlClient.request<{
    lesson_completionsCollection: EdgeBag<PassedCompletionWithStudent>;
  }>(PASSED_COMPLETIONS_WITH_STUDENT_QUERY);
  return rows(data.lesson_completionsCollection);
}

// ─────────────────────────────────────────────────────────────
// Product units at a school WITH joined product + assigned member —
// used by school Stock page.
// ─────────────────────────────────────────────────────────────
export interface UnitWithJoins extends ProductUnit {
  product: Pick<Product, 'id' | 'name' | 'sku'> | null;
  current_member: Pick<ClubMember, 'id' | 'full_name' | 'in_club'> | null;
}
const UNITS_AT_SCHOOL_WITH_JOINS_QUERY = /* GraphQL */ `
  query GetUnitsAtSchoolWithJoins($schoolId: UUID!) {
    product_unitsCollection(
      filter: { current_school_id: { eq: $schoolId } }
      orderBy: [{ fabricated_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          serial_number
          product_id
          order_id
          fabricated_by_school_id
          current_school_id
          current_member_id
          status
          fabricated_at
          assigned_at
          notes
          product {
            id
            name
            sku
          }
          current_member {
            id
            full_name
            in_club
          }
        }
      }
    }
  }
`;
export async function fetchUnitsAtSchoolWithJoins(schoolId: string): Promise<UnitWithJoins[]> {
  const data = await gqlClient.request<{
    product_unitsCollection: EdgeBag<UnitWithJoins>;
  }>(UNITS_AT_SCHOOL_WITH_JOINS_QUERY, { schoolId });
  return rows(data.product_unitsCollection);
}

// ─────────────────────────────────────────────────────────────
// Stock on hand for a school — pg_graphql exposes the view as a
// Collection. Returns raw rows; the caller stitches product info.
// ─────────────────────────────────────────────────────────────
const STOCK_ON_HAND_BY_SCHOOL_QUERY = /* GraphQL */ `
  query GetStockOnHandBySchool($schoolId: UUID!) {
    stock_on_handCollection(filter: { school_id: { eq: $schoolId } }) {
      edges {
        node {
          school_id
          product_id
          on_hand
        }
      }
    }
  }
`;
export async function fetchStockOnHandBySchool(schoolId: string): Promise<StockOnHandRow[]> {
  const data = await gqlClient.request<{
    stock_on_handCollection: EdgeBag<StockOnHandRow>;
  }>(STOCK_ON_HAND_BY_SCHOOL_QUERY, { schoolId });
  return rows(data.stock_on_handCollection);
}

// ─────────────────────────────────────────────────────────────
// Products by id list — used by Stock page after stock_on_hand
// rows arrive (so we can show product name/sku/category).
// ─────────────────────────────────────────────────────────────
const PRODUCTS_BY_IDS_QUERY = /* GraphQL */ `
  query GetProductsByIds($ids: [UUID!]!) {
    productsCollection(filter: { id: { in: $ids } }) {
      edges {
        node {
          id
          name
          description
          category
          is_durable
          sku
          designed_by_school_id
          is_active
          created_at
        }
      }
    }
  }
`;
export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const data = await gqlClient.request<{ productsCollection: EdgeBag<Product> }>(
    PRODUCTS_BY_IDS_QUERY,
    { ids },
  );
  return rows(data.productsCollection);
}

// ─────────────────────────────────────────────────────────────
// Orders with joined product + placer + fulfiller schools —
// used by school Orders page (sees every order RLS allows).
// ─────────────────────────────────────────────────────────────
export interface OrderWithJoins extends Order {
  product:              Pick<Product, 'id' | 'name' | 'sku' | 'is_durable'> | null;
  placed_by_school:     Pick<School,  'id' | 'name'> | null;
  fulfilled_by_school:  Pick<School,  'id' | 'name'> | null;
}
const ORDERS_WITH_JOINS_QUERY = /* GraphQL */ `
  query GetOrdersWithJoins {
    ordersCollection(orderBy: [{ placed_at: DescNullsLast }]) {
      edges {
        node {
          id
          placed_by_school_id
          fulfilled_by_school_id
          product_id
          quantity
          status
          notes
          expected_delivery
          placed_at
          accepted_at
          shipped_at
          delivered_at
          product {
            id
            name
            sku
            is_durable
          }
          placed_by_school {
            id
            name
          }
          fulfilled_by_school {
            id
            name
          }
        }
      }
    }
  }
`;
export async function fetchOrdersWithJoins(): Promise<OrderWithJoins[]> {
  const data = await gqlClient.request<{ ordersCollection: EdgeBag<OrderWithJoins> }>(
    ORDERS_WITH_JOINS_QUERY,
  );
  return rows(data.ordersCollection);
}

// ─────────────────────────────────────────────────────────────
// Admin orders feed — joined product + placer + fulfiller, limit 200.
// Cache key in the page: ['orders', 'admin']
// ─────────────────────────────────────────────────────────────
const ORDERS_ADMIN_QUERY = /* GraphQL */ `
  query GetOrdersAdmin {
    ordersCollection(
      orderBy: [{ placed_at: DescNullsLast }]
      first: 200
    ) {
      edges {
        node {
          id
          placed_by_school_id
          fulfilled_by_school_id
          product_id
          quantity
          status
          notes
          expected_delivery
          placed_at
          accepted_at
          shipped_at
          delivered_at
          product {
            id
            name
            sku
            is_durable
          }
          placed_by_school {
            id
            name
          }
          fulfilled_by_school {
            id
            name
          }
        }
      }
    }
  }
`;
export async function fetchOrdersAdmin(): Promise<OrderWithJoins[]> {
  const data = await gqlClient.request<{ ordersCollection: EdgeBag<OrderWithJoins> }>(
    ORDERS_ADMIN_QUERY,
  );
  return rows(data.ordersCollection);
}

// ─────────────────────────────────────────────────────────────
// Consumable assignments — orders with fulfilled_by_school_id NULL,
// joined product + placer. (admin Distribute)
// ─────────────────────────────────────────────────────────────
export interface AssignmentRowGql extends Order {
  product:          Pick<Product, 'id' | 'name' | 'sku' | 'is_durable'> | null;
  placed_by_school: Pick<School,  'id' | 'name'> | null;
}
const CONSUMABLE_ASSIGNMENTS_QUERY = /* GraphQL */ `
  query GetConsumableAssignments {
    ordersCollection(
      filter: { fulfilled_by_school_id: { is: NULL } }
      orderBy: [{ placed_at: DescNullsLast }]
      first: 100
    ) {
      edges {
        node {
          id
          placed_by_school_id
          fulfilled_by_school_id
          product_id
          quantity
          status
          notes
          expected_delivery
          placed_at
          accepted_at
          shipped_at
          delivered_at
          product {
            id
            name
            sku
            is_durable
          }
          placed_by_school {
            id
            name
          }
        }
      }
    }
  }
`;
export async function fetchConsumableAssignments(): Promise<AssignmentRowGql[]> {
  const data = await gqlClient.request<{ ordersCollection: EdgeBag<AssignmentRowGql> }>(
    CONSUMABLE_ASSIGNMENTS_QUERY,
  );
  return rows(data.ordersCollection);
}

// ─────────────────────────────────────────────────────────────
// Maker-space production queue — orders routed TO a school, with
// joined product + placer + fabricated units. Status filter limits
// to live stages (placed / accepted / in_production / shipped) and
// the original supabase-js code orders by placed_at ASC.
// ─────────────────────────────────────────────────────────────
export interface ProdOrderGql extends Order {
  product: Pick<Product, 'id' | 'name' | 'sku' | 'is_durable'> | null;
  placed_by_school: { id: string; name: string; contact_email: string | null } | null;
  product_units: Pick<ProductUnit, 'id' | 'serial_number' | 'status'>[];
}
const ORDERS_FOR_MAKER_PRODUCTION_QUERY = /* GraphQL */ `
  query GetOrdersForMakerProduction($schoolId: UUID!) {
    ordersCollection(
      filter: {
        and: [
          { fulfilled_by_school_id: { eq: $schoolId } }
          { status: { in: ["placed", "accepted", "in_production", "shipped"] } }
        ]
      }
      orderBy: [{ placed_at: AscNullsLast }]
    ) {
      edges {
        node {
          id
          placed_by_school_id
          fulfilled_by_school_id
          product_id
          quantity
          status
          notes
          expected_delivery
          placed_at
          accepted_at
          shipped_at
          delivered_at
          product {
            id
            name
            sku
            is_durable
          }
          placed_by_school {
            id
            name
            contact_email
          }
          product_unitsCollection {
            edges {
              node {
                id
                serial_number
                status
              }
            }
          }
        }
      }
    }
  }
`;
interface ProdOrderRaw extends Order {
  product: Pick<Product, 'id' | 'name' | 'sku' | 'is_durable'> | null;
  placed_by_school: { id: string; name: string; contact_email: string | null } | null;
  product_unitsCollection: EdgeBag<Pick<ProductUnit, 'id' | 'serial_number' | 'status'>>;
}
export async function fetchOrdersForMakerProduction(schoolId: string): Promise<ProdOrderGql[]> {
  const data = await gqlClient.request<{ ordersCollection: EdgeBag<ProdOrderRaw> }>(
    ORDERS_FOR_MAKER_PRODUCTION_QUERY,
    { schoolId },
  );
  return rows(data.ordersCollection).map((o) => ({
    ...o,
    product_units: rows(o.product_unitsCollection),
  }));
}

// ─────────────────────────────────────────────────────────────
// Project team members with student detail — used by school
// Project page + admin Projects panel.
// ─────────────────────────────────────────────────────────────
export interface ProjectTeamMemberWithStudent extends ProjectTeamMember {
  student: Pick<ClubMember, 'id' | 'full_name' | 'grade'> | null;
}
const PROJECT_TEAM_WITH_STUDENT_QUERY = /* GraphQL */ `
  query GetProjectTeamWithStudent($projectId: UUID!) {
    project_team_membersCollection(filter: { project_id: { eq: $projectId } }) {
      edges {
        node {
          project_id
          student_id
          role
          student {
            id
            full_name
            grade
          }
        }
      }
    }
  }
`;
export async function fetchProjectTeamWithStudent(
  projectId: string,
): Promise<ProjectTeamMemberWithStudent[]> {
  const data = await gqlClient.request<{
    project_team_membersCollection: EdgeBag<ProjectTeamMemberWithStudent>;
  }>(PROJECT_TEAM_WITH_STUDENT_QUERY, { projectId });
  return rows(data.project_team_membersCollection);
}

// ─────────────────────────────────────────────────────────────
// All projects with joined school + programme — admin Projects.
// Ordered by submitted_at desc (nulls last) then created_at desc.
// ─────────────────────────────────────────────────────────────
export interface ProjectWithJoins extends Project {
  school:    Pick<School,    'id' | 'name' | 'county'> | null;
  programme: Pick<Programme, 'id' | 'name'> | null;
}
const PROJECTS_WITH_JOINS_QUERY = /* GraphQL */ `
  query GetProjectsWithJoins {
    projectsCollection(
      orderBy: [
        { submitted_at: DescNullsLast }
        { created_at:   DescNullsLast }
      ]
    ) {
      edges {
        node {
          id
          school_id
          programme_id
          title
          description
          repo_url
          video_url
          image_url
          status
          submitted_at
          created_at
          updated_at
          school {
            id
            name
            county
          }
          programme {
            id
            name
          }
        }
      }
    }
  }
`;
export async function fetchProjectsWithJoins(): Promise<ProjectWithJoins[]> {
  const data = await gqlClient.request<{ projectsCollection: EdgeBag<ProjectWithJoins> }>(
    PROJECTS_WITH_JOINS_QUERY,
  );
  return rows(data.projectsCollection);
}

// ─────────────────────────────────────────────────────────────
// Certificate issuance by id with joined template + school + student
// (printable Certificate page)
// ─────────────────────────────────────────────────────────────
export interface IssuanceWithJoins extends CertificateIssuance {
  template: CertificateTemplate | null;
  school:   Pick<School, 'id' | 'name' | 'county'> | null;
  student:  Pick<ClubMember, 'id' | 'full_name' | 'grade'> | null;
}
const ISSUANCE_BY_ID_WITH_JOINS_QUERY = /* GraphQL */ `
  query GetIssuanceByIdWithJoins($id: UUID!) {
    certificate_issuancesCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          template_id
          student_id
          teacher_id
          school_id
          notes
          issued_at
          issued_by
          revoked_at
          template {
            id
            title
            description
            programme
            audience
            duration_text
            criteria_text
            hero_color
            is_active
            created_at
          }
          school {
            id
            name
            county
          }
          student {
            id
            full_name
            grade
          }
        }
      }
    }
  }
`;
export async function fetchIssuanceByIdWithJoins(id: string): Promise<IssuanceWithJoins | null> {
  const data = await gqlClient.request<{
    certificate_issuancesCollection: EdgeBag<IssuanceWithJoins>;
  }>(ISSUANCE_BY_ID_WITH_JOINS_QUERY, { id });
  return rows(data.certificate_issuancesCollection)[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
// Issuances at a school with template + student snippets, not
// revoked, ordered by issued_at desc — school Certificates page.
// ─────────────────────────────────────────────────────────────
export interface IssuanceSchoolRow extends CertificateIssuance {
  template: Pick<CertificateTemplate, 'id' | 'title' | 'audience' | 'programme' | 'hero_color'> | null;
  student:  Pick<ClubMember, 'id' | 'full_name'> | null;
}
const ISSUANCES_BY_SCHOOL_WITH_JOINS_QUERY = /* GraphQL */ `
  query GetIssuancesBySchoolWithJoins($schoolId: UUID!) {
    certificate_issuancesCollection(
      filter: {
        and: [
          { school_id:  { eq: $schoolId } }
          { revoked_at: { is: NULL } }
        ]
      }
      orderBy: [{ issued_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          template_id
          student_id
          teacher_id
          school_id
          notes
          issued_at
          issued_by
          revoked_at
          template {
            id
            title
            audience
            programme
            hero_color
          }
          student {
            id
            full_name
          }
        }
      }
    }
  }
`;
export async function fetchIssuancesBySchoolWithJoins(
  schoolId: string,
): Promise<IssuanceSchoolRow[]> {
  const data = await gqlClient.request<{
    certificate_issuancesCollection: EdgeBag<IssuanceSchoolRow>;
  }>(ISSUANCES_BY_SCHOOL_WITH_JOINS_QUERY, { schoolId });
  return rows(data.certificate_issuancesCollection);
}

// ─────────────────────────────────────────────────────────────
// Recent issuances (admin Certifications feed) — joined template +
// school + student. Limit 30, ordered by issued_at desc.
// ─────────────────────────────────────────────────────────────
export interface IssuanceAdminRow extends CertificateIssuance {
  template: Pick<CertificateTemplate, 'id' | 'title' | 'audience'> | null;
  school:   Pick<School, 'id' | 'name'> | null;
  student:  Pick<ClubMember, 'id' | 'full_name'> | null;
}
const RECENT_ISSUANCES_ADMIN_QUERY = /* GraphQL */ `
  query GetRecentIssuancesAdmin {
    certificate_issuancesCollection(
      orderBy: [{ issued_at: DescNullsLast }]
      first: 30
    ) {
      edges {
        node {
          id
          template_id
          student_id
          teacher_id
          school_id
          notes
          issued_at
          issued_by
          revoked_at
          template {
            id
            title
            audience
          }
          school {
            id
            name
          }
          student {
            id
            full_name
          }
        }
      }
    }
  }
`;
export async function fetchRecentIssuancesAdmin(): Promise<IssuanceAdminRow[]> {
  const data = await gqlClient.request<{
    certificate_issuancesCollection: EdgeBag<IssuanceAdminRow>;
  }>(RECENT_ISSUANCES_ADMIN_QUERY);
  return rows(data.certificate_issuancesCollection);
}

// ─────────────────────────────────────────────────────────────
// Events with their event_schools list (each link's school snippet) —
// admin Events page + admin SchoolDetails page reuse this under
// queryKey ['events'].
// ─────────────────────────────────────────────────────────────
export interface EventWithSchools extends ChipuEvent {
  event_schools: Array<{
    school_id:   string;
    attended_at: string | null;
    school:      Pick<School, 'id' | 'name'> | null;
  }>;
}
const EVENTS_WITH_SCHOOLS_QUERY = /* GraphQL */ `
  query GetEventsWithSchools {
    eventsCollection(orderBy: [{ start_at: DescNullsLast }]) {
      edges {
        node {
          id
          title
          description
          event_type
          start_at
          end_at
          location
          url
          created_by
          created_at
          event_schoolsCollection {
            edges {
              node {
                school_id
                attended_at
                school {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;
interface EventWithSchoolsRaw extends ChipuEvent {
  event_schoolsCollection: EdgeBag<{
    school_id:   string;
    attended_at: string | null;
    school:      Pick<School, 'id' | 'name'> | null;
  }>;
}
export async function fetchEventsWithSchools(): Promise<EventWithSchools[]> {
  const data = await gqlClient.request<{ eventsCollection: EdgeBag<EventWithSchoolsRaw> }>(
    EVENTS_WITH_SCHOOLS_QUERY,
  );
  return rows(data.eventsCollection).map((e) => ({
    ...e,
    event_schools: rows(e.event_schoolsCollection),
  }));
}

// ─────────────────────────────────────────────────────────────
// Event attendance rows — small (event_id only). admin Events page.
// ─────────────────────────────────────────────────────────────
const EVENT_ATTENDANCES_EVENT_ID_QUERY = /* GraphQL */ `
  query GetEventAttendancesEventId {
    event_attendancesCollection {
      edges {
        node {
          event_id
        }
      }
    }
  }
`;
export async function fetchEventAttendancesEventId(): Promise<{ event_id: string }[]> {
  const data = await gqlClient.request<{
    event_attendancesCollection: EdgeBag<{ event_id: string }>;
  }>(EVENT_ATTENDANCES_EVENT_ID_QUERY);
  return rows(data.event_attendancesCollection);
}

// ─────────────────────────────────────────────────────────────
// Event attendance rows — (event_id, school_id). admin SchoolDetails.
// ─────────────────────────────────────────────────────────────
const EVENT_ATTENDANCES_BY_SCHOOL_QUERY = /* GraphQL */ `
  query GetEventAttendancesBySchool {
    event_attendancesCollection {
      edges {
        node {
          event_id
          school_id
        }
      }
    }
  }
`;
export async function fetchEventAttendances(): Promise<EventAttendanceRow[]> {
  const data = await gqlClient.request<{
    event_attendancesCollection: EdgeBag<EventAttendanceRow>;
  }>(EVENT_ATTENDANCES_BY_SCHOOL_QUERY);
  return rows(data.event_attendancesCollection);
}

// ─────────────────────────────────────────────────────────────
// Event_schools links with joined event — admin SchoolDetails uses
// this to list every activity a single school has touched.
// ─────────────────────────────────────────────────────────────
export interface EventSchoolWithEvent {
  attended_at: string | null;
  event_id:    string;
  school_id:   string;
  event:       ChipuEvent | null;
}
const EVENT_SCHOOLS_WITH_EVENT_QUERY = /* GraphQL */ `
  query GetEventSchoolsWithEvent {
    event_schoolsCollection {
      edges {
        node {
          attended_at
          event_id
          school_id
          event {
            id
            title
            description
            event_type
            start_at
            end_at
            location
            url
            created_by
            created_at
          }
        }
      }
    }
  }
`;
export async function fetchEventSchoolsWithEvent(): Promise<EventSchoolWithEvent[]> {
  const data = await gqlClient.request<{
    event_schoolsCollection: EdgeBag<EventSchoolWithEvent>;
  }>(EVENT_SCHOOLS_WITH_EVENT_QUERY);
  return rows(data.event_schoolsCollection);
}
