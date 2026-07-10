-- ============================================================================
-- Tighten profiles UPDATE so non-admins can NEVER escalate their own role
-- or move themselves to a different school.
--
-- Rationale (per product decision):
--   • School leaders can self-register via the /dashboard/register-club form
--     and get `role = 'school_lead'` automatically.
--   • ChipuRobo admins are NEVER created from the frontend. The ONLY way to
--     become admin is for an existing admin (or someone with direct
--     database access) to run an UPDATE statement.
--
-- A BEFORE UPDATE trigger is cleaner than trying to express this with RLS
-- WITH CHECK because Postgres RLS doesn't give policies access to OLD vs
-- NEW values in the same statement.
-- ============================================================================

create or replace function public.profiles_prevent_role_escalation()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  -- Admins can change anything (including promoting/demoting others).
  if public.me_is_admin() then
    return new;
  end if;

  -- For anyone else:
  --   • role must not change
  --   • school_id must not change
  if new.role is distinct from old.role then
    raise exception 'permission denied: role can only be changed by an admin'
      using errcode = '42501';
  end if;
  if new.school_id is distinct from old.school_id then
    raise exception 'permission denied: school_id can only be changed by an admin or via signup'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.profiles_prevent_role_escalation();

-- Note: the `register_school_with_club` RPC writes role='school_lead' (which
-- matches the existing default) AND school_id (which transitions from NULL
-- to a fresh school). Because that update runs inside a SECURITY DEFINER
-- function, the trigger still fires under the caller's identity — and the
-- school_id change for a brand-new user fails the trigger check above.
--
-- Fix: when the *caller's* current school_id is NULL (first-ever signup),
-- allow the transition. We patch the trigger function to permit that one
-- transition (NULL → uuid) explicitly.
create or replace function public.profiles_prevent_role_escalation()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  if public.me_is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'permission denied: role can only be changed by an admin'
      using errcode = '42501';
  end if;

  -- Allow the one-time signup transition NULL → uuid for school_id.
  -- Any other change to school_id (e.g. moving schools) is admin-only.
  if new.school_id is distinct from old.school_id
     and old.school_id is not null then
    raise exception 'permission denied: changing school_id requires an admin'
      using errcode = '42501';
  end if;

  return new;
end;
$$;
