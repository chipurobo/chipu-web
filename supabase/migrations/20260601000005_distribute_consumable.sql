-- ============================================================================
-- Consumable distribution — ChipuRobo-fulfilled order pipeline
--
-- When ChipuRobo admin assigns a consumable product to a school, the
-- assignment goes through the SAME production lifecycle as a maker-space
-- order: accepted → in_production → shipped → delivered. The only
-- difference is the fulfiller: there's no maker-space school filling it,
-- so fulfilled_by_school_id is NULL and we treat NULL fulfiller as
-- "ChipuRobo HQ is handling it".
--
-- Stage transitions:
--   create_consumable_assignment(school, product, qty, notes)
--     - Admin-only. Asserts product is consumable.
--     - Inserts an order with status='accepted' (admin commissioning
--       implicitly accepts) and fulfilled_by_school_id = NULL.
--
--   ship_order(order_id) is unchanged but now also handles the
--   NULL-fulfiller case for admins (admin bypass in the existing RPC
--   already permits this; ship_order doesn't touch product_units for
--   consumables, so there's nothing else to do).
--
--   mark_order_delivered(order_id) likewise unchanged — for consumables
--   it credits placed_by_school_id's stock_ledger with the order quantity.
--
-- We also expose a tiny `advance_consumable_to_production(order_id)`
-- helper so the admin UI can take a NULL-fulfiller order from accepted
-- → in_production with one call (the direct UPDATE works too via RLS
-- since admin can update any order; the helper exists purely for
-- symmetry with the other lifecycle RPCs).
-- ============================================================================

-- Drop the older instant-ledger version (rebuilt below as create_consumable_assignment)
drop function if exists public.distribute_consumable(uuid, uuid, integer, text);

create or replace function public.create_consumable_assignment(
  p_school_id  uuid,
  p_product_id uuid,
  p_quantity   integer,
  p_notes      text default null
) returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_is_durable boolean;
  v_order_id   uuid;
begin
  if not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;

  if p_quantity <= 0 then
    raise exception 'quantity must be positive' using errcode = '22023';
  end if;

  if not exists (select 1 from public.schools where id = p_school_id) then
    raise exception 'recipient school not found' using errcode = '23503';
  end if;

  select is_durable into v_is_durable
    from public.products
   where id = p_product_id and is_active = true;

  if v_is_durable is null then
    raise exception 'product not found (or inactive)' using errcode = '23503';
  end if;
  if v_is_durable then
    raise exception 'consumable assignments are for non-durable products only'
      using errcode = '22023';
  end if;

  insert into public.orders (
    placed_by_school_id, fulfilled_by_school_id, product_id, quantity,
    status, notes, accepted_at
  ) values (
    p_school_id,
    null,                                 -- ChipuRobo-fulfilled
    p_product_id,
    p_quantity,
    'accepted',                           -- skips the school-side "placed" step
    p_notes,
    now()
  )
  returning id into v_order_id;

  return v_order_id;
end;
$$;

grant execute on function public.create_consumable_assignment(uuid, uuid, integer, text)
  to authenticated;


-- Move an accepted ChipuRobo assignment into production. Admin-only;
-- mirrors the manual "start production" click maker spaces make on
-- their own orders.
create or replace function public.advance_consumable_to_production(p_order_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  if not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'order not found';
  end if;
  if v_order.fulfilled_by_school_id is not null then
    raise exception 'this RPC is for ChipuRobo-fulfilled orders only'
      using errcode = '22023';
  end if;
  if v_order.status <> 'accepted' then
    raise exception 'order must be accepted to start production (currently %)', v_order.status
      using errcode = '22023';
  end if;

  update public.orders
     set status = 'in_production'
   where id = p_order_id;
end;
$$;

grant execute on function public.advance_consumable_to_production(uuid) to authenticated;
