-- ============================================================================
-- Maker-space directory
--
-- The order-placement form needs to show every maker space so the school
-- lead can route the order directly. The existing schools_select policy
-- only exposes the caller's own school + everything to admins, so the
-- dropdown comes back empty for non-admin school leads.
--
-- This adds a second SELECT policy on `schools` that lets any authenticated
-- user see schools where is_maker_space = true. RLS combines SELECT
-- policies with OR, so this is purely additive — a school lead still
-- sees their own school as well, and admins still see everything.
--
-- The exposure is intentional: maker spaces need to be discoverable. The
-- columns shown are name + county + the contact name/phone/email of the
-- maker space lead (this is operational info, not student data).
-- ============================================================================

create policy schools_maker_space_directory on public.schools
  for select to authenticated using (
    is_maker_space = true
  );
