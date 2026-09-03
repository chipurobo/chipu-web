-- ============================================================================
-- Real email logins, a way to add a teacher, and a way to recover one
-- 2026-09-04
--
-- Four things were wrong with onboarding, and they share a root cause.
--
-- Logins were minted as `<username>@chipurobo.local`. That domain does not
-- exist, so no message can ever reach it: no invite, no password reset, no
-- notification. A teacher who forgot their password could only be recovered by
-- someone with direct database access. The teacher's real address was already
-- being collected as schools.contact_email and then used for nothing.
--
-- And create_school_with_lead was the only way to mint an account. It always
-- creates a school, a code club and a lead together, so a school could never
-- have a second teacher — while SessionRegister already renders teacher
-- attendance, a feature onboarding could not supply.
--
-- WHAT THIS MIGRATION DOES NOT DO: it does not rewrite the email of a single
-- existing user. Changing someone's login email changes the credential they
-- type, so a bulk UPDATE here would silently lock out every teacher currently
-- signing in as .local. Existing accounts keep working exactly as they are.
-- They are migrated one at a time through admin_update_login, ideally with the
-- teacher on the phone. Login.tsx keeps appending @chipurobo.local when no "@"
-- is typed, so legacy usernames continue to work indefinitely.
-- ============================================================================

-- A deliberately permissive check. Bouncing a real address because it has an
-- apostrophe or a long TLD is worse than accepting a typo, which a failed
-- invite will surface anyway.
create or replace function public.is_email_like(p text)
returns boolean language sql immutable as $$
  select p is not null and btrim(p) ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$';
$$;

-- ----------------------------------------------------------------------------
-- Shared account minting
--
-- Both entry points below need the same twelve lines of auth.users insert, and
-- getting them subtly different is how one of them ends up unable to log in.
-- The four empty strings at the bottom are load-bearing: GoTrue reads NULL
-- there as a corrupt row and fails login with "Database error querying schema".
-- ----------------------------------------------------------------------------
create or replace function public.mint_login(
  p_login_email text,
  p_password    text,
  p_full_name   text
) returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_email text := lower(btrim(coalesce(p_login_email, '')));
  v_id    uuid := gen_random_uuid();
begin
  if not public.is_email_like(v_email) then
    raise exception 'a real email address is required for the login'
      using errcode = '22023';
  end if;
  if p_password is null or length(p_password) < 8 then
    raise exception 'password must be at least 8 characters' using errcode = '22023';
  end if;
  if exists (select 1 from auth.users where lower(email) = v_email) then
    raise exception 'that email address already has an account' using errcode = '23505';
  end if;

  insert into auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    v_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', v_email,
    crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name),
    now(), now(), '', '', '', ''
  );
  return v_id;
end;
$$;

revoke execute on function public.mint_login(text, text, text) from public, anon, authenticated;

comment on function public.mint_login(text, text, text) is
  'Internal. Creates the auth.users row both onboarding paths need. Not '
  'callable by any client role — the two SECURITY DEFINER callers below own '
  'the permission check.';

-- ----------------------------------------------------------------------------
-- 1. Onboard a NEW school and its first teacher
--
-- Replaces the p_username form. The identity is now the teacher's real email,
-- so an invite and a password reset both have somewhere to go. Dropped rather
-- than replaced because PostgreSQL will not rename an input parameter.
-- ----------------------------------------------------------------------------
drop function if exists public.create_school_with_lead(
  text, text, text, text, text, text, text, public.school_type, boolean, integer
);

create or replace function public.create_school_with_lead(
  p_login_email     text,
  p_password        text,
  p_full_name       text,
  p_phone           text,
  p_school_name     text,
  p_county          text,
  p_school_type     public.school_type,
  p_is_maker_space  boolean,
  p_member_count    integer
) returns table (user_id uuid, login_email text, school_id uuid)
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_user_id   uuid;
  v_school_id uuid;
  v_email     text := lower(btrim(coalesce(p_login_email, '')));
begin
  if auth.role() <> 'service_role' and not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;

  v_user_id := public.mint_login(v_email, p_password, p_full_name);

  insert into public.schools (
    name, county, type, is_maker_space, contact_name, contact_phone, contact_email
  ) values (
    p_school_name, p_county, p_school_type, p_is_maker_space,
    p_full_name, p_phone, v_email
  ) returning id into v_school_id;

  insert into public.code_clubs (school_id, registered_by, member_count)
  values (v_school_id, v_user_id, coalesce(p_member_count, 0));

  update public.profiles
     set school_id = v_school_id, full_name = p_full_name,
         phone = p_phone, role = 'school_lead'
   where id = v_user_id;

  return query select v_user_id, v_email, v_school_id;
