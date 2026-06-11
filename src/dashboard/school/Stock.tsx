import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { Product, ProductUnit, ClubMember, UnitStatus } from '../../lib/database.types';
import { Package, Wrench, UserPlus, X } from 'lucide-react';
import { Pagination, usePaged } from '../components/Pagination';
import { SkeletonRows } from '../components/Skeletons';

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
  const schoolId = school?.id ?? null;

  // Active students for the assignment picker — keyed for cross-page reuse.
  const studentsQuery = useQuery({
    queryKey: ['members', schoolId],
    queryFn: async (): Promise<ClubMember[]> => {
      const { data, error } = await supabase
        .from('club_members')
        .select('*')
        .eq('school_id', schoolId!)
        .order('full_name');
      if (error) throw new Error(error.message);
      return data as ClubMember[];
    },
    enabled: !!schoolId,
  });
  const students = studentsQuery.data?.filter((s) => s.is_active) ?? null;

  const unitsQuery = useQuery({
    queryKey: ['units', schoolId],
    queryFn: async (): Promise<UnitRow[]> => {
      const { data, error } = await supabase
        .from('product_units')
        .select(`
          *,
          products ( id, name, sku ),
          member:current_member_id ( id, full_name, in_club )
        `)
        .eq('current_school_id', schoolId!)
        .order('fabricated_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data as unknown as UnitRow[];
    },
    enabled: !!schoolId,
  });
  const units = unitsQuery.data ?? null;

  const stockQuery = useQuery({
    queryKey: ['stock', schoolId],
    queryFn: async (): Promise<StockRow[]> => {
      const { data: sData, error: sErr } = await supabase
        .from('stock_on_hand')
        .select('school_id, product_id, on_hand')
        .eq('school_id', schoolId!);
      if (sErr) throw new Error(sErr.message);
      if (!sData || sData.length === 0) return [];
      const ids = sData.map((r) => r.product_id);
      const { data: pData, error: pErr } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);
      if (pErr) throw new Error(pErr.message);
      const productById = new Map<string, Product>(
        (pData as Product[] | null ?? []).map((p) => [p.id, p]),
      );
      return sData
        .map((row) => ({
          product: productById.get(row.product_id),
          on_hand: row.on_hand,
        }))
        .filter((r): r is StockRow => !!r.product);
    },
    enabled: !!schoolId,
  });
  const stock = stockQuery.data ?? null;

  const { paged: pagedUnits, page: unitsPage, setPage: setUnitsPage, totalPages: unitsTotalPages } = usePaged(units, 25);

  const err =
    studentsQuery.error?.message
    ?? unitsQuery.error?.message
    ?? stockQuery.error?.message
    ?? null;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-10">
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
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {/* Durable units */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="h-4 w-4 text-teal-700" aria-hidden="true" />
          <h2 className="m-0">Durable units</h2>
          <span className="text-xs text-gray-500">{units?.length ?? 0}</span>
        </div>
        <div className="card overflow-x-auto">
          <table className="data-table" aria-label="Durable units">
            <thead>
              <tr>
                <th scope="col">Serial</th>
                <th scope="col">Product</th>
                <th scope="col">Status</th>
                <th scope="col">Held by</th>
                <th scope="col">Received</th>
              </tr>
            </thead>
            <tbody>
              {!units && (
                <SkeletonRows rows={5} cols={5} label="Loading durable units" />
              )}
              {units && units.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-8">
                    No durable units yet. They'll show up here once a maker space ships an
                    order to your school.
                  </td>
                </tr>
              )}
              {pagedUnits?.map((u) => (
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
          <Pagination page={unitsPage} totalPages={unitsTotalPages} onChange={setUnitsPage} label="Durable units pagination" />
        </div>
      </section>

      {/* Consumable stock */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-4 w-4 text-teal-700" aria-hidden="true" />
          <h2 className="m-0">Consumable stock</h2>
          <span className="text-xs text-gray-500">
            {stock?.filter((s) => s.on_hand > 0).length ?? 0} products on hand
          </span>
        </div>
        <div className="card overflow-x-auto">
          <table className="data-table" aria-label="Consumable stock">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">SKU</th>
                <th scope="col">Category</th>
                <th scope="col" className="text-right">On hand</th>
              </tr>
            </thead>
            <tbody>
              {!stock && (
                <tr><td role="status" colSpan={4} className="text-center text-gray-500 py-8">Loading…</td></tr>
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
  unit, students, schoolId,
}: {
  unit: UnitRow;
  students: ClubMember[] | null;
  schoolId: string;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(unit.current_member_id ?? '');

  // Add-new-student form (collapsed by default)
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newInClub, setNewInClub] = useState(false);

  const assignMutation = useMutation({
    mutationFn: async (memberId: string | null) => {
      const patch: Record<string, unknown> = {
        current_member_id: memberId,
        status: memberId ? 'with_user' : 'with_school',
        assigned_at: memberId ? new Date().toISOString() : null,
      };
      const { error } = await supabase
        .from('product_units')
        .update(patch)
        .eq('id', unit.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { setOpen(false); },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['units', schoolId] });
      void qc.invalidateQueries({ queryKey: ['members', schoolId] });
    },
  });

  const addStudentMutation = useMutation({
    mutationFn: async (input: { name: string; grade: string; inClub: boolean }): Promise<string> => {
      const { data, error } = await supabase
        .from('club_members')
        .insert({
          school_id: schoolId,
          full_name: input.name.trim(),
          grade: input.grade.trim() || null,
          in_club: input.inClub,
        })
        .select('id')
        .single();
      if (error) throw new Error(error.message);
      return data!.id as string;
    },
    onSuccess: (newId) => {
      setSelected(newId);
      setNewName('');
      setNewGrade('');
      setAddOpen(false);
      void qc.invalidateQueries({ queryKey: ['members', schoolId] });
      // Auto-assign the new student.
      assignMutation.mutate(newId);
    },
  });

  const saving = assignMutation.isPending;
  const adding = addStudentMutation.isPending;
  const localErr =
    assignMutation.error?.message
    ?? addStudentMutation.error?.message
    ?? null;

  const assign = (memberId: string | null) => assignMutation.mutate(memberId);

  const addStudent = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addStudentMutation.mutate({ name: newName, grade: newGrade, inClub: newInClub });
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
          aria-label={`Assign ${unit.products?.name ?? 'unit'} ${unit.serial_number} to a student`}
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
          onClick={() => { setOpen(false); assignMutation.reset(); }}
          className="p-1 text-gray-500 hover:text-gray-900"
          title="Cancel"
          aria-label="Cancel assignment"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {!addOpen ? (
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="text-xs text-teal-700 hover:underline inline-flex items-center"
        >
          <UserPlus className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          Add a new student
        </button>
      ) : (
        <form onSubmit={addStudent} aria-label="Add a new student" className="border border-warm-200 rounded-md p-2 space-y-2 bg-warm-50">
          <div className="flex gap-2">
            <input
              type="text"
              required
              aria-required="true"
              aria-label="Full name"
              placeholder="Full name"
              className="field-input flex-1 !py-1 !text-xs"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              type="text"
              aria-label="Grade"
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
        <div role="alert" className="text-[0.7rem] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
          {localErr}
        </div>
      )}
    </div>
  );
}
