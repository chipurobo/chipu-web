import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchActionsForSchool, createAction, updateAction,
} from '../../lib/gql/queries';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';
import type { ActionSource, ProgrammeAction } from '../../lib/database.types';
import { ListChecks, Plus, CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { SkeletonRows } from '../components/Skeletons';

// =============================================================
// /dashboard/school/actions
//
// The action tracker that appears three times on paper — in the weekly
// monitoring form, the school baseline and the visit checklist. On paper each
// list is stranded in the document that created it, so nobody can answer "what
// is still open at this school?". Modelled once, that question is a query.
// =============================================================

const SOURCE_LABEL: Record<ActionSource, string> = {
  weekly_session:  'Weekly session',
  school_baseline: 'School baseline',
  school_visit:    'School visit',
  other:           'Other',
};

function isOverdue(a: ProgrammeAction): boolean {
  if (a.status === 'closed' || !a.due_date) return false;
  return a.due_date < new Date().toISOString().slice(0, 10);
}

export function SchoolActions() {
  const { school, profile } = useAuth();
  const schoolId = school?.id ?? null;
  const { notify } = useNotifications();
  const queryClient = useQueryClient();

  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName]     = useState('');
  const [dueDate, setDueDate]         = useState('');
  const [source, setSource]           = useState<ActionSource>('other');
  const [showClosed, setShowClosed]   = useState(false);

  const actionsQuery = useQuery({
    queryKey: ['actions', schoolId],
    queryFn: () => fetchActionsForSchool(schoolId!),
    enabled: !!schoolId,
  });

  const visible = useMemo(() => {
    const all = actionsQuery.data ?? [];
    return showClosed ? all : all.filter((a) => a.status === 'open');
  }, [actionsQuery.data, showClosed]);

  const openCount = (actionsQuery.data ?? []).filter((a) => a.status === 'open').length;
  const overdueCount = (actionsQuery.data ?? []).filter(isOverdue).length;

  const addMutation = useMutation({
    mutationFn: () => createAction({
      school_id: schoolId!,
      description: description.trim(),
      owner_name: ownerName.trim() || null,
      due_date: dueDate || null,
      source,
      created_by: profile?.id ?? null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions', schoolId] });
      notify('success', 'Action added', 'It will stay open until someone closes it.');
      setDescription(''); setOwnerName(''); setDueDate(''); setSource('other');
    },
    onError: (err: Error) => notify('warning', 'Could not add action', err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (a: ProgrammeAction) =>
      // closed_at is maintained by a trigger, so the client only sends status.
      updateAction(a.id, { status: a.status === 'open' ? 'closed' : 'open' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['actions', schoolId] }),
    onError: (err: Error) => notify('warning', 'Could not update action', err.message),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <ListChecks className="h-6 w-6 text-teal-600" aria-hidden="true" />
        Actions
      </h1>
      <p className="text-sm text-gray-600 mt-1 mb-6">
        {openCount} open
        {overdueCount > 0 && (
          <span className="text-terracotta-600"> · {overdueCount} overdue</span>
        )}
      </p>

      <div className="card p-4 mb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="desc">Action required</label>
            <input id="desc" className="field-input" value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to happen?" />
          </div>
          <div>
            <label className="field-label" htmlFor="owner">Owner</label>
            <input id="owner" className="field-input" value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Who is responsible?" />
          </div>
          <div>
            <label className="field-label" htmlFor="due">Due date</label>
            <input id="due" type="date" className="field-input" value={dueDate}
              onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="source">Arising from</label>
            <select id="source" className="field-input" value={source}
              onChange={(e) => setSource(e.target.value as ActionSource)}>
              {(Object.keys(SOURCE_LABEL) as ActionSource[]).map((s) => (
                <option key={s} value={s}>{SOURCE_LABEL[s]}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            className="btn-primary"
            disabled={!description.trim() || addMutation.isPending}
            onClick={() => addMutation.mutate()}
          >
            <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {addMutation.isPending ? 'Adding…' : 'Add action'}
          </button>
        </div>
      </div>

      <label className="inline-flex items-center gap-2 cursor-pointer mb-2">
        <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
        <span className="text-sm text-gray-700">Show closed actions</span>
      </label>

      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="Programme actions">
          <thead>
            <tr>
              <th>Action</th>
              <th>Owner</th>
              <th>Due</th>
              <th>Arising from</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {actionsQuery.isPending ? (
              <SkeletonRows rows={4} cols={6} label="Loading actions" />
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-sm text-gray-500 py-6 text-center">
                  {showClosed ? 'No actions yet.' : 'Nothing open.'}
                </td>
              </tr>
            ) : (
              visible.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium text-gray-900">{a.description}</td>
                  <td className="text-sm text-gray-600">{a.owner_name ?? '—'}</td>
                  <td className="whitespace-nowrap text-sm">
                    {a.due_date ?? '—'}
                    {isOverdue(a) && (
                      <span className="badge-terra ml-2 inline-flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                        overdue
                      </span>
                    )}
                  </td>
                  <td className="text-sm text-gray-600">{SOURCE_LABEL[a.source]}</td>
                  <td>
                    <span className={a.status === 'open' ? 'badge-amber' : 'badge-teal'}>{a.status}</span>
                  </td>
                  <td className="text-right">
                    <button
                      className="btn-secondary !py-1 !text-xs"
                      disabled={toggleMutation.isPending}
                      onClick={() => toggleMutation.mutate(a)}
                    >
                      {a.status === 'open' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />Close</>
                      ) : (
                        <><RotateCcw className="h-3 w-3 mr-1" aria-hidden="true" />Reopen</>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
