-- ============================================================================
-- Security hardening — 2026-07-18
--
-- Closes the findings from the public-repo security review. Three of them
-- (the public_schools_map write grants, school_leaderboard's anon SELECT,
-- and stock_on_hand's RLS bypass) are regressions: 20260710000001 fixed
-- them, then 20260710000005 dropped and recreated the same objects while
-- reverting an unrelated pg_graphql change, which reset their ACLs back to
-- Supabase's permissive defaults. pg_graphql has since been dropped
-- entirely (20260710000006), so those views serve no remaining purpose —
-- the app already reads their SECURITY DEFINER replacements.
--
--   1. anon write grants (default privileges)     — defence in depth
--   2. public_schools_map  — anon INSERT/UPDATE/DELETE onto public.schools
--   3. school_leaderboard  — anon SELECT
--   4. stock_on_hand       — cross-school read via security_invoker = off
--   5. create_school_with_lead — anonymous account minting
--   6. ship_order          — NULL-vs-NULL guard bypass
--   7. schools_maker_space_directory — contact PII to every account
--   8. projects            — self-service draft → judged
--   9. project_team_members — cross-school roster read
-- ============================================================================


-- ── 1. Stop anon holding write grants on anything ───────────────────────────
--
-- Supabase's `alter default privileges ... grant all` hands every newly
-- created table and view INSERT/UPDATE/DELETE/TRUNCATE for anon and
-- authenticated. For base tables that is harmless — RLS is the control, and
-- every policy in this schema is scoped `to authenticated`. For a view it is
-- not: an auto-updatable view with security_invoker = off executes as its
-- owner and bypasses RLS entirely (finding 2).
--
-- anon has no write policy anywhere, so revoking its write grants outright
-- costs nothing and removes the whole class. authenticated KEEPS its table
-- grants — RLS is what scopes those, and revoking them would break every
-- write path in the dashboard. Views are handled individually below.
alter default privileges in schema public
  revoke insert, update, delete, truncate on tables from anon;

revoke insert, update, delete, truncate on all tables in schema public from anon;


-- ── 2 & 3. Drop the two resurrected views ───────────────────────────────────
--
-- public_schools_map was the serious one: simple auto-updatable (single base
-- table, no aggregates), owner-executed, and anon-writable — so
-- `DELETE /rest/v1/public_schools_map?id=neq.<uuid>` deleted every school
-- with coordinates from public.schools, cascading into club_members,
-- code_clubs, stock_ledger, events, certificates and projects.
--
-- Neither view is referenced by the frontend; both were superseded by the
-- RPCs in 20260710000003, which the app already calls. Dropping them is the
-- durable fix — an RPC cannot be written through.
drop view if exists public.public_schools_map;
drop view if exists public.school_leaderboard;


-- ── 4. stock_on_hand: enforce the caller's RLS ──────────────────────────────
--
-- 20260710000001 set security_invoker = on and called the alternative a
-- "REAL BUG"; 20260710000005 turned it back off. With it off the view runs
-- as its owner and the stock_ledger_all policy never applies, so any
-- authenticated account reads every school's inventory. This view IS used by
-- the app (src/lib/gql/queries.ts), so it is fixed in place rather than
-- dropped. School leads keep their own stock, admins keep all.
alter view public.stock_on_hand set (security_invoker = on);

revoke insert, update, delete, truncate on public.stock_on_hand from anon, authenticated;


-- ── 5. create_school_with_lead: fail closed, and unreachable by anon ────────
--
-- Two independent defects. The guard read
--   `if v_caller is not null and not public.me_is_admin()`
-- which skips the admin check entirely when auth.uid() is NULL — the exact
-- state of a request carrying only the anon key. And unlike create_admin_user
-- (20260601000002), EXECUTE was never revoked from public, so Supabase's
-- default function privileges left anon able to call it. Together: anyone on
-- the internet could mint themselves a confirmed school_lead account.
--
-- The revoke below is the load-bearing fix; the fail-closed guard is defence
-- in depth for any future caller that reaches the function another way.

create or replace function public.create_school_with_lead(
  p_username        text,
  p_password        text,
  p_full_name       text,
  p_phone           text,
  p_contact_email   text,                  -- teacher's real email (optional, for reference)
  p_school_name     text,
  p_county          text,
  p_school_type     public.school_type,
  p_is_maker_space  boolean,
  p_member_count    integer
) returns table (
  user_id   uuid,
  username  text,
  school_id uuid
)
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_user_id   uuid;
  v_school_id uuid;
  v_username  text;
  v_email     text;
begin
  -- Permission: admins only, failing CLOSED.
  --
  -- The previous form was `if <caller> is not null and not me_is_admin()`,
  -- which skipped the check entirely for a caller with no session — and
  -- auth.uid() is NULL for any request bearing only the anon key. Combined
  -- with the missing revoke below, that made this an anonymous
  -- account-minting endpoint. Server-side callers now authenticate as
  -- service_role rather than by the absence of a JWT.
  if auth.role() <> 'service_role' and not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;

  -- Validate + normalise the username.
  v_username := lower(btrim(coalesce(p_username, '')));
  if v_username !~ '^[a-z0-9][a-z0-9._-]{2,31}$' then
    raise exception
      'username must be 3–32 chars, lowercase letters/numbers/._- only, starting with a letter or number'
      using errcode = '22023';
  end if;

  if p_password is null or length(p_password) < 8 then
    raise exception 'password must be at least 8 characters' using errcode = '22023';
  end if;

  v_email := v_username || '@chipurobo.local';

  if exists (select 1 from auth.users where email = v_email) then
    raise exception 'a user with this username already exists' using errcode = '23505';
  end if;

  -- 1. auth user — handle_new_auth_user trigger creates matching profile row.
  --
  -- The four empty-string columns at the bottom are required: GoTrue treats
  -- NULLs there as a corrupt user row and login fails with "Database error
  -- querying schema". crypt() + gen_salt() resolve via search_path.
  v_user_id := gen_random_uuid();
  insert into auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name, 'username', v_username),
    now(), now(),
    '', '', '', ''
  );

  -- 2. school + code club
  insert into public.schools (
    name, county, type, is_maker_space, contact_name, contact_phone, contact_email
  ) values (
    p_school_name, p_county, p_school_type, p_is_maker_space,
    p_full_name, p_phone,
    case when p_contact_email is not null and btrim(p_contact_email) <> ''
         then lower(btrim(p_contact_email))
         else null end
  ) returning id into v_school_id;

  insert into public.code_clubs (school_id, registered_by, member_count)
  values (v_school_id, v_user_id, coalesce(p_member_count, 0));

  -- 3. promote profile to school_lead and link
  update public.profiles
     set school_id = v_school_id,
         full_name = p_full_name,
         phone     = p_phone,
         role      = 'school_lead'
   where id = v_user_id;

  return query select v_user_id, v_username, v_school_id;
