import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Order, OrderStatus, Product, ProductUnit } from '../../lib/database.types';
import { Wrench, Inbox, PlayCircle, Truck, Plus, AlertCircle, PackageCheck } from 'lucide-react';

// =============================================================
// /dashboard/school/production
//
// Visible only to maker-space schools. Kanban-style pipeline for orders
// routed TO us, grouped by stage:
//
//   1. Inbox        — status='placed' → Accept
//   2. Accepted     — status='accepted' → Start production
//   3. In production — status='in_production' → for durables, add
//                       serial-numbered units; Ship when ready
//   4. Shipped      — status='shipped' (read-only, waiting on placer)
//
// Stats strip at the top shows live counts. Shipping calls the ship_order
// RPC; everything else is a direct UPDATE / INSERT (allowed by RLS).
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
  const inbox        = orders?.filter((o) => o.status === 'placed')         ?? null;
  const toStart      = orders?.filter((o) => o.status === 'accepted')       ?? null;
  const inProduction = orders?.filter((o) => o.status === 'in_production')  ?? null;
  const shipped      = orders?.filter((o) => o.status === 'shipped')        ?? null;

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

  const cancel = async (id: string) => {
    if (!window.confirm('Cancel this order? The placer will see it as cancelled. Any units you fabricated for it stay on record but the order disappears from your pipeline.')) return;
    setErr(null);
    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
    if (error) setErr(error.message);
    else void load();
  };

  const stats = [
    { key: 'inbox',         label: 'Inbox',         count: inbox?.length        ?? 0, accent: 'bg-amber-500'   },
    { key: 'accepted',      label: 'Accepted',      count: toStart?.length      ?? 0, accent: 'bg-teal-500'    },
    { key: 'in_production', label: 'In production', count: inProduction?.length ?? 0, accent: 'bg-indigo-500'  },
    { key: 'shipped',       label: 'Shipped',       count: shipped?.length      ?? 0, accent: 'bg-emerald-500' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{school.name}</p>
        <h1>Production</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Orders routed to your maker space. Accept → start production → record units → ship.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.key} className="card p-3 flex items-center gap-3">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${s.accent}`} />
            <div className="min-w-0">
              <div className="text-2xl font-semibold text-gray-900 leading-none">{s.count}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {/* Kanban — first three lighter-weight columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Column
          title="Inbox"
          subtitle="New orders to accept"
          icon={Inbox}
          accent="amber"
          rows={inbox}
          emptyIcon={Inbox}
          emptyText="No new orders"
        >
          {(o) => (
            <SimpleTile
              order={o}
              tint={ACCENTS.amber.tint}
              actionLabel="Accept order"
              actionIcon={PlayCircle}
              actionStyle="primary"
              onAction={() => setStatus(o.id, 'accepted', 'accepted_at')}
              onCancel={() => cancel(o.id)}
            />
          )}
        </Column>

        <Column
          title="Accepted"
          subtitle="Ready to start"
          icon={PlayCircle}
          accent="teal"
          rows={toStart}
          emptyIcon={PlayCircle}
          emptyText="Nothing waiting"
        >
          {(o) => (
            <SimpleTile
              order={o}
              tint={ACCENTS.teal.tint}
              actionLabel="Start production"
              actionIcon={Wrench}
              actionStyle="primary"
              onAction={() => setStatus(o.id, 'in_production')}
              onCancel={() => cancel(o.id)}
            />
          )}
        </Column>

        <Column
          title="Shipped"
          subtitle="Awaiting delivery"
          icon={Truck}
          accent="emerald"
          rows={shipped}
          emptyIcon={Truck}
          emptyText="Nothing in transit"
        >
          {(o) => (
            <ShippedTile order={o} tint={ACCENTS.emerald.tint} />
          )}
        </Column>
      </div>

      {/* In production — full-width section because each card carries the
          serial-number register + Add-unit form, which is denser than the
          tiles above. */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="h-4 w-4 text-indigo-600" />
          <h2 className="m-0">On the bench</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
            {inProduction?.length ?? 0}
          </span>
        </div>

        {!inProduction || inProduction.length === 0 ? (
          <div className="card p-8 text-center">
            <Wrench className="h-7 w-7 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Nothing on the bench.</p>
            <p className="text-xs text-gray-400 mt-1">
              Accepted orders move here once you click "Start production".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {inProduction.map((o) => (
              <InProductionCard
                key={o.id}
                order={o}
                onShip={() => ship(o.id)}
                onCancel={() => cancel(o.id)}
                onChanged={load}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// -----------------------------------------------------------------
// Reusable column
// -----------------------------------------------------------------

const ACCENTS = {
  amber:   { bar: 'bg-amber-500',   tint: 'bg-amber-50',   pill: 'bg-amber-100 text-amber-800'     },
  teal:    { bar: 'bg-teal-500',    tint: 'bg-teal-50',    pill: 'bg-teal-100 text-teal-800'       },
  emerald: { bar: 'bg-emerald-500', tint: 'bg-emerald-50', pill: 'bg-emerald-100 text-emerald-800' },
} as const;

type Accent = keyof typeof ACCENTS;

function Column({
  title, subtitle, icon: Icon, accent, rows,
  emptyIcon: EmptyIcon, emptyText, children,
}: {
  title: string;
  subtitle: string;
  icon: typeof Inbox;
  accent: Accent;
  rows: ProdOrder[] | null;
  emptyIcon: typeof Inbox;
  emptyText: string;
  children: (o: ProdOrder) => React.ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <section className="card overflow-hidden flex flex-col">
      <div className={`h-1 ${a.bar}`} />
      <header className="px-4 py-3 border-b border-warm-200 flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-700" />
        <div className="flex-1 min-w-0">
          <h2 className="m-0 text-sm font-semibold leading-tight">{title}</h2>
          <p className="text-[0.7rem] text-gray-500 leading-tight">{subtitle}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.pill}`}>
          {rows?.length ?? 0}
        </span>
      </header>

      <div className="flex-1 p-3 space-y-2 min-h-[160px]">
        {!rows && <p className="text-xs text-gray-400 italic px-2 py-3">Loading…</p>}
        {rows && rows.length === 0 && (
          <div className="text-center py-8 px-3">
            <EmptyIcon className="h-7 w-7 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">{emptyText}</p>
          </div>
        )}
        {rows?.map((o) => <div key={o.id}>{children(o)}</div>)}
      </div>
    </section>
  );
}

