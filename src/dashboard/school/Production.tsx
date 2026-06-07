import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Order, OrderStatus, Product, ProductUnit } from '../../lib/database.types';
import { Wrench, Inbox, PlayCircle, Truck, Plus, AlertCircle } from 'lucide-react';

// =============================================================
// /dashboard/school/production
//
// Visible only to maker-space schools. Shows orders routed TO us, grouped
// by stage of the fabrication pipeline:
//
//   1. Inbox        — status='placed' → Accept
//   2. To start     — status='accepted' → Start production
//   3. In production — status='in_production' → for durables add serial-numbered
//                       units; click Ship when ready
//
// Shipping calls the ship_order RPC (multi-table). Mark-delivered is the
// PLACER's action; that button lives on the Orders page.
// =============================================================

interface ProdOrder extends Order {
  products: Pick<Product, 'id' | 'name' | 'sku' | 'is_durable'> | null;
  placer:   { id: string; name: string } | null;
  units:    Pick<ProductUnit, 'id' | 'serial_number' | 'status'>[];
}

export function SchoolProduction() {
  const { school } = useAuth();
  const [orders, setOrders] = useState<ProdOrder[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    if (!school) return;
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products  ( id, name, sku, is_durable ),
        placer:placed_by_school_id ( id, name ),
        units:product_units!product_units_order_id_fkey ( id, serial_number, status )
      `)
      .eq('fulfilled_by_school_id', school.id)
      .in('status', ['placed', 'accepted', 'in_production', 'shipped'])
      .order('placed_at', { ascending: true });
    if (error) setErr(error.message);
    else setOrders(data as unknown as ProdOrder[]);
  };

  useEffect(() => { void load(); }, [school?.id]);

  if (!school?.is_maker_space) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-12 max-w-2xl">
        <div className="card p-8 text-center">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h1 className="mb-2">Production is for maker spaces</h1>
          <p className="text-sm text-gray-600">
            This view is only available to schools flagged as maker spaces. If your school has been
            approved as one, ask ChipuRobo to toggle <code className="bg-warm-100 px-1.5 py-0.5 rounded text-xs">
              is_maker_space
            </code> on your school record.
          </p>
        </div>
      </div>
    );
  }

  // Group by status
  const inbox        = orders?.filter((o) => o.status === 'placed') ?? null;
  const toStart      = orders?.filter((o) => o.status === 'accepted') ?? null;
  const inProduction = orders?.filter((o) => o.status === 'in_production') ?? null;
  const shipped      = orders?.filter((o) => o.status === 'shipped') ?? null;

  // Mutations
  const setStatus = async (id: string, status: OrderStatus, stamp?: 'accepted_at') => {
    setErr(null);
    const patch: Record<string, unknown> = { status };
    if (stamp) patch[stamp] = new Date().toISOString();
    const { error } = await supabase.from('orders').update(patch).eq('id', id);
    if (error) setErr(error.message);
    else void load();
  };

  const ship = async (id: string) => {
    setErr(null);
    const { error } = await supabase.rpc('ship_order', { p_order_id: id });
    if (error) setErr(error.message);
    else void load();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-10">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{school.name}</p>
        <h1>Production</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          The fabrication pipeline for orders routed to your maker space. Accept → start production
          → record units → ship.
        </p>
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {/* 1. Inbox */}
      <Section icon={Inbox} title="Inbox" count={inbox?.length ?? 0}>
        {!inbox || inbox.length === 0
          ? <Empty>No new orders.</Empty>
          : inbox.map((o) => (
              <OrderCard key={o.id} o={o}>
                <button onClick={() => setStatus(o.id, 'accepted', 'accepted_at')} className="btn-primary">
                  Accept order
                </button>
              </OrderCard>
            ))}
      </Section>

      {/* 2. To start */}
      <Section icon={PlayCircle} title="Accepted — ready to start" count={toStart?.length ?? 0}>
        {!toStart || toStart.length === 0
          ? <Empty>Nothing waiting.</Empty>
          : toStart.map((o) => (
              <OrderCard key={o.id} o={o}>
                <button onClick={() => setStatus(o.id, 'in_production')} className="btn-primary">
                  Start production
                </button>
              </OrderCard>
            ))}
      </Section>

      {/* 3. In production */}
      <Section icon={Wrench} title="In production" count={inProduction?.length ?? 0}>
        {!inProduction || inProduction.length === 0
          ? <Empty>Nothing on the bench.</Empty>
          : inProduction.map((o) => (
              <InProductionCard key={o.id} order={o} onShip={() => ship(o.id)} onChanged={load} />
            ))}
      </Section>

      {/* 4. Shipped (read-only history, waiting on delivery confirmation) */}
      <Section icon={Truck} title="Shipped — awaiting delivery" count={shipped?.length ?? 0}>
        {!shipped || shipped.length === 0
          ? <Empty>Nothing in transit.</Empty>
          : shipped.map((o) => (
              <OrderCard key={o.id} o={o}>
                <span className="text-xs text-gray-500">
                  {o.placer?.name ?? 'Placer'} marks this delivered on receipt.
                </span>
              </OrderCard>
            ))}
      </Section>
    </div>
  );
}

function Section({
  icon: Icon, title, count, children,
}: {
  icon: typeof Inbox; title: string; count: number; children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-teal-700" />
        <h2 className="m-0">{title}</h2>
        <span className="text-xs text-gray-500">{count}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500 italic px-4 py-3">{children}</p>;
}

function OrderCard({ o, children }: { o: ProdOrder; children?: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="font-medium text-gray-900">
            {o.products?.name ?? 'Unknown product'} × {o.quantity}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Placed by {o.placer?.name ?? '—'}
            {o.products?.sku && <> · {o.products.sku}</>}
            {' · '}
            <span className={o.products?.is_durable ? 'text-teal-700' : 'text-amber-700'}>
              {o.products?.is_durable ? 'durable (serials)' : 'consumable (counted)'}
            </span>
          </div>
          {o.notes && <div className="text-xs text-gray-600 mt-1.5 italic">"{o.notes}"</div>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">{children}</div>
      </div>
    </div>
  );
}

/**
 * The card for an order that's in production. For durable products, lets the
 * maker space record serial-numbered units one at a time. Ships when the
 * count meets the ordered quantity (or via override for partial ships later).
 */
function InProductionCard({
  order, onShip, onChanged,
}: {
  order: ProdOrder; onShip: () => void; onChanged: () => void;
}) {
  const isDurable = !!order.products?.is_durable;
  const fabricated = order.units.length;
  const required = order.quantity;
  const ready = fabricated >= required;

  const [adding, setAdding] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  // Serial numbers are auto-generated by a BEFORE INSERT trigger
  // (20260601000012_auto_generate_serial.sql) — we just hit "Add unit"
  // and the DB assigns "<SKU>-NNN" based on the product's existing count.
  const addUnit = async () => {
    if (!order.products) return;
    setAdding(true);
    setLocalErr(null);
    const { error } = await supabase.from('product_units').insert({
      product_id:              order.products.id,
      order_id:                order.id,
      fabricated_by_school_id: order.fulfilled_by_school_id!,
      status:                  'with_maker',
    });
    setAdding(false);
    if (error) {
      setLocalErr(error.message);
    } else {
      onChanged();
    }
  };

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div className="min-w-0">
          <div className="font-medium text-gray-900">
            {order.products?.name ?? 'Unknown product'} × {required}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Placed by {order.placer?.name ?? '—'}
            {' · '}
            <span className={isDurable ? 'text-teal-700' : 'text-amber-700'}>
              {isDurable ? 'durable' : 'consumable'}
            </span>
          </div>
        </div>
        <button onClick={onShip} className="btn-primary" disabled={isDurable && !ready}>
          <Truck className="h-4 w-4 mr-1.5" />
          Ship
        </button>
      </div>

      {isDurable ? (
        <>
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
            <span className={`badge ${ready ? 'badge-green' : 'badge-amber'}`}>
              {fabricated} of {required} fabricated
            </span>
            {!ready && (
              <span className="text-gray-500">
                Add {required - fabricated} more before shipping
              </span>
            )}
          </div>

          {order.units.length > 0 && (
            <div className="mb-3 space-y-1 max-h-32 overflow-y-auto pr-1">
              {order.units.map((u) => (
                <div key={u.id} className="text-xs font-mono text-gray-600">
                  · {u.serial_number}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-warm-200">
            <p className="text-xs text-gray-500">
              Click <span className="font-medium">Add unit</span> for each one you finish — the
              serial number is generated automatically (e.g.{' '}
              <span className="font-mono">{order.products?.sku ?? 'SKU'}-{String(fabricated + 1).padStart(3, '0')}</span>).
            </p>
            <button
              type="button"
              onClick={addUnit}
              className="btn-secondary"
              disabled={adding || ready}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {adding ? 'Adding…' : 'Add unit'}
            </button>
          </div>
          {localErr && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 mt-2">
              {localErr}
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-500 italic">
          Consumable order — no per-unit tracking. Click Ship when the quantity is on its way to
          the placer.
        </p>
      )}
    </div>
  );
}
