import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  fetchProgrammeStageById,
  fetchMembersBySchool,
  fetchCompletionsForStage,
} from '../../lib/gql/queries';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';
import type { LessonCompletion, StageKind } from '../../lib/database.types';
import {
  ArrowLeft, Save, Star, BookOpen, Laptop, MonitorPlay, FolderKanban, GraduationCap, Megaphone,
} from 'lucide-react';
import { SkeletonRows } from '../components/Skeletons';

// =============================================================
// /dashboard/school/lessons/:stageId
//
// Roster for a single activity. Teacher ticks who passed + optionally rates
// their confidence 1-5. Local edits are tracked in a Map and saved as a
// single bulk upsert against lesson_completions.
// =============================================================

const STAGE_KIND_LABEL: Record<StageKind, string> = {
  outreach:          'Outreach',
  bootcamp_physical: 'Bootcamp (Physical)',
  bootcamp_virtual:  'Bootcamp (Virtual)',
  lesson:            'Lesson',
  project:           'Project',
};

const STAGE_KIND_ICON: Record<StageKind, typeof BookOpen> = {
  outreach:          Megaphone,
  bootcamp_physical: Laptop,
  bootcamp_virtual:  MonitorPlay,
  lesson:            BookOpen,
  project:           FolderKanban,
};

const STAGE_KIND_BADGE: Record<StageKind, string> = {
  outreach:          'badge-terra',
  bootcamp_physical: 'badge-amber',
  bootcamp_virtual:  'badge-teal',
  lesson:            'badge-teal',
  project:           'badge-terra',
};

interface RowState {
  passed:     boolean;
  confidence: number | null;
}

