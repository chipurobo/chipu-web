import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Product, ProductUnit, ClubMember, UnitStatus } from '../../lib/database.types';
import { Package, Wrench, UserPlus, X } from 'lucide-react';

// product_units joined with product + assigned member
interface UnitRow extends ProductUnit {
  products: Pick<Product, 'id' | 'name' | 'sku'> | null;
  member: Pick<ClubMember, 'id' | 'full_name' | 'in_club'> | null;
}

interface StockRow {
  product: Product;
  on_hand: number;
}

const UNIT_STATUS_STYLES: Record<UnitStatus, string> = {
  with_maker:  'badge-amber',
  in_transit:  'badge-teal',
  with_school: 'badge-teal',
  with_user:   'badge-green',
  returned:    'badge-gray',
  retired:     'badge-gray',
};

/**
 * /dashboard/school/stock
 *
 * Two stacked sections:
 *   • Durable units we currently hold — from product_units where
 *     current_school_id = us. Each row supports assigning the unit to ANY
 *     student at the school (the picker pulls from club_members regardless
 *     of in_club; new students can be added inline).
 *   • Consumable stock on hand — from stock_on_hand view (sum of stock_ledger).
 */
export function SchoolStock() {
  const { school } = useAuth();
  const [units, setUnits] = useState<UnitRow[] | null>(null);
  const [stock, setStock] = useState<StockRow[] | null>(null);
  const [students, setStudents] = useState<ClubMember[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loadStudents = async () => {
    if (!school) return;
    const { data, error } = await supabase
      .from('club_members')
      .select('*')
      .eq('school_id', school.id)
      .eq('is_active', true)
      .order('full_name');
    if (error) setErr(error.message);
    else setStudents(data as ClubMember[]);
  };

  const loadUnits = async () => {
    if (!school) return;
    const { data, error } = await supabase
      .from('product_units')
      .select(`
        *,
        products ( id, name, sku ),
        member:current_member_id ( id, full_name, in_club )
      `)
      .eq('current_school_id', school.id)
      .order('fabricated_at', { ascending: false });
    if (error) setErr(error.message);
    else setUnits(data as unknown as UnitRow[]);
  };

  const loadStock = async () => {
    if (!school) return;
    const { data: sData, error: sErr } = await supabase
      .from('stock_on_hand')
      .select('school_id, product_id, on_hand')
      .eq('school_id', school.id);
    if (sErr) {
      setErr(sErr.message);
      return;
    }
    if (sData && sData.length > 0) {
      const ids = sData.map((r: { product_id: string }) => r.product_id);
      const { data: pData } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);
      const productById = new Map<string, Product>(
        (pData as Product[] | null ?? []).map((p) => [p.id, p]),
      );
      setStock(
        sData
          .map((row: { product_id: string; on_hand: number }) => ({
            product: productById.get(row.product_id),
            on_hand: row.on_hand,
          }))
          .filter((r: { product: Product | undefined }): r is StockRow => !!r.product),
      );
    } else {
      setStock([]);
    }
  };

  useEffect(() => {
    void loadUnits();
    void loadStock();
    void loadStudents();
  }, [school?.id]);

  return (
    <div className="px-6 sm:px-10 py-8 space-y-10">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
          {school?.name ?? 'Your school'}
        </p>
        <h1>Stock & units</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Durables (robots, kits) arrive via orders you placed with a maker space and are tracked
          per serial number. Consumables (filament, lesson packs) are distributed to your school
          by ChipuRobo and tracked by quantity on hand.
        </p>
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {/* Durable units */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="h-4 w-4 text-teal-700" />
          <h2 className="m-0">Durable units</h2>
          <span className="text-xs text-gray-500">{units?.length ?? 0}</span>
        </div>
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Serial</th>
                <th>Product</th>
                <th>Status</th>
                <th>Held by</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {!units && (
                <tr><td colSpan={5} className="text-center text-gray-500 py-8">Loading…</td></tr>
              )}
              {units && units.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-8">
                    No durable units yet. They'll show up here once a maker space ships an
                    order to your school.
                  </td>
                </tr>
              )}
              {units?.map((u) => (
                <tr key={u.id}>
                  <td className="font-mono text-xs">{u.serial_number}</td>
                  <td>
                    <div className="font-medium text-gray-900">{u.products?.name ?? '—'}</div>
                    {u.products?.sku && (
                      <div className="text-xs text-gray-500">{u.products.sku}</div>
                    )}
                  </td>
                  <td>
                    <span className={UNIT_STATUS_STYLES[u.status]}>
                      {u.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="text-sm min-w-[260px]">
                    {school && (
                      <HeldByCell
                        unit={u}
                        students={students}
                        schoolId={school.id}
                        onChanged={() => { void loadUnits(); void loadStudents(); }}
                      />
                    )}
                  </td>
                  <td className="text-xs text-gray-500">
                    {u.assigned_at
                      ? new Date(u.assigned_at).toLocaleDateString()
                      : new Date(u.fabricated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Consumable stock */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-4 w-4 text-teal-700" />
          <h2 className="m-0">Consumable stock</h2>
          <span className="text-xs text-gray-500">
            {stock?.filter((s) => s.on_hand > 0).length ?? 0} products on hand
          </span>
        </div>
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th className="text-right">On hand</th>
              </tr>
            </thead>
            <tbody>
              {!stock && (
                <tr><td colSpan={4} className="text-center text-gray-500 py-8">Loading…</td></tr>
              )}
              {stock && stock.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-8">
                    No consumables tracked yet.
                  </td>
                </tr>
              )}
              {stock?.map((s) => (
                <tr key={s.product.id}>
                  <td className="font-medium text-gray-900">{s.product.name}</td>
                  <td className="text-xs text-gray-500 font-mono">{s.product.sku ?? '—'}</td>
                  <td className="text-sm text-gray-700">{s.product.category ?? '—'}</td>
                  <td className="text-right font-medium text-gray-900">{s.on_hand}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/**
 * "Held by" cell — shows the current holder + an inline picker. The picker
 * pulls EVERY active student at the school (in_club true or false); if the
 * student isn't there yet, the cell lets you add them on the spot.
 */
function HeldByCell({
  unit, students, schoolId, onChanged,
}: {
  unit: UnitRow;
  students: ClubMember[] | null;
  schoolId: string;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(unit.current_member_id ?? '');
  const [saving, setSaving] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  // Add-new-student form (collapsed by default)
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newInClub, setNewInClub] = useState(false);
  const [adding, setAdding] = useState(false);

  const assign = async (memberId: string | null) => {
    setSaving(true);
    setLocalErr(null);
    const patch: Record<string, unknown> = {
      current_member_id: memberId,
      status: memberId ? 'with_user' : 'with_school',
      assigned_at: memberId ? new Date().toISOString() : null,
    };
    const { error } = await supabase
      .from('product_units')
      .update(patch)
      .eq('id', unit.id);
    setSaving(false);
    if (error) {
      setLocalErr(error.message);
    } else {
      setOpen(false);
      onChanged();
    }
  };

  const addStudent = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setLocalErr(null);
    const { data, error } = await supabase
      .from('club_members')
      .insert({
        school_id: schoolId,
        full_name: newName.trim(),
        grade: newGrade.trim() || null,
        in_club: newInClub,
      })
      .select('id')
      .single();
    setAdding(false);
    if (error) {
      setLocalErr(error.message);
    } else if (data) {
      // Auto-select the newly-added student and assign in one go.
      setSelected(data.id);
      setNewName('');
      setNewGrade('');
      setAddOpen(false);
      void assign(data.id);
    }
  };

  // Read-only view
  if (!open) {
    return (
      <div className="flex items-center gap-2">
        {unit.member ? (
          <>
            <span className="text-gray-900">{unit.member.full_name}</span>
            {unit.member.in_club === false && (
              <span className="text-[0.625rem] text-gray-500 italic">non-club</span>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-400 italic">unassigned</span>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs text-teal-700 hover:underline ml-auto"
        >
          {unit.member ? 'Change' : 'Assign'}
        </button>
      </div>
    );
  }

  // Editor view
  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-stretch">
        <select
          className="field-select flex-1"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">— unassigned —</option>
          {students?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}{s.grade ? ` · ${s.grade}` : ''}{!s.in_club ? ' (non-club)' : ''}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => assign(selected || null)}
          className="btn-primary !py-1 !px-3 !text-xs"
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setLocalErr(null); }}
          className="p-1 text-gray-500 hover:text-gray-900"
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {!addOpen ? (
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="text-xs text-teal-700 hover:underline inline-flex items-center"
        >
          <UserPlus className="h-3.5 w-3.5 mr-1" />
          Add a new student
        </button>
      ) : (
        <form onSubmit={addStudent} className="border border-warm-200 rounded-md p-2 space-y-2 bg-warm-50">
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Full name"
              className="field-input flex-1 !py-1 !text-xs"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Grade"
              className="field-input w-20 !py-1 !text-xs"
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={newInClub}
              onChange={(e) => setNewInClub(e.target.checked)}
            />
            Also add to the code club roster
          </label>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setAddOpen(false); setNewName(''); setNewGrade(''); }}
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary !py-1 !px-2 !text-xs"
              disabled={adding || !newName.trim()}
            >
              Add &amp; assign
            </button>
          </div>
        </form>
      )}

      {localErr && (
        <div className="text-[0.7rem] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
          {localErr}
        </div>
      )}
    </div>
  );
}
