import { QueryClient } from '@tanstack/react-query';

/**
 * Shared TanStack Query client for the dashboard.
 *
 * Tuning rationale:
 *   • staleTime 30s — most dashboard data (schools, orders, products) is
 *     fine to display from cache for half a minute. Background refetch on
 *     focus keeps things fresh. Realtime subscriptions invalidate the
 *     specific cache key when a relevant row actually changes.
 *   • gcTime 5m — cached pages stay in memory for 5 minutes after the
 *     last component unmounts. Means navigating away and back is instant.
 *   • refetchOnWindowFocus — yes, in case the school lead left the tab
 *     open all day; coming back triggers a freshness check.
 *   • retry 1 — Supabase RLS errors are deterministic; retrying won't
 *     help. Network blips do warrant one retry.
 *
 * Cache invalidation pattern:
 *   • Mutations call queryClient.invalidateQueries({ queryKey: ['orders'] })
 *     etc. after success. The realtime subscription (useOrderRealtime)
 *     can also invalidate when Supabase broadcasts a change.
 *
 * Query key conventions:
 *   • ['schools']                       — admin: all schools
 *   • ['schools', schoolId]             — admin: one school detail
 *   • ['orders', { scope, schoolId? }]  — orders scoped to admin/school
 *   • ['products', { active? }]         — product catalogue
 *   • ['members', schoolId]             — students for one school
 *   • ['units', schoolId]               — durable units held at school
 *   • ['events']                        — admin: activities
 *   • ['templates']                     — certificate templates
 *   • ['issuances', { scope, ... }]     — certificate issuances
 *   • ['school-leads']                  — admin: list of school-lead users
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime:    5 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect:   true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
