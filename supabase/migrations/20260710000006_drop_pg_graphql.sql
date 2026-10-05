-- Drop the pg_graphql extension. All dashboard reads now go through
-- supabase-js (PostgREST) instead of the /graphql/v1 endpoint.
drop extension if exists pg_graphql;

notify pgrst, 'reload schema';
