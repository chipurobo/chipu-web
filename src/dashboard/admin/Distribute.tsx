import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import type { Order, Product, School } from '../../lib/database.types';
import { Send, PlayCircle, Wrench, Truck, Plus, ChevronDown } from 'lucide-react';

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

  return (
    <div className="px-6 sm:px-10 py-8 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Admin</p>
        <h1>Consumable assignments</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          ChipuRobo's own production line. Assigning a consumable creates an order with the same
          accepted → in production → shipped → delivered lifecycle a maker space goes through.
          Once the school marks it delivered, it lands in their stock.
        </p>
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
          className="btn-primary"
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

      {/* Pipeline stages */}
      <Section icon={PlayCircle} title="Accepted — ready to start" count={accepted?.length ?? 0}>
        {!accepted || accepted.length === 0
          ? <Empty>Nothing waiting.</Empty>
          : accepted.map((o) => (
              <AssignmentCard key={o.id} o={o}>
                <button onClick={() => startProduction(o.id)} className="btn-primary">
                  Start production
                </button>
              </AssignmentCard>
            ))}
      </Section>

      <Section icon={Wrench} title="In production" count={inProduction?.length ?? 0}>
        {!inProduction || inProduction.length === 0
          ? <Empty>Nothing on the bench.</Empty>
          : inProduction.map((o) => (
              <AssignmentCard key={o.id} o={o}>
                <button onClick={() => ship(o.id)} className="btn-primary">
                  <Truck className="h-4 w-4 mr-1.5" />
                  Ship
                </button>
              </AssignmentCard>
            ))}
      </Section>

      <Section icon={Truck} title="Shipped — awaiting delivery" count={shipped?.length ?? 0}>
        {!shipped || shipped.length === 0
          ? <Empty>Nothing in transit.</Empty>
          : shipped.map((o) => (
              <AssignmentCard key={o.id} o={o}>
                <button onClick={() => markDelivered(o.id)} className="btn-secondary">
                  Mark delivered
                </button>
              </AssignmentCard>
            ))}
      </Section>

      <Section icon={Send} title="Recently delivered" count={delivered?.length ?? 0}>
        {!delivered || delivered.length === 0
          ? <Empty>No deliveries yet.</Empty>
          : delivered.slice(0, 20).map((o) => (
              <AssignmentCard key={o.id} o={o}>
                <span className="text-xs text-gray-500">
                  Delivered {o.delivered_at ? new Date(o.delivered_at).toLocaleDateString() : ''}
                </span>
              </AssignmentCard>
            ))}
      </Section>
    </div>
  );
}

function Section({
  icon: Icon, title, count, children,
}: {
  icon: typeof PlayCircle; title: string; count: number; children: React.ReactNode;
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

function AssignmentCard({ o, children }: { o: AssignmentRow; children?: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="font-medium text-gray-900">
            {o.products?.name ?? 'Unknown product'} × {o.quantity}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            For {o.placer?.name ?? '—'}
            {o.products?.sku && <> · {o.products.sku}</>}
            {' · placed '}
            {new Date(o.placed_at).toLocaleDateString()}
          </div>
          {o.notes && <div className="text-xs text-gray-600 mt-1.5 italic">"{o.notes}"</div>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">{children}</div>
      </div>
    </div>
  );
}
