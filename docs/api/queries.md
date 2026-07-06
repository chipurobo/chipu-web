# GraphQL queries

Every read in the dashboard goes through one of the helpers in `src/lib/gql/queries.ts`. They wrap a `pg_graphql` operation and return plain rows (the `{ edges: [{ node }] }` envelope is unwrapped).

Pattern:

```ts
const q = useQuery({
  queryKey: ['leaderboard'],
  queryFn:  fetchLeaderboard,
});
```

To add a new helper:

1. Drop the operation into `queries.ts` as a `/* GraphQL */` template string.
2. Export an `async function fetchX(...)` that calls `gqlClient.request<T>(QUERY, vars)` and unwraps with `rows(...)`.
3. Use `import type { X } from '../database.types'` for the return shape.
4. (Optional) Also drop the operation into a `.graphql` file alongside the page that uses it so `npm run codegen` can pick it up.

---

## Single-table helpers

### Leaderboard

| Helper | Returns | Used by |
|---|---|---|
| `fetchLeaderboard()` | `LeaderboardRow[]` | `Leaderboard.tsx` |

```graphql
query GetLeaderboard {
  school_leaderboardCollection(orderBy: [{ total_pts: DescNullsLast }]) {
    edges { node {
      school_id school_name county programme_id programme_name
      lesson_pts project_pts total_pts
    }}
  }
}
```

### Programmes

| Helper | Returns | Used by |
|---|---|---|
| `fetchProgrammes()` | `Programme[]` (by `name asc`) | `Leaderboard.tsx`, `AdminCertifications.tsx` |
| `fetchProgrammesByCreated()` | `Programme[]` (by `created_at asc`) | `AdminProgrammes.tsx` |
| `fetchProgrammeStages(programmeId)` | `ProgrammeStage[]` (by `position asc`) | `SchoolLessonStage.tsx` |
| `fetchActiveProgrammeStages(programmeId)` | `ProgrammeStage[]` (active only) | `SchoolLessons.tsx` |
| `fetchProgrammeStageById(id)` | `ProgrammeStage \| null` | `SchoolLessonStage.tsx` |

### Schools

| Helper | Returns | Used by |
|---|---|---|
| `fetchSchools()` | `School[]` (by `name asc`) | `AdminProgrammes.tsx`, `AdminEvents.tsx`, `AdminCertifications.tsx`, `AdminProjects.tsx` |
| `fetchSchoolsByCreated()` | `School[]` (by `created_at desc`) | `AdminSchools.tsx` |
| `fetchSchoolById(id)` | `School \| null` | `AdminSchoolDetails.tsx` |

### Products

| Helper | Returns | Used by |
|---|---|---|
| `fetchProducts()` | `Product[]` (by `created_at desc`) | `AdminProducts.tsx`, `AdminDistribute.tsx`, `SchoolOrders.tsx` |
| `fetchProductsByIds(ids[])` | `Product[]` (filtered by `id in`) | `SchoolStock.tsx` |

### Orders

| Helper | Returns | Used by |
|---|---|---|
| `fetchOrders()` | `Order[]` (raw, by `placed_at desc`) | (helper available, currently unused) |
| `fetchOrdersAdmin()` | `OrderWithJoins[]` (joined with product + placer/fulfiller) | `AdminOrders.tsx` |
| `fetchOrdersWithJoins()` | `OrderWithJoins[]` | `SchoolOrders.tsx` |
| `fetchOrdersPlacedBy(schoolId)` | `Order[]` | (helper available) |
| `fetchOrdersFulfilledBy(schoolId)` | `Order[]` | (helper available) |
| `fetchOrdersForMakerProduction(schoolId)` | `ProdOrderGql[]` (joined, status in production lane) | `SchoolProduction.tsx` |
| `fetchConsumableAssignments()` | `AssignmentRowGql[]` (where fulfiller is NULL, joined) | `AdminDistribute.tsx` |

### Club members (students)

| Helper | Returns | Used by |
|---|---|---|
| `fetchMembersBySchool(schoolId)` | `ClubMember[]` (by `full_name asc`) | `SchoolLessonStage.tsx`, `SchoolProject.tsx` |
| `fetchMembersBySchoolJoinedDesc(schoolId)` | `ClubMember[]` (by `joined_at desc`) | `SchoolMembers.tsx` |
| `fetchMembersBySchoolUnordered(schoolId)` | `ClubMember[]` | `SchoolLessons.tsx` |

### Product units (durables)

| Helper | Returns | Used by |
|---|---|---|
| `fetchUnitsAtSchool(schoolId)` | `ProductUnit[]` | (helper available) |
| `fetchUnitsAtSchoolWithJoins(schoolId)` | `UnitWithJoins[]` (joined with product + member) | `SchoolStock.tsx` |

### Stock

| Helper | Returns | Used by |
|---|---|---|
| `fetchStockOnHandBySchool(schoolId)` | `StockOnHandRow[]` | `SchoolStock.tsx` |

### Lesson completions

