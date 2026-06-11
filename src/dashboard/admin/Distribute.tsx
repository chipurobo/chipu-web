import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Order, Product, School } from '../../lib/database.types';
import { Send, PlayCircle, Wrench, Truck, Plus, ChevronDown, Inbox, PackageCheck, CheckCircle2 } from 'lucide-react';
import { notifyConsumableAssignment } from '../../lib/orderEmails';
import { useDialog } from '../../lib/useDialog';
import { Pagination, usePaged } from '../components/Pagination';
import { SkeletonCards } from '../components/Skeletons';

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
  const qc = useQueryClient();

  const [success,   setSuccess]   = useState<string | null>(null);
  const [formOpen,  setFormOpen]  = useState(false);

  const [schoolId,  setSchoolId]  = useState('');
  const [productId, setProductId] = useState('');
  const [quantity,  setQuantity]  = useState<number>(1);
  const [notes,     setNotes]     = useState('');

  const assignFormRef = useDialog<HTMLFormElement>({
    open: formOpen,
    onClose: () => setFormOpen(false),
    trapFocus: false,
  });

  const { data: schools, error: schoolsErr } = useQuery({
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
    // Pick the same key as Products.tsx so the cache is shared. We filter
    // client-side to active+consumable below.
  });

  // ChipuRobo-fulfilled = NULL fulfiller. Show every stage that's still
  // moving plus a slim look at recently-delivered ones.
  const { data: orders, error: ordersErr } = useQuery({
    queryKey: ['orders', 'admin'],
    queryFn: async (): Promise<AssignmentRow[]> => {
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
      if (error) throw new Error(error.message);
      return data as unknown as AssignmentRow[];
    },
  });

  // The picker only offers active consumables.
  const consumableProducts = products?.filter((p) => p.is_active && !p.is_durable) ?? null;

  useEffect(() => {
    if (!schoolId  && schools  && schools.length  > 0) setSchoolId(schools[0].id);
    if (!productId && consumableProducts && consumableProducts.length > 0) setProductId(consumableProducts[0].id);
  }, [schools, consumableProducts, schoolId, productId]);

  const createAssignment = useMutation({
    mutationFn: async (input: { schoolId: string; productId: string; quantity: number; notes: string }) => {
      const { error } = await supabase.rpc('create_consumable_assignment', {
        p_school_id:  input.schoolId,
        p_product_id: input.productId,
        p_quantity:   input.quantity,
        p_notes:      input.notes.trim() || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_data, vars) => {
      const recipient = schools?.find((s) => s.id === vars.schoolId);
      const product   = products?.find((p) => p.id === vars.productId);
      const schoolName  = recipient?.name ?? 'school';
      const productName = product?.name ?? 'product';
      setSuccess(`Queued ${vars.quantity} × ${productName} for ${schoolName}. It's in the Accepted lane.`);

      // Notify the recipient school. Fire-and-forget — the UI doesn't wait.
      if (recipient && product) {
        void notifyConsumableAssignment({
          productName: product.name,
          productSku:  product.sku ?? null,
          quantity:    vars.quantity,
          schoolName:  recipient.name,
          schoolEmail: recipient.contact_email,
          notes:       vars.notes.trim() || null,
        });
      }

      setQuantity(1);
      setNotes('');
      setFormOpen(false);
    },
    onSettled: (_d, _e, vars) => {
      void qc.invalidateQueries({ queryKey: ['orders', 'admin'] });
      if (vars?.schoolId) {
        void qc.invalidateQueries({ queryKey: ['orders', 'school', vars.schoolId] });
        void qc.invalidateQueries({ queryKey: ['stock', vars.schoolId] });
      }
    },
  });

  const startProductionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('advance_consumable_to_production', { p_order_id: id });
      if (error) throw new Error(error.message);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['orders', 'admin'] });
    },
  });

  const shipMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('ship_order', { p_order_id: id });
      if (error) throw new Error(error.message);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['orders', 'admin'] });
    },
  });

  const markDeliveredMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('mark_order_delivered', { p_order_id: id });
      if (error) throw new Error(error.message);
    },
    onSettled: (_d, _e, id) => {
      void qc.invalidateQueries({ queryKey: ['orders', 'admin'] });
      // Find the placer to invalidate their stock + orders cache.
      const placerId = orders?.find((o) => o.id === id)?.placer?.id;
      if (placerId) {
        void qc.invalidateQueries({ queryKey: ['orders', 'school', placerId] });
        void qc.invalidateQueries({ queryKey: ['stock', placerId] });
      }
    },
  });

  const err =
    schoolsErr?.message
    ?? productsErr?.message
    ?? ordersErr?.message
    ?? createAssignment.error?.message
    ?? startProductionMutation.error?.message
    ?? shipMutation.error?.message
    ?? markDeliveredMutation.error?.message
    ?? null;

  const submitting = createAssignment.isPending;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!schoolId || !productId || quantity < 1) return;
    setSuccess(null);
    createAssignment.mutate({ schoolId, productId, quantity, notes });
  };

  const startProduction = (id: string) => startProductionMutation.mutate(id);
  const ship            = (id: string) => shipMutation.mutate(id);
  const markDelivered   = (id: string) => markDeliveredMutation.mutate(id);

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
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}
      {success && (
        <div role="status" className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
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
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {formOpen ? 'Cancel new assignment' : 'New consumable assignment'}
          <ChevronDown className={`h-4 w-4 ml-1.5 transition-transform ${formOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        {formOpen && (
          <>
            {schools && consumableProducts ? (
              schools.length === 0 ? (
                <div className="card p-5 text-sm text-gray-500 mt-3">No schools yet.</div>
              ) : consumableProducts.length === 0 ? (
                <div className="card p-5 text-sm text-gray-500 mt-3">
                  No consumable products in the catalogue yet.
                </div>
              ) : (
                <form
                  ref={assignFormRef}
                  role="region"
                  aria-labelledby="assign-more-heading"
                  onSubmit={onSubmit}
                  className="card p-5 grid sm:grid-cols-2 gap-4 mt-3"
                >
                  <h2 id="assign-more-heading" className="sr-only">New consumable assignment</h2>
                  <div>
                    <label className="field-label" htmlFor="assign-school">Recipient school</label>
                    <select
                      id="assign-school"
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
                    <label className="field-label" htmlFor="assign-product">Consumable product</label>
                    <select
                      id="assign-product"
                      className="field-select"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                    >
                      {consumableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}{p.sku ? ` · ${p.sku}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="assign-qty">Quantity<span aria-hidden="true" className="text-red-600 ml-0.5">*</span></label>
                    <input
                      id="assign-qty"
                      type="number"
                      min={1}
                      required
                      aria-required="true"
                      className="field-input max-w-[160px]"
                      value={quantity || ''}
                      onChange={(e) => setQuantity(parseInt(e.target.value || '0', 10))}
                    />
                  </div>

                  <div>
                    <label className="field-label" htmlFor="assign-notes">Notes (optional)</label>
                    <input
                      id="assign-notes"
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
              <div role="status" className="card p-5 text-sm text-gray-500 mt-3">Loading…</div>
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
          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          <h2 className="m-0">Recently delivered</h2>
          <span className="text-xs text-gray-500">{delivered?.length ?? 0}</span>
        </div>

        {!delivered || delivered.length === 0 ? (
          <div className="card p-6 text-center">
            <Send className="h-6 w-6 text-gray-400 mx-auto mb-2" aria-hidden="true" />
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
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
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
  const { paged, page, setPage, totalPages } = usePaged(rows, 10);
  return (
    <section className="card overflow-hidden flex flex-col">
      <div className={`h-1 ${a.bar}`} />
      <header className="px-4 py-3 border-b border-warm-200 flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-700" aria-hidden="true" />
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
          <SkeletonCards count={3} label={`Loading ${title.toLowerCase()}`} />
        )}
        {rows && rows.length === 0 && (
          <div className="text-center py-8 px-3">
            <EmptyIcon className="h-7 w-7 text-gray-300 mx-auto mb-2" aria-hidden="true" />
            <p className="text-xs text-gray-500">{emptyText}</p>
          </div>
        )}
        {paged?.map((o) => (
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
        <Pagination page={page} totalPages={totalPages} onChange={setPage} label={`${title} pagination`} />
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
        <ActionIcon className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
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
