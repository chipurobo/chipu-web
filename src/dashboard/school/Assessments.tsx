import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchInstruments, fetchActiveInstrumentVersion, fetchResponsesForSchool,
  createResponse, fetchMembersBySchool, fetchTeachersAtSchool,
} from '../../lib/gql/queries';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';
import type { Instrument, InstrumentRound, AssessorMode } from '../../lib/database.types';
import { ClipboardCheck, ArrowRight, FileText } from 'lucide-react';
import { SkeletonRows } from '../components/Skeletons';

// =============================================================
// /dashboard/school/assessments
//
// Entry point for the MERL questionnaires. Starting one creates a draft
// response against the instrument's ACTIVE version and hands off to the
// generic renderer.
//
// Consent is captured before the form opens, not buried inside it: the MERL
// Plan requires an approved consent/assent process "particularly for minors",
// and a form you can fill in first and consent to afterwards is not that.
// =============================================================

const ROUND_LABEL: Record<InstrumentRound, string> = {
  baseline: 'Baseline',
  endline:  'Endline',
  adhoc:    'Ad hoc',
};

// The round each instrument is normally collected at. The picker still allows
// any value — an endline instrument can be re-run, and a baseline tool may be
// used mid-cycle for a school that joins late.
function defaultRound(slug: string): InstrumentRound {
  if (slug.endsWith('-baseline')) return 'baseline';
  if (slug === 'endline') return 'endline';
  return 'adhoc';
}

