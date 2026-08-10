import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchWorkshopsForSchool, fetchCurriculumLessons, requestWorkshop, updateWorkshop,
} from '../../lib/gql/queries';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';
import type { WorkshopMode, WorkshopStatus } from '../../lib/database.types';
import { Presentation, Plus, MapPin, MonitorPlay, Clock } from 'lucide-react';
import { SkeletonRows } from '../components/Skeletons';

// =============================================================
// /dashboard/school/workshops
//
// A school's own training requests. Pick a lesson from the curriculum, say
// whether you want it in person or online, and ChipuRobo schedules it.
//
// The school can create a request and cancel its own, but cannot schedule or
// mark one delivered — a database trigger enforces that, so the restriction
// holds even if a request is made outside this UI.
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

export function SchoolWorkshops() {
  const { school, profile } = useAuth();
  const schoolId = school?.id ?? null;
  const { notify } = useNotifications();
  const qc = useQueryClient();

  const [requesting, setRequesting] = useState(false);
  const [lessonId, setLessonId] = useState('');
  const [mode, setMode] = useState<WorkshopMode>('physical');
  const [note, setNote] = useState('');

  const workshopsQuery = useQuery({
    queryKey: ['workshops', schoolId],
    queryFn: () => fetchWorkshopsForSchool(schoolId!),
    enabled: !!schoolId,
  });

  const lessonsQuery = useQuery({
    queryKey: ['lessons', 'curriculum'],
    queryFn: fetchCurriculumLessons,
  });

  const selectedLesson = useMemo(
    () => (lessonsQuery.data ?? []).find((l) => l.id === lessonId) ?? null,
    [lessonsQuery.data, lessonId],
  );

  const requestMutation = useMutation({
    mutationFn: () => requestWorkshop({
      lesson_id: lessonId,
      school_id: schoolId!,
      requested_by: profile?.id ?? null,
      mode,
      request_note: note.trim() || null,
      title: selectedLesson?.title ?? null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workshops'] });
      notify('success', 'Workshop requested', 'ChipuRobo will confirm a date with you.');
      setLessonId(''); setNote(''); setMode('physical'); setRequesting(false);
    },
    onError: (err: Error) => notify('warning', 'Could not send request', err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateWorkshop(id, { status: 'cancelled' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workshops'] }),
    onError: (err: Error) => notify('warning', 'Could not cancel', err.message),
  });

  const rows = workshopsQuery.data ?? [];

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Presentation className="h-6 w-6 text-teal-600" aria-hidden="true" />
            Workshops
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Request training on any lesson in the curriculum — in person at your school, or online.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setRequesting((v) => !v)}>
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {requesting ? 'Cancel' : 'Request a workshop'}
        </button>
      </div>

      {requesting && (
        <div className="card p-4 mb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="w-lesson">Lesson</label>
              <select id="w-lesson" className="field-input" value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}>
                <option value="">— choose a lesson —</option>
                {(lessonsQuery.data ?? []).map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="w-mode">How should it be delivered?</label>
              <select id="w-mode" className="field-input" value={mode}
                onChange={(e) => setMode(e.target.value as WorkshopMode)}>
                <option value="physical">In person, at our school</option>
                <option value="virtual">Online</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="w-note">Anything ChipuRobo should know?</label>
              <textarea id="w-note" className="field-input" rows={2} value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Preferred dates, number of teachers, access needs…" />
            </div>
          </div>
          <div className="mt-4">
            <button className="btn-primary" disabled={!lessonId || requestMutation.isPending}
              onClick={() => requestMutation.mutate()}>
              {requestMutation.isPending ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="Our workshop requests">
          <thead>
            <tr>
              <th>Lesson</th>
              <th>Mode</th>
              <th>Status</th>
              <th>When</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {workshopsQuery.isPending ? (
              <SkeletonRows rows={3} cols={5} label="Loading workshops" />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-sm text-gray-500 py-6 text-center">
                  No workshops yet. Request one above.
                </td>
              </tr>
            ) : (
              rows.map((w) => (
                <tr key={w.id}>
                  <td className="font-medium text-gray-900">
                    {w.lesson?.title ?? (
                      <span className="text-gray-400 italic">{w.title ?? '—'}</span>
                    )}
                  </td>
                  <td>
                    <span className="badge-gray inline-flex items-center">
                      {w.mode === 'physical'
                        ? <><MapPin className="h-3 w-3 mr-1" aria-hidden="true" />In person</>
                        : <><MonitorPlay className="h-3 w-3 mr-1" aria-hidden="true" />Online</>}
                    </span>
                  </td>
                  <td>
                    <span className={STATUS_BADGE[w.status]}>{STATUS_LABEL[w.status]}</span>
                    {w.status === 'declined' && w.decline_reason && (
                      <p className="text-xs text-gray-500 mt-1">{w.decline_reason}</p>
                    )}
                  </td>
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
                  <td className="text-right">
                    {(w.status === 'requested' || w.status === 'scheduled') && (
                      <button
                        className="btn-secondary !py-1 !text-xs"
                        disabled={cancelMutation.isPending}
                        onClick={() => cancelMutation.mutate(w.id)}
                      >
                        Cancel
                      </button>
                    )}
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