// -----------------------------------------------------------------
// Tile variants
// -----------------------------------------------------------------

function SimpleTile({
  order, tint, actionLabel, actionIcon: ActionIcon, actionStyle, onAction, onCancel,
}: {
  order: ProdOrder;
  tint: string;
  actionLabel: string;
  actionIcon: typeof Inbox;
  actionStyle: 'primary' | 'secondary';
  onAction: () => void;
  onCancel?: () => void;
}) {
  return (
    <div className={`rounded-md border border-warm-200 ${tint} p-3`}>
      <div className="font-medium text-gray-900 text-sm leading-tight">
        {order.products?.name ?? 'Unknown product'}{' '}
        <span className="text-gray-500 font-normal">× {order.quantity}</span>
      </div>
      <div className="text-[0.7rem] text-gray-500 mt-1 leading-snug">
        From <span className="text-gray-700">{order.placer?.name ?? '—'}</span>
        {order.products?.sku && <> · <span className="font-mono">{order.products.sku}</span></>}
      </div>
      <div className="text-[0.7rem] mt-0.5">
        <span className={order.products?.is_durable ? 'text-teal-700' : 'text-amber-700'}>
          {order.products?.is_durable ? 'durable' : 'consumable'}
        </span>
        <span className="text-gray-400"> · placed {new Date(order.placed_at).toLocaleDateString()}</span>
      </div>
      {order.notes && <NoteCallout>{order.notes}</NoteCallout>}
      <button
        type="button"
        onClick={onAction}
        className={`mt-3 w-full justify-center inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          actionStyle === 'primary'
            ? 'bg-gray-900 text-white hover:bg-gray-800'
            : 'bg-white border border-warm-200 text-gray-700 hover:bg-warm-50'
        }`}
      >
        <ActionIcon className="h-3.5 w-3.5 mr-1.5" />
        {actionLabel}
      </button>
      {onCancel && (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-[0.7rem] text-gray-500 hover:text-red-700 hover:underline"
          >
            Cancel order
          </button>
        </div>
      )}
    </div>
  );
}