| Helper | Returns | Used by |
|---|---|---|
| `fetchCompletionsForStage(stageId)` | `LessonCompletion[]` | `SchoolLessonStage.tsx` |
| `fetchPassedCompletionsWithStudent()` | `PassedCompletionWithStudent[]` (joined with student, filtered passed=true) | `SchoolLessons.tsx` (counts per stage) |

### Projects

| Helper | Returns | Used by |
|---|---|---|
| `fetchProjectForSchool(schoolId, programmeId)` | `Project \| null` | `SchoolProject.tsx` |
| `fetchAllProjects()` | `Project[]` | (helper available) |
| `fetchProjectsWithJoins()` | `ProjectWithJoins[]` (joined with school + programme) | `AdminProjects.tsx` |
| `fetchProjectTeam(projectId)` | `ProjectTeamMember[]` (raw) | (helper available) |
| `fetchProjectTeamWithStudent(projectId)` | `ProjectTeamMember + ClubMember` | `SchoolProject.tsx`, `AdminProjects.tsx` |
| `fetchProjectJudgment(projectId)` | `ProjectJudgment \| null` | `SchoolProject.tsx`, `AdminProjects.tsx` |
| `fetchAllProjectJudgments()` | `ProjectJudgment[]` | `AdminProjects.tsx` |

### Certificates

| Helper | Returns | Used by |
|---|---|---|
| `fetchCertificateTemplates()` | `CertificateTemplate[]` | `AdminCertifications.tsx` |
| `fetchRecentIssuances(limit?)` | `CertificateIssuance[]` (default `limit=30`) | (helper available) |
| `fetchRecentIssuancesAdmin()` | `IssuanceAdminRow[]` (joined: template + school + student, `first: 30`) | `AdminCertifications.tsx` |
| `fetchIssuancesBySchool(schoolId)` | `CertificateIssuance[]` | (helper available) |
| `fetchIssuancesBySchoolWithJoins(schoolId)` | `IssuanceWithJoins[]` (joined, non-revoked) | `SchoolCertificates.tsx` |
| `fetchIssuanceById(id)` | `CertificateIssuance \| null` | (helper available) |
| `fetchIssuanceByIdWithJoins(id)` | `IssuanceWithJoins \| null` (joined: template + school + student) | `Certificate.tsx` |

### Events / attendance

| Helper | Returns | Used by |
|---|---|---|
| `fetchEvents()` | `ChipuEvent[]` | (helper available) |
| `fetchEventsWithSchools()` | `EventWithSchools[]` (joined with `event_schools` + school snippets) | `AdminEvents.tsx` |
| `fetchEventSchoolLinks()` | `EventSchoolLink[]` | (helper available) |
| `fetchEventSchoolsWithEvent()` | `EventSchoolWithEvent[]` (joined with event) | `AdminSchoolDetails.tsx` |
| `fetchEventAttendances()` | `EventAttendanceRow[]` (`event_id` + `school_id` only) | `AdminSchoolDetails.tsx` |
| `fetchEventAttendancesEventId()` | `{ event_id }[]` | `AdminEvents.tsx` |

### Profiles

| Helper | Returns | Used by |
|---|---|---|
| `fetchProfiles()` | `Profile[]` | (helper available) |

---

## pg_graphql cheat-sheet

A few conventions that bite often:

### Filtering

```graphql
filter: { col: { eq: "uuid" } }
filter: { col: { in: ["a","b"] } }
filter: { col: { is: NULL } }                  # NULL check
filter: { and: [{ a: { eq: 1 } }, { b: { eq: 2 } }] }
```

### Ordering

```graphql
orderBy: [{ col: AscNullsLast }]
orderBy: [{ created_at: DescNullsLast }, { name: AscNullsFirst }]
```

### Limits

```graphql
first: 30          # first N
last: 5            # last N (must be paired with `before` cursor)
```

### Joins (foreign keys)

| FK direction | Relation name (default) |
|---|---|
| `placed_by_school_id → schools.id` | `placed_by_school` (singular, column name minus `_id`) |
| `fulfilled_by_school_id → schools.id` | `fulfilled_by_school` |
| `product_id → products.id` | `product` |
| `student_id → club_members.id` | `student` |
| Reverse (one-to-many) | `<table>Collection` |

Example — `orders` joined with both schools + product:

```graphql
query Orders {
  ordersCollection {
    edges { node {
      id status
      product { id name sku }
      placed_by_school    { id name }
      fulfilled_by_school { id name }
    }}
  }
}
```

### When a query needs a shape that doesn't exist yet

Add a new helper to `queries.ts`:

```ts
const FOO_BAR_QUERY = /* GraphQL */ `
  query GetFooBar($id: UUID!) {
    fooCollection(filter: { id: { eq: $id } }) {
      edges { node { id name } }
    }
  }
`;
export async function fetchFooBar(id: string): Promise<Foo | null> {
  const data = await gqlClient.request<{ fooCollection: EdgeBag<Foo> }>(
    FOO_BAR_QUERY, { id },
  );
  return rows(data.fooCollection)[0] ?? null;
}
```

Then in the page:

```ts
const { data } = useQuery({
  queryKey: ['foo', id],
  queryFn:  () => fetchFooBar(id),
});
```

Keep the `queryKey` stable — cross-page invalidation depends on it.
