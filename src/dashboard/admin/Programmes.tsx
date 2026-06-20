import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Programme, School } from '../../lib/database.types';
import {
  Plus, X, Pencil, Trash2, Layers, School as SchoolIcon, ChevronRight,
} from 'lucide-react';
import { useDialog } from '../../lib/useDialog';
import { SkeletonCards } from '../components/Skeletons';

// =============================================================
// /dashboard/admin/programmes
//
// Admin programme catalogue. Each programme is a pipeline a school can
// be enrolled in (school.programme_id). The page lists every programme
// and, under each, the schools currently enrolled — clickable through
// to the school detail page.
//
// The internal curriculum (activities — outreach, bootcamps, lessons,
// project) is seeded once via SQL and surfaced on the school-side
// Lessons page. It is intentionally not editable from this view.
// =============================================================

export function AdminProgrammes() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editing,  setEditing]  = useState<Programme | null>(null);

  // === All programmes ===
  const programmesQuery = useQuery({
    queryKey: ['programmes'],
    queryFn: async (): Promise<Programme[]> => {
      const { data, error } = await supabase
        .from('programmes')
        .select('*')
        .order('created_at');
      if (error) throw new Error(error.message);
      return data as Programme[];
    },
  });

  // === All schools — bucketed client-side by programme_id ===
  // Shared cache key with AdminSchools so we re-use the same fetch.
  const schoolsQuery = useQuery({
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

  const schoolsByProgramme = useMemo(() => {
    const map = new Map<string, School[]>();
    const unassigned: School[] = [];
    (schoolsQuery.data ?? []).forEach((s) => {
      if (!s.programme_id) {
        unassigned.push(s);
        return;
      }
      const bucket = map.get(s.programme_id) ?? [];
      bucket.push(s);
      map.set(s.programme_id, bucket);
    });
    return { map, unassigned };
  }, [schoolsQuery.data]);

  // === Delete programme mutation ===
  const deleteProgrammeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('programmes').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['programmes'] });
      void qc.invalidateQueries({ queryKey: ['schools'] });
    },
  });

  const onDeleteProgramme = (p: Programme) => {
    const enrolled = schoolsByProgramme.map.get(p.id)?.length ?? 0;
    const warning = enrolled > 0
      ? `Delete the "${p.name}" programme? ${enrolled} school(s) are enrolled — their programme link will be cleared.`
      : `Delete the "${p.name}" programme?`;
    if (!window.confirm(warning)) return;
    deleteProgrammeMutation.mutate(p.id);
  };

  const err =
    programmesQuery.error?.message
    ?? schoolsQuery.error?.message
    ?? deleteProgrammeMutation.error?.message
    ?? null;

  const programmes = programmesQuery.data ?? null;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Admin</p>
          <h1>Programmes</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            The pipelines schools are enrolled in. Select a programme to see every school taking part.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setCreating(true); setEditing(null); }}
          className="btn-primary w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          New programme
        </button>
      </div>

      {err && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {(creating || editing) && (
        <ProgrammeForm
          initial={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            void qc.invalidateQueries({ queryKey: ['programmes'] });
          }}
        />
      )}

      {!programmes && <SkeletonCards count={2} label="Loading programmes" />}
      {programmes && programmes.length === 0 && !creating && (
        <div className="card p-10 text-center">
          <Layers className="h-8 w-8 text-gray-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-gray-600">No programmes yet.</p>
          <p className="text-xs text-gray-500 mt-1">Create your first one with the button above.</p>
        </div>
      )}

      {programmes?.map((p) => (
        <ProgrammeCard
          key={p.id}
          programme={p}
          schools={schoolsByProgramme.map.get(p.id) ?? []}
          loadingSchools={!schoolsQuery.data}
          onEdit={() => { setEditing(p); setCreating(false); }}
          onDelete={() => onDeleteProgramme(p)}
        />
      ))}

      {/* Schools without a programme — admin attention bucket */}
      {schoolsByProgramme.unassigned.length > 0 && (
        <UnassignedSchools schools={schoolsByProgramme.unassigned} />
      )}
    </div>
  );
}

// -----------------------------------------------------------------
// Programme card — header + collapsible schools list
// -----------------------------------------------------------------

