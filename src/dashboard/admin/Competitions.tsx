import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCompetitions, fetchCompetitionEntries, fetchSchools,
  createCompetition, updateCompetition, enterSchool, withdrawSchool,
} from '../../lib/gql/queries';
import { useNotifications } from '../../lib/notifications';
import type { CompetitionStatus } from '../../lib/database.types';
import { Trophy, Plus, School as SchoolIcon, X } from 'lucide-react';
import { SkeletonCards } from '../components/Skeletons';

// =============================================================
// /dashboard/admin/competitions
//
// One row per cycle of the Pan-African STEM competition. Before this,
// "Inclusive Robotics" was only a label on a certificate template, so there was
// no way to say which schools were in the 2026 cycle or which cycle a submitted
// project belonged to.
//
// A new year is a new competition, which is what keeps last year's entries and
// projects attached to last year.
// =============================================================

const STATUS_LABEL: Record<CompetitionStatus, string> = {
  draft:  'Draft',
  open:   'Open for entries',
  closed: 'Closed',
  judged: 'Judged',
};

const STATUS_BADGE: Record<CompetitionStatus, string> = {
  draft:  'badge-gray',
  open:   'badge-teal',
  closed: 'badge-amber',
  judged: 'badge-terra',
};

const slugify = (name: string, year: number) =>
  `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${year}`;

export function AdminCompetitions() {
  const { notify } = useNotifications();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [openFor, setOpenFor] = useState<string | null>(null);

  const competitionsQuery = useQuery({
    queryKey: ['competitions'],
    queryFn: fetchCompetitions,
  });

  const createMutation = useMutation({
    mutationFn: () => createCompetition({
      slug: slugify(name, year),
      name: name.trim(),
      year,
      description: description.trim() || null,
      status: 'draft',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitions'] });
      notify('success', 'Competition created', 'It stays in draft until you open it for entries.');
      setName(''); setDescription(''); setCreating(false);
    },
    onError: (err: Error) => notify('warning', 'Could not create', err.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CompetitionStatus }) =>
      updateCompetition(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['competitions'] }),
    onError: (err: Error) => notify('warning', 'Could not update', err.message),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) createMutation.mutate();
  };

  const competitions = competitionsQuery.data ?? [];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Admin</p>
          <h1>Competitions</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Each cycle of the Pan-African STEM competition. Enter the schools taking part; their
            projects are their entries, judged towards the National Showcase.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setCreating((v) => !v)}>
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {creating ? 'Cancel' : 'New competition'}
        </button>
      </div>

      {creating && (
        <form onSubmit={onSubmit} className="card p-4" aria-label="New competition">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="c-name">Name</label>
              <input id="c-name" className="field-input" value={name}
                onChange={(e) => setName(e.target.value)} placeholder="e.g. Inclusive Robotics" />
            </div>
            <div>
              <label className="field-label" htmlFor="c-year">Year</label>
              <input id="c-year" type="number" className="field-input" value={year}
                onChange={(e) => setYear(Number(e.target.value))} />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="c-desc">Description</label>
              <textarea id="c-desc" className="field-input" rows={2} value={description}
                onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <button className="btn-primary" type="submit"
              disabled={!name.trim() || createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create competition'}
            </button>
          </div>
        </form>
      )}

      {competitionsQuery.isPending ? (
        <SkeletonCards count={2} label="Loading competitions" />
      ) : competitions.length === 0 ? (
        <div className="card p-10 text-center text-sm text-gray-600">No competitions yet.</div>
      ) : (
        competitions.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="m-0 text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  {c.name} {c.year}
                </h2>
                {c.description && <p className="text-xs text-gray-500 mt-1 max-w-2xl">{c.description}</p>}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={STATUS_BADGE[c.status]}>{STATUS_LABEL[c.status]}</span>
                <select
                  className="field-input !py-1 !text-xs"
                  aria-label={`Status for ${c.name} ${c.year}`}
                  value={c.status}
                  onChange={(e) => statusMutation.mutate({
                    id: c.id, status: e.target.value as CompetitionStatus,
                  })}
                >
                  {(Object.keys(STATUS_LABEL) as CompetitionStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                <button
                  className="btn-secondary !py-1 !text-xs"
                  onClick={() => setOpenFor(openFor === c.id ? null : c.id)}
                >
                  <SchoolIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                  Schools
                </button>
              </div>
            </div>

            {openFor === c.id && <EntryManager competitionId={c.id} />}
          </div>
        ))
      )}
    </div>
  );
}

