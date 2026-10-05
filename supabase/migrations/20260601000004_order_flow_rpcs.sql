-- ============================================================================
-- Order-flow RPCs
--
-- Accepting an order and starting production are single-row UPDATEs on the
-- orders table and can go through the SDK directly (the orders_update RLS
-- policy permits the fulfilling school to write).
--
-- Shipping and delivering are MULTI-table transitions, so we wrap them in
-- SECURITY DEFINER functions. Permission checks happen inside.
--
--   ship_order(order_id):
--     - Caller must be the order's fulfilling school (or admin)
--     - Order must be in_production
--     - Moves order.status to 'shipped' + sets shipped_at
--     - For durable products: all product_units tied to this order with
--       status='with_maker' transition to 'in_transit'
--
--   mark_order_delivered(order_id):
--     - Caller must be the order's PLACING school (or admin)
--     - Order must be shipped
--     - Moves order.status to 'delivered' + sets delivered_at
--     - For durables: each product_unit tied to this order moves to
--       'with_school' under current_school_id = placer
--     - For consumables: a positive stock_ledger row is inserted
--       (delta = order.quantity, school_id = placer)
-- ============================================================================

create or replace function public.ship_order(p_order_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'order not found';
  end if;

  if not public.me_is_admin()
     and v_order.fulfilled_by_school_id is distinct from public.me_school_id() then
    raise exception 'permission denied: only the fulfilling maker space can ship this order'
      using errcode = '42501';
  end if;

  if v_order.status <> 'in_production' then
    raise exception 'order must be in_production to ship (currently %)', v_order.status
      using errcode = '22023';
  end if;

  update public.orders
     set status = 'shipped',
         shipped_at = now()
   where id = p_order_id;

  -- Mark any fabricated units as in_transit.
  update public.product_units
     set status = 'in_transit'
   where order_id = p_order_id
     and status = 'with_maker';
end;
$$;
grant execute on function public.ship_order(uuid) to authenticated;


create or replace function public.mark_order_delivered(p_order_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_order      public.orders%rowtype;
  v_is_durable boolean;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'order not found';
  end if;

  if not public.me_is_admin()
     and v_order.placed_by_school_id is distinct from public.me_school_id() then
    raise exception 'permission denied: only the placing school can mark this order delivered'
      using errcode = '42501';
  end if;

  if v_order.status <> 'shipped' then
    raise exception 'order must be shipped to mark delivered (currently %)', v_order.status
      using errcode = '22023';
  end if;

  select is_durable into v_is_durable
    from public.products where id = v_order.product_id;

  update public.orders
     set status = 'delivered',
         delivered_at = now()
   where id = p_order_id;

  if v_is_durable then
    -- Hand the durable units over to the receiving school.
    update public.product_units
       set status            = 'with_school',
           current_school_id = v_order.placed_by_school_id,
           assigned_at       = now()
     where order_id = p_order_id
       and status   = 'in_transit';
  else
    -- Auto-credit consumables to the receiving school's ledger.
    insert into public.stock_ledger (
      school_id, product_id, delta, order_id, recorded_by, note
    ) values (
      v_order.placed_by_school_id,
      v_order.product_id,
      v_order.quantity,
      p_order_id,
      coalesce(auth.uid(), v_order.placed_by_school_id::uuid),  -- fallback if called without a session
      'Auto-credited on delivery'
    );
  end if;
end;
$$;
grant execute on function public.mark_order_delivered(uuid) to authenticated;
