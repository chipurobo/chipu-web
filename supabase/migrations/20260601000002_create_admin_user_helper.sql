-- ============================================================================
-- One-shot admin-user creation helper.
--
-- USAGE (SQL editor or psql):
--
--   select public.create_admin_user(
--     'admin@chipurobo.com',   -- email
--     'somesecurePass1!',      -- password
--     'Kevin Irungu'           -- full_name (optional)
--   );
--
-- That single call:
--   1. Inserts the user into auth.users with email_confirmed_at = now()
--      so the password works immediately.
--   2. Lets the on_auth_user_created trigger create the empty profile.
--   3. Promotes the profile to role = 'admin', school_id = null.
--
-- ⚠️  LOCAL DEV / DIRECT-DB ONLY.
-- The function inserts into auth.users directly, which only works when
-- you have superuser access to the database (the Supabase CLI gives you
-- this locally). On Supabase Cloud, the equivalent is the Supabase Auth
-- Admin API — call `supabase.auth.admin.createUser()` with the
-- service_role key from a server / script (see scripts/create-admin.mjs).
--
-- EXECUTE is revoked from `authenticated` so logged-in users cannot call
-- this from the browser even if they discovered it.
-- ============================================================================

-- We need pgcrypto for crypt() + gen_salt('bf'). The init migration already
-- creates this extension, but `create extension if not exists` is cheap and
-- makes this file self-contained.
create extension if not exists "pgcrypto";

-- Patch the role-escalation trigger so it permits server-side / superuser
-- updates (where there is no auth.uid() from a JWT). This is what lets the
-- create_admin_user function flip role from 'school_lead' → 'admin' on the
-- profile row that the on_auth_user_created trigger just inserted.
create or replace function public.profiles_prevent_role_escalation()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  -- Server-side / superuser context (no authenticated JWT) → trusted, allow.
  if auth.uid() is null then
    return new;
  end if;
  -- Admins can change anything.
  if public.me_is_admin() then
    return new;
  end if;
  -- Non-admin user can't escalate their own role.
  if new.role is distinct from old.role then
    raise exception 'permission denied: role can only be changed by an admin'
      using errcode = '42501';
  end if;
  -- Non-admin user can't move to a different school (but NULL → uuid is fine,
  -- that's the one-time signup transition).
  if new.school_id is distinct from old.school_id
     and old.school_id is not null then
    raise exception 'permission denied: changing school_id requires an admin'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

-- The main function.
create or replace function public.create_admin_user(
  p_email     text,
  p_password  text,
  p_full_name text default null
) returns uuid
language plpgsql security definer
set search_path = public, auth, extensions
as $$
declare
  v_user_id uuid := gen_random_uuid();
  v_email   text := lower(trim(p_email));
begin
  if v_email = '' or p_password is null or length(p_password) < 8 then
    raise exception 'email is required and password must be at least 8 chars'
      using errcode = '22023';
  end if;

  if exists (select 1 from auth.users where email = v_email) then
    raise exception 'a user with email % already exists', v_email
      using errcode = '23505';
  end if;

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
    coalesce(jsonb_build_object('full_name', p_full_name), '{}'::jsonb),
    now(), now(),
    '', '', '', ''
  );

  -- on_auth_user_created already inserted an (id, full_name) profile row
  -- with default role = 'school_lead' and school_id = null. Promote it.
  update public.profiles
    set role      = 'admin',
        school_id = null,
        full_name = p_full_name
  where id = v_user_id;

  return v_user_id;
end;
$$;

-- Defensively revoke from anyone who could reach the SDK.
revoke all on function public.create_admin_user(text, text, text) from public;
revoke all on function public.create_admin_user(text, text, text) from authenticated;
revoke all on function public.create_admin_user(text, text, text) from anon;

comment on function public.create_admin_user(text, text, text) is
  'LOCAL DEV / direct-DB only. Creates an auth user + admin profile in one call. '
  'Production: use Supabase Auth Admin API (service_role) instead. '
  'See scripts/create-admin.mjs.';
