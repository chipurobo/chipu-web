# ChipuRobo Dashboard API

Reference docs for the data layer behind `/dashboard/*`. Three files:

| File | What's in it |
|---|---|
| [`schema.md`](./schema.md) | Every table, view, enum, foreign key, and RLS rule. |
| [`queries.md`](./queries.md) | Every GraphQL read helper in `src/lib/gql/queries.ts`. |
| [`mutations.md`](./mutations.md) | Every direct write + every Postgres RPC. |

---

## Architecture at a glance

```
┌─────────────────────────────────────────────────────────────┐
│                     React dashboard                         │
│                                                             │
│   useQuery (reads) ────────► graphql-request ──┐            │
│   useMutation (writes) ────► @supabase/supabase-js ──┐      │
│                                                       │     │
└───────────────────────────────────────────────────────┼─────┘
                                                        ▼
                          ┌──────────────────────────────────┐
                          │   Supabase (PostgREST + Realtime  │
                          │   + pg_graphql + Auth + Storage)  │
                          └──────────┬───────────────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  PostgreSQL  │
                              │  + RLS       │
                              └──────────────┘
```

- **Reads** flow through `pg_graphql` at `/graphql/v1`. Helpers in
  `src/lib/gql/queries.ts` wrap each operation and return plain rows
  (the `{ edges: [{ node }] }` envelope is unwrapped in `rows()`).
- **Mutations + RPCs** flow through `supabase-js` REST (`supabase.from(...).insert/update/delete/upsert` and `supabase.rpc(...)`).
- **Realtime** uses `supabase.channel(...).on('postgres_changes', ...)` for
  cross-tab invalidation (see `src/lib/useOrderRealtime.ts` and the
  inline subscription in `src/dashboard/Leaderboard.tsx`).
- **Cache**: every read is wrapped in TanStack Query so multiple
  components share one fetch + one cache entry. Mutations call
  `qc.invalidateQueries({ queryKey: [...] })` on settle.

---

## Auth model

Two roles in `public.profiles.role`:

| Role | Who | Sees |
|---|---|---|
| `admin` | ChipuRobo staff | everything via RLS-`true` policies |
| `school_lead` | The lead teacher of one school | only rows scoped to their `profiles.school_id` |

There is no `student` role — students are tracked as `club_members` rows owned by a school; they don't sign in.

JWT is the Supabase access token. The GraphQL client (`src/lib/graphqlClient.ts`) injects it on every request via `requestMiddleware`:

```ts
Authorization: Bearer <access_token>
apikey: <publishable_key>
```

RLS policies are written against `auth.uid()` and a helper sub-select against `profiles` to look up the caller's role / school_id. Same policies apply whether the request comes in via PostgREST or `pg_graphql`.

---

## Conventions

### Query keys (TanStack Query)

| Key prefix | Cache contents |
|---|---|
| `['schools']` | every school |
| `['schools', schoolId]` | one school's detail |
| `['school-leads']` | output of `admin_list_school_leads` RPC |
| `['programmes']` | every programme |
| `['programme-stages', programmeId]` | stages of one programme |
| `['products']` | every product |
| `['orders', 'admin']` | every order (admin view) |
| `['orders', 'school', schoolId]` | orders placed by a school |
| `['orders', 'maker', schoolId]` | orders fulfilled by a maker space |
| `['members', schoolId]` | club_members of one school |
| `['units', schoolId]` | product_units currently at a school |
| `['stock', schoolId]` | stock_on_hand for a school |
| `['events']` | every event (admin only) |
| `['event-attendances']` | attendance feed |
| `['templates']` | certificate templates |
| `['issuances', { scope, schoolId? }]` | certificate issuances |
| `['lesson-completions', stageId]` | per-stage completions |
| `['projects']` | every project (admin) |
| `['projects', schoolId]` | school's own project |
| `['project-team', projectId]` | team members on one project |
| `['project-judgments', projectId]` | judgment for one project |
| `['leaderboard']` | `school_leaderboard` view |
| `['profile']` | current user's profile |

### Naming

| Layer | Convention |
|---|---|
| Tables | `snake_case`, plural — `programme_stages`, `lesson_completions`. |
| GraphQL collections | `<table>Collection` (added by pg_graphql). |
| Enums | `snake_case` type name, `lower_snake_case` values. |
| RPCs | `<verb>_<object>` — `attach_school_to_event`, `ship_order`. Admin-only RPCs are prefixed `admin_`. |
| Helpers (`queries.ts`) | `fetch<Resource>[By<Filter>]` — `fetchOrdersFulfilledBy(schoolId)`. |

---

## Codegen

A typed SDK can be generated from your live Supabase schema:

```bash
# Make sure Supabase is up and .env.local has the URL + key
npm run codegen
```

This introspects `/graphql/v1`, reads any `.graphql` file under `src/`, and writes a typed SDK to `src/lib/gql/sdk.ts`. After running, you can replace the hand-written helpers in `queries.ts` with calls into the generated SDK — the return shapes are identical.

The hand-typed helpers in `queries.ts` are the source of truth until codegen is wired into CI.
