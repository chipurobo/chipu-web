import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Order, OrderStatus, Product, School } from '../../lib/database.types';
import { Plus, X, Wrench, PackageCheck } from 'lucide-react';
import { notifyOrderEvent } from '../../lib/orderEmails';
import { useDialog } from '../../lib/useDialog';
import { Pagination, usePaged } from '../components/Pagination';
import { SkeletonRows } from '../components/Skeletons';

// Order rows joined with product info (small subset).
interface OrderRow extends Order {
  products: Pick<Product, 'id' | 'name' | 'sku' | 'is_durable'> | null;
  placer: { id: string; name: string } | null;
  fulfiller: { id: string; name: string } | null;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  placed:        'badge-amber',
  accepted:      'badge-teal',
  in_production: 'badge-teal',
  shipped:       'badge-teal',
  delivered:     'badge-green',
  cancelled:     'badge-gray',
};

/**
 * /dashboard/school/orders
 *
 * Two stacked sections:
 *   • "Orders I've placed" — every school sees this; can place new orders here
 *   • "Orders to fulfil"   — only shown when school.is_maker_space is true
 *
 * The Supabase select uses join syntax to pull product details + the names
 * of the placer/fulfiller schools in one round-trip. RLS does the scoping —
 * we only ever see orders where our school is the placer or fulfiller.
 */