function EntryManager({ competitionId }: { competitionId: string }) {
  const { notify } = useNotifications();
  const qc = useQueryClient();
  const [picker, setPicker] = useState('');

  const entriesQuery = useQuery({
    queryKey: ['competition-entries', competitionId],
    queryFn: () => fetchCompetitionEntries(competitionId),
  });

  const schoolsQuery = useQuery({ queryKey: ['schools'], queryFn: fetchSchools });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['competition-entries', competitionId] });

  const enterMutation = useMutation({
    mutationFn: (schoolId: string) => enterSchool(competitionId, schoolId),
    onSuccess: () => { setPicker(''); invalidate(); },
    onError: (err: Error) => notify('warning', 'Could not enter school', err.message),
  });

  const withdrawMutation = useMutation({
    mutationFn: (schoolId: string) => withdrawSchool(competitionId, schoolId),
    onSuccess: invalidate,
    onError: (err: Error) => notify('warning', 'Could not withdraw school', err.message),
  });

  const entries = entriesQuery.data ?? [];
  const active = entries.filter((e) => !e.withdrawn_at);
  // Built inside the memo: a Set constructed on every render would change
  // identity each time and defeat the memo entirely.
  const available = useMemo(() => {
    const enteredIds = new Set(
      (entriesQuery.data ?? []).filter((e) => !e.withdrawn_at).map((e) => e.school_id),
    );
    return (schoolsQuery.data ?? []).filter((s) => !enteredIds.has(s.id));
  }, [schoolsQuery.data, entriesQuery.data]);

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <h3 className="m-0 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Schools entered ({active.length})
      </h3>

      <div className="mt-2 overflow-x-auto">
        <table className="data-table" aria-label="Schools entered">
          <thead>
            <tr><th>School</th><th>County</th><th>Entered</th><th /></tr>
          </thead>
          <tbody>
            {entriesQuery.isPending ? (
              <tr><td colSpan={4} className="text-sm text-gray-500 py-4">Loading…</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={4} className="text-sm text-gray-500 py-4">No schools entered yet.</td></tr>
            ) : (
              entries.map((e) => (
                <tr key={e.school_id} className={e.withdrawn_at ? 'opacity-50' : undefined}>
                  <td className="font-medium text-gray-900">{e.school?.name ?? '—'}</td>
                  <td className="text-sm text-gray-600">{e.school?.county ?? '—'}</td>
                  <td className="text-sm whitespace-nowrap">
                    {new Date(e.entered_at).toLocaleDateString()}
                    {e.withdrawn_at && <span className="badge-gray ml-2">withdrawn</span>}
                  </td>
                  <td className="text-right">
                    {!e.withdrawn_at && (
                      <button
                        className="btn-secondary !py-1 !text-xs"
                        disabled={withdrawMutation.isPending}
                        onClick={() => withdrawMutation.mutate(e.school_id)}
                      >
                        <X className="h-3 w-3 mr-1" aria-hidden="true" />Withdraw
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex gap-2 items-end flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <label className="field-label" htmlFor={`enter-${competitionId}`}>Enter a school</label>
          <select id={`enter-${competitionId}`} className="field-input" value={picker}
            onChange={(e) => setPicker(e.target.value)}>
            <option value="">— pick a school —</option>
            {available.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <button
          className="btn-secondary"
          disabled={!picker || enterMutation.isPending}
          onClick={() => enterMutation.mutate(picker)}
        >
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />Enter
        </button>
      </div>
    </div>
  );
}
