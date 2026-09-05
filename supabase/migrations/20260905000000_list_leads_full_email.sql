-- ============================================================================
-- The admin school list was showing the wrong login email — 2026-09-05
--
-- admin_list_school_leads has always returned the LOCAL PART of the address:
--
--     split_part(u.email, '@', 1)     -- "kevin.maina.irungu"
--
-- That was fine while every login was <username>@chipurobo.local, because the
-- interface could put the domain back. 20260904000002 made the login the
-- teacher's real address, and the assumption broke silently: a teacher whose
-- login is mary@school.ac.ke came back as "mary", and the interface rendered
-- her login as mary@chipurobo.local. Wrong address, shown to an admin, on the
-- screen used to tell teachers how to sign in.
--
-- The same missing "@" broke the warning banner. The panel tested
-- `!username.includes('@')` to spot a legacy account; since the local part
-- never contains an "@", every teacher was flagged as legacy, including the
-- ones already migrated.
--
-- Returning the whole address removes both problems and the guesswork with
-- them. The column is renamed to login_email so that a caller written against
-- the old shape fails loudly rather than displaying a plausible wrong value.
-- ============================================================================

drop function if exists public.admin_list_school_leads();

create or replace function public.admin_list_school_leads()
returns table (
  user_id     uuid,
  login_email text,
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
      p.id       as user_id,
      u.email::text as login_email,   -- the whole address, exactly as typed to sign in
      p.full_name,
      p.phone,
      p.school_id,
      s.name     as school_name
      from public.profiles p
      join auth.users     u on u.id = p.id
      left join public.schools s on s.id = p.school_id
     where p.role = 'school_lead'
     order by s.name nulls last, p.full_name;
end;
$$;

revoke execute on function public.admin_list_school_leads() from public, anon;
grant  execute on function public.admin_list_school_leads() to authenticated;

comment on function public.admin_list_school_leads() is
  'Admin only. Returns each school lead with the FULL login email. Previously '
  'returned only the local part, which the interface re-suffixed with '
  '@chipurobo.local — correct for legacy logins, wrong for real ones.';

notify pgrst, 'reload schema';