export function SchoolOrders() {
  const { school } = useAuth();
  const qc = useQueryClient();
  const schoolId = school?.id ?? null;
  const [showNew, setShowNew] = useState(false);

  const { data: orders, error: ordersErr } = useQuery({
    queryKey: ['orders', 'school', schoolId],
    queryFn: async (): Promise<OrderRow[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products ( id, name, sku, is_durable ),
          placer:placed_by_school_id ( id, name ),
          fulfiller:fulfilled_by_school_id ( id, name )
        `)
        .order('placed_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data as unknown as OrderRow[];
    },
    enabled: !!schoolId,
  });

  // Shared product cache key — Distribute/Products/etc all key on ['products'].
  // We filter to active durables client-side so the order picker shows only
  // what schools can route to a maker space.
  const { data: products, error: productsErr } = useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data as Product[];
    },
  });
  const orderableProducts = products?.filter((p) => p.is_active && p.is_durable) ?? null;

  // Maker-space directory: schools the placer can route their order to.
  const { data: makerSpaces, error: makerSpacesErr } = useQuery({
    queryKey: ['schools'],
    queryFn: async (): Promise<School[]> => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      if (error) throw new Error(error.message);
      return data as School[];
    },
  });
  const makerSpaceOptions = makerSpaces?.filter((s) => s.is_maker_space) ?? null;

  const placedByMe   = orders?.filter((o) => o.placed_by_school_id === schoolId) ?? null;
  const toFulfil     = orders?.filter((o) => o.fulfilled_by_school_id === schoolId) ?? null;

  const markDeliveredMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('mark_order_delivered', { p_order_id: id });
      if (error) throw new Error(error.message);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['orders', 'school', schoolId] });
      void qc.invalidateQueries({ queryKey: ['orders', 'admin'] });
      void qc.invalidateQueries({ queryKey: ['stock', schoolId] });
    },
  });

  const err =
    ordersErr?.message
    ?? productsErr?.message
    ?? makerSpacesErr?.message
    ?? markDeliveredMutation.error?.message
    ?? null;

  const markDelivered = (id: string) => markDeliveredMutation.mutate(id);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            {school?.name ?? 'Your school'}
          </p>
          <h1>Orders</h1>
        </div>
        <button
          onClick={() => setShowNew((s) => !s)}
          className="btn-primary w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          Place new order
        </button>
      </div>

      {err && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {showNew && orderableProducts && makerSpaceOptions && school && (
        <NewOrderForm
          products={orderableProducts}
          makerSpaces={makerSpaceOptions}
          schoolId={school.id}
          placerName={school.name}
          placerEmail={school.contact_email}
          onCreated={(fulfillerId) => {
            setShowNew(false);
            void qc.invalidateQueries({ queryKey: ['orders', 'school', schoolId] });
            void qc.invalidateQueries({ queryKey: ['orders', 'admin'] });
            void qc.invalidateQueries({ queryKey: ['orders', 'maker', fulfillerId] });
          }}
          onClose={() => setShowNew(false)}
        />
      )}

      {/* Orders I've placed */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="m-0">Orders I've placed</h2>
          <span className="text-xs text-gray-500">
            {placedByMe?.length ?? 0} total
          </span>
        </div>
        <OrdersTable rows={placedByMe} side="placer" onMarkDelivered={markDelivered} />
      </section>

      {/* Orders to fulfil — only maker spaces (read-only here; actions live on /production) */}
      {school?.is_maker_space && (
        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="m-0">Orders to fulfil</h2>
            <span className="text-xs text-gray-500">
              {toFulfil?.length ?? 0} routed to us
            </span>
          </div>
          <p className="text-xs text-gray-500 -mt-2 mb-3">
            Take action on these in <a href="/dashboard/school/production" className="text-teal-700 hover:underline">Production</a>.
          </p>
          <OrdersTable rows={toFulfil} side="fulfiller" />
        </section>
      )}
    </div>
  );
}

function OrdersTable({
  rows,
  side,
  onMarkDelivered,
}: {
  rows: OrderRow[] | null;
  side: 'placer' | 'fulfiller';
  onMarkDelivered?: (orderId: string) => void;
}) {
  const showActions = !!onMarkDelivered;
  const { paged, page, setPage, totalPages } = usePaged(rows, 25);
  const colSpan = showActions ? 7 : 6;
  return (
    <div className="card overflow-x-auto">
      <table className="data-table" aria-label={side === 'placer' ? "Orders I've placed" : 'Orders to fulfil'}>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Qty</th>
            <th scope="col">{side === 'placer' ? 'Fulfiller' : 'Placed by'}</th>
            <th scope="col">Status</th>
            <th scope="col">Placed</th>
            <th scope="col">Expected</th>
            {showActions && <th scope="col" className="text-right">Action</th>}
          </tr>
        </thead>
        <tbody>
          {!rows && <SkeletonRows rows={5} cols={colSpan} label="Loading orders" />}
          {rows && rows.length === 0 && (
            <tr><td colSpan={colSpan} className="text-center text-gray-500 py-8">Nothing here yet.</td></tr>
          )}
          {paged?.map((o) => (
            <tr key={o.id}>
              <td>
                <div className="font-medium text-gray-900">{o.products?.name ?? '—'}</div>
                {o.products?.sku && (
                  <div className="text-xs text-gray-500">{o.products.sku}</div>
                )}
              </td>
              <td className="text-gray-700">{o.quantity}</td>
              <td className="text-sm text-gray-700">
                {side === 'placer'
                  ? (o.fulfiller?.name ?? <span className="text-teal-700">ChipuRobo</span>)
                  : (o.placer?.name ?? '—')}
              </td>
              <td>
                <span className={STATUS_STYLES[o.status]}>
                  {o.status.replace('_', ' ')}
                </span>
              </td>
              <td className="text-xs text-gray-500">
                {new Date(o.placed_at).toLocaleDateString()}
              </td>
              <td className="text-xs text-gray-500">
                {o.expected_delivery
                  ? new Date(o.expected_delivery).toLocaleDateString()
                  : '—'}
              </td>
              {showActions && (
                <td className="text-right">
                  {o.status === 'shipped' ? (
                    <button
                      onClick={() => onMarkDelivered!(o.id)}
                      className="btn-primary !py-1 !px-3 !text-xs"
                    >
                      <PackageCheck className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Mark delivered
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} label={side === 'placer' ? "Orders I've placed pagination" : 'Orders to fulfil pagination'} />
    </div>
  );
}

function NewOrderForm({
  products,
  makerSpaces,
  schoolId,
  placerName,
  placerEmail,
  onCreated,
  onClose,
}: {
  products: Product[];
  makerSpaces: School[];
  schoolId: string;
  placerName: string;
  placerEmail: string | null;
  onCreated: (fulfillerId: string) => void;
  onClose: () => void;
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [fulfillerId, setFulfillerId] = useState(makerSpaces[0]?.id ?? '');
  const [quantity, setQuantity] = useState<number>(1);
  const [expected, setExpected] = useState('');
  const [notes, setNotes] = useState('');

  const dialogRef = useDialog<HTMLDivElement>({ open: true, onClose, trapFocus: false });

  const createOrder = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('orders').insert({
        placed_by_school_id:    schoolId,
        fulfilled_by_school_id: fulfillerId,
        product_id:             productId,
        quantity,
        expected_delivery:      expected || null,
        notes:                  notes.trim() || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      // Fire-and-forget email to both parties.
      const product   = products.find((p)    => p.id === productId);
      const fulfiller = makerSpaces.find((s) => s.id === fulfillerId);
      if (product && fulfiller) {
        void notifyOrderEvent('placed', {
          productName:    product.name,
          productSku:     product.sku,
          quantity,
          placerName:     placerName,
          fulfillerName:  fulfiller.name,
          placerEmail:    placerEmail,
          fulfillerEmail: fulfiller.contact_email,
        });
      }
      onCreated(fulfillerId);
    },
  });

  const submitting = createOrder.isPending;
  const err = createOrder.error?.message ?? null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!productId || !fulfillerId || quantity < 1) return;
    createOrder.mutate();
  };

  if (makerSpaces.length === 0) {
    return (
      <div ref={dialogRef} role="region" aria-labelledby="new-order-heading" className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="m-0" id="new-order-heading">New order</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900" aria-label="Close new order form">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          No maker-space schools are registered yet. Once at least one school is flagged as a
          maker space, you'll be able to route orders to them from here.
        </p>
      </div>
    );
  }

  return (
    <div ref={dialogRef} role="region" aria-labelledby="new-order-heading" className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="m-0" id="new-order-heading">New order</h2>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900" aria-label="Close new order form">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={onSubmit} aria-labelledby="new-order-heading" className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="new-order-product">Product</label>
          <select
            id="new-order-product"
            className="field-select"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.sku ? ` · ${p.sku}` : ''}
              </option>
            ))}
          </select>
          <p className="field-help">
            Durable products only — consumables (filament, lesson packs, etc.) are distributed by
            ChipuRobo directly and will appear in your Stock automatically.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="new-order-fulfiller">
            <Wrench className="h-3.5 w-3.5 inline -mt-0.5 mr-1 text-teal-700" aria-hidden="true" />
            Maker space (fulfiller)<span aria-hidden="true" className="text-red-600 ml-0.5">*</span>
          </label>
          <select
            id="new-order-fulfiller"
            className="field-select"
            value={fulfillerId}
            onChange={(e) => setFulfillerId(e.target.value)}
            required
            aria-required="true"
          >
            {makerSpaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.county ? ` · ${s.county}` : ''}
                {s.id === schoolId ? ' (self)' : ''}
              </option>
            ))}
          </select>
          <p className="field-help">
            The maker-space school you're routing this order to. They'll see it under their
            "Orders to fulfil" view.
          </p>
        </div>

        <div>
          <label className="field-label" htmlFor="new-order-qty">Quantity<span aria-hidden="true" className="text-red-600 ml-0.5">*</span></label>
          <input
            id="new-order-qty"
            type="number"
            min={1}
            required
            aria-required="true"
            className="field-input"
            value={quantity || ''}
            onChange={(e) => setQuantity(parseInt(e.target.value || '0', 10))}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="new-order-exp">Expected delivery (optional)</label>
          <input
            id="new-order-exp"
            type="date"
            className="field-input"
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="new-order-notes">Notes (optional)</label>
          <textarea
            id="new-order-notes"
            rows={2}
            className="field-input"
            placeholder="Anything the maker space should know — specs, delivery instructions, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {err && (
          <div role="alert" className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {err}
          </div>
        )}

        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-warm-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Placing…' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  );
}