export function SchoolLessonStage() {
  const { stageId } = useParams<{ stageId: string }>();
  const { school, profile } = useAuth();
  const qc = useQueryClient();
  const { notify } = useNotifications();
  const schoolId = school?.id ?? null;

  // Stage metadata. fetchProgrammeStageById returns T | null; the .single()
  // behaviour of the old code threw on missing rows, so we surface the same
  // contract by throwing here.
  const stageQuery = useQuery({
    queryKey: ['programme-stage', stageId],
    queryFn: async () => {
      const row = await fetchProgrammeStageById(stageId!);
      if (!row) throw new Error('Activity not found.');
      return row;
    },
    enabled: !!stageId,
  });

  // Active club members at this school. We include in_club + non-club so
  // a teacher can tick anyone on the roster.
  const membersQuery = useQuery({
    queryKey: ['members', schoolId],
    queryFn: () => fetchMembersBySchool(schoolId!),
    enabled: !!schoolId,
  });

  // Existing completions for this stage. RLS already scopes to our students.
  const completionsQuery = useQuery({
    queryKey: ['lesson-completions', stageId],
    queryFn: () => fetchCompletionsForStage(stageId!),
    enabled: !!stageId,
  });

  const stage       = stageQuery.data ?? null;
  const members     = membersQuery.data ?? null;
  const completions = completionsQuery.data ?? null;

  const activeMembers = useMemo(
    () => (members ?? []).filter((m) => m.is_active),
    [members],
  );

  // Map student_id → existing completion for fast lookup.
  const existingByStudent = useMemo(() => {
    const m = new Map<string, LessonCompletion>();
    (completions ?? []).forEach((c) => m.set(c.student_id, c));
    return m;
  }, [completions]);

  // Local edits. Keyed by student_id. A student appears in this map only
  // after the teacher touches their row — saves only push the changed ones.
  const [edits, setEdits] = useState<Map<string, RowState>>(new Map());

  // Reset edits whenever the source data changes (e.g. after save invalidation).
  useEffect(() => {
    setEdits(new Map());
  }, [completionsQuery.dataUpdatedAt]);

  const rowState = (studentId: string): RowState => {
    if (edits.has(studentId)) return edits.get(studentId)!;
    const existing = existingByStudent.get(studentId);
    return {
      passed:     existing?.passed ?? false,
      confidence: existing?.confidence ?? null,
    };
  };

  const setRow = (studentId: string, patch: Partial<RowState>) => {
    setEdits((cur) => {
      const next = new Map(cur);
      const existing = existingByStudent.get(studentId);
      const current = next.get(studentId) ?? {
        passed:     existing?.passed ?? false,
        confidence: existing?.confidence ?? null,
      };
      next.set(studentId, { ...current, ...patch });
      return next;
    });
  };

  // Which rows differ from the persisted version? Only those get upserted.
  const dirtyStudentIds: string[] = useMemo(() => {
    const out: string[] = [];
    edits.forEach((v, studentId) => {
      const ex = existingByStudent.get(studentId);
      const exPassed = ex?.passed ?? false;
      const exConf   = ex?.confidence ?? null;
      if (v.passed !== exPassed || v.confidence !== exConf) out.push(studentId);
    });
    return out;
  }, [edits, existingByStudent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!stageId) throw new Error('No activity id.');
      if (dirtyStudentIds.length === 0) return 0;
      const rows = dirtyStudentIds.map((studentId) => {
        const r = rowState(studentId);
        return {
          stage_id:    stageId,
          student_id:  studentId,
          passed:      r.passed,
          confidence:  r.confidence,
          recorded_by: profile?.id ?? null,
          recorded_at: new Date().toISOString(),
        };
      });
      const { error } = await supabase
        .from('lesson_completions')
        .upsert(rows, { onConflict: 'stage_id,student_id' });
      if (error) throw new Error(error.message);
      return rows.length;
    },
    onSuccess: (n) => {
      if (n > 0) {
        notify('success', 'Lesson completions saved', `${n} student${n === 1 ? '' : 's'} updated.`);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['lesson-completions', stageId] });
      void qc.invalidateQueries({ queryKey: ['lesson-completions', 'school', schoolId] });
      void qc.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });

  const err =
    stageQuery.error?.message
    ?? membersQuery.error?.message
    ?? completionsQuery.error?.message
    ?? saveMutation.error?.message
    ?? null;

  const Icon = stage ? STAGE_KIND_ICON[stage.kind] : BookOpen;
  const badge = stage ? STAGE_KIND_BADGE[stage.kind] : 'badge-teal';

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div>
        <Link
          to="/dashboard/school/lessons"
          className="text-xs text-teal-700 hover:underline inline-flex items-center"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          Back to lessons
        </Link>
      </div>

      <div className="flex items-start gap-3 flex-wrap">
        <div className="p-2.5 rounded-md bg-warm-100 flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-700" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            {school?.name ?? 'Your school'}
          </p>
          <h1>{stage?.title ?? '…'}</h1>
          {stage && (
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className={`${badge}`}>{STAGE_KIND_LABEL[stage.kind]}</span>
              <span className="text-xs text-gray-600">
                {stage.points} pt{stage.points === 1 ? '' : 's'} per student
              </span>
              {stage.required_for_certificate && (
                <span className="badge-amber inline-flex items-center">
                  <GraduationCap className="h-3 w-3 mr-1" aria-hidden="true" />
                  required for certificate
                </span>
              )}
            </div>
          )}
          {stage?.description && (
            <p className="text-sm text-gray-700 mt-2">{stage.description}</p>
          )}
        </div>
      </div>

      {err && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="Student roster for this lesson activity">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Grade</th>
              <th scope="col">Passed</th>
              <th scope="col">Confidence</th>
              <th scope="col">Last recorded</th>
            </tr>
          </thead>
          <tbody>
            {!members && (
              <SkeletonRows rows={5} cols={5} label="Loading roster" />
            )}
            {members && activeMembers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-8">
                  No active students on the roster. Add them under Students first.
                </td>
              </tr>
            )}
            {activeMembers.map((m) => {
              const existing = existingByStudent.get(m.id);
              const state    = rowState(m.id);
              return (
                <tr key={m.id}>
                  <td className="font-medium text-gray-900">{m.full_name}</td>
                  <td className="text-gray-700">{m.grade ?? '—'}</td>
                  <td>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.passed}
                        onChange={(e) => setRow(m.id, { passed: e.target.checked })}
                        aria-label={`${m.full_name} passed`}
                      />
                      <span className="text-xs text-gray-600">
                        {state.passed ? 'passed' : 'not yet'}
                      </span>
                    </label>
                  </td>
                  <td>
                    <ConfidenceStars
                      value={state.confidence}
                      onChange={(v) => setRow(m.id, { confidence: v })}
                      studentName={m.full_name}
                    />
                  </td>
                  <td className="text-xs text-gray-500">
                    {existing
                      ? new Date(existing.recorded_at).toLocaleDateString()
                      : <span className="text-gray-400 italic">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3 flex-wrap">
        <span className="text-xs text-gray-500" role="status" aria-live="polite">
          {dirtyStudentIds.length === 0
            ? 'No changes to save.'
            : `${dirtyStudentIds.length} student${dirtyStudentIds.length === 1 ? '' : 's'} edited.`}
        </span>
        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={dirtyStudentIds.length === 0 || saveMutation.isPending}
          className="btn-primary"
        >
          <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {saveMutation.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

function ConfidenceStars({
  value, onChange, studentName,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  studentName: string;
}) {
  return (
    <div className="inline-flex items-center gap-0.5" role="group" aria-label={`Confidence for ${studentName}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value !== null && n <= value;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className={`p-1 rounded-md hover:bg-warm-100 ${filled ? 'text-amber-500' : 'text-gray-300'}`}
            aria-label={`Set confidence to ${n} for ${studentName}`}
            aria-pressed={filled}
            title={`${n} of 5`}
          >
            <Star
              className="h-4 w-4"
              fill={filled ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </button>
        );
      })}
      {value !== null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-1 text-xs text-gray-500 hover:text-gray-900"
          aria-label={`Clear confidence for ${studentName}`}
        >
          clear
        </button>
      )}
    </div>
  );
}
