# ChipuRobo

Robotics & AI education for Kenyan schools, with a focus on inclusive and
special-needs learning. This repo is the web frontend — two products in one
codebase:

1. **Public marketing site** — programs, Microsoft bootcamps, impact report,
   maker-spaces map, blog, podcast, 2026 registration.
2. **Operations dashboard** (`/dashboard/*`) — the engine behind the
   programme: school & student management, kit fabrication and serialized
   unit tracking, orders and stock ledgers, lessons, projects, judging,
   certificates, and a school leaderboard.

## Stack

| Layer | Choice |
|---|---|
| Build | Vite 5 + TypeScript 5.5 |
| UI | React 18, Tailwind CSS 3, lucide-react, Leaflet (maps) |
| Routing | React Router 6 (v7 future flags on) |
| Data | Supabase — Auth, Postgres + RLS, Realtime, pg_graphql, Storage, Edge Functions |
| Reads | `graphql-request` against `/graphql/v1`, cached by TanStack Query |
| Writes | `supabase-js` REST + Postgres RPCs |
| Hosting | Vercel (also works on Netlify / `node server.js`) |

Architecture notes, the full data-layer reference (every table, RLS rule,
query helper, and mutation) live in [`docs/api/`](./docs/api/README.md).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values from Supabase project settings
npm run dev                  # http://localhost:5173
```

Environment variables (all `VITE_*`-prefixed, safe for the browser):

| Var | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable (browser) key — RLS is the security boundary |
| `VITE_DASHBOARD_URL` | Optional; public URL used in outgoing emails (defaults sensibly) |
| `VITE_IDLE_TIMEOUT_MINUTES` | Optional; auto sign-out after N idle minutes |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck (`tsc`) + production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run codegen` | Generate the typed GraphQL SDK from the Supabase schema |
| `npm start` | Serve `dist/` via Express (`server.js`) — for non-Vercel hosts |

## Backend

The Supabase backend lives in [`supabase/`](./supabase/README.md): SQL
migrations (the schema's source of truth — every table, RLS policy, and
RPC), the `send-email` edge function, CLI config, and local seed data.
Apply changes with `supabase migration up` locally and `supabase db push`
to production. A human-readable schema reference is kept in
[`docs/api/schema.md`](./docs/api/schema.md).

Function secrets (`supabase/functions/.env`) and ad-hoc SQL snippets are
gitignored — copy `supabase/functions/.env.example` to get started locally.

Two auth roles: `admin` (ChipuRobo staff, sees everything) and
`school_lead` (one lead teacher per school, sees only their school's rows).
Students don't sign in — they're roster rows owned by a school.

## Deployment

Pushes to `main` deploy via Vercel. SPA rewrites are configured for Vercel
(`vercel.json`), Netlify (`netlify.toml`), and Express (`server.js`), so any
of the three hosts works.
