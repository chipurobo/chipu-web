import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createIncident, fetchMySchoolIncidentCount } from '../../lib/gql/queries';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';
import { sendEmail } from '../../lib/sendEmail';
import type { IncidentSeverity } from '../../lib/database.types';
import { ShieldAlert, Send, Lock } from 'lucide-react';

// =============================================================
// /dashboard/school/report-incident
//
// A school lead files a safeguarding concern here. Three things about this
// screen are deliberate and easy to "fix" by mistake:
//
//   1. There is no list. Reading incidents is admin-only, including for the
//      person who filed one — a concern may involve a colleague at the same
//      school, so school-scoped visibility would be the wrong default. The
//      lead sees a count of what their school has filed, and nothing else.
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

const MIN_DESCRIPTION = 20;

export function ReportIncident() {
  const { school, profile } = useAuth();
  const schoolId = school?.id ?? null;
  const { notify } = useNotifications();
  const queryClient = useQueryClient();

  const [learnerCode, setLearnerCode] = useState('');
  const [occurredOn,  setOccurredOn]  = useState(() => new Date().toISOString().slice(0, 10));
  const [severity,    setSeverity]    = useState<IncidentSeverity>('medium');
  const [description, setDescription] = useState('');

  const { data: filedCount } = useQuery({
    queryKey: ['incident-count', schoolId],
    queryFn: fetchMySchoolIncidentCount,
    enabled: !!schoolId,
  });

  const codeLooksWrong =
    learnerCode.trim() !== '' && !/^LRN-\d{6}$/.test(learnerCode.trim());
  const tooShort = description.trim().length > 0 && description.trim().length < MIN_DESCRIPTION;
  const canSubmit =
    !!schoolId && !!profile?.id && description.trim().length >= MIN_DESCRIPTION && !codeLooksWrong;

  const submit = useMutation({
    mutationFn: async () => {
      await createIncident({
        school_id:    schoolId!,
        reported_by:  profile!.id,
        learner_code: learnerCode.trim() === '' ? null : learnerCode.trim(),
        occurred_on:  occurredOn,
        severity,
        description:  description.trim(),
      });

      // Best effort. The report is already saved; failing to send the alert
      // must not tell the reporter their report did not go through.
      const alert = await sendEmail({
        to: SAFEGUARDING_INBOX,
        subject: `Safeguarding report — ${school?.name ?? 'a school'} (${severity})`,
        text:
          `A safeguarding report has been filed.\n\n` +
          `School:   ${school?.name ?? schoolId}\n` +
          `Severity: ${severity}\n` +
          `Occurred: ${occurredOn}\n` +
          `Learner:  ${learnerCode.trim() || 'not specified'}\n\n` +
          `Open the dashboard to read it. The detail is deliberately not in this email.`,
      });
      return alert.ok;
    },
    onSuccess: (alerted) => {
      setLearnerCode(''); setDescription(''); setSeverity('medium');
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
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-2xl text-gray-900 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-terracotta-600" aria-hidden="true" />
          Report a concern
        </h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          For safeguarding concerns about a learner or the running of your club. This goes
          straight to ChipuRobo&rsquo;s safeguarding lead.{' '}
          <strong>If a learner is in immediate danger, contact the authorities first.</strong>
        </p>
      </div>

      <div className="card p-4 bg-warm-50 border-warm-200 flex items-start gap-3">
        <Lock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm text-gray-700 m-0">
          Once filed, a report can only be read by ChipuRobo&rsquo;s safeguarding lead — not by
          you, and not by anyone else at your school. That is deliberate: a concern may involve
          a colleague. Your school has filed{' '}
          <strong>{filedCount ?? 0}</strong> report{filedCount === 1 ? '' : 's'}.
        </p>
      </div>

      <form
        className="card p-6 space-y-5 max-w-2xl"
        onSubmit={(e) => { e.preventDefault(); if (canSubmit) submit.mutate(); }}
      >
        <div>
          <label htmlFor="learner-code" className="label">Learner code (optional)</label>
          <input
            id="learner-code"
            className="input font-mono"
            placeholder="LRN-000123"
            value={learnerCode}
            onChange={(e) => setLearnerCode(e.target.value.toUpperCase())}
            aria-describedby="learner-code-help"
          />
          <p id="learner-code-help" className="text-xs text-gray-500 mt-1">
            The learner&rsquo;s participant code, never their name. Leave blank if no single
            learner is involved. You can find codes on your Students page.
          </p>
          {codeLooksWrong && (
            <p className="text-xs text-terracotta-700 mt-1">
              That is not a participant code. It should look like LRN-000123.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="occurred-on" className="label">When did it happen?</label>
            <input
              id="occurred-on" type="date" className="input"
              max={new Date().toISOString().slice(0, 10)}
              value={occurredOn}
              onChange={(e) => setOccurredOn(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="severity" className="label">How urgent is it?</label>
            <select
              id="severity" className="input" value={severity}
              onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
            >
              {SEVERITIES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {SEVERITIES.find((s) => s.value === severity)?.hint}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="label">What happened?</label>
          <textarea
            id="description" className="input min-h-[9rem]" value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What you saw or were told, when, and who else was present. Use participant codes rather than names."
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.trim().length < MIN_DESCRIPTION
              ? `At least ${MIN_DESCRIPTION} characters — ${MIN_DESCRIPTION - description.trim().length} to go.`
              : 'Please avoid learners’ names. Use their participant code.'}
          </p>
          {tooShort && <p className="sr-only">Description is too short.</p>}
        </div>

        <button type="submit" className="btn-cta" disabled={!canSubmit || submit.isPending}>
          <Send className="mr-2 h-4 w-4" aria-hidden="true" />
          {submit.isPending ? 'Filing…' : 'File report'}
        </button>
      </form>
    </div>
  );
}
