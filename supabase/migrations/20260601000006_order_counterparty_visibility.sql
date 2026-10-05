-- ============================================================================
-- Order counterparty visibility
--
-- A maker space needs to see the NAME of the placing school for any order
-- routed to them — otherwise their "Orders to fulfil" view says "Placed by:
-- —" because the schools-select RLS hides non-maker-space schools.
--
-- Symmetrically a placer should be able to see the fulfiller's school name
-- even if the fulfiller isn't a maker space (e.g. internal cases).
--
-- This policy is purely additive: if there's an ORDER between you and the
-- other school, you can SELECT that school row. Other personal details on
-- the schools table (contact_phone, contact_email) are not exposed via the
-- dashboard UI anyway, but the name + county fields are what we render.
-- ============================================================================

create policy schools_order_counterparties on public.schools
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where (
        -- Other school placed an order with my school
        (o.fulfilled_by_school_id = public.me_school_id()
         and o.placed_by_school_id = schools.id)
        or
        -- I placed an order with the other school
        (o.placed_by_school_id = public.me_school_id()
         and o.fulfilled_by_school_id = schools.id)
      )
    )
  );