function ProgrammeCard({
  programme, schools, loadingSchools, onEdit, onDelete,
}: {
  programme:        Programme;
  schools:          School[];
  loadingSchools:   boolean;
  onEdit:           () => void;
  onDelete:         () => void;
}) {
  // Default to open for active programmes so the admin sees enrolment
  // at a glance; closed for inactive ones to keep the page tidy.
  const [open, setOpen] = useState(programme.is_active);

  return (
    <article className="card overflow-hidden">
      <header className="p-4 sm:p-5 flex items-start justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`programme-schools-${programme.id}`}
          className="flex items-start gap-3 text-left flex-1 min-w-0 -m-2 p-2 rounded-md hover:bg-warm-100/60 transition-colors"
        >
          <ChevronRight
            aria-hidden="true"
            className={`h-4 w-4 mt-1 flex-shrink-0 text-gray-500 transform transition-transform ${
              open ? 'rotate-90' : ''
            }`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="m-0 text-base">{programme.name}</h2>
              <span className="text-xs font-mono text-gray-500">{programme.slug}</span>
              {programme.is_active
                ? <span className="badge-green">active</span>
                : <span className="badge-gray">inactive</span>}
              <span className="badge-teal inline-flex items-center">
                <SchoolIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                {schools.length} school{schools.length === 1 ? '' : 's'}
              </span>
            </div>
            {programme.description && (
              <p className="text-sm text-gray-700 mt-1">{programme.description}</p>
            )}
          </div>
        </button>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-md"
            title="Edit programme"
            aria-label={`Edit programme ${programme.name}`}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-red-700 hover:bg-red-50 rounded-md"
            title="Delete programme"
            aria-label={`Delete programme ${programme.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {open && (
        <div
          id={`programme-schools-${programme.id}`}
          className="border-t border-warm-200 px-4 sm:px-5 py-4"
        >
          <h3 className="m-0 text-xs uppercase tracking-wider text-gray-500 mb-3">
            Schools enrolled
          </h3>

          {loadingSchools && (
            <p role="status" className="text-sm text-gray-500">Loading schools…</p>
          )}

          {!loadingSchools && schools.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No schools enrolled yet. Open <Link to="/dashboard/admin/schools" className="text-teal-700 hover:underline">Schools</Link> and assign this programme on a school's edit panel.
            </p>
          )}

          {!loadingSchools && schools.length > 0 && (
            <div className="card overflow-x-auto">
              <table className="data-table" aria-label={`Schools enrolled in ${programme.name}`}>
                <thead>
                  <tr>
                    <th scope="col">School</th>
                    <th scope="col">Type</th>
                    <th scope="col">County</th>
                    <th scope="col">Contact email</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <Link
                          to={`/dashboard/admin/schools/${s.id}`}
                          className="font-medium text-gray-900 hover:text-teal-700 hover:underline"
                        >
                          {s.name}
                        </Link>
                      </td>
                      <td>
                        <span className={
                          s.type === 'special'    ? 'badge-terra' :
                          s.type === 'integrated' ? 'badge-amber' :
                                                    'badge-teal'
                        }>{s.type}</span>
                      </td>
                      <td className="text-sm text-gray-700">{s.county ?? '—'}</td>
                      <td className="text-sm text-gray-700">{s.contact_email ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// -----------------------------------------------------------------
// Bucket for schools without a programme
// -----------------------------------------------------------------

function UnassignedSchools({ schools }: { schools: School[] }) {
  return (
    <article className="card overflow-hidden border-amber-200">
      <header className="p-4 sm:p-5">
        <h2 className="m-0 text-base flex items-center gap-2 flex-wrap">
          Schools without a programme
          <span className="badge-amber">{schools.length}</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          These schools aren't enrolled in any programme yet. Open each one and assign it from the Edit panel.
        </p>
      </header>
      <div className="border-t border-warm-200 px-4 sm:px-5 py-4">
        <div className="card overflow-x-auto">
          <table className="data-table" aria-label="Schools without a programme">
            <thead>
              <tr>
                <th scope="col">School</th>
                <th scope="col">Type</th>
                <th scope="col">County</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link
                      to={`/dashboard/admin/schools/${s.id}`}
                      className="font-medium text-gray-900 hover:text-teal-700 hover:underline"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td>
                    <span className={
                      s.type === 'special'    ? 'badge-terra' :
                      s.type === 'integrated' ? 'badge-amber' :
                                                'badge-teal'
                    }>{s.type}</span>
                  </td>
                  <td className="text-sm text-gray-700">{s.county ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  );
}

// -----------------------------------------------------------------
// Programme create / edit form
// -----------------------------------------------------------------

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function ProgrammeForm({
  initial, onClose, onSaved,
}: {
  initial: Programme | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [name,        setName]        = useState(initial?.name ?? '');
  const [slug,        setSlug]        = useState(initial?.slug ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isActive,    setIsActive]    = useState(initial?.is_active ?? true);

  const dialogRef = useDialog<HTMLDivElement>({ open: true, onClose, trapFocus: false });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name:        name.trim(),
        slug:        slug.trim(),
        description: description.trim() || null,
        is_active:   isActive,
      };
      const { error } = isEdit
        ? await supabase.from('programmes').update(payload).eq('id', initial!.id)
        : await supabase.from('programmes').insert(payload);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { onSaved(); },
  });

  const err = saveMutation.error?.message ?? null;
  const saving = saveMutation.isPending;

  const slugInvalid = slug.length > 0 && !SLUG_RE.test(slug);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || slugInvalid) return;
    saveMutation.mutate();
  };

  return (
    <div ref={dialogRef} role="region" aria-labelledby="programme-form-heading" className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="m-0" id="programme-form-heading">
          {isEdit ? `Edit programme — ${initial!.name}` : 'New programme'}
        </h2>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900" aria-label="Close programme form">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={onSubmit} aria-labelledby="programme-form-heading" className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="programme-name">
            Name<span aria-hidden="true" className="text-red-600 ml-0.5">*</span>
          </label>
          <input
            id="programme-name" type="text" required aria-required="true" className="field-input"
            placeholder="e.g. Inclusive Robotics"
            value={name} onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="programme-slug">
            Slug<span aria-hidden="true" className="text-red-600 ml-0.5">*</span>
          </label>
          <input
            id="programme-slug" type="text" required aria-required="true"
            className="field-input font-mono"
            placeholder="e.g. inclusive-robotics"
            value={slug} onChange={(e) => setSlug(e.target.value)}
            aria-invalid={slugInvalid || undefined}
          />
          <p className="field-help">
            Lowercase letters, numbers, and dashes only — e.g. <span className="font-mono">inclusive-robotics</span>.
          </p>
          {slugInvalid && (
            <p role="alert" className="text-xs text-red-700 mt-1">
              Use lowercase letters, numbers, and single dashes only.
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="programme-desc">Description</label>
          <textarea
            id="programme-desc" rows={3} className="field-input"
            value={description} onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active — visible to schools
          </label>
        </div>

        {err && (
          <div role="alert" className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {err}
          </div>
        )}

        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-warm-200">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving || !name.trim() || !slug.trim() || slugInvalid}
          >
            {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Create programme')}
          </button>
        </div>
      </form>
    </div>
  );
}
