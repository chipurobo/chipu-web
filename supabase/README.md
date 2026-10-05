# ChipuRobo dashboard — Supabase backend

Everything the dashboard talks to lives in this folder. The frontend (under
`src/dashboard/`) reads/writes via the Supabase JS SDK; there is no separate
Node API server.

## What's here

```
supabase/
├── config.toml                              # CLI + local-stack config
├── migrations/
│   └── 20260601000000_init.sql              # the entire schema + RLS + RPC + storage bucket
├── seed.sql                                 # demo products + 3 demo schools for local dev
└── README.md                                # this file
```

## One-time setup

You'll need the Supabase CLI and Docker on your machine.

```bash
# 1. Install the CLI (Mac)
brew install supabase/tap/supabase

# 2. Make sure Docker Desktop is running

# 3. From the project root:
supabase start
```

The first `supabase start` pulls the Postgres + Auth + Storage + Studio
containers and applies every migration in `migrations/` plus the seed.
When it finishes you'll see something like:

```
   API URL: http://localhost:54321
    DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
  Inbucket: http://localhost:54324      ← (unused — email confirmation is OFF)
   anon key: eyJ...                     ← put in .env.local as VITE_SUPABASE_ANON_KEY
service_role: eyJ...                    ← server-side only; do NOT ship in the frontend
```

Copy the `API URL` and `anon key` into a `.env.local` at the project root:

```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Day-to-day commands

```bash
supabase start         # boot the local stack
supabase stop          # shut it down (keeps data)
supabase stop --no-backup   # nuke the local DB
supabase db reset      # re-apply migrations + seed.sql from scratch (great for testing)
supabase status        # show URLs and keys for the running stack
```

When you edit `migrations/` files, run `supabase db reset` to re-apply them.

When you've made schema changes you want to ship, generate a new timestamped
migration:

```bash
supabase migration new add_inquiry_table
# edit the file it just created
supabase db reset      # verify locally
```

## Going to production (Supabase Cloud)

```bash
# 1. Create a project at https://supabase.com
# 2. Link this folder to it
supabase login
supabase link --project-ref <ref-from-the-supabase-dashboard>

# 3. Push migrations
supabase db push
```

After linking, the production `anon key` and `URL` go into your deployed
frontend env (Vercel/Netlify/wherever). The local keys stay in
`.env.local` (which is gitignored).

## Trust model + permissions (the bit that drives the SQL)

- **Onboarding happens offline.** ChipuRobo decides which schools become
  code clubs. Only after that handshake do they get the
  `/dashboard/register-club` URL.
- **No email verification, no admin approval queue.** Signup via the URL
  immediately creates a live session and a school-scoped account.
- **Postgres enforces who sees what.** Every table has Row-Level Security.
  Two roles: `admin` (ChipuRobo team, sees everything) and `school_lead`
  (everything scoped to their school). What the school *does* on the
  dashboard (place orders vs. fulfil orders) is driven by the
  `schools.is_maker_space` boolean, not by the role.
- **Only school leaders self-register; admins are SQL-only.** The
  `/dashboard/register-club` form always creates `role = 'school_lead'`
  accounts (hardcoded in the `register_school_with_club` RPC). A
  BEFORE-UPDATE trigger on `profiles` further blocks any non-admin from
  changing their own `role` column via the JS SDK. The only way to create
  or promote an admin is to run an UPDATE statement against
  `public.profiles` with direct database access (Studio SQL Editor, psql,
  or `supabase db push`).

The full schema, RLS policies, the signup RPC (`register_school_with_club`),
and the roster Storage bucket are all in
`migrations/20260601000000_init.sql`. Read the comments at the top of that
file for the entity overview.

## Creating / promoting an admin (SQL only — by design)

Admins cannot self-register. The frontend has no admin-signup form. To
create an admin you need direct database access (Supabase Studio SQL
Editor, psql, or a migration). For the first admin:

1. Open Supabase Studio at <http://localhost:54323>
2. **Authentication → Users → Add user → "Create new user"** (set a
   password; leave "auto-confirm" on)
3. SQL Editor → run:
   ```sql
   update public.profiles
      set role = 'admin', school_id = null
    where id = (select id from auth.users where email = 'someone@chipurobo.com');
   ```
4. The user signs in at `/dashboard/login` with the email + password from
   step 2 and sees admin views.

For subsequent admins, any existing admin can run the same UPDATE from
their own session (RLS allows admins to write to other profiles).

> **The signup form will never create an admin, even if someone tampers
> with the request.** The `register_school_with_club` RPC hardcodes
> `role = 'school_lead'` and a BEFORE-UPDATE trigger on `profiles` blocks
> non-admins from changing their own role column.
