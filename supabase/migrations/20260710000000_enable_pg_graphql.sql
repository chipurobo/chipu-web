-- =============================================================
-- Re-enable pg_graphql.
--
-- 2026-07-10: production started returning "pg_graphql extension is
-- not enabled." on every /graphql/v1 request — every dashboard read
-- goes through GraphQL, so all pages failed at once. The extension
-- was somehow disabled on the hosted project (no migration ever
-- dropped it; likely a dashboard toggle or project-level event).
--
-- Making it a migration (rather than a one-off dashboard toggle)
-- keeps local/remote parity and re-asserts the extension on any
-- future db reset.
-- =============================================================

create extension if not exists pg_graphql;

-- Ask PostgREST to reload its schema cache so /graphql/v1 picks the
-- restored graphql.resolve() up immediately instead of on next restart.
notify pgrst, 'reload schema';
