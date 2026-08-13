import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  fetchSessionsForSchool,
  fetchAttendanceForSessions,
  fetchLessonsForSchool,
  fetchAdaptationTypes,
  fetchAdaptationsForSessions,
  createSession,
  saveSessionAdaptations,
} from '../../lib/gql/queries';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';
import type { SessionActivity, YpnStatus } from '../../lib/database.types';
import { CalendarDays, Plus, ArrowRight, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { SkeletonRows } from '../components/Skeletons';

// =============================================================
// /dashboard/school/sessions
//
// The weekly monitoring form (09_Weekly_Monitoring_Form), which is one row
// per delivered — or attempted — activity.
//
// `delivered` is the field that carries the programme model: a session
// recorded as 'partly' or 'no' with a reason is how "where support is needed"
// becomes visible. Before this existed, a club that was held but went badly
// wrote nothing at all and looked identical to one that never happened.
// =============================================================

const ACTIVITY_LABEL: Record<SessionActivity, string> = {
  weekly_code_club: 'Weekly Code Club',
  teacher_support:  'Teacher support',
  bootcamp:         'Bootcamp',
  hackathon:        'Hackathon',
  webinar:          'Webinar',
  other:            'Other',
};

const DELIVERED_LABEL: Record<YpnStatus, string> = {
  yes:    'Delivered',
  partly: 'Partly delivered',
  no:     'Not delivered',
};

const DELIVERED_BADGE: Record<YpnStatus, string> = {
  yes:    'badge-teal',
  partly: 'badge-amber',
  no:     'badge-terra',
};

const DELIVERED_ICON: Record<YpnStatus, typeof CheckCircle> = {
  yes:    CheckCircle,
  partly: AlertCircle,
  no:     XCircle,
};

const TODAY = () => new Date().toISOString().slice(0, 10);

export function SchoolSessions() {
  const { school, profile } = useAuth();
  const schoolId = school?.id ?? null;
  const { notify } = useNotifications();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [activityType, setActivityType] = useState<SessionActivity>('weekly_code_club');
  const [sessionDate, setSessionDate]   = useState(TODAY);
  const [delivered, setDelivered]       = useState<YpnStatus>('yes');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [lessonId, setLessonId]         = useState('');
  const [facilitators, setFacilitators] = useState('');
  const [focus, setFocus]               = useState('');
  const [learnerActivity, setLearnerActivity] = useState('');
  const [evidence, setEvidence]         = useState('');
  const [inclusionSupports, setInclusionSupports] = useState('');
  const [resourcesAdequate, setResourcesAdequate] = useState<YpnStatus | ''>('');
  const [notablePattern, setNotablePattern] = useState('');
  // Which adaptations the session used. The ToC's central Activity is adapting
  // delivery for HI and VI learners; recording it as codes rather than prose is
  // what lets "adapted delivery" be counted.
  const [adaptations, setAdaptations] = useState<string[]>([]);

  const adaptationsQuery = useQuery({
    queryKey: ['adaptation-types'],
    queryFn: fetchAdaptationTypes,
  });

  const sessionsQuery = useQuery({
    queryKey: ['sessions', schoolId],
    queryFn: () => fetchSessionsForSchool(schoolId!),
    enabled: !!schoolId,
  });

  const lessonsQuery = useQuery({
    queryKey: ['lessons', 'school', schoolId],
    queryFn: fetchLessonsForSchool,
    enabled: !!schoolId,
  });

  const sessionIds = useMemo(
    () => (sessionsQuery.data ?? []).map((s) => s.id),
    [sessionsQuery.data],
  );

  // Adaptations across the listed sessions, so the count is visible without
  // opening each one — this is the ToC Output the dashboard could not evidence.
  const adaptationRowsQuery = useQuery({
    queryKey: ['session-adaptations', 'batch', sessionIds],
    queryFn: () => fetchAdaptationsForSessions(sessionIds),
    enabled: sessionIds.length > 0,
  });

  const attendanceQuery = useQuery({
    queryKey: ['session-attendance', 'batch', sessionIds],
    queryFn: () => fetchAttendanceForSessions(sessionIds),
    enabled: sessionIds.length > 0,
  });

  // present / total per session, so the list shows whether a register was
  // actually taken rather than only that a session was logged.
  const counts = useMemo(() => {
    const map = new Map<string, { present: number; total: number }>();
    for (const row of attendanceQuery.data ?? []) {
      const entry = map.get(row.session_id) ?? { present: 0, total: 0 };
      entry.total += 1;
      if (row.present) entry.present += 1;
      map.set(row.session_id, entry);
    }
    return map;
  }, [attendanceQuery.data]);

  const adaptationsBySession = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of adaptationRowsQuery.data ?? []) {
      m.set(r.session_id, (m.get(r.session_id) ?? 0) + 1);
    }
    return m;
  }, [adaptationRowsQuery.data]);

  const adaptedSessions = adaptationsBySession.size;

  function resetForm() {
    setActivityType('weekly_code_club');
    setSessionDate(TODAY());
    setDelivered('yes');
    setDeliveryNote('');
    setLessonId('');
    setFacilitators('');
    setFocus('');
    setLearnerActivity('');
    setEvidence('');
    setInclusionSupports('');
    setResourcesAdequate('');
    setNotablePattern('');
    setAdaptations([]);
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      createSession({
        school_id: schoolId!,
        activity_type: activityType,
        session_date: sessionDate,
        delivered,
        // The DB requires a reason whenever delivery was not full; send null
        // rather than '' so that constraint does the talking.
        delivery_note: delivered === 'yes' ? (deliveryNote.trim() || null) : deliveryNote.trim(),
        lesson_id: lessonId || null,
        facilitators: facilitators.trim() || null,
        focus: focus.trim() || null,
        learner_activity: learnerActivity.trim() || null,
        evidence_observed: evidence.trim() || null,
        inclusion_supports: inclusionSupports.trim() || null,
        resources_adequate: resourcesAdequate || null,
        notable_pattern: notablePattern.trim() || null,
        recorded_by: profile?.id ?? null,
      }).then(async (created) => {
        // Written after the session exists, because the join hangs off its id.
        if (adaptations.length) await saveSessionAdaptations(created.id, adaptations);
        return created;
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', schoolId] });
      notify('success', 'Session recorded', `${ACTIVITY_LABEL[created.activity_type]} on ${created.session_date}.`);
      resetForm();
      setShowForm(false);
    },
    onError: (err: Error) => notify('warning', 'Could not save session', err.message),
  });

  const needsReason = delivered !== 'yes' && deliveryNote.trim() === '';
  const canSave = !!schoolId && !!sessionDate && !needsReason && !saveMutation.isPending;

  const sessions = sessionsQuery.data ?? [];

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-teal-600" aria-hidden="true" />
            Sessions
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            One record per club session or activity — including the ones that could not go ahead.
          </p>
          {sessions.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {adaptedSessions} of {sessions.length} recorded an adaptation.
            </p>
          )}
        </div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {showForm ? 'Cancel' : 'Record a session'}
        </button>
      </div>

      {showForm && (
        <div className="card p-4 mb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="activity">Activity type</label>
              <select
                id="activity"
                className="field-input"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as SessionActivity)}
              >
                {(Object.keys(ACTIVITY_LABEL) as SessionActivity[]).map((k) => (
                  <option key={k} value={k}>{ACTIVITY_LABEL[k]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="date">Session date</label>
              <input
                id="date" type="date" className="field-input"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="delivered">Planned session delivered?</label>
              <select
                id="delivered"
                className="field-input"
                value={delivered}
                onChange={(e) => setDelivered(e.target.value as YpnStatus)}
              >
                <option value="yes">Yes</option>
                <option value="partly">Partly</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="lesson">Lesson covered (optional)</label>
              <select
                id="lesson" className="field-input"
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
              >
                <option value="">— none —</option>
                {(lessonsQuery.data ?? []).map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>

            {delivered !== 'yes' && (
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="reason">
                  What stopped the session going fully ahead? <span className="text-terracotta-600">Required</span>
                </label>
                <textarea
                  id="reason" className="field-input" rows={2}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Brief and factual — this is what triggers support."
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="facilitators">Facilitator(s)</label>
              <input
                id="facilitators" className="field-input"
                value={facilitators}
                onChange={(e) => setFacilitators(e.target.value)}
                placeholder="Names of whoever ran the session"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="focus">What was the activity focus?</label>
              <textarea id="focus" className="field-input" rows={2}
                value={focus} onChange={(e) => setFocus(e.target.value)} />
            </div>

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="did">What did learners do, make or practise?</label>
              <textarea id="did" className="field-input" rows={2}
                value={learnerActivity} onChange={(e) => setLearnerActivity(e.target.value)} />
            </div>

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="evidence">
                Evidence of engagement, collaboration or learning
              </label>
              <textarea id="evidence" className="field-input" rows={2}
                value={evidence} onChange={(e) => setEvidence(e.target.value)} />
            </div>

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="inclusion">Inclusion supports or adaptations used</label>
              <textarea id="inclusion" className="field-input" rows={2}
                value={inclusionSupports} onChange={(e) => setInclusionSupports(e.target.value)} />
            </div>

            <div>
              <label className="field-label" htmlFor="resources">
                Were materials, space, power or connectivity adequate?
              </label>
              <select
                id="resources" className="field-input"
                value={resourcesAdequate}
                onChange={(e) => setResourcesAdequate(e.target.value as YpnStatus | '')}
              >
                <option value="">— not recorded —</option>
                <option value="yes">Yes</option>
                <option value="partly">Partly</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <span className="field-label">Adaptations used</span>
              <p className="text-xs text-gray-500 mb-2">
                How delivery was adapted. This records what the programme did — never a
                learner's condition.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(adaptationsQuery.data ?? []).map((a) => {
                  const on = adaptations.includes(a.code);
                  return (
                    <button
                      key={a.code}
                      type="button"
                      aria-pressed={on}
                      title={a.description ?? undefined}
                      className={on ? 'badge-teal' : 'badge-gray'}
                      onClick={() => setAdaptations((prev) =>
                        on ? prev.filter((c) => c !== a.code) : [...prev, a.code])}
                    >
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="pattern">Notable attendance pattern or barrier</label>
              <input id="pattern" className="field-input"
                value={notablePattern} onChange={(e) => setNotablePattern(e.target.value)} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              className="btn-primary"
              disabled={!canSave}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? 'Saving…' : 'Save session'}
            </button>
            {needsReason && (
              <span className="text-xs text-gray-500">
                A reason is required when a session was not fully delivered.
              </span>
            )}
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="Recorded sessions">
          <thead>
            <tr>
              <th>Date</th>
              <th>Activity</th>
              <th>Delivered</th>
              <th>Lesson</th>
              <th>Register</th>
              <th>Adaptations</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sessionsQuery.isPending ? (
              <SkeletonRows rows={4} cols={7} label="Loading sessions" />
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-sm text-gray-500 py-6 text-center">
                  No sessions recorded yet.
                </td>
              </tr>
            ) : (
              sessions.map((s) => {
                const Icon = DELIVERED_ICON[s.delivered];
                const c = counts.get(s.id);
                return (
                  <tr key={s.id}>
                    <td className="whitespace-nowrap">{s.session_date}</td>
                    <td>{ACTIVITY_LABEL[s.activity_type]}</td>
                    <td>
                      <span className={`${DELIVERED_BADGE[s.delivered]} inline-flex items-center`}>
                        <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
                        {DELIVERED_LABEL[s.delivered]}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">{s.lesson?.title ?? '—'}</td>
                    <td className="text-sm text-gray-600">
                      {c ? `${c.present} of ${c.total} present` : 'not taken'}
                    </td>
                    <td className="text-sm text-gray-600">
                      {adaptationsBySession.get(s.id)
                        ? <span className="badge-teal">{adaptationsBySession.get(s.id)} used</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="text-right">
                      <Link className="btn-secondary !py-1 !text-xs" to={`/dashboard/school/sessions/${s.id}`}>
                        Register
                        <ArrowRight className="h-3 w-3 ml-1" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