function ShippedTile({ order, tint }: { order: ProdOrder; tint: string }) {
  return (
    <div className={`rounded-md border border-warm-200 ${tint} p-3`}>
      <div className="font-medium text-gray-900 text-sm leading-tight">
        {order.products?.name ?? 'Unknown product'}{' '}
        <span className="text-gray-500 font-normal">× {order.quantity}</span>
      </div>
      <div className="text-[0.7rem] text-gray-500 mt-1 leading-snug">
        Shipped to <span className="text-gray-700">{order.placer?.name ?? '—'}</span>
      </div>
      <div className="mt-2 text-[0.7rem] text-emerald-700 inline-flex items-center gap-1">
        <PackageCheck className="h-3.5 w-3.5" />
        Awaiting their delivery confirmation
      </div>
    </div>
  );
}

function NoteCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 text-[0.7rem] text-gray-600 italic bg-white/70 border border-warm-200 rounded px-2 py-1 leading-snug">
      "{children}"
    </div>
  );
}

// -----------------------------------------------------------------
// In Production — denser card with serial-number register
// -----------------------------------------------------------------

function InProductionCard({
  order, onShip, onCancel, onChanged,
}: {
  order: ProdOrder; onShip: () => void; onCancel: () => void; onChanged: () => void;
}) {
  const isDurable = !!order.products?.is_durable;
  const fabricated = order.units.length;
  const required = order.quantity;
  const ready = fabricated >= required;

  const [adding, setAdding] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

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
    if (error) setLocalErr(error.message);
    else onChanged();
  };

  return (
    <div className="card overflow-hidden">
      <div className="h-1 bg-indigo-500" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div className="min-w-0">
            <div className="font-medium text-gray-900">
              {order.products?.name ?? 'Unknown product'}{' '}
              <span className="text-gray-500 font-normal">× {required}</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              For <span className="text-gray-700">{order.placer?.name ?? '—'}</span>
              {' · '}
              <span className={isDurable ? 'text-teal-700' : 'text-amber-700'}>
                {isDurable ? 'durable' : 'consumable'}
              </span>
            </div>
          </div>
          <button
            onClick={onShip}
            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDurable && !ready}
          >
            <Truck className="h-3.5 w-3.5 mr-1.5" />
            Ship
          </button>
        </div>

        {isDurable ? (
          <>
            {/* Progress */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${ready ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    style={{ width: `${Math.min(100, (fabricated / required) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  <span className="font-medium text-gray-900">{fabricated}</span> of {required} fabricated
                  {!ready && (
                    <span className="text-gray-400"> · {required - fabricated} more to go</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={addUnit}
                disabled={adding || ready}
                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-warm-200 text-gray-700 hover:bg-warm-50 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {adding ? 'Adding…' : 'Add unit'}
              </button>
            </div>

            {/* Serial register */}
            {order.units.length > 0 ? (
              <div className="border border-warm-200 rounded-md bg-warm-50 max-h-32 overflow-y-auto p-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {order.units.map((u) => (
                    <div key={u.id} className="text-xs font-mono text-gray-700 truncate">
                      · {u.serial_number}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                No units yet. Click <span className="font-medium">Add unit</span> for each one you finish —
                serial numbers auto-generate as{' '}
                <span className="font-mono">{order.products?.sku ?? 'SKU'}-001</span>, …
              </p>
            )}

            {localErr && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 mt-2">
                {localErr}
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-500 italic">
            Consumable order — no per-unit tracking. Click <span className="font-medium">Ship</span>{' '}
            when the quantity is on its way to the placer.
          </p>
        )}

        {order.notes && <NoteCallout>{order.notes}</NoteCallout>}

        <div className="mt-3 text-right">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-red-700 hover:underline"
          >
            Cancel order
          </button>
        </div>
      </div>
    </div>
  );
}
