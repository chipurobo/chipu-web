import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import type { Order, Product, School } from '../../lib/database.types';
import { Send, PlayCircle, Wrench, Truck, Plus, ChevronDown, Inbox, PackageCheck, CheckCircle2 } from 'lucide-react';

interface AssignmentRow extends Order {
  products: Pick<Product, 'id' | 'name' | 'sku' | 'is_durable'> | null;
  placer:   Pick<School,  'id' | 'name'> | null;
}

/**
 * /dashboard/admin/distribute
 *
 * ChipuRobo's own production line for consumable assignments. Mirrors the
 * maker-space Production view — accepted → in_production → shipped — but the
 * fulfiller is ChipuRobo (so fulfilled_by_school_id is NULL). Once shipped,
 * the receiving school marks it delivered and the stock_ledger entry lands
 * automatically (mark_order_delivered RPC).
 *
 * Plus an inline "new assignment" form at the top so admin can commission
 * an assignment without leaving the page.
 */
export function AdminDistribute() {
  const [schools,   setSchools]   = useState<School[] | null>(null);
  const [products,  setProducts]  = useState<Product[] | null>(null);
  const [orders,    setOrders]    = useState<AssignmentRow[] | null>(null);
  const [err,       setErr]       = useState<string | null>(null);
  const [success,   setSuccess]   = useState<string | null>(null);
  const [formOpen,  setFormOpen]  = useState(false);

  const [schoolId,  setSchoolId]  = useState('');
  const [productId, setProductId] = useState('');
  const [quantity,  setQuantity]  = useState<number>(1);
  const [notes,     setNotes]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReferenceData = async () => {
    const [sRes, pRes] = await Promise.all([
      supabase.from('schools').select('*').order('name'),
      supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_durable', false)
        .order('name'),
    ]);
    if (sRes.error) setErr(sRes.error.message);
    else setSchools(sRes.data as School[]);
    if (pRes.error) setErr(pRes.error.message);
    else setProducts(pRes.data as Product[]);
  };

  const loadOrders = async () => {
    // ChipuRobo-fulfilled = NULL fulfiller. Show every stage that's still
    // moving plus a slim look at recently-delivered ones.
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products ( id, name, sku, is_durable ),
        placer:placed_by_school_id ( id, name )
      `)
      .is('fulfilled_by_school_id', null)
      .order('placed_at', { ascending: false })
      .limit(100);
    if (error) setErr(error.message);
    else setOrders(data as unknown as AssignmentRow[]);
  };

  useEffect(() => {
    void loadReferenceData();
    void loadOrders();
  }, []);

  useEffect(() => {
    if (!schoolId  && schools  && schools.length  > 0) setSchoolId(schools[0].id);
    if (!productId && products && products.length > 0) setProductId(products[0].id);
  }, [schools, products, schoolId, productId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!schoolId || !productId || quantity < 1) return;
    setSubmitting(true);
    setErr(null);
    setSuccess(null);
    const { error } = await supabase.rpc('create_consumable_assignment', {
      p_school_id:  schoolId,
      p_product_id: productId,
      p_quantity:   quantity,
      p_notes:      notes.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      setErr(error.message);
    } else {
      const schoolName  = schools?.find((s) => s.id === schoolId)?.name ?? 'school';
      const productName = products?.find((p) => p.id === productId)?.name ?? 'product';
      setSuccess(`Queued ${quantity} × ${productName} for ${schoolName}. It's in the Accepted lane.`);
      setQuantity(1);
      setNotes('');
      setFormOpen(false);
      void loadOrders();
    }
  };

  // Pipeline mutations
  const startProduction = async (id: string) => {
    setErr(null);
    const { error } = await supabase.rpc('advance_consumable_to_production', { p_order_id: id });
    if (error) setErr(error.message);
    else void loadOrders();
  };

  const ship = async (id: string) => {
    setErr(null);
    const { error } = await supabase.rpc('ship_order', { p_order_id: id });
    if (error) setErr(error.message);
    else void loadOrders();
  };

  const markDelivered = async (id: string) => {
    setErr(null);
    const { error } = await supabase.rpc('mark_order_delivered', { p_order_id: id });
    if (error) setErr(error.message);
    else void loadOrders();
  };

  // Buckets
  const accepted     = orders?.filter((o) => o.status === 'accepted')      ?? null;
  const inProduction = orders?.filter((o) => o.status === 'in_production') ?? null;
  const shipped      = orders?.filter((o) => o.status === 'shipped')       ?? null;
  const delivered    = orders?.filter((o) => o.status === 'delivered')     ?? null;

  const stats = [
    { key: 'accepted',      label: 'Ready',        count: accepted?.length ?? 0,     accent: 'bg-amber-500'  },
    { key: 'in_production', label: 'In production', count: inProduction?.length ?? 0, accent: 'bg-teal-500'   },
    { key: 'shipped',       label: 'Shipped',      count: shipped?.length ?? 0,      accent: 'bg-indigo-500' },
    { key: 'delivered',     label: 'Delivered',    count: delivered?.length ?? 0,    accent: 'bg-emerald-500' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Admin</p>
        <h1>Consumable assignments</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          ChipuRobo's own production line. Each assignment goes through the same lifecycle a maker
          space follows. When the school marks it delivered, it lands in their stock.
        </p>
      </div>

      {/* Pipeline stats strip */}
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
      {success && (
        <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          {success}
        </div>
      )}

      {/* New assignment — collapsible */}
      <section>
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="btn-primary w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {formOpen ? 'Cancel new assignment' : 'New consumable assignment'}
          <ChevronDown className={`h-4 w-4 ml-1.5 transition-transform ${formOpen ? 'rotate-180' : ''}`} />
        </button>

        {formOpen && (
          <>
            {schools && products ? (
              schools.length === 0 ? (
                <div className="card p-5 text-sm text-gray-500 mt-3">No schools yet.</div>
              ) : products.length === 0 ? (
                <div className="card p-5 text-sm text-gray-500 mt-3">
                  No consumable products in the catalogue yet.
                </div>
              ) : (
                <form onSubmit={onSubmit} className="card p-5 grid sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="field-label" htmlFor="schoolPick">Recipient school</label>
                    <select
                      id="schoolPick"
                      className="field-select"
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                    >
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}{s.county ? ` · ${s.county}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="prodPick">Consumable product</label>
                    <select
                      id="prodPick"
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
                  </div>

                  <div>
                    <label className="field-label" htmlFor="qty">Quantity</label>
                    <input
                      id="qty"
                      type="number"
                      min={1}
                      required
                      className="field-input max-w-[160px]"
                      value={quantity || ''}
                      onChange={(e) => setQuantity(parseInt(e.target.value || '0', 10))}
                    />
                  </div>

                  <div>
                    <label className="field-label" htmlFor="notes">Notes (optional)</label>
                    <input
                      id="notes"
                      type="text"
                      className="field-input"
                      placeholder="e.g. Q2 termly assignment"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end pt-2 border-t border-warm-200">
                    <button type="submit" className="btn-primary" disabled={submitting}>
                      {submitting ? 'Creating…' : 'Create assignment'}
                    </button>
                  </div>
                </form>
              )
            ) : (
              <div className="card p-5 text-sm text-gray-500 mt-3">Loading…</div>
            )}
          </>
        )}
      </section>

      {/* Kanban board — three active stages side by side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Column
          title="Accepted"
          subtitle="Ready to start"
          icon={PlayCircle}
          accent="amber"
          rows={accepted}
          emptyIcon={Inbox}
          emptyText="Nothing waiting"
          actionLabel="Start production"
          actionIcon={PlayCircle}
          onAction={startProduction}
          actionStyle="primary"
        />
        <Column
          title="In production"
          subtitle="On the bench"
          icon={Wrench}
          accent="teal"
          rows={inProduction}
          emptyIcon={Wrench}
          emptyText="Nothing on the bench"
          actionLabel="Mark shipped"
          actionIcon={Truck}
          onAction={ship}
          actionStyle="primary"
        />
        <Column
          title="Shipped"
          subtitle="Awaiting delivery"
          icon={Truck}
          accent="indigo"
          rows={shipped}
          emptyIcon={Truck}
          emptyText="Nothing in transit"
          actionLabel="Mark delivered"
          actionIcon={PackageCheck}
          onAction={markDelivered}
          actionStyle="secondary"
        />
      </div>

      {/* Recently delivered — slim card list, not a Kanban column */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <h2 className="m-0">Recently delivered</h2>
          <span className="text-xs text-gray-500">{delivered?.length ?? 0}</span>
        </div>

        {!delivered || delivered.length === 0 ? (
          <div className="card p-6 text-center">
            <Send className="h-6 w-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No deliveries yet.</p>
          </div>
        ) : (
          <div className="card divide-y divide-warm-200">
            {delivered.slice(0, 20).map((o) => (
              <div key={o.id} className="px-4 py-3 flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 text-sm">
                    {o.products?.name ?? 'Unknown product'}{' '}
                    <span className="text-gray-500 font-normal">× {o.quantity}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    To {o.placer?.name ?? '—'}
                    {o.products?.sku && <> · <span className="font-mono">{o.products.sku}</span></>}
                  </div>
                </div>
                <span className="text-xs text-emerald-700 inline-flex items-center gap-1 flex-shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {o.delivered_at ? new Date(o.delivered_at).toLocaleDateString() : 'delivered'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// -----------------------------------------------------------------
// Kanban-style column for one pipeline stage.
// -----------------------------------------------------------------

const ACCENTS = {
  amber:  { bar: 'bg-amber-500',   tint: 'bg-amber-50',   pill: 'bg-amber-100 text-amber-800'   },
  teal:   { bar: 'bg-teal-500',    tint: 'bg-teal-50',    pill: 'bg-teal-100 text-teal-800'     },
  indigo: { bar: 'bg-indigo-500',  tint: 'bg-indigo-50',  pill: 'bg-indigo-100 text-indigo-800' },
} as const;

type Accent = keyof typeof ACCENTS;

function Column({
  title, subtitle, icon: Icon, accent, rows,
  emptyIcon: EmptyIcon, emptyText,
  actionLabel, actionIcon: ActionIcon, onAction, actionStyle,
}: {
  title: string;
  subtitle: string;
  icon: typeof PlayCircle;
  accent: Accent;
  rows: AssignmentRow[] | null;
  emptyIcon: typeof PlayCircle;
  emptyText: string;
  actionLabel: string;
  actionIcon: typeof PlayCircle;
  onAction: (id: string) => void;
  actionStyle: 'primary' | 'secondary';
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
        {!rows && (
          <p className="text-xs text-gray-400 italic px-2 py-3">Loading…</p>
        )}
        {rows && rows.length === 0 && (
          <div className="text-center py-8 px-3">
            <EmptyIcon className="h-7 w-7 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">{emptyText}</p>
          </div>
        )}
        {rows?.map((o) => (
          <AssignmentTile
            key={o.id}
            o={o}
            tint={a.tint}
            actionLabel={actionLabel}
            actionIcon={ActionIcon}
            onAction={() => onAction(o.id)}
            actionStyle={actionStyle}
          />
        ))}
      </div>
    </section>
  );
}

function AssignmentTile({
  o, tint, actionLabel, actionIcon: ActionIcon, onAction, actionStyle,
}: {
  o: AssignmentRow;
  tint: string;
  actionLabel: string;
  actionIcon: typeof PlayCircle;
  onAction: () => void;
  actionStyle: 'primary' | 'secondary';
}) {
  return (
    <div className={`rounded-md border border-warm-200 ${tint} p-3`}>
      <div className="font-medium text-gray-900 text-sm leading-tight">
        {o.products?.name ?? 'Unknown product'}{' '}
        <span className="text-gray-500 font-normal">× {o.quantity}</span>
      </div>
      <div className="text-[0.7rem] text-gray-500 mt-1 leading-snug">
        For <span className="text-gray-700">{o.placer?.name ?? '—'}</span>
        {o.products?.sku && <> · <span className="font-mono">{o.products.sku}</span></>}
      </div>
      <div className="text-[0.7rem] text-gray-400 mt-0.5">
        placed {new Date(o.placed_at).toLocaleDateString()}
      </div>
      {o.notes && (
        <Note>{o.notes}</Note>
      )}
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
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 text-[0.7rem] text-gray-600 italic bg-white/70 border border-warm-200 rounded px-2 py-1 leading-snug">
      "{children}"
    </div>
  );
}
