-- ============================================================================
-- admin_delete_school(school_id)
--
-- Hard-deletes a school and every row that depends on it. Some of the FKs
-- from product_units / orders use ON DELETE RESTRICT, so a plain
-- `delete from schools` would error if the school has ever placed an
-- order or fabricated a unit. This RPC unwinds those dependencies in
-- the right order before removing the school.
--
-- Order of operations (irrecoverable — UI should confirm strongly):
--   1. Delete auth.users for every school_lead whose profile points at
--      this school. Cascades clean their profiles, club_members rows, etc.
--   2. Delete product_units fabricated by OR currently held by the school.
--   3. Delete orders placed by OR fulfilled by the school.
--   4. Delete stock_ledger rows for the school.
--   5. Delete club_members for the school.
--   6. Delete the code_club for the school.
--   7. Delete the schools row itself.
--
-- For BULK delete the client calls this RPC once per id — each call is its
-- own transaction so a failure on one school doesn't roll back the others.
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

  -- 1. Wipe lead-teacher auth users (cascades through profiles → club_members).
  for v_user_id in
    select id from public.profiles
     where school_id = p_school_id and role = 'school_lead'
  loop
    delete from auth.users where id = v_user_id;
  end loop;

  -- 2. Units this school fabricated or currently holds.
  delete from public.product_units
   where fabricated_by_school_id = p_school_id
      or current_school_id       = p_school_id;

  -- 3. Orders placed by OR fulfilled by this school.
  delete from public.orders
   where placed_by_school_id    = p_school_id
      or fulfilled_by_school_id = p_school_id;

  -- 4. Stock ledger entries.
  delete from public.stock_ledger where school_id = p_school_id;

  -- 5. Students (club_members has on-delete-cascade from school, but explicit
  --    here so the order is unambiguous even if the FK changes).
  delete from public.club_members where school_id = p_school_id;

  -- 6. Code club row (also has cascade, kept explicit).
  delete from public.code_clubs where school_id = p_school_id;

  -- 7. Finally the school itself.
  delete from public.schools where id = p_school_id;
end;
$$;

grant execute on function public.admin_delete_school(uuid) to authenticated;