end;
$$;

revoke execute on function public.create_school_with_lead(
  text, text, text, text, text, text, text, public.school_type, boolean, integer
) from public, anon;

grant execute on function public.create_school_with_lead(
  text, text, text, text, text, text, text, public.school_type, boolean, integer
) to authenticated;

comment on function public.create_school_with_lead(
  text, text, text, text, text, text, text, public.school_type, boolean, integer
) is
  'Admin-only school + lead provisioning. Fails closed: a caller that is '
  'neither service_role nor an admin profile is rejected, and EXECUTE is '
  'revoked from anon.';


-- ── 6. ship_order: NULL-safe permission guard ───────────────────────────────
--
-- The guard compared `v_order.fulfilled_by_school_id is distinct from
-- public.me_school_id()`. Orders fulfilled by ChipuRobo HQ carry
-- fulfilled_by_school_id = NULL (20260601000005), and me_school_id() is NULL
-- for a caller with no school — so the comparison was NULL vs NULL, which is
-- `false`, and the guard passed. mark_order_delivered was never affected
-- because placed_by_school_id is NOT NULL.
--
-- A school-less caller is now rejected explicitly before the comparison.
create or replace function public.ship_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order  public.orders;
  v_school uuid := public.me_school_id();
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found then
    raise exception 'order not found' using errcode = 'P0002';
  end if;

  if not public.me_is_admin()
     and (v_school is null
          or v_order.fulfilled_by_school_id is distinct from v_school) then
    raise exception 'permission denied: only the fulfilling maker space can ship this order'
      using errcode = '42501';
  end if;

  update public.orders
     set status = 'shipped', shipped_at = now()
   where id = p_order_id;
end;
$$;

revoke execute on function public.ship_order(uuid) from public, anon;
grant execute on function public.ship_order(uuid) to authenticated;


-- ── 7. Maker-space directory without the contact PII ────────────────────────
--
-- RLS grants rows, not columns. schools_maker_space_directory (20260601000003)
-- was added so a school lead could pick a maker space from a dropdown, but it
-- exposed the whole row — contact_name, contact_phone, contact_email — for
-- every maker space to every authenticated account. A column-projecting RPC
-- gives the dropdown exactly what it renders and nothing more.
--
-- Counterparty contact details remain reachable through
-- schools_order_counterparties (20260601000006) once an order actually links
-- the two schools, which is the relationship that justifies them.
drop policy if exists schools_maker_space_directory on public.schools;

create or replace function public.list_maker_spaces()
returns table (id uuid, name text, county text)
language sql stable security definer
set search_path = public
as $$
  select id, name, county
  from schools
  where is_maker_space = true
  order by name
$$;

revoke execute on function public.list_maker_spaces() from public, anon;
grant execute on function public.list_maker_spaces() to authenticated;

comment on function public.list_maker_spaces() is
  'Maker-space picker source. Projects only the columns the dropdown renders '
  '— replaces schools_maker_space_directory, which exposed contact PII.';


-- ── 8. projects: constrain the status a school lead may write ───────────────
--
-- USING required status = 'draft', but WITH CHECK validated only ownership,
-- so a school lead could move their own project straight to 'judged',
-- skipping admin review and locking themselves out of further edits.
drop policy if exists "School lead updates own draft project" on public.projects;

create policy "School lead updates own draft project"
  on public.projects for update to authenticated
  using (
    (school_id = public.me_school_id() and status = 'draft')
    or public.me_is_admin()
  )
  with check (
    (school_id = public.me_school_id() and status in ('draft', 'submitted'))
    or public.me_is_admin()
  );


-- ── 9. project_team_members: scope reads to the owning school ───────────────
--
-- `using (true)` exposed every school's roster composition. Student names
-- were never reachable (club_members stays school-scoped), but the
-- project/student/role mapping was.
drop policy if exists "Read team members" on public.project_team_members;

create policy "Read team members"
  on public.project_team_members for select to authenticated
  using (
    public.me_is_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_team_members.project_id
        and p.school_id = public.me_school_id()
    )
  );


notify pgrst, 'reload schema';
