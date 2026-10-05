import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBookingsForSchool, fetchBookableWorkshops, requestWorkshop, updateBooking,
} from '../../lib/gql/queries';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';
import type { WorkshopMode, WorkshopStatus } from '../../lib/database.types';
import { Presentation, MapPin, MonitorPlay, Clock, BookOpen, ExternalLink } from 'lucide-react';
import { SkeletonRows } from '../components/Skeletons';
import { safeHttpUrl } from '../../lib/safeUrl';
import { LevelFilter } from '../components/LevelFilter';
import { matchesLevel, type LevelChoice } from '../components/levels';

// =============================================================
// /dashboard/school/workshops
//
// The catalogue, not a blank form. Every lesson has a bookable workshop
// created for it automatically, so booking training is two clicks — pick the
// workshop, pick in person or online — rather than composing a request and
// hoping it names something ChipuRobo actually offers.
//
// A school can book and cancel its own. It cannot schedule or mark delivered:
// a database trigger enforces that, so the rule holds even outside this UI.
// =============================================================

const STATUS_LABEL: Record<WorkshopStatus, string> = {
  requested: 'Awaiting ChipuRobo',
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

// A workshop is open to booking again once any previous booking has finished.
const LIVE: WorkshopStatus[] = ['requested', 'scheduled'];

export function SchoolWorkshops() {
  const { school, profile } = useAuth();
  const schoolId = school?.id ?? null;
  const { notify } = useNotifications();
  const qc = useQueryClient();
  const [note, setNote] = useState<Record<string, string>>({});
  const [level, setLevel] = useState<LevelChoice>('all');

  const catalogueQuery = useQuery({
    queryKey: ['workshops', 'catalogue'],
    queryFn: fetchBookableWorkshops,
  });

  const bookingsQuery = useQuery({
    queryKey: ['bookings', schoolId],
    queryFn: () => fetchBookingsForSchool(schoolId!),
    enabled: !!schoolId,
  });

  // The live booking per workshop, so a catalogue row can show "Scheduled"
  // instead of offering a second booking for training already coming.
  const liveByWorkshop = useMemo(() => {
    const map = new Map<string, { id: string; status: WorkshopStatus; mode: WorkshopMode; scheduled_for: string | null }>();
    for (const b of bookingsQuery.data ?? []) {
      if (b.workshop_id && LIVE.includes(b.status)) {
        map.set(b.workshop_id, { id: b.id, status: b.status, mode: b.mode, scheduled_for: b.scheduled_for });
      }
    }
    return map;
  }, [bookingsQuery.data]);

  const bookMutation = useMutation({
    mutationFn: ({ workshopId, lessonId, mode, title }:
      { workshopId: string; lessonId: string; mode: WorkshopMode; title: string | null }) =>
      requestWorkshop({
        workshop_id: workshopId,
        lesson_id: lessonId,
        school_id: schoolId!,
        requested_by: profile?.id ?? null,
        mode,
        request_note: (note[workshopId] ?? '').trim() || null,
        title,
      }),
    onSuccess: (_b, vars) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setNote((n) => ({ ...n, [vars.workshopId]: '' }));
      notify('success', 'Training requested', 'ChipuRobo will confirm a date with you.');
    },
    onError: (err: Error) => notify('warning', 'Could not book', err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateBooking(id, { status: 'cancelled' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
    onError: (err: Error) => notify('warning', 'Could not cancel', err.message),
  });

  const allWorkshops = catalogueQuery.data ?? [];
  const catalogue = allWorkshops.filter(
    (w) => !w.lesson || matchesLevel(w.lesson.level, level),
  );
  const history = (bookingsQuery.data ?? []).filter((b) => !LIVE.includes(b.status));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Presentation className="h-6 w-6 text-teal-600" aria-hidden="true" />
        Workshops
      </h1>
      <p className="text-sm text-gray-600 mt-1 mb-6">
        Every lesson has a workshop you can book. Choose one and say whether you would like it
        in person at your school or online.
      </p>

      <div className="mb-4">
        <LevelFilter
          value={level}
          onChange={setLevel}
          counts={{
            all: allWorkshops.length,
            primary: allWorkshops.filter((w) => !w.lesson || matchesLevel(w.lesson.level, 'primary')).length,
            secondary: allWorkshops.filter((w) => !w.lesson || matchesLevel(w.lesson.level, 'secondary')).length,
          }}
        />
      </div>

      {catalogueQuery.isPending ? (
        <p className="text-sm text-gray-500">Loading workshops…</p>
      ) : catalogueQuery.error ? (
        /* A failed query used to fall through to `data ?? []` and render as
           "none open for booking", which is how a broken embed reached
           production looking like an empty catalogue. Say what went wrong. */
        <div role="alert" className="card p-4 text-sm text-red-700 bg-red-50 border border-red-200">
          Could not load the workshops: {(catalogueQuery.error as Error).message}
        </div>
      ) : catalogue.length === 0 ? (
        <div className="card p-8 text-center text-sm text-gray-600">
          No workshops are open for booking yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {catalogue.map((w) => {
            const live = liveByWorkshop.get(w.id);
            const title = w.title ?? w.lesson?.title ?? 'Workshop';
            const desc = w.description ?? w.lesson?.description ?? null;
            return (
              <div key={w.id} className="card p-4 flex flex-col">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-teal-600 flex-shrink-0" aria-hidden="true" />
                  {title}
                </h2>
                {desc && <p className="text-xs text-gray-500 mt-1 line-clamp-3">{desc}</p>}
                {safeHttpUrl(w.lesson?.resource_url) && (
                  <a
                    href={safeHttpUrl(w.lesson?.resource_url)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-700 hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    Open the resource
                  </a>
                )}

                {live ? (
                  <div className="mt-3">
                    <span className={STATUS_BADGE[live.status]}>{STATUS_LABEL[live.status]}</span>
                    <span className="badge-gray ml-1.5 inline-flex items-center">
                      {live.mode === 'physical'
                        ? <><MapPin className="h-3 w-3 mr-1" aria-hidden="true" />In person</>
                        : <><MonitorPlay className="h-3 w-3 mr-1" aria-hidden="true" />Online</>}
                    </span>
                    {live.scheduled_for && (
                      <p className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {new Date(live.scheduled_for).toLocaleDateString()}
                      </p>
                    )}
                    <button
                      className="btn-secondary !py-1 !text-xs mt-2 self-start"
                      disabled={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(live.id)}
                    >
                      Cancel booking
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <input
                      className="field-input !py-1 !text-xs mb-2"
                      placeholder="Anything we should know? (optional)"
                      aria-label={`Note for ${title}`}
                      value={note[w.id] ?? ''}
                      onChange={(e) => setNote((n) => ({ ...n, [w.id]: e.target.value }))}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {w.allows_physical && (
                        <button
                          className="btn-primary !py-1 !text-xs"
                          disabled={!w.lesson || bookMutation.isPending}
                          onClick={() => bookMutation.mutate({
                            workshopId: w.id, lessonId: w.lesson!.id, mode: 'physical', title,
                          })}
                        >
                          <MapPin className="h-3 w-3 mr-1" aria-hidden="true" />
                          Request in person
                        </button>
                      )}
                      {w.allows_virtual && (
                        <button
                          className="btn-secondary !py-1 !text-xs"
                          disabled={!w.lesson || bookMutation.isPending}
                          onClick={() => bookMutation.mutate({
                            workshopId: w.id, lessonId: w.lesson!.id, mode: 'virtual', title,
                          })}
                        >
                          <MonitorPlay className="h-3 w-3 mr-1" aria-hidden="true" />
                          Request online
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-700 mt-8 mb-2">Past bookings</h2>
      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="Past workshop bookings">
          <thead>
            <tr>
              <th>Workshop</th>
              <th>Mode</th>
              <th>Status</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {bookingsQuery.isPending ? (
              <SkeletonRows rows={3} cols={4} label="Loading bookings" />
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-sm text-gray-500 py-6 text-center">
                  Nothing yet.
                </td>
              </tr>
            ) : (
              history.map((b) => (
                <tr key={b.id}>
                  <td className="font-medium text-gray-900">
                    {b.lesson?.title ?? <span className="text-gray-400 italic">{b.title ?? '—'}</span>}
                  </td>
                  <td className="text-sm">{b.mode === 'physical' ? 'In person' : 'Online'}</td>
                  <td>
                    <span className={STATUS_BADGE[b.status]}>{STATUS_LABEL[b.status]}</span>
                    {b.status === 'declined' && b.decline_reason && (
                      <p className="text-xs text-gray-500 mt-1">{b.decline_reason}</p>
                    )}
                  </td>
                  <td className="text-sm whitespace-nowrap">
                    {b.delivered_at ? new Date(b.delivered_at).toLocaleDateString() : '—'}
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
