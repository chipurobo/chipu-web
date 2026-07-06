import { GraphQLClient, type Variables } from 'graphql-request';
import { supabase } from './supabase';

// =============================================================
// Supabase GraphQL client
//
// pg_graphql exposes the same Postgres schema as a GraphQL endpoint
// at /graphql/v1. RLS still applies — the user's JWT is sent on every
// request via the Authorization header, so policies behave identically
// to the REST/PostgREST path the rest of the app uses.
//
// Architecture notes:
//   • This client is for READS. Mutations + RPCs stay on supabase-js.
//   • Cache lives in TanStack Query (the dashboard already uses it).
//     Wrap requests in useQuery() with stable keys so invalidation and
//     cross-page sharing keep working unchanged.
//   • The middleware re-reads the session on every request rather than
//     caching the token so a refreshed JWT is picked up automatically.
//
// Once `npm run codegen` is run against your local Supabase, replace
// the manual `request<T>` calls in src/lib/gql/queries.ts with calls
// into the typed SDK generated at src/lib/gql/sdk.ts.
// =============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    'graphqlClient: missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY.',
  );
}

export const gqlClient = new GraphQLClient(`${SUPABASE_URL}/graphql/v1`, {
  // Default headers — request-time middleware below overrides the
  // Authorization header with the current user's JWT when available.
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  },
  requestMiddleware: async (request) => {
    // Per-request: pull the latest access token from the active session
    // so refreshed tokens land here without re-instantiating the client.
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token ?? SUPABASE_KEY;
    return {
      ...request,
      headers: {
        ...(request.headers as Record<string, string> | undefined),
        apikey:        SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
      },
    };
  },
});

/**
 * Convenience typed-request helper. Use this in queryFn bodies when the
 * generated SDK isn't available yet:
 *
 *   const data = await gqlRequest<LeaderboardResp>(LEADERBOARD_QUERY);
 */
export function gqlRequest<TData, TVariables extends Variables = Variables>(
  query: string,
  variables?: TVariables,
): Promise<TData> {
  return gqlClient.request<TData, TVariables>(query, variables);
}
