import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createIncident, fetchLessonById, fetchMySchoolIncidentCount } from '../../lib/gql/queries';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';
import { sendEmail } from '../../lib/sendEmail';
import type { IncidentSeverity } from '../../lib/database.types';
import { Send, Lock, Flag, CheckCircle2 } from 'lucide-react';

// =============================================================
// /dashboard/report-concern
//
// Any signed-in learner or educator files a safeguarding concern here. Three
// things about this
// screen are deliberate and easy to "fix" by mistake:
//
//   1. There is no list. Reading incidents is admin-only, including for the
//      person who filed one — a concern may involve a colleague at the same
//      school, so school-scoped visibility would be the wrong default. The
//      School leads see a count of what their school has filed; learners and
//      teachers do not, because even the number can reveal sensitive activity.
//
//   2. The learner is identified by participant code, never by name. The
//      mapping from LRN-000123 to a child stays with the school.
//
//   3. The insert does not ask for the row back. Reading is denied for this
//      user, and a RETURNING clause is subject to the select policy, so
//      requesting a representation makes the whole insert fail.
// =============================================================

const SAFEGUARDING_INBOX = 'chipurobo@gmail.com';

const SEVERITIES: { value: IncidentSeverity; label: string; hint: string }[] = [
  { value: 'low',    label: 'Low',    hint: 'Worth recording; no immediate risk.' },
  { value: 'medium', label: 'Medium', hint: 'Needs looking at soon.' },
  { value: 'high',   label: 'High',   hint: 'A learner may be at risk. Do not wait for this form — call as well.' },
];

const CONCERN_TYPES = [
  { value: 'bullying', label: 'Bullying' },
  { value: 'inappropriate behaviour', label: 'Inappropriate behaviour' },
  { value: 'unsafe content', label: 'Unsafe content' },
  { value: 'online interaction', label: 'Online interaction' },
  { value: 'something else', label: 'Something else' },
] as const;

