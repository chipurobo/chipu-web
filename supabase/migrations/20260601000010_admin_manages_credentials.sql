-- ============================================================================
-- Admin manages school-lead credentials
--
-- Three SECURITY DEFINER RPCs, all admin-only:
--
--   admin_list_school_leads()
--     Returns one row per school_lead: user_id, username (the part before
--     @chipurobo.local), full_name, phone, school_id, school_name.
--
--   admin_reset_lead_password(user_id, new_password)
--     Overwrites the bcrypted password on auth.users. Use this when a
--     teacher loses their password.
--
--   admin_set_lead_username(user_id, new_username)
--     Renames the synthetic email = <new_username>@chipurobo.local. Fails
--     if the username is malformed or already taken.
-- ============================================================================

create or replace function public.admin_list_school_leads()
returns table (
  user_id     uuid,
  username    text,
  full_name   text,
  phone       text,
  school_id   uuid,
  school_name text
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;

  return query
    select
      p.id                                                              as user_id,
      split_part(u.email, '@', 1)                                       as username,
      p.full_name,
      p.phone,
      p.school_id,
      s.name                                                            as school_name
      from public.profiles p
      join auth.users     u on u.id = p.id
      left join public.schools s on s.id = p.school_id
     where p.role = 'school_lead'
     order by s.name nulls last, p.full_name;
end;
$$;
grant execute on function public.admin_list_school_leads() to authenticated;


create or replace function public.admin_reset_lead_password(
  p_user_id      uuid,
  p_new_password text
) returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;
  if p_new_password is null or length(p_new_password) < 8 then
    raise exception 'password must be at least 8 characters' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.profiles
     where id = p_user_id and role = 'school_lead'
  ) then
    raise exception 'user not found or not a school_lead' using errcode = '23503';
  end if;

  -- crypt() + gen_salt() resolve via search_path (extensions in the
  -- function declaration). Using unqualified names matches the working
  -- create_admin_user pattern.
  update auth.users
     set encrypted_password = crypt(p_new_password, gen_salt('bf')),
         updated_at         = now()
   where id = p_user_id;
end;
$$;
grant execute on function public.admin_reset_lead_password(uuid, text) to authenticated;


create or replace function public.admin_set_lead_username(
  p_user_id      uuid,
  p_new_username text
) returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_username text;
  v_email    text;
begin
  if not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;

  v_username := lower(btrim(coalesce(p_new_username, '')));
  if v_username !~ '^[a-z0-9][a-z0-9._-]{2,31}$' then
    raise exception
      'username must be 3–32 chars, lowercase letters/numbers/._- only, starting with a letter or number'
      using errcode = '22023';
  end if;

  v_email := v_username || '@chipurobo.local';

  if exists (select 1 from auth.users where email = v_email and id <> p_user_id) then
    raise exception 'username already taken' using errcode = '23505';
  end if;

  if not exists (
    select 1 from public.profiles
     where id = p_user_id and role = 'school_lead'
  ) then
    raise exception 'user not found or not a school_lead' using errcode = '23503';
  end if;

  update auth.users
     set email                  = v_email,
         raw_user_meta_data     = jsonb_set(
                                    coalesce(raw_user_meta_data, '{}'::jsonb),
                                    '{username}',
                                    to_jsonb(v_username),
                                    true
                                  ),
         updated_at             = now()
   where id = p_user_id;

  return v_username;
end;
$$;
grant execute on function public.admin_set_lead_username(uuid, text) to authenticated;
