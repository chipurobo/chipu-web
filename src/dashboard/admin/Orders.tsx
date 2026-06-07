import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Order, OrderStatus, Product, School } from '../../lib/database.types';
import { ClipboardList } from 'lucide-react';

interface OrderRow extends Order {
  products: Pick<Product, 'id' | 'name' | 'sku' | 'is_durable'> | null;
  placer:    Pick<School,  'id' | 'name'> | null;
  fulfiller: Pick<School,  'id' | 'name'> | null;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  placed:         'badge-amber',
  accepted:       'badge-teal',
  in_production:  'badge-teal',
  shipped:        'badge-teal',
  delivered:      'badge-green',
  cancelled:      'badge-gray',
};

const STATUS_FILTERS: Array<{ key: 'all' | OrderStatus; label: string }> = [
  { key: 'all',           label: 'All' },
  { key: 'placed',        label: 'Placed' },
  { key: 'accepted',      label: 'Accepted' },
  { key: 'in_production', label: 'In production' },
  { key: 'shipped',       label: 'Shipped' },
  { key: 'delivered',     label: 'Delivered' },
  { key: 'cancelled',     label: 'Cancelled' },
];

/**
 * /dashboard/admin/orders
 *
 * System-wide read-only view of every order. ChipuRobo admins don't place
 * or fulfil orders themselves — those are between the placing school and
 * the maker space they picked. This screen just lets the team see the
 * pipeline in one place: who's ordering, who's fulfilling, what's stuck.
 */
export function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [err,    setErr]    = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products  ( id, name, sku, is_durable ),
          placer:placed_by_school_id    ( id, name ),
          fulfiller:fulfilled_by_school_id ( id, name )
        `)
        .order('placed_at', { ascending: false })
        .limit(200);
      if (cancelled) return;
      if (error) setErr(error.message);
      else setOrders(data as unknown as OrderRow[]);
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!orders) return null;
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const countsByStatus = useMemo(() => {
    const m = new Map<OrderStatus, number>();
    orders?.forEach((o) => m.set(o.status, (m.get(o.status) ?? 0) + 1));
    return m;
  }, [orders]);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Admin</p>
        <h1>All orders</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Every order in the system, newest first. Schools place these directly with the maker
          space they pick — ChipuRobo just watches the pipeline.
        </p>
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => {
          const active = filter === f.key;
          const count  = f.key === 'all'
            ? (orders?.length ?? 0)
            : (countsByStatus.get(f.key) ?? 0);
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                active
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-warm-200 hover:bg-warm-100'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 ${active ? 'text-gray-300' : 'text-gray-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="h-4 w-4 text-teal-700" />
          <h2 className="m-0">Orders</h2>
          <span className="text-xs text-gray-500">{filtered?.length ?? 0}</span>
        </div>

        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Placed</th>
                <th>Product</th>
                <th className="text-right">Qty</th>
                <th>Placer (school)</th>
                <th>Fulfiller (maker space)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!filtered && (
                <tr><td colSpan={6} className="text-center text-gray-500 py-8">Loading…</td></tr>
              )}
              {filtered && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-8">
                    No orders match this filter.
                  </td>
                </tr>
              )}
              {filtered?.map((o) => (
                <tr key={o.id}>
                  <td className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(o.placed_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="font-medium text-gray-900">{o.products?.name ?? '—'}</div>
                    <div className="text-xs text-gray-500">
                      {o.products?.sku ?? '—'}
                      {o.products && (
                        <span className="ml-2">
                          {o.products.is_durable ? '· durable' : '· consumable'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-right font-medium">{o.quantity}</td>
                  <td className="text-sm text-gray-800">{o.placer?.name ?? '—'}</td>
                  <td className="text-sm text-gray-800">
                    {o.fulfiller?.name ?? (
                      <span className="text-teal-700">ChipuRobo</span>
                    )}
                  </td>
                  <td>
                    <span className={STATUS_STYLES[o.status]}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