end;
$$;

revoke execute on function public.create_school_with_lead(
  text, text, text, text, text, text, public.school_type, boolean, integer
) from public, anon;
grant execute on function public.create_school_with_lead(
  text, text, text, text, text, text, public.school_type, boolean, integer
) to authenticated;

-- ----------------------------------------------------------------------------
-- 2. Add a teacher to a school that already exists
--
-- The gap this migration exists to close. SessionRegister has been rendering
-- teacher attendance against fetchTeachersAtSchool() with no way to create a
-- second teacher, so every school had exactly one.
-- ----------------------------------------------------------------------------
create or replace function public.add_teacher_to_school(
  p_login_email text,
  p_password    text,
  p_full_name   text,
  p_phone       text,
  p_school_id   uuid
) returns table (user_id uuid, login_email text)
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_user_id uuid;
  v_email   text := lower(btrim(coalesce(p_login_email, '')));
begin
  if auth.role() <> 'service_role' and not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;
  if not exists (select 1 from public.schools where id = p_school_id) then
    raise exception 'no such school' using errcode = '23503';
  end if;

  v_user_id := public.mint_login(v_email, p_password, p_full_name);

  update public.profiles
     set school_id = p_school_id, full_name = p_full_name,
         phone = p_phone, role = 'school_lead'
   where id = v_user_id;

  return query select v_user_id, v_email;
end;
$$;

revoke execute on function public.add_teacher_to_school(text, text, text, text, uuid)
  from public, anon;
grant execute on function public.add_teacher_to_school(text, text, text, text, uuid)
  to authenticated;

comment on function public.add_teacher_to_school(text, text, text, text, uuid) is
  'Admin only. Mints a school_lead against an EXISTING school, which '
  'create_school_with_lead cannot do because it always creates a new school.';

-- ----------------------------------------------------------------------------
-- 3. Recover or migrate an account
--
-- Sets a login email, a password, or both. This is how a teacher who has
-- forgotten their password gets back in today, and how a .local account is
-- moved onto a real address — one at a time, on purpose.
--
-- Admins are refused explicitly: an admin's own credentials are not something
-- another admin resets through a school-management screen.
-- ----------------------------------------------------------------------------
create or replace function public.admin_update_login(
  p_user_id     uuid,
  p_login_email text default null,
  p_password    text default null
) returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_email text := lower(btrim(coalesce(p_login_email, '')));
begin
  if auth.role() <> 'service_role' and not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;
  if p_login_email is null and p_password is null then
    raise exception 'nothing to change' using errcode = '22023';
  end if;
  if exists (select 1 from public.profiles where id = p_user_id and role = 'admin') then
    raise exception 'admin logins are not managed here' using errcode = '42501';
  end if;

  if p_login_email is not null then
    if not public.is_email_like(v_email) then
      raise exception 'a real email address is required' using errcode = '22023';
    end if;
    if exists (select 1 from auth.users where lower(email) = v_email and id <> p_user_id) then
      raise exception 'that email address already has an account' using errcode = '23505';
    end if;
    update auth.users
       set email = v_email, email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where id = p_user_id;
    update public.schools s
       set contact_email = v_email
      from public.profiles p
     where p.id = p_user_id and s.id = p.school_id;
  end if;

  if p_password is not null then
    if length(p_password) < 8 then
      raise exception 'password must be at least 8 characters' using errcode = '22023';
    end if;
    update auth.users
       set encrypted_password = crypt(p_password, gen_salt('bf')), updated_at = now()
     where id = p_user_id;
  end if;
end;
$$;

revoke execute on function public.admin_update_login(uuid, text, text) from public, anon;
grant execute on function public.admin_update_login(uuid, text, text) to authenticated;

-- ----------------------------------------------------------------------------
-- Who still needs migrating off .local, so the job is visible rather than
-- remembered. Admin-only, and it returns no credentials.
-- ----------------------------------------------------------------------------
create or replace function public.legacy_local_logins()
returns table (user_id uuid, full_name text, login_email text,
               school_id uuid, school_name text, contact_email text)
language sql stable security definer
set search_path = public, auth
as $$
  select p.id, p.full_name, u.email, s.id, s.name, s.contact_email
  from auth.users u
  join public.profiles p on p.id = u.id
  left join public.schools s on s.id = p.school_id
  where u.email like '%@chipurobo.local'
    and public.me_is_admin()
  order by s.name nulls last, p.full_name;
$$;

revoke execute on function public.legacy_local_logins() from public, anon;
grant execute on function public.legacy_local_logins() to authenticated;

notify pgrst, 'reload schema';
