import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  fetchResponseWithForm, fetchAnswers, saveAnswers, submitResponse,
} from '../../lib/gql/queries';
import { useNotifications } from '../../lib/notifications';
import { useAuth } from '../../lib/auth';
import type { QuestionOption, QuestionType } from '../../lib/database.types';
import { ArrowLeft, Save, Send, Lock } from 'lucide-react';

// =============================================================
// /dashboard/school/assessments/:responseId
//
// One renderer for every MERL questionnaire. The teacher baseline, learner
// baseline, school baseline, endline, webinar feedback and visit checklist all
// come through here — they differ only in the rows seeded into
// instrument_sections / instrument_questions, so adding or reworording a form
// after MERL approval is a data change, not a code change.
//
// Sections flagged staff_only ("completed by programme team") are hidden from
// school leads and shown only to admins.
// =============================================================

type AnswerValue = {
  value_number: number | null;
  value_text: string | null;
  value_bool: boolean | null;
  value_options: string[] | null;
};

const EMPTY: AnswerValue = { value_number: null, value_text: null, value_bool: null, value_options: null };

function parseOptions(raw: unknown): QuestionOption[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as QuestionOption[];
  return [];
}

export function InstrumentForm() {
  const { responseId } = useParams<{ responseId: string }>();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const { notify } = useNotifications();
  const queryClient = useQueryClient();

  const formQuery = useQuery({
    queryKey: ['response-form', responseId],
    queryFn: () => fetchResponseWithForm(responseId!),
    enabled: !!responseId,
  });

  const answersQuery = useQuery({
    queryKey: ['response-answers', responseId],
    queryFn: () => fetchAnswers(responseId!),
    enabled: !!responseId,
  });

  const [edits, setEdits] = useState<Map<string, AnswerValue>>(new Map());

  const saved = useMemo(() => {
    const map = new Map<string, AnswerValue>();
    for (const a of answersQuery.data ?? []) {
      map.set(a.question_id, {
        value_number: a.value_number,
        value_text: a.value_text,
        value_bool: a.value_bool,
        value_options: a.value_options,
      });
    }
    return map;
  }, [answersQuery.data]);

  useEffect(() => { setEdits(new Map()); }, [answersQuery.data]);

  const valueOf = (qid: string): AnswerValue => edits.get(qid) ?? saved.get(qid) ?? EMPTY;

  function setValue(qid: string, patch: Partial<AnswerValue>) {
    setEdits((prev) => {
      const next = new Map(prev);
      next.set(qid, { ...valueOf(qid), ...patch });
      return next;
    });
  }

  const response = formQuery.data;
  const version = response?.version ?? null;
  const instrument = version?.instruments ?? null;
  const locked = response?.status === 'submitted';

  const sections = useMemo(() => {
    const all = version?.instrument_sections ?? [];
    return all
      .filter((s) => isAdmin || !s.staff_only)
      .slice()
      .sort((a, b) => a.position - b.position);
  }, [version, isAdmin]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const rows = [...edits.entries()].map(([question_id, v]) => ({
        response_id: responseId!,
        question_id,
        value_number: v.value_number,
        value_text: v.value_text,
        value_bool: v.value_bool,
        value_options: v.value_options,
      }));
      await saveAnswers(rows);
      return rows.length;
    },
    onSuccess: (n) => {
      queryClient.invalidateQueries({ queryKey: ['response-answers', responseId] });
      notify('success', 'Answers saved', `${n} answer${n === 1 ? '' : 's'} updated.`);
    },
    onError: (err: Error) => notify('warning', 'Could not save', err.message),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (edits.size > 0) await saveMutation.mutateAsync();
      await submitResponse(responseId!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['response-form', responseId] });
      queryClient.invalidateQueries({ queryKey: ['responses'] });
      notify('success', 'Response submitted', 'It is now read-only.');
    },
    onError: (err: Error) => notify('warning', 'Could not submit', err.message),
  });

  if (formQuery.isPending) {
    return <p className="text-sm text-gray-500">Loading form…</p>;
  }
  if (!response || !version || !instrument) {
    return <p className="text-sm text-gray-500">This response could not be loaded.</p>;
  }

  return (
    <div className="max-w-3xl">
      <Link to="/dashboard/school/assessments" className="btn-secondary !py-1 !text-xs mb-4 inline-flex">
        <ArrowLeft className="h-3 w-3 mr-1" aria-hidden="true" />
        Back to assessments
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">{instrument.title}</h1>
      {instrument.subtitle && <p className="text-sm text-gray-600 mt-1">{instrument.subtitle}</p>}
      <p className="text-xs text-gray-500 mt-2">
        Version {version.version} · collected {response.collected_at} · {response.round}
        {locked && ' · submitted'}
      </p>

      {locked && (
        <div className="card p-3 mt-4 text-sm text-gray-700 flex items-center gap-2">
          <Lock className="h-4 w-4 text-gray-500" aria-hidden="true" />
          This response has been submitted and can no longer be edited.
        </div>
      )}

      {sections.map((section) => (
        <section key={section.id} className="card p-4 mt-6">
          <h2 className="font-semibold text-gray-900">
            {section.code ? `${section.code}. ` : ''}{section.title}
            {section.staff_only && (
              <span className="badge-amber ml-2">programme team</span>
            )}
          </h2>
          {section.description && (
            <p className="text-xs text-gray-500 mt-1">{section.description}</p>
          )}

          <div className="mt-4 space-y-5">
            {(section.instrument_questions ?? [])
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((q) => (
                <QuestionField
                  key={q.id}
                  id={q.id}
                  prompt={q.prompt}
                  helpText={q.help_text}
                  qtype={q.qtype as QuestionType}
                  options={parseOptions(q.options)}
                  required={q.required}
                  value={valueOf(q.id)}
                  disabled={locked}
                  onChange={(patch) => setValue(q.id, patch)}
                />
              ))}
          </div>
        </section>
      ))}

      {!locked && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            className="btn-secondary"
            disabled={edits.size === 0 || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {saveMutation.isPending ? 'Saving…' : 'Save draft'}
          </button>
          <button
            className="btn-primary"
            disabled={submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
          >
            <Send className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {submitMutation.isPending ? 'Submitting…' : 'Submit response'}
          </button>
          <span className="text-xs text-gray-500">
            {edits.size === 0 ? 'No unsaved changes.' : `${edits.size} unsaved.`}
          </span>
        </div>
      )}
    </div>
  );
}