// PostgreSQL accepts canonical UUIDs beyond the RFC version/variant patterns,
// including historical/imported identifiers, so validate the shape here and
// let the database perform the authoritative type check.
const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export function ReportIncident() {
  const { school, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const schoolId = school?.id ?? null;
  const { notify } = useNotifications();
  const queryClient = useQueryClient();
  const isLearner = profile?.role === 'learner';
  const maySeeCount = profile?.role === 'school_lead' || profile?.role === 'admin';
  const lessonIdParam = searchParams.get('lessonId');
  const lessonId = lessonIdParam && UUID.test(lessonIdParam) ? lessonIdParam : null;

  const [category,    setCategory]    = useState('');
  const [learnerCode, setLearnerCode] = useState('');
  const [occurredOn,  setOccurredOn]  = useState(() => new Date().toISOString().slice(0, 10));
  const [severity,    setSeverity]    = useState<IncidentSeverity>('medium');
  const [description, setDescription] = useState('');
  const [submitted,   setSubmitted]   = useState(false);

  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => fetchLessonById(lessonId!),
    enabled: !!lessonId,
  });

  const { data: filedCount } = useQuery({
    queryKey: ['incident-count', schoolId],
    queryFn: fetchMySchoolIncidentCount,
    enabled: !!schoolId && maySeeCount,
  });

  const codeLooksWrong =
    learnerCode.trim() !== '' && !/^LRN-\d{6}$/.test(learnerCode.trim());
  const canSubmit =
    !!schoolId && !!profile?.id && !!category
    && !codeLooksWrong;

  const submit = useMutation({
    mutationFn: async () => {
      const context = [
        `Concern type: ${category}`,
        lesson ? `Lesson: ${lesson.title} (${lesson.id})` : null,
        '',
        description.trim() || 'No extra details supplied.',
      ].filter((line) => line !== null).join('\n');
      await createIncident({
        school_id:    schoolId!,
        reported_by:  profile!.id,
        learner_code: isLearner || learnerCode.trim() === '' ? null : learnerCode.trim(),
        occurred_on:  occurredOn,
        severity:      isLearner ? 'medium' : severity,
        description:   context,
      });

      // Best effort. The report is already saved; failing to send the alert
      // must not tell the reporter their report did not go through.
      const alert = await sendEmail({
        to: SAFEGUARDING_INBOX,
        subject: `Safeguarding report — ${school?.name ?? 'a school'} (${severity})`,
        text:
          `A safeguarding report has been filed.\n\n` +
          `School:   ${school?.name ?? schoolId}\n` +
          `Type:     ${category}\n` +
          `Severity: ${isLearner ? 'medium' : severity}\n` +
          `Occurred: ${occurredOn}\n` +
          `Lesson:   ${lesson?.title ?? 'not linked'}\n` +
          `Learner:  ${isLearner ? 'reporter account' : learnerCode.trim() || 'not specified'}\n\n` +
          `Open the dashboard to read it. The detail is deliberately not in this email.`,
      });
      return alert.ok;
    },
    onSuccess: (alerted) => {
      setLearnerCode(''); setDescription(''); setSeverity('medium'); setCategory('');
      setOccurredOn(new Date().toISOString().slice(0, 10));
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['incident-count', schoolId] });
      notify(
        alerted ? 'success' : 'warning',
        'Report filed',
        alerted
          ? 'The safeguarding lead has been notified.'
          : 'The email alert did not send, but your report is saved.',
      );
    },
    onError: (e: Error) => notify('warning', 'Could not file report', e.message),
  });

  return (
    <div className={`mx-auto max-w-4xl space-y-5 ${isLearner ? 'learner-zone' : ''}`}>
      <header className="rounded-2xl border border-terracotta-200 bg-gradient-to-br from-terracotta-50 to-white p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-terracotta-100 text-terracotta-700">
            <Flag className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
              {isLearner ? 'Tell us if something feels wrong' : 'Report a concern'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-700">
              {isLearner
                ? 'You can tell us about something that happened to you or someone else. You will not be in trouble for asking for help.'
                : 'Tell ChipuRobo’s safeguarding lead about something that may be unsafe or harmful.'}
            </p>
          </div>
        </div>
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
          If someone is in danger right now, tell a trusted adult nearby or contact the authorities first.
        </p>
      </header>

      <div className="card flex items-start gap-3 border-teal-200 bg-teal-50 p-4">
        <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-700" aria-hidden="true" />
        <p className="text-sm text-gray-700 m-0">
          <strong>Your report is private.</strong> Only ChipuRobo&rsquo;s safeguarding team can read it.
          You and other people at your school cannot open it after it is sent.
          {maySeeCount && <> Your school has filed <strong>{filedCount ?? 0}</strong> report{filedCount === 1 ? '' : 's'}.</>}
        </p>
      </div>

      {lesson && (
        <div className="card border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
          <strong>Reporting from lesson:</strong> {lesson.title}
        </div>
      )}

      {submitted && (
        <div role="status" className="card border-emerald-300 bg-emerald-50 p-5 text-emerald-950">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold">Your report has been sent</h2>
              <p className="mt-1 text-sm">Thank you for speaking up. The safeguarding team will look at it.</p>
            </div>
          </div>
        </div>
      )}

      <form
        className="card space-y-6 p-5 sm:p-7"
        aria-label="Safeguarding concern form"
        onSubmit={(e) => { e.preventDefault(); if (canSubmit) submit.mutate(); }}
      >
        <fieldset aria-describedby="concern-type-help">
          <legend className="field-label !text-sm">What are you worried about?</legend>
          <p id="concern-type-help" className="mb-3 text-xs text-gray-600">
            Choose the closest one. It is okay if you are not sure.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CONCERN_TYPES.map((type) => (
              <label
                key={type.value}
                className={isLearner ? 'choice-tile' : `flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  category === type.value
                    ? 'border-terracotta-500 bg-terracotta-50 text-gray-950 ring-2 ring-terracotta-100'
                    : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="concern-type"
                  value={type.value}
                  checked={category === type.value}
                  required
                  onChange={() => { setCategory(type.value); setSubmitted(false); }}
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="description" className="field-label !text-sm">Tell us more <span className="font-normal text-gray-500">(optional)</span></label>
          <textarea
            id="description" className="field-input min-h-[7rem] resize-y" rows={3} value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isLearner ? 'You can leave this blank if you do not know what to write.' : 'Add anything that would help us understand. Avoid learners’ names.'}
            onFocus={() => setSubmitted(false)}
          />
        </div>

        {!isLearner && (
          <details className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-gray-800">Add details (optional)</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="learner-code" className="field-label !text-sm">Learner code</label>
                <input
                  id="learner-code"
                  className="field-input font-mono"
                  placeholder="LRN-000123"
                  value={learnerCode}
                  onChange={(e) => setLearnerCode(e.target.value.toUpperCase())}
                  aria-describedby={codeLooksWrong ? 'learner-code-help learner-code-error' : 'learner-code-help'}
                  aria-invalid={codeLooksWrong}
                />
                <p id="learner-code-help" className="mt-1 text-xs text-gray-500">Use a participant code, never a learner&rsquo;s name.</p>
                {codeLooksWrong && <p id="learner-code-error" role="alert" className="mt-1 text-xs text-terracotta-700">Use a code like LRN-000123.</p>}
              </div>
              <div>
                <label htmlFor="occurred-on" className="field-label !text-sm">Date</label>
                <input id="occurred-on" type="date" className="field-input" max={new Date().toISOString().slice(0, 10)} value={occurredOn} onChange={(e) => setOccurredOn(e.target.value)} />
              </div>
              <div>
                <label htmlFor="severity" className="field-label !text-sm">Urgency</label>
                <select id="severity" className="field-input" value={severity} aria-describedby="severity-help" onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}>
                  {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <p id="severity-help" className="mt-1 text-xs text-gray-500">{SEVERITIES.find((s) => s.value === severity)?.hint}</p>
              </div>
            </div>
          </details>
        )}

        <button type="submit" className="btn-primary gap-2 !bg-terracotta-600 hover:!bg-terracotta-700" disabled={!canSubmit || submit.isPending}>
          <Send className="h-4 w-4" aria-hidden="true" />
          {submit.isPending ? 'Sending…' : isLearner ? 'Send my report' : 'Send report'}
        </button>
      </form>
    </div>
  );
}
