-- ============================================================================
-- Fix admin_delete_school FK order
--
-- code_clubs.registered_by references auth.users with ON DELETE RESTRICT.
-- The old function deleted auth.users for the school_lead first, which
-- failed because the code_club row was still pointing at them.
--
-- New order: clear out everything that references the user OR the school
-- before touching auth.users. Specifically code_clubs must go first.
-- ============================================================================

create or replace function public.admin_delete_school(p_school_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
begin
  if not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;

  if not exists (select 1 from public.schools where id = p_school_id) then
    raise exception 'school not found' using errcode = '23503';
  end if;

  -- 1. Units this school fabricated or currently holds (RESTRICT FK on
  --    product_units.fabricated_by_school_id).
  delete from public.product_units
   where fabricated_by_school_id = p_school_id
      or current_school_id       = p_school_id;

  -- 2. Orders placed by OR fulfilled by this school (RESTRICT FK on
  --    orders.placed_by_school_id).
  delete from public.orders
   where placed_by_school_id    = p_school_id
      or fulfilled_by_school_id = p_school_id;

  -- 3. Stock ledger entries.
  delete from public.stock_ledger where school_id = p_school_id;

  -- 4. Event attendances + school attachments (cascade from school but
  --    explicit for clarity).
  delete from public.event_attendances where school_id = p_school_id;
  delete from public.event_schools     where school_id = p_school_id;

  -- 5. Students.
  delete from public.club_members where school_id = p_school_id;

  -- 6. Code club FIRST — it has a RESTRICT FK to auth.users.id via
  --    code_clubs.registered_by, so it must be gone before we can drop
  --    the lead's auth row.
  delete from public.code_clubs where school_id = p_school_id;

  -- 7. Wipe lead-teacher auth users (cascades through profiles).
  for v_user_id in
    select id from public.profiles
     where school_id = p_school_id and role = 'school_lead'
  loop
    delete from auth.users where id = v_user_id;
  end loop;

  -- 8. Finally the school itself.
  delete from public.schools where id = p_school_id;
end;
$$;
