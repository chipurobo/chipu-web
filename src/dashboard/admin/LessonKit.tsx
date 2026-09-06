import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchLessonProducts, attachLessonProduct, detachLessonProduct, fetchProducts,
} from '../../lib/gql/queries';
import { useNotifications } from '../../lib/notifications';
import { useDialog } from '../../lib/useDialog';
import { ProductThumb } from '../components/ProductThumb';
import { X, Plus, Trash2, Package } from 'lucide-react';

// =============================================================
// What a lesson needs printed or supplied.
//
// Attaching kit to a lesson was the missing half: lesson_products and the
// teacher-facing list both existed, but only SQL could populate the table, so
// "What you need for this lesson" was hidden on every lesson in the system.
//
// Admin-only, enforced by RLS on lesson_products rather than by this component
// being hard to reach.
// =============================================================

export function LessonKitPanel({
  lessonId, lessonTitle, onClose,
}: { lessonId: string; lessonTitle: string; onClose: () => void }) {
  const qc = useQueryClient();
  const { notify } = useNotifications();
  const dialogRef = useDialog<HTMLDivElement>({ open: true, onClose, trapFocus: false });

  const [productId, setProductId] = useState('');
  const [note, setNote] = useState('');

  const attached = useQuery({
    queryKey: ['lesson-products', lessonId],
    queryFn: () => fetchLessonProducts(lessonId),
  });

  const catalogue = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['lesson-products', lessonId] });
    void qc.invalidateQueries({ queryKey: ['lesson-product-counts'] });
  };

  const add = useMutation({
    mutationFn: () => attachLessonProduct(lessonId, productId, note.trim() || null),
    onSuccess: () => {
      setProductId(''); setNote('');
      refresh();
      notify('success', 'Added to this lesson');
    },
    onError: (e: Error) => notify('warning', 'Could not add it', e.message),
  });

  const remove = useMutation({
    mutationFn: (pid: string) => detachLessonProduct(lessonId, pid),
    onSuccess: () => { refresh(); notify('success', 'Removed from this lesson'); },
    onError: (e: Error) => notify('warning', 'Could not remove it', e.message),
  });

  const rows = attached.data ?? [];
  // Only offer what is not already attached, and only what is still active.
  const alreadyOn = new Set(rows.map((r) => r.product_id));
  const options = (catalogue.data ?? []).filter((p) => p.is_active && !alreadyOn.has(p.id));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (productId) add.mutate();
  };

  return (
    <div ref={dialogRef} role="region" aria-labelledby="lesson-kit-heading" className="card p-5">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h2 className="m-0 flex items-center gap-2" id="lesson-kit-heading">
            <Package className="h-4 w-4 text-teal-700" aria-hidden="true" />
            What this lesson needs
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{lessonTitle}</p>
        </div>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900" aria-label="Close">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end mb-4">
        <div>
          <label className="field-label" htmlFor="kit-product">Product</label>
          <select
            id="kit-product" className="field-input"
            value={productId} onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Choose a product…</option>
            {options.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {options.length === 0 && !catalogue.isPending && (
            <p className="field-help">Everything active is already attached.</p>
          )}
        </div>
        <div>
          <label className="field-label" htmlFor="kit-note">Note (optional)</label>
          <input
            id="kit-note" className="field-input" placeholder="e.g. one per pair"
            value={note} onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={!productId || add.isPending}>
          <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
          Add
        </button>
      </form>

      {attached.isPending ? (
        <p role="status" className="text-sm text-gray-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          Nothing attached yet. Until something is, this lesson shows no kit to teachers.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 list-none p-0 m-0">
          {rows.map((r) => (
            <li key={r.product_id} className="flex items-start gap-3 border border-warm-200 rounded-md p-3">
              <ProductThumb path={r.product?.image_path} name={r.product?.name} size={44} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900">{r.product?.name ?? 'Unknown item'}</div>
                {r.note && <div className="text-xs text-gray-600">{r.note}</div>}
                {r.product?.source_credit && (
                  <div className="text-[0.7rem] text-gray-400">design: {r.product.source_credit}</div>
                )}
              </div>
              <button
                type="button"
                className="text-xs text-red-700 hover:underline inline-flex items-center flex-shrink-0"
                disabled={remove.isPending}
                onClick={() => remove.mutate(r.product_id)}
                aria-label={`Remove ${r.product?.name ?? 'item'} from this lesson`}
              >
                <Trash2 className="h-3 w-3 mr-1" aria-hidden="true" />
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