function QuestionField({
  id, prompt, helpText, qtype, options, required, value, disabled, onChange,
}: {
  id: string;
  prompt: string;
  helpText: string | null;
  qtype: QuestionType;
  options: QuestionOption[];
  required: boolean;
  value: AnswerValue;
  disabled: boolean;
  onChange: (patch: Partial<AnswerValue>) => void;
}) {
  const label = (
    <span className="field-label">
      {prompt}
      {required && <span className="text-terracotta-600"> *</span>}
    </span>
  );

  return (
    <div>
      <label htmlFor={`q-${id}`}>{label}</label>
      {helpText && <p className="text-xs text-gray-500 mb-1">{helpText}</p>}

      {qtype === 'scale' || qtype === 'single_select' ? (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={prompt}>
          {options.map((opt) => {
            const selected = value.value_text === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                className={selected ? 'badge-teal' : 'badge-gray'}
                onClick={() => onChange({
                  value_text: selected ? null : opt.value,
                  // Store the option's score too, so a scoring rule applied
                  // later does not have to re-resolve the option list of a
                  // version that may since have been retired.
                  value_number: selected ? null : (opt.score ?? null),
                })}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : qtype === 'multi_select' ? (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={prompt}>
          {options.map((opt) => {
            const current = value.value_options ?? [];
            const selected = current.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                className={selected ? 'badge-teal' : 'badge-gray'}
                onClick={() => onChange({
                  value_options: selected
                    ? current.filter((v) => v !== opt.value)
                    : [...current, opt.value],
                })}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : qtype === 'long_text' ? (
        <textarea
          id={`q-${id}`} className="field-input" rows={3} disabled={disabled}
          value={value.value_text ?? ''}
          onChange={(e) => onChange({ value_text: e.target.value })}
        />
      ) : qtype === 'boolean' ? (
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            id={`q-${id}`} type="checkbox" disabled={disabled}
            checked={value.value_bool ?? false}
            onChange={(e) => onChange({ value_bool: e.target.checked })}
          />
          <span className="text-sm text-gray-700">{value.value_bool ? 'Yes' : 'No'}</span>
        </label>
      ) : qtype === 'integer' ? (
        <input
          id={`q-${id}`} type="number" className="field-input" disabled={disabled}
          value={value.value_number ?? ''}
          onChange={(e) => onChange({ value_number: e.target.value === '' ? null : Number(e.target.value) })}
        />
      ) : qtype === 'date' ? (
        <input
          id={`q-${id}`} type="date" className="field-input" disabled={disabled}
          value={value.value_text ?? ''}
          onChange={(e) => onChange({ value_text: e.target.value })}
        />
      ) : (
        <input
          id={`q-${id}`} className="field-input" disabled={disabled}
          value={value.value_text ?? ''}
          onChange={(e) => onChange({ value_text: e.target.value })}
        />
      )}
    </div>
  );
}
