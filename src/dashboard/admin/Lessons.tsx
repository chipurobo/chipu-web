import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllLessonsAdmin, createLesson, updateLesson } from '../../lib/gql/queries';
import { useNotifications } from '../../lib/notifications';
import type { StageKind } from '../../lib/database.types';
import { BookOpen, Plus, GraduationCap, EyeOff, Eye } from 'lucide-react';
import { SkeletonRows } from '../components/Skeletons';

// =============================================================
// /dashboard/admin/lessons
//
// The curriculum. Lessons are authored here once and stand on their own —
// until 20260810000003 a lesson could not exist without belonging to an
// "event", which is what made workshops look like containers of lessons
// rather than training requested against one.
//
// Schools browse this list and request a workshop on a lesson; ChipuRobo
// schedules it from /dashboard/admin/workshops.
// =============================================================

const KIND_LABEL: Record<StageKind, string> = {
  outreach:          'Outreach',
  bootcamp_physical: 'Bootcamp (physical)',
  bootcamp_virtual:  'Bootcamp (virtual)',
  lesson:            'Lesson',
  async_track:       'Self-paced track',
  project:           'Project',
};

export function AdminLessons() {
  const { notify } = useNotifications();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<StageKind>('lesson');
  const [points, setPoints] = useState(1);
  const [required, setRequired] = useState(false);

  const lessonsQuery = useQuery({
    queryKey: ['lessons', 'admin'],
    queryFn: fetchAllLessonsAdmin,
  });

  const createMutation = useMutation({
    mutationFn: () => createLesson({
      title: title.trim(),
      description: description.trim() || null,
      kind,
      points,
      required_for_certificate: required,
      // Appended to the end of the curriculum. event_id is deliberately
      // omitted — a lesson is no longer owned by an event.
      position: (lessonsQuery.data?.length ?? 0) + 1,
      is_active: true,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lessons'] });
      notify('success', 'Lesson added', 'Schools can now request a workshop on it.');
      setTitle(''); setDescription(''); setKind('lesson'); setPoints(1); setRequired(false);
      setCreating(false);
    },
    onError: (err: Error) => notify('warning', 'Could not add lesson', err.message),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateLesson(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons'] }),
    onError: (err: Error) => notify('warning', 'Could not update lesson', err.message),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) createMutation.mutate();
  };

  const lessons = lessonsQuery.data ?? [];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Admin</p>
          <h1>Lessons</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            The curriculum. Every lesson here can have a workshop requested against it by a
            school or teacher, delivered in person or online.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setCreating((v) => !v)}>
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {creating ? 'Cancel' : 'New lesson'}
        </button>
      </div>

      {creating && (
        <form onSubmit={onSubmit} className="card p-4" aria-label="New lesson">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="l-title">Title</label>
              <input id="l-title" className="field-input" value={title}
                onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Intro to Python" />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="l-desc">Description</label>
              <textarea id="l-desc" className="field-input" rows={2} value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this lesson covers, or a link for a self-paced track" />
            </div>
            <div>
              <label className="field-label" htmlFor="l-kind">Kind</label>
              <select id="l-kind" className="field-input" value={kind}
                onChange={(e) => setKind(e.target.value as StageKind)}>
                {(Object.keys(KIND_LABEL) as StageKind[]).map((k) => (
                  <option key={k} value={k}>{KIND_LABEL[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="l-points">Points</label>
              <input id="l-points" type="number" min={0} className="field-input" value={points}
                onChange={(e) => setPoints(Number(e.target.value))} />
            </div>
            <div className="sm:col-span-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={required}
                  onChange={(e) => setRequired(e.target.checked)} />
                <span className="text-sm text-gray-700">Required for certificate</span>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <button className="btn-primary" type="submit"
              disabled={!title.trim() || createMutation.isPending}>
              {createMutation.isPending ? 'Adding…' : 'Add lesson'}
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="Curriculum lessons">
          <thead>
            <tr>
              <th>#</th>
              <th>Lesson</th>
              <th>Kind</th>
              <th>Points</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {lessonsQuery.isPending ? (
              <SkeletonRows rows={4} cols={6} label="Loading lessons" />
            ) : lessons.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-sm text-gray-500 py-6 text-center">
                  No lessons yet. Add the first one above.
                </td>
              </tr>
            ) : (
              lessons.map((l) => (
                <tr key={l.id}>
                  <td className="text-gray-400 text-sm">{l.position}</td>
                  <td className="font-medium text-gray-900">
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                      {l.title}
                    </span>
                    {l.required_for_certificate && (
                      <GraduationCap className="h-3.5 w-3.5 text-amber-500 inline ml-1.5"
                        aria-label="Required for certificate" />
                    )}
                  </td>
                  <td className="text-sm text-gray-600">{KIND_LABEL[l.kind]}</td>
                  <td className="text-sm">{l.points}</td>
                  <td>
                    <span className={l.is_active ? 'badge-teal' : 'badge-gray'}>
                      {l.is_active ? 'active' : 'retired'}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      className="btn-secondary !py-1 !text-xs"
                      disabled={toggleActive.isPending}
                      onClick={() => toggleActive.mutate({ id: l.id, is_active: !l.is_active })}
                    >
                      {l.is_active
                        ? <><EyeOff className="h-3 w-3 mr-1" aria-hidden="true" />Retire</>
                        : <><Eye className="h-3 w-3 mr-1" aria-hidden="true" />Restore</>}
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
