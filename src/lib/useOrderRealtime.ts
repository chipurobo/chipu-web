import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { useAuth } from './auth';
import { useNotifications } from './notifications';
import type { OrderStatus } from './database.types';

// =============================================================
// Real-time order awareness for the dashboard sidebar + toasts.
//
// • Subscribes to public.orders via Supabase Realtime (RLS-scoped, so
//   the user only ever receives events for orders they can already see).
// • Fires toast notifications:
//     – New order routed to my maker space → "New order received"
//     – Status change on an order touching me → "Order is now <status>"
// • Returns badge counts the sidebar reads:
//     inbox             — placed orders my maker space hasn't accepted yet
//     awaitingDelivery  — shipped orders I (placer) need to mark delivered
//     adminBacklog      — ChipuRobo-fulfilled (NULL fulfiller) orders in
//                         accepted / in_production / shipped (admin-only)
// =============================================================

export interface OrderCounts {
  inbox:            number;
  awaitingDelivery: number;
  adminBacklog:     number;
}

const STATUS_HUMAN: Record<OrderStatus, string> = {
  placed:        'placed',
  accepted:      'accepted',
  in_production: 'in production',
  shipped:       'shipped',
  delivered:     'delivered',
  cancelled:     'cancelled',
};

interface OrderRow {
  id:                     string;
  status:                 OrderStatus;
  quantity:               number;
  placed_by_school_id:    string | null;
  fulfilled_by_school_id: string | null;
}

export function useOrderRealtime(): OrderCounts {
  const { profile, school } = useAuth();
  const { notify } = useNotifications();
  const qc = useQueryClient();
  const [counts, setCounts] = useState<OrderCounts>({
    inbox: 0, awaitingDelivery: 0, adminBacklog: 0,
  });

  const refresh = async () => {
    if (!profile) return;
    const tasks: Promise<number>[] = [];

    if (school?.id) {
      tasks.push(
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('fulfilled_by_school_id', school.id)
          .eq('status', 'placed')
          .then((r) => r.count ?? 0),
      );
      tasks.push(
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('placed_by_school_id', school.id)
          .eq('status', 'shipped')
          .then((r) => r.count ?? 0),
      );
    } else {
      tasks.push(Promise.resolve(0));
      tasks.push(Promise.resolve(0));
    }

    if (profile.role === 'admin') {
      tasks.push(
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .is('fulfilled_by_school_id', null)
          .in('status', ['accepted', 'in_production', 'shipped'])
          .then((r) => r.count ?? 0),
      );
    } else {
      tasks.push(Promise.resolve(0));
    }

    const [inbox, awaitingDelivery, adminBacklog] = await Promise.all(tasks);
    setCounts({ inbox, awaitingDelivery, adminBacklog });
  };

  // Initial + whenever auth context changes
  useEffect(() => { void refresh(); }, [profile?.id, school?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!profile) return;
    const channelName = `orders-${profile.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          const event = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
          const newRow = (payload.new ?? null) as OrderRow | null;
          const oldRow = (payload.old ?? null) as OrderRow | null;

          // New incoming order at my maker space
          if (event === 'INSERT' && newRow && school?.id
              && newRow.fulfilled_by_school_id === school.id) {
            notify(
              'info',
              'New order received',
              `${newRow.quantity} unit(s) waiting in your Production inbox.`,
            );
          }

          // Status change on an order involving me
          if (event === 'UPDATE' && newRow && oldRow && newRow.status !== oldRow.status) {
            const friendly = STATUS_HUMAN[newRow.status] ?? newRow.status;
            if (school?.id && newRow.placed_by_school_id === school.id) {
              notify('success', 'Your order is now ' + friendly,
                `${newRow.quantity} unit(s)`);
            } else if (school?.id && newRow.fulfilled_by_school_id === school.id) {
              notify('info', 'Order you are fulfilling is now ' + friendly,
                `${newRow.quantity} unit(s)`);
            } else if (profile.role === 'admin' && newRow.fulfilled_by_school_id === null) {
              notify('info', 'ChipuRobo assignment is now ' + friendly,
                `${newRow.quantity} unit(s)`);
            }
          }

          // Re-pull counts after every event we care about
          void refresh();
          // Nudge any open order list to refetch. Broad invalidation is fine
          // here — TanStack will only refetch the queries that are actually
          // mounted. (TODO: useOrderRealtime itself still does its own count
          // queries via refresh(); consider routing those through TanStack
          // with an ['order-counts', { userId, role }] cache later.)
          void qc.invalidateQueries({ queryKey: ['orders'] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profile?.id, school?.id, notify, qc]);

  return counts;
}