export function SchoolAssessments() {
  const { school, profile } = useAuth();
  const schoolId = school?.id ?? null;
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [starting, setStarting] = useState<Instrument | null>(null);

  const instrumentsQuery = useQuery({
    queryKey: ['instruments'],
    queryFn: fetchInstruments,
  });

  const responsesQuery = useQuery({
    queryKey: ['responses', schoolId],
    queryFn: () => fetchResponsesForSchool(schoolId!),
    enabled: !!schoolId,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <ClipboardCheck className="h-6 w-6 text-teal-600" aria-hidden="true" />
        Assessments
      </h1>
      <p className="text-sm text-gray-600 mt-1 mb-6">
        Baseline, endline and feedback tools. Answers are stored against the form version
        they were collected on, so later edits to a form never rewrite past responses.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {(instrumentsQuery.data ?? []).map((inst) => (
          <div key={inst.id} className="card p-4 flex flex-col">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-600" aria-hidden="true" />
              {inst.title}
            </h2>
            {inst.subtitle && <p className="text-xs text-gray-500 mt-1">{inst.subtitle}</p>}
            <span className="badge-gray mt-2 self-start">{inst.subject_type}</span>
            <button className="btn-secondary !py-1 !text-xs mt-3 self-start" onClick={() => setStarting(inst)}>
              Start
              <ArrowRight className="h-3 w-3 ml-1" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {starting && schoolId && (
        <StartDialog
          instrument={starting}
          schoolId={schoolId}
          collectedBy={profile?.id ?? null}
          onCancel={() => setStarting(null)}
          onStarted={(responseId) => {
            queryClient.invalidateQueries({ queryKey: ['responses', schoolId] });
            notify('success', 'Draft created', 'Fill it in and submit when complete.');
            setStarting(null);
            navigate(`/dashboard/school/assessments/${responseId}`);
          }}
        />
      )}

      <h2 className="text-sm font-semibold text-gray-700 mb-2">Collected responses</h2>
      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="Collected responses">
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Round</th>
              <th>Collected</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {responsesQuery.isPending ? (
              <SkeletonRows rows={4} cols={5} label="Loading responses" />
            ) : (responsesQuery.data ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="text-sm text-gray-500 py-6 text-center">
                  Nothing collected yet.
                </td>
              </tr>
            ) : (
              (responsesQuery.data ?? []).map((r) => (
                <tr key={r.id}>
                  <td className="font-medium text-gray-900">
                    {r.version?.instruments?.title ?? '—'}
                  </td>
                  <td>{ROUND_LABEL[r.round]}</td>
                  <td className="whitespace-nowrap">{r.collected_at}</td>
                  <td>
                    <span className={r.status === 'submitted' ? 'badge-teal' : 'badge-amber'}>
                      {r.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link className="btn-secondary !py-1 !text-xs" to={`/dashboard/school/assessments/${r.id}`}>
                      {r.status === 'submitted' ? 'View' : 'Continue'}
                    </Link>
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

function StartDialog({
  instrument, schoolId, collectedBy, onCancel, onStarted,
}: {
  instrument: Instrument;
  schoolId: string;
  collectedBy: string | null;
  onCancel: () => void;
  onStarted: (responseId: string) => void;
}) {
  const { notify } = useNotifications();
  const [round, setRound] = useState<InstrumentRound>(defaultRound(instrument.slug));
  const [mode, setMode] = useState<AssessorMode>('assessor');
  const [consent, setConsent] = useState(false);
  const [subjectId, setSubjectId] = useState('');

  const needsLearner = instrument.subject_type === 'learner';
  const needsTeacher = instrument.subject_type === 'teacher';

  const learnersQuery = useQuery({
    queryKey: ['members', schoolId],
    queryFn: () => fetchMembersBySchool(schoolId),
    enabled: needsLearner,
  });

  const teachersQuery = useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: () => fetchTeachersAtSchool(schoolId),
    enabled: needsTeacher,
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const version = await fetchActiveInstrumentVersion(instrument.slug);
      const created = await createResponse({
        version_id: version.id,
        school_id: schoolId,
        learner_id: needsLearner ? (subjectId || null) : null,
        teacher_id: needsTeacher ? (subjectId || null) : null,
        round,
        assessor_mode: mode,
        consent_confirmed: consent,
        collected_by: collectedBy,
      });
      return created.id;
    },
    onSuccess: onStarted,
    onError: (err: Error) => notify('warning', 'Could not start', err.message),
  });

  const subjectMissing = (needsLearner || needsTeacher) && !subjectId;

  return (
    <div className="card p-4 mb-8 border-teal-200">
      <h3 className="font-semibold text-gray-900">Start: {instrument.title}</h3>

      <div className="grid gap-4 sm:grid-cols-2 mt-3">
        <div>
          <label className="field-label" htmlFor="round">Round</label>
          <select id="round" className="field-input" value={round}
            onChange={(e) => setRound(e.target.value as InstrumentRound)}>
            {(Object.keys(ROUND_LABEL) as InstrumentRound[]).map((r) => (
              <option key={r} value={r}>{ROUND_LABEL[r]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="mode">Administration</label>
          <select id="mode" className="field-input" value={mode}
            onChange={(e) => setMode(e.target.value as AssessorMode)}>
            <option value="assessor">Assessor-administered</option>
            <option value="self">Self-administered</option>
          </select>
        </div>

        {needsLearner && (
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="subject">Learner</label>
            <select id="subject" className="field-input" value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">— choose —</option>
              {(learnersQuery.data ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.full_name}{l.learner_code ? ` · ${l.learner_code}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {needsTeacher && (
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="subject">Teacher</label>
            <select id="subject" className="field-input" value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">— choose —</option>
              {(teachersQuery.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name ?? '—'}{t.teacher_code ? ` · ${t.teacher_code}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="inline-flex items-start gap-2 cursor-pointer">
            <input type="checkbox" className="mt-1" checked={consent}
              onChange={(e) => setConsent(e.target.checked)} />
            <span className="text-sm text-gray-700">
              Approved consent {instrument.subject_type === 'learner' ? 'and learner assent have' : 'has'} been
              obtained for this respondent.
            </span>
          </label>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          className="btn-primary"
          disabled={!consent || subjectMissing || startMutation.isPending}
          onClick={() => startMutation.mutate()}
        >
          {startMutation.isPending ? 'Starting…' : 'Create draft'}
        </button>
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        {!consent && (
          <span className="text-xs text-gray-500">Consent must be confirmed before collection begins.</span>
        )}
      </div>
    </div>
  );
}
