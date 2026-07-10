-- =============================================================
-- Harden the three public views flagged by the Security Advisor
-- (2026-07-10). Before this migration, all three were SECURITY
-- DEFINER *and* granted to anon — meaning an anonymous visitor with
-- the publishable key could read every school's stock levels and the
-- full leaderboard. Verified live before fixing.
--
-- Resolution per view:
--   • stock_on_hand      — REAL BUG. Flip to security_invoker so the
--     querying user's RLS applies. stock_ledger already has the right
--     policy (me_is_admin() OR school_id = me_school_id()), so school
--     leads keep seeing their own stock, admins keep seeing all, and
--     anon/other schools see nothing. Revoke anon entirely.
--   • school_leaderboard — SECURITY DEFINER **by design**: the whole
--     point is that every school sees every school's totals, which
--     per-school RLS on lesson_completions would forbid. It exposes
--     only aggregates (name, county, points). Keep definer, but
--     dashboard-only: revoke anon.
--   • public_schools_map — SECURITY DEFINER **by design**: it exposes
--     a redacted shape (no contact info) of schools with coordinates
--     to the anonymous marketing-site map. Keep definer + anon SELECT.
--
-- Also strip the meaningless write-ish default grants (INSERT/UPDATE/
-- DELETE/…) that Supabase default privileges put on views.
-- =============================================================

-- ── stock_on_hand: enforce the querying user's RLS ──────────────
alter view public.stock_on_hand set (security_invoker = on);
revoke all on public.stock_on_hand from anon;
revoke all on public.stock_on_hand from authenticated;
grant select on public.stock_on_hand to authenticated;

-- ── school_leaderboard: definer by design, but authenticated-only ─
revoke all on public.school_leaderboard from anon;
revoke all on public.school_leaderboard from authenticated;
grant select on public.school_leaderboard to authenticated;
comment on view public.school_leaderboard is
  'SECURITY DEFINER by design: cross-school aggregate leaderboard. '
  'Exposes only school name/county/points to authenticated dashboard '
  'users; per-school RLS on the underlying tables would defeat its '
  'purpose. Advisor finding acknowledged 2026-07-10.';

-- ── public_schools_map: definer + anon by design, select-only ────
revoke all on public.public_schools_map from anon;
revoke all on public.public_schools_map from authenticated;
grant select on public.public_schools_map to anon, authenticated;
comment on view public.public_schools_map is
  'SECURITY DEFINER by design: redacted school pins (no contact info) '
  'for the anonymous marketing-site map. Advisor finding acknowledged '
  '2026-07-10.';
