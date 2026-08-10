import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBookings, updateBooking } from '../../lib/gql/queries';
import { useNotifications } from '../../lib/notifications';
import type { WorkshopStatus } from '../../lib/database.types';
import { Presentation, MapPin, MonitorPlay, CheckCircle2, X, Clock } from 'lucide-react';
import { SkeletonRows } from '../components/Skeletons';

// =============================================================
// /dashboard/admin/workshops
//
// The booking queue. Every lesson already has a bookable workshop (created
// automatically), so a teacher books rather than composes a request; this is
// where ChipuRobo schedules, delivers or declines what comes in.
//
// Rows with no lesson came from bootcamp events migrated in 20260810000003,
// where the source event taught zero or several lessons and guessing one would
// have been worse than leaving it unset.
// =============================================================

const STATUS_LABEL: Record<WorkshopStatus, string> = {
  requested: 'Requested',
  scheduled: 'Scheduled',
  delivered: 'Delivered',
  declined:  'Declined',
  cancelled: 'Cancelled',
};

const STATUS_BADGE: Record<WorkshopStatus, string> = {
  requested: 'badge-amber',
  scheduled: 'badge-teal',
  delivered: 'badge-teal',
  declined:  'badge-terra',
  cancelled: 'badge-gray',
};

const ORDER: WorkshopStatus[] = ['requested', 'scheduled', 'delivered', 'declined', 'cancelled'];

export function AdminWorkshops() {
  const { notify } = useNotifications();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<WorkshopStatus | 'all'>('requested');
  const [scheduling, setScheduling] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [facilitator, setFacilitator] = useState('');

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: fetchBookings,
  });

  const rows = useMemo(() => {
    const all = bookingsQuery.data ?? [];
    const filtered = filter === 'all' ? all : all.filter((w) => w.status === filter);
    return filtered.slice().sort(
      (a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status),
    );
  }, [bookingsQuery.data, filter]);

  const counts = useMemo(() => {
    const map = new Map<WorkshopStatus, number>();
    for (const w of bookingsQuery.data ?? []) {
      map.set(w.status, (map.get(w.status) ?? 0) + 1);
    }
    return map;
  }, [bookingsQuery.data]);

  const mutate = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateBooking>[1] }) =>
      updateBooking(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setScheduling(null); setScheduleDate(''); setFacilitator('');
    },
    onError: (err: Error) => notify('warning', 'Could not update booking', err.message),
  });

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Admin</p>
        <h1>Workshop bookings</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Training booked by schools and teachers, delivered in person or online. Schedule a
          booking, then mark it delivered once it has run.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          className={filter === 'all' ? 'badge-teal' : 'badge-gray'}
          onClick={() => setFilter('all')}
        >
          All ({bookingsQuery.data?.length ?? 0})
        </button>
        {ORDER.map((s) => (
          <button
            key={s}
            className={filter === s ? 'badge-teal' : 'badge-gray'}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABEL[s]} ({counts.get(s) ?? 0})
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="Workshop bookings">
          <thead>
            <tr>
              <th>School</th>
              <th>Lesson</th>
              <th>Mode</th>
              <th>Status</th>
              <th>When</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {bookingsQuery.isPending ? (
              <SkeletonRows rows={4} cols={6} label="Loading workshops" />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-sm text-gray-500 py-6 text-center">
                  Nothing here.
                </td>
              </tr>
            ) : (
              rows.map((w) => (
                <tr key={w.id}>
                  <td className="font-medium text-gray-900">{w.school?.name ?? '—'}</td>
                  <td className="text-sm text-gray-600">
                    {w.lesson?.title ?? (
                      <span className="text-gray-400 italic">
                        {w.title ?? 'no lesson linked'}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge-gray inline-flex items-center">
                      {w.mode === 'physical'
                        ? <><MapPin className="h-3 w-3 mr-1" aria-hidden="true" />In person</>
                        : <><MonitorPlay className="h-3 w-3 mr-1" aria-hidden="true" />Online</>}
                    </span>
                  </td>
                  <td><span className={STATUS_BADGE[w.status]}>{STATUS_LABEL[w.status]}</span></td>
                  <td className="text-sm whitespace-nowrap">
                    {w.delivered_at
                      ? new Date(w.delivered_at).toLocaleDateString()
                      : w.scheduled_for
                        ? <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" aria-hidden="true" />
                            {new Date(w.scheduled_for).toLocaleDateString()}
                          </span>
                        : '—'}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    {w.status === 'requested' && (
                      <>
                        <button
                          className="btn-secondary !py-1 !text-xs mr-1"
                          onClick={() => setScheduling(scheduling === w.id ? null : w.id)}
                        >
                          Schedule
                        </button>
                        <button
                          className="btn-secondary !py-1 !text-xs"
                          onClick={() => {
                            const reason = window.prompt('Why is this being declined?');
                            if (reason === null) return;
                            mutate.mutate({ id: w.id, patch: { status: 'declined', decline_reason: reason || null } });
                          }}
                        >
                          <X className="h-3 w-3 mr-1" aria-hidden="true" />Decline
                        </button>
                      </>
                    )}
                    {w.status === 'scheduled' && (
                      <button
                        className="btn-primary !py-1 !text-xs"
                        onClick={() => mutate.mutate({
                          id: w.id,
                          patch: { status: 'delivered', delivered_at: new Date().toISOString() },
                        })}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                        Mark delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {scheduling && (
        <div className="card p-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Presentation className="h-4 w-4 text-teal-600" aria-hidden="true" />
            Schedule this workshop
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 mt-3">
            <div>
              <label className="field-label" htmlFor="sched">Date</label>
              <input id="sched" type="date" className="field-input"
                value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="fac">Facilitator</label>
              <input id="fac" className="field-input" value={facilitator}
                onChange={(e) => setFacilitator(e.target.value)}
                placeholder="Who will run it?" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              className="btn-primary"
              disabled={!scheduleDate || mutate.isPending}
              onClick={() => mutate.mutate({
                id: scheduling,
                patch: {
                  status: 'scheduled',
                  scheduled_for: new Date(scheduleDate).toISOString(),
                  facilitator: facilitator.trim() || null,
                },
              })}
            >
              {mutate.isPending ? 'Saving…' : 'Confirm schedule'}
            </button>
            <button className="btn-secondary" onClick={() => setScheduling(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
