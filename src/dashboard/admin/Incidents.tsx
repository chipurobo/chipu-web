import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchIncidents, updateIncident } from '../../lib/gql/queries';
import { useNotifications } from '../../lib/notifications';
import type { Incident, IncidentStatus } from '../../lib/database.types';
import { ShieldAlert, Filter } from 'lucide-react';
import { SkeletonRows } from '../components/Skeletons';

// =============================================================
// /dashboard/admin/incidents
//
// The safeguarding queue. Only admins can read this — the select policy on
// public.incidents says so, and the route guard is the second lock, not the
// only one.
//
// Learners appear as participant codes. There is no join to club_members and
// there should never be one: resolving a code to a child is the school's job,
// because the school is where that mapping lives.
// =============================================================

const STATUSES: IncidentStatus[] = ['reported', 'acknowledged', 'under_review', 'closed'];

const STATUS_STYLE: Record<IncidentStatus, string> = {
  reported:     'bg-terracotta-100 text-terracotta-800',
  acknowledged: 'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  closed:       'bg-gray-100 text-gray-600',
};

const SEVERITY_STYLE: Record<string, string> = {
  high:   'bg-terracotta-600 text-white',
  medium: 'bg-amber-200 text-amber-900',
  low:    'bg-gray-200 text-gray-700',
};

export function AdminIncidents() {
  const { notify } = useNotifications();
  const queryClient = useQueryClient();
  const [showClosed, setShowClosed] = useState(false);

  const { data: rows, isLoading, error } = useQuery({
    queryKey: ['incidents', { showClosed }],
    queryFn: () => fetchIncidents({ includeClosed: showClosed }),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: IncidentStatus }) =>
      updateIncident(id, {
        status,
        closed_at: status === 'closed' ? new Date().toISOString() : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      notify('success', 'Status updated');
    },
    onError: (e: Error) => notify('warning', 'Could not update status', e.message),
  });

  const open = (rows ?? []).filter((r: Incident) => r.status !== 'closed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="heading-display text-2xl text-gray-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-terracotta-600" aria-hidden="true" />
            Safeguarding
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Reports filed by schools. Learners are identified by participant code — resolving a
            code to a child is the school&rsquo;s job, not something this screen can do.{' '}
            <strong>{open}</strong> open.
          </p>
        </div>
        <button
          type="button"
          className="btn-outline text-sm"
          onClick={() => setShowClosed((v) => !v)}
        >
          <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
          {showClosed ? 'Hide closed' : 'Show closed'}
        </button>
      </div>

      {error && (
        <div className="card p-4 border-terracotta-300 bg-terracotta-50 text-sm text-terracotta-900">
          Could not load reports: {(error as Error).message}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="Safeguarding reports">
          <thead>
            <tr>
              <th>Filed</th>
              <th>School</th>
              <th>Learner</th>
              <th>Severity</th>
              <th>What happened</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <SkeletonRows rows={4} cols={6} label="Loading reports" />}
            {!isLoading && (rows ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="text-sm text-gray-500 italic">
                  No reports{showClosed ? '' : ' open'}.
                </td>
              </tr>
            )}
            {(rows ?? []).map((r: Incident & { school?: { name: string } | null }) => (
              <tr key={r.id}>
                <td className="text-sm whitespace-nowrap">{r.occurred_on}</td>
                <td className="text-sm">{r.school?.name ?? '—'}</td>
                <td className="text-sm font-mono">{r.learner_code ?? '—'}</td>
                <td>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_STYLE[r.severity]}`}>
                    {r.severity}
                  </span>
                </td>
                <td className="text-sm max-w-md">{r.description}</td>
                <td>
                  <select
                    className="input text-sm py-1"
                    value={r.status}
                    aria-label={`Status for report filed ${r.occurred_on}`}
                    onChange={(e) =>
                      setStatus.mutate({ id: r.id, status: e.target.value as IncidentStatus })}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                  <span className={`sr-only ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
