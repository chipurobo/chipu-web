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

const MIN_DESCRIPTION = 20;

const CONCERN_TYPES = [
  { value: 'bullying', label: 'Bullying', hint: 'Someone is being hurt, threatened, left out or picked on.' },
  { value: 'inappropriate behaviour', label: 'Inappropriate behaviour', hint: 'Someone behaved in a way that felt wrong or uncomfortable.' },
  { value: 'unsafe content', label: 'Unsafe content', hint: 'You saw a picture, video, message or lesson that felt unsafe.' },
  { value: 'online interaction', label: 'Online interaction', hint: 'Something worrying happened in a chat, game, call or online space.' },
  { value: 'something else', label: 'Something else', hint: 'Choose this if you are not sure. You can still tell us.' },
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
  const tooShort = description.trim().length > 0 && description.trim().length < MIN_DESCRIPTION;
  const canSubmit =
    !!schoolId && !!profile?.id && !!category
    && description.trim().length >= MIN_DESCRIPTION && !codeLooksWrong;

  const submit = useMutation({
    mutationFn: async () => {
      const context = [
        `Concern type: ${category}`,
        lesson ? `Lesson: ${lesson.title} (${lesson.id})` : null,
        '',
        description.trim(),
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
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-2xl text-gray-900 flex items-center gap-2">
          <Flag className="h-6 w-6 text-terracotta-600" aria-hidden="true" />
          {isLearner ? 'Tell us if something feels wrong' : 'Report a concern'}
        </h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          {isLearner
            ? 'You can tell us about something that happened to you or someone else. You will not be in trouble for asking for help.'
            : 'Tell ChipuRobo’s safeguarding lead about something that may be unsafe or harmful.'}{' '}
          <strong>If someone is in danger right now, tell a trusted adult nearby or contact the authorities first.</strong>
        </p>
      </div>

      <div className="card p-4 bg-warm-50 border-warm-200 flex items-start gap-3">
        <Lock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
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
        <div role="status" className="card max-w-2xl border-emerald-300 bg-emerald-50 p-5 text-emerald-950">
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
        className="card p-6 space-y-5 max-w-2xl"
        onSubmit={(e) => { e.preventDefault(); if (canSubmit) submit.mutate(); }}
      >
        <fieldset>
          <legend className="label">What are you worried about?</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {CONCERN_TYPES.map((type) => (
              <label key={type.value} className={`cursor-pointer rounded-xl border-2 p-4 ${category === type.value ? 'border-terracotta-500 bg-terracotta-50' : 'border-warm-200 bg-white'}`}>
                <span className="flex items-start gap-3">
                  <input type="radio" name="concern-type" value={type.value} checked={category === type.value}
                    onChange={() => { setCategory(type.value); setSubmitted(false); }} className="mt-1" />
                  <span><strong className="block text-sm text-gray-900">{type.label}</strong><span className="mt-1 block text-xs text-gray-600">{type.hint}</span></span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {!isLearner && <div>
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
        </div>}

        <div className={`grid gap-4 ${isLearner ? '' : 'sm:grid-cols-2'}`}>
          <div>
            <label htmlFor="occurred-on" className="label">When did it happen?</label>
            <input
              id="occurred-on" type="date" className="input"
              max={new Date().toISOString().slice(0, 10)}
              value={occurredOn}
              onChange={(e) => setOccurredOn(e.target.value)}
            />
          </div>
          {!isLearner && <div>
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
          </div>}
        </div>

        <div>
          <label htmlFor="description" className="label">Tell us what happened</label>
          <textarea
            id="description" className="input min-h-[9rem]" value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isLearner ? 'Write what happened and anything that would help us understand.' : 'What you saw or were told, when, and who else was present. Use participant codes rather than names.'}
            onFocus={() => setSubmitted(false)}
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.trim().length < MIN_DESCRIPTION
              ? `At least ${MIN_DESCRIPTION} characters — ${MIN_DESCRIPTION - description.trim().length} to go.`
              : isLearner ? 'That is enough detail to send.' : 'Please avoid learners’ names. Use their participant code.'}
          </p>
          {tooShort && <p className="sr-only">Description is too short.</p>}
        </div>

        <button type="submit" className="btn-cta" disabled={!canSubmit || submit.isPending}>
          <Send className="mr-2 h-4 w-4" aria-hidden="true" />
          {submit.isPending ? 'Sending…' : isLearner ? 'Send my report' : 'Send report'}
        </button>
      </form>
    </div>
  );
}
