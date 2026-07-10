-- =============================================================
-- Force pg_graphql to rebuild its schema cache.
--
-- Migrations 20260710000001–003 ran DDL that may not have
-- triggered pg_graphql's event trigger (pg_graphql_ddl_watch):
--   001 — ALTER VIEW, REVOKE/GRANT, COMMENT ON VIEW
--   002 — COMMENT ON CONSTRAINT (×14 relation-name directives)
--   003 — DROP VIEW (×2), CREATE FUNCTION (×2)
--
-- If the event trigger missed any of these, the cached schema
-- still references the dropped views (school_leaderboard,
-- public_schools_map) and their OIDs resolve to NULL, causing
-- "argument 0 must not be null" on every graphql.resolve() call.
--
-- Fix: a COMMENT ON SCHEMA is DDL that reliably fires the event
-- trigger.  inflect_names: false is the pg_graphql default, so
-- this is a no-op configuration-wise.
-- =============================================================

comment on schema public is e'@graphql({"inflect_names": false})';

notify pgrst, 'reload schema';
