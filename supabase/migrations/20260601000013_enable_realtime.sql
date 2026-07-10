-- ============================================================================
-- Realtime for the dashboard
--
-- Add orders + product_units to the supabase_realtime publication so the
-- client can subscribe to INSERT/UPDATE events. RLS is still enforced on
-- realtime payloads, so each subscriber only sees rows their policies
-- already permit (placer/fulfiller/admin).
--
-- Used by:
--   src/lib/useOrderRealtime.ts → maker-space inbox + status-change toasts
-- ============================================================================

do $$
begin
  if not exists (
    select 1
      from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'orders'
  ) then
    execute 'alter publication supabase_realtime add table public.orders';
  end if;

  if not exists (
    select 1
      from pg_publication_tables
     where pubname = 'supabase_realtime'
       and schemaname = 'public'
       and tablename = 'product_units'
  ) then
    execute 'alter publication supabase_realtime add table public.product_units';
  end if;
end $$;
