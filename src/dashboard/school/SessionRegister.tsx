import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  fetchSession,
  fetchSessionAttendance,
  fetchMembersBySchool,
  fetchTeachersAtSchool,
  saveSessionAttendance,
} from '../../lib/gql/queries';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';
import { ArrowLeft, Save, Users, GraduationCap } from 'lucide-react';
import { SkeletonRows } from '../components/Skeletons';

// =============================================================
// /dashboard/school/sessions/:sessionId
//
// The attendance register (10_Attendance_Registers). Two things here are not
// cosmetic:
//
//   • Absence is recorded explicitly. The paper register is a P/A tick, and
//     absence is the signal the continuity indicator is built on — so a blank
//     row means "not marked", not "absent".
//   • Teachers appear on the register alongside learners. Attendance used to
//     be learner-only at the database level, which made teacher participation
//     in their own training impossible to record.
//
// Only rows the facilitator actually touched are sent, matching the lesson
// roster's pattern — a register filled in a club room on a weak connection
// should not have to resend the whole class.
// =============================================================

type Mark = { present: boolean | null; supportNote: string };
const keyFor = (kind: 'l' | 't', id: string) => `${kind}:${id}`;

export function SessionRegister() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { school } = useAuth();
  const schoolId = school?.id ?? null;
  const { notify } = useNotifications();
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => fetchSession(sessionId!),
    enabled: !!sessionId,
  });

  const learnersQuery = useQuery({
    queryKey: ['members', schoolId],
    queryFn: () => fetchMembersBySchool(schoolId!),
    enabled: !!schoolId,
  });

  const teachersQuery = useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: () => fetchTeachersAtSchool(schoolId!),
    enabled: !!schoolId,
  });

  const attendanceQuery = useQuery({
    queryKey: ['session-attendance', sessionId],
    queryFn: () => fetchSessionAttendance(sessionId!),
    enabled: !!sessionId,
  });

  const [edits, setEdits] = useState<Map<string, Mark>>(new Map());

  // Saved state, keyed the same way the edit map is.
  const saved = useMemo(() => {
    const map = new Map<string, Mark>();
    for (const row of attendanceQuery.data ?? []) {
      const k = row.learner_id ? keyFor('l', row.learner_id)
              : row.teacher_id ? keyFor('t', row.teacher_id)
              : null;
      if (k) map.set(k, { present: row.present, supportNote: row.support_note ?? '' });
    }
    return map;
  }, [attendanceQuery.data]);

  // Drop local edits whenever the source data changes, so a save that
  // invalidates the query does not leave stale ticks behind.
  useEffect(() => { setEdits(new Map()); }, [attendanceQuery.data]);

  function markOf(k: string): Mark {
    return edits.get(k) ?? saved.get(k) ?? { present: null, supportNote: '' };
  }

  function setMark(k: string, patch: Partial<Mark>) {
    setEdits((prev) => {
      const next = new Map(prev);
      next.set(k, { ...markOf(k), ...patch });
      return next;
    });
  }

  const dirtyKeys = useMemo(() => {
    const out: string[] = [];
    for (const [k, v] of edits) {
      const before = saved.get(k) ?? { present: null, supportNote: '' };
      if (v.present !== before.present || v.supportNote.trim() !== (before.supportNote ?? '').trim()) {
        out.push(k);
      }
    }
    return out;
  }, [edits, saved]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const rows = dirtyKeys
        // A row still on "not marked" has nothing to record; present is NOT NULL.
        .filter((k) => markOf(k).present !== null)
        .map((k) => {
          const [kind, id] = k.split(':');
          const m = markOf(k);
          return {
            session_id: sessionId!,
            learner_id: kind === 'l' ? id : null,
            teacher_id: kind === 't' ? id : null,
            present: m.present as boolean,
            support_note: m.supportNote.trim() || null,
          };
        });
      await saveSessionAttendance(rows);
      return rows.length;
    },
    onSuccess: (n) => {
      queryClient.invalidateQueries({ queryKey: ['session-attendance', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['session-attendance', 'batch'] });
      notify('success', 'Register saved', `${n} row${n === 1 ? '' : 's'} updated.`);
    },
    onError: (err: Error) => notify('warning', 'Could not save register', err.message),
  });

  const learners = learnersQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];

  const tally = useMemo(() => {
    let present = 0, absent = 0;
    for (const list of [learners.map((l) => keyFor('l', l.id)), teachers.map((t) => keyFor('t', t.id))]) {
      for (const k of list) {
        const m = markOf(k);
        if (m.present === true) present += 1;
        else if (m.present === false) absent += 1;
      }
    }
    return { present, absent };
    // markOf closes over edits + saved, both of which are in the dep list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learners, teachers, edits, saved]);

  return (
    <div>
      <Link to="/dashboard/school/sessions" className="btn-secondary !py-1 !text-xs mb-4 inline-flex">
        <ArrowLeft className="h-3 w-3 mr-1" aria-hidden="true" />
        Back to sessions
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">Attendance register</h1>
      <p className="text-sm text-gray-600 mt-1 mb-6">
        {sessionQuery.data
          ? <>Session on {sessionQuery.data.session_date}{sessionQuery.data.lesson ? ` · ${sessionQuery.data.lesson.title}` : ''}</>
          : 'Loading session…'}
        {' · '}
        <span className="text-gray-500">{tally.present} present, {tally.absent} absent</span>
      </p>

      <RegisterTable
        title="Learners"
        icon={Users}
        rows={learners.map((l) => ({ id: l.id, name: l.full_name, code: l.learner_code, kind: 'l' as const }))}
        loading={learnersQuery.isPending}
        markOf={markOf}
        setMark={setMark}
      />

      <RegisterTable
        title="Teachers and facilitators"
        icon={GraduationCap}
        rows={teachers.map((t) => ({ id: t.id, name: t.full_name ?? '—', code: t.teacher_code, kind: 't' as const }))}
        loading={teachersQuery.isPending}
        markOf={markOf}
        setMark={setMark}
        emptyHint="No school-lead accounts at this school yet."
      />

      <div className="mt-6 flex items-center gap-3">
        <button
          className="btn-primary"
          disabled={dirtyKeys.length === 0 || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {saveMutation.isPending ? 'Saving…' : 'Save register'}
        </button>
        <span className="text-xs text-gray-500">
          {dirtyKeys.length === 0 ? 'No changes to save.' : `${dirtyKeys.length} change${dirtyKeys.length === 1 ? '' : 's'} pending.`}
        </span>
      </div>
    </div>
  );
}

function RegisterTable({
  title, icon: Icon, rows, loading, markOf, setMark, emptyHint,
}: {
  title: string;
  icon: typeof Users;
  rows: Array<{ id: string; name: string; code: string | null; kind: 'l' | 't' }>;
  loading: boolean;
  markOf: (k: string) => Mark;
  setMark: (k: string, patch: Partial<Mark>) => void;
  emptyHint?: string;
}) {
  return (
    <section className="mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-teal-600" aria-hidden="true" />
        {title}
      </h2>
      <div className="card overflow-x-auto">
        <table className="data-table" aria-label={`${title} attendance`}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Present / absent</th>
              <th>Participation support (optional)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows rows={4} cols={4} label={`Loading ${title}`} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-sm text-gray-500 py-6 text-center">
                  {emptyHint ?? 'Nobody to show.'}
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const k = `${r.kind}:${r.id}`;
                const m = markOf(k);
                return (
                  <tr key={k}>
                    <td className="font-medium text-gray-900">{r.name}</td>
                    {/* The code is what leaves the platform in reports; the name
                        stays here, where the school already knows the person. */}
                    <td className="text-xs font-mono text-gray-500">{r.code ?? '—'}</td>
                    <td>
                      <div className="inline-flex gap-1" role="group" aria-label={`Attendance for ${r.name}`}>
                        <button
                          type="button"
                          aria-pressed={m.present === true}
                          className={m.present === true ? 'badge-teal' : 'badge-gray'}
                          onClick={() => setMark(k, { present: m.present === true ? null : true })}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          aria-pressed={m.present === false}
                          className={m.present === false ? 'badge-terra' : 'badge-gray'}
                          onClick={() => setMark(k, { present: m.present === false ? null : false })}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        className="field-input !py-1 !text-xs"
                        value={m.supportNote}
                        onChange={(e) => setMark(k, { supportNote: e.target.value })}
                        placeholder="Agreed accommodation only"
                        aria-label={`Participation support note for ${r.name}`}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
