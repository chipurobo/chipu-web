import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
  fetchProjectsWithJoins,
  fetchAllProjectJudgments,
  fetchProjectTeamWithStudent,
  type ProjectWithJoins,
} from '../../lib/gql/queries';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';
import type {
  ProjectJudgment, ProjectStatus,
} from '../../lib/database.types';
import {
  X, Link as LinkIcon, Trophy, GraduationCap, Save, ChevronRight, AlertCircle,
} from 'lucide-react';
import { useDialog } from '../../lib/useDialog';
import { Pagination, usePaged } from '../components/Pagination';
import { SkeletonRows } from '../components/Skeletons';

// =============================================================
// /dashboard/admin/projects
//
// Every team project across every school. Admin clicks a row, gets the
// full project + an inline judging form (0-100 + comment). Saving the
// judgment upserts project_judgments — a trigger flips status='judged'.
// Re-judging is allowed: the form pre-fills with the existing score.
// =============================================================

// Use the helper-shaped row, augmented with the stitched judgment.
interface ProjectRow extends ProjectWithJoins {
  judgment: ProjectJudgment | null;
}

const STATUS_BADGE: Record<ProjectStatus, string> = {
  draft:     'badge-gray',
  submitted: 'badge-teal',
  judged:    'badge-green',
};

