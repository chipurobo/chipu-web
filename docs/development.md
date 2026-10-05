# Development

Setup and architecture notes for the ChipuRobo web repo. For what the
organisation actually does, see the [README](../README.md).

Two products share this codebase:

1. **Public marketing site** — programmes, Microsoft bootcamps, impact report,
   maker-spaces map, blog, podcast, 2026 registration.
2. **Operations dashboard** (`/dashboard/*`) — school and student management,
   kit fabrication and serialized unit tracking, orders and stock ledgers,
   lessons, projects, judging, certificates, and a school leaderboard.

## Stack

| Layer | Choice |
|---|---|
| Build | Vite 5 + TypeScript 5.5 |
| UI | React 18, Tailwind CSS 3, lucide-react, Leaflet (maps) |
| Routing | React Router 6 (v7 future flags on) |
| Data | Supabase — Auth, Postgres + RLS, Realtime, Storage, Edge Functions |
| Reads / writes | `supabase-js` REST + Postgres RPCs, cached by TanStack Query |
| Hosting | Vercel (also works on Netlify / `node server.js`) |

The full data-layer reference — every table, RLS rule, query helper and
mutation — lives in [`api/`](./api/README.md).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values from Supabase project settings
npm run dev                  # http://localhost:5173
```

Environment variables (all `VITE_*`-prefixed, so they ship in the browser
bundle — never put a secret behind this prefix):

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
| `npm start` | Serve `dist/` via Express (`server.js`) — for non-Vercel hosts |

## Backend

The Supabase backend lives in [`../supabase/`](../supabase/README.md): SQL
migrations (the schema's source of truth — every table, RLS policy and RPC),
the `send-email` edge function, CLI config, and local seed data. A
human-readable schema reference is kept in [`api/schema.md`](./api/schema.md).

Run the stack locally with `supabase start`, then `supabase db reset` to replay
migrations and seed. Deploy schema changes with `supabase db push`.

Migrations are tracked in git deliberately — they are the schema's source of
truth, and gitignoring them would break deploys from a clean clone without
gaining any security. Function secrets (`supabase/functions/.env`) and ad-hoc
SQL snippets are gitignored; copy `supabase/functions/.env.example` to get
started locally.

Two auth roles: `admin` (ChipuRobo staff, sees everything) and `school_lead`
(one lead teacher per school, sees only their school's rows). Students don't
sign in — they're roster rows owned by a school.

### Security notes

- **RLS is the security boundary.** The publishable key is public by design; it
  ships in the browser bundle. Anything reachable with it is reachable by
  anyone, so policies and grants are what protect data.
- **`config.toml` configures the local stack only.** It does not reflect the
  hosted project, and `supabase config push` would overwrite production auth
  settings with local ones (including `site_url`). Change hosted auth settings
  in the Supabase dashboard.
- **Views need care.** Supabase default privileges grant write access on newly
  created tables and views. A view that is auto-updatable and runs as its owner
  bypasses RLS entirely — set `security_invoker = on`, or prefer a
  `SECURITY DEFINER` function, which cannot be written through.
- **Never render a user-supplied URL directly into an `href`.** Use
  `safeHttpUrl` from `src/lib/safeUrl.ts`; `<input type="url">` accepts
  `javascript:` payloads.

## Deployment

Pushes to `main` deploy via Vercel. SPA rewrites and security headers are
configured for Vercel (`vercel.json`), Netlify (`netlify.toml`) and Express
(`server.js`), so any of the three hosts works. The header values have a single
source of truth in [`../security-headers.js`](../security-headers.js) — keep
the three configs in step when changing it.
