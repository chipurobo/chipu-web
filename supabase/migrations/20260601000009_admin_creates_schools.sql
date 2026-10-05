-- ============================================================================
-- Schools are now created BY ADMIN — no self-signup
-- Login is USERNAME + password (no teacher email needed).
--
-- The old self-signup flow (register_school_with_club) is gone.
--
-- New flow:
--   1. ChipuRobo admin signs in.
--   2. On /dashboard/admin/schools → Create school, admin fills in the
--      school details + lead teacher username + temp password.
--   3. create_school_with_lead RPC (this file) does everything:
--        a. Inserts the auth.users row with email = <username>@chipurobo.local
--           and a bcrypted password. The handle_new_auth_user trigger
--           auto-creates the profile.
--        b. Inserts the school + code_club rows. Teacher's real email (if
--           provided) is stored in schools.contact_email for reference only.
--        c. Promotes the new profile to school_lead and links it.
--   4. Admin shares the username + password with the lead teacher OUT OF
--      BAND (manual email for v1).
--   5. Lead teacher visits /dashboard/login and signs in with USERNAME.
--      The login form transparently maps username → <username>@chipurobo.local
--      before calling Supabase Auth.
--
-- Why a synthetic email:
--   Supabase Auth (GoTrue) needs SOMETHING in auth.users.email because
--   that's the unique handle it indexes for password auth. Using
--   <username>@chipurobo.local means the teacher never has to remember an
--   email — just their username — but the underlying auth row still has a
--   uniquely-indexed identifier.
-- ============================================================================

drop function if exists public.register_school_with_club(text, text, public.school_type, boolean, integer, text, text, text);
drop function if exists public.create_school_with_lead(text, text, text, text, text, text, public.school_type, boolean, integer);


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
  v_caller    uuid := auth.uid();
  v_user_id   uuid;
  v_school_id uuid;
  v_username  text;
  v_email     text;
begin
  -- Permission: only admins (or pure server-side calls with no session).
  if v_caller is not null and not public.me_is_admin() then
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

grant execute on function public.create_school_with_lead(
  text, text, text, text, text, text, text, public.school_type, boolean, integer
) to authenticated;