export function AdminProjects() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<ProjectRow | null>(null);

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<ProjectRow[]> => {
      const rows = await fetchProjectsWithJoins();
      return rows.map((p) => ({ ...p, judgment: null }));
    },
  });

  // Fetch all judgments in one go and stitch by project_id.
  const judgmentsQuery = useQuery({
    queryKey: ['project-judgments'],
    queryFn: fetchAllProjectJudgments,
  });

  const projects: ProjectRow[] | null = useMemo(() => {
    if (!projectsQuery.data) return null;
    const map = new Map<string, ProjectJudgment>();
    (judgmentsQuery.data ?? []).forEach((j) => map.set(j.project_id, j));
    return projectsQuery.data.map((p) => ({ ...p, judgment: map.get(p.id) ?? null }));
  }, [projectsQuery.data, judgmentsQuery.data]);

  const err =
    projectsQuery.error?.message
    ?? judgmentsQuery.error?.message
    ?? null;

  const { paged, page, setPage, totalPages } = usePaged(projects, 25);

  // Keep the open panel in sync if the underlying row changes (e.g. after judging).
  useEffect(() => {
    if (!selected || !projects) return;
    const fresh = projects.find((p) => p.id === selected.id);
    if (fresh && fresh !== selected) setSelected(fresh);
  }, [projects, selected]);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Admin</p>
        <h1>Projects</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Every team project across the network. Click a row to view full details and submit a judgment.
        </p>
      </div>

      {err && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {selected && (
        <ProjectPanel
          project={selected}
          onClose={() => setSelected(null)}
          onJudged={() => {
            void qc.invalidateQueries({ queryKey: ['projects'] });
            void qc.invalidateQueries({ queryKey: ['project-judgments'] });
            void qc.invalidateQueries({ queryKey: ['leaderboard'] });
          }}
        />
      )}

      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="Projects">
          <thead>
            <tr>
              <th scope="col">School</th>
              <th scope="col">Programme</th>
              <th scope="col">Title</th>
              <th scope="col">Status</th>
              <th scope="col">Score</th>
              <th scope="col">Submitted</th>
              <th scope="col" className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!projects && (
              <SkeletonRows rows={5} cols={7} label="Loading projects" />
            )}
            {projects && projects.length === 0 && (
              <tr><td colSpan={7} className="text-center text-gray-500 py-8">No projects yet.</td></tr>
            )}
            {paged?.map((p) => {
              const isOpen = selected?.id === p.id;
              return (
                <tr key={p.id} className={isOpen ? 'bg-warm-100/60' : ''}>
                  <td className="font-medium text-gray-900">{p.school?.name ?? '—'}</td>
                  <td className="text-sm text-gray-700">{p.programme?.name ?? '—'}</td>
                  <td className="text-sm">{p.title}</td>
                  <td><span className={STATUS_BADGE[p.status]}>{p.status}</span></td>
                  <td className="text-sm">
                    {p.judgment
                      ? <span className="font-medium text-gray-900">{p.judgment.score} / 100</span>
                      : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="text-xs text-gray-500">
                    {p.submitted_at ? new Date(p.submitted_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelected(p)}
                      className="text-xs text-teal-700 hover:underline inline-flex items-center"
                    >
                      {p.status === 'draft' ? 'View' : 'Judge'}
                      <ChevronRight className="h-3.5 w-3.5 ml-0.5" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// Inline judging panel
// -----------------------------------------------------------------

function ProjectPanel({
  project, onClose, onJudged,
}: {
  project: ProjectRow;
  onClose: () => void;
  onJudged: () => void;
}) {
  const { profile } = useAuth();
  const { notify } = useNotifications();
  const dialogRef = useDialog<HTMLDivElement>({ open: true, onClose, trapFocus: false });

  const teamQuery = useQuery({
    queryKey: ['project-team', project.id],
    queryFn: () => fetchProjectTeamWithStudent(project.id),
  });

  const team = teamQuery.data ?? null;

  // Pre-fill with existing judgment so re-judging just edits in place.
  const [score,   setScore]   = useState<number>(project.judgment?.score ?? 80);
  const [comment, setComment] = useState<string>(project.judgment?.comment ?? '');

  useEffect(() => {
    setScore(project.judgment?.score ?? 80);
    setComment(project.judgment?.comment ?? '');
  }, [project.id, project.judgment?.score, project.judgment?.comment]);

  const judgeMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('Not signed in.');
      const payload = {
        project_id: project.id,
        score,
        comment:    comment.trim() || null,
        judged_by:  profile.id,
        judged_at:  new Date().toISOString(),
      };
      const { error } = await supabase
        .from('project_judgments')
        .upsert(payload, { onConflict: 'project_id' });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      notify('success', 'Judgment saved', `${project.school?.name ?? 'School'} · ${score} / 100`);
      onJudged();
    },
    onError: (e) => { notify('warning', 'Judgment failed', e.message); },
  });

  const err = teamQuery.error?.message ?? judgeMutation.error?.message ?? null;
  const saving = judgeMutation.isPending;
  const isDraft = project.status === 'draft';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (score < 0 || score > 100) return;
    judgeMutation.mutate();
  };

  return (
    <div ref={dialogRef} role="region" aria-labelledby="project-panel-heading" className="card p-5">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            {project.school?.name ?? '—'}{project.school?.county ? ` · ${project.school.county}` : ''}
          </p>
          <h2 className="m-0" id="project-panel-heading">{project.title}</h2>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className={STATUS_BADGE[project.status]}>{project.status}</span>
            {project.programme?.name && (
              <span className="text-xs text-gray-500">{project.programme.name}</span>
            )}
            {project.submitted_at && (
              <span className="text-xs text-gray-500">
                · submitted {new Date(project.submitted_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900" aria-label="Close project panel">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {project.description && (
        <p className="text-sm text-gray-800 whitespace-pre-wrap mb-3">{project.description}</p>
      )}

      <div className="flex flex-wrap gap-3 text-xs mb-4">
        {project.repo_url && (
          <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1 text-teal-700 hover:underline">
            <LinkIcon className="h-3 w-3" aria-hidden="true" /> Repository
          </a>
        )}
        {project.video_url && (
          <a href={project.video_url} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1 text-teal-700 hover:underline">
            <LinkIcon className="h-3 w-3" aria-hidden="true" /> Video
          </a>
        )}
        {project.image_url && (
          <a href={project.image_url} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1 text-teal-700 hover:underline">
            <LinkIcon className="h-3 w-3" aria-hidden="true" /> Image
          </a>
        )}
      </div>

      <section aria-label="Team members" className="mb-4">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 m-0 mb-2">
          <GraduationCap className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
          Team
        </h3>
        {!team ? (
          <p role="status" className="text-sm text-gray-500">Loading team…</p>
        ) : team.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No team members listed.</p>
        ) : (
          <ul className="border border-warm-200 rounded-md divide-y divide-warm-200 list-none p-0">
            {team.map((tm) => (
              <li key={tm.student_id} className="px-3 py-2 text-sm flex items-center gap-3 flex-wrap">
                <span className="font-medium text-gray-900">{tm.student?.full_name ?? '—'}</span>
                {tm.student?.grade && <span className="text-xs text-gray-500">{tm.student.grade}</span>}
                {tm.role && <span className="text-xs text-gray-600 italic">{tm.role}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {isDraft ? (
        <div role="status" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 inline-flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>School hasn't submitted yet — judging disabled.</span>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          aria-label="Judging form"
          className="grid sm:grid-cols-[auto_1fr] gap-4 pt-4 border-t border-warm-200"
        >
          <div>
            <label className="field-label" htmlFor="judge-score">
              <Trophy className="h-3.5 w-3.5 inline mr-1 text-emerald-700" aria-hidden="true" />
              Score (0–100)<span aria-hidden="true" className="text-red-600 ml-0.5">*</span>
            </label>
            <input
              id="judge-score" type="number" min={0} max={100} required aria-required="true"
              className="field-input font-mono w-32"
              value={score}
              onChange={(e) => {
                const n = Number(e.target.value);
                setScore(Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0);
              }}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="judge-comment">Comment (optional)</label>
            <textarea
              id="judge-comment" rows={3} className="field-input"
              placeholder="What worked well? What could improve?"
              value={comment} onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {err && (
            <div role="alert" className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {err}
            </div>
          )}

          <div className="sm:col-span-2 flex justify-end gap-2 flex-wrap">
            <button type="button" onClick={onClose} className="btn-secondary">Close</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {saving
                ? 'Saving…'
                : project.judgment ? 'Update judgment' : 'Save judgment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
