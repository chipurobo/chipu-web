import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';
import type {
  Project, ProjectTeamMember, ProjectJudgment, ClubMember,
} from '../../lib/database.types';
import {
  FolderKanban, Save, Send, Link as LinkIcon, Image as ImageIcon, Video, GitBranch,
  Trophy, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { SkeletonCards } from '../components/Skeletons';

// =============================================================
// /dashboard/school/project
//
// The one team project per programme that schools submit for judging.
//
// Flow:
//   • draft     → editable, "Save draft" + "Submit for judging" buttons.
//   • submitted → fields read-only, hint about contacting ChipuRobo.
//   • judged    → fields read-only, score + comment panel shown.
// =============================================================

interface TeamMemberRow extends ProjectTeamMember {
  student?: Pick<ClubMember, 'id' | 'full_name' | 'grade'> | null;
}

export function SchoolProject() {
  const { school } = useAuth();
  const qc = useQueryClient();
  const { notify } = useNotifications();
  const schoolId    = school?.id ?? null;
  const programmeId = school?.programme_id ?? null;

  const projectQuery = useQuery({
    queryKey: ['projects', schoolId],
    queryFn: async (): Promise<Project | null> => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('school_id', schoolId!)
        .eq('programme_id', programmeId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as Project | null);
    },
    enabled: !!schoolId && !!programmeId,
  });

  const project = projectQuery.data ?? null;

  const teamQuery = useQuery({
    queryKey: ['project-team', project?.id],
    queryFn: async (): Promise<TeamMemberRow[]> => {
      const { data, error } = await supabase
        .from('project_team_members')
        .select('project_id, student_id, role, student:student_id ( id, full_name, grade )')
        .eq('project_id', project!.id);
      if (error) throw new Error(error.message);
      return data as unknown as TeamMemberRow[];
    },
    enabled: !!project?.id,
  });

  const judgmentQuery = useQuery({
    queryKey: ['project-judgments', project?.id],
    queryFn: async (): Promise<ProjectJudgment | null> => {
      const { data, error } = await supabase
        .from('project_judgments')
        .select('*')
        .eq('project_id', project!.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as ProjectJudgment | null);
    },
    enabled: !!project?.id && project?.status === 'judged',
  });

  const studentsQuery = useQuery({
    queryKey: ['members', schoolId],
    queryFn: async (): Promise<ClubMember[]> => {
      const { data, error } = await supabase
        .from('club_members')
        .select('*')
        .eq('school_id', schoolId!)
        .order('full_name');
      if (error) throw new Error(error.message);
      return data as ClubMember[];
    },
    enabled: !!schoolId,
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('projects')
        .insert({
          school_id:    schoolId!,
          programme_id: programmeId!,
          title:        'Untitled project',
          status:       'draft',
        });
      if (error) throw new Error(error.message);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['projects', schoolId] });
    },
  });

  const err =
    projectQuery.error?.message
    ?? teamQuery.error?.message
    ?? judgmentQuery.error?.message
    ?? studentsQuery.error?.message
    ?? startMutation.error?.message
    ?? null;

  if (!programmeId) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <Header school={school?.name ?? null} />
        <div className="card p-8 text-center mt-6">
          <FolderKanban className="h-7 w-7 text-gray-300 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-gray-600">Your school isn't enrolled in a programme yet.</p>
          <p className="text-xs text-gray-500 mt-1">Ask ChipuRobo to assign one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <Header school={school?.name ?? null} status={project?.status} />

      {err && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {projectQuery.isLoading && <SkeletonCards count={1} label="Loading project" />}

      {!projectQuery.isLoading && !project && (
        <div className="card p-8 text-center">
          <FolderKanban className="h-7 w-7 text-gray-300 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-gray-600">You haven't started a project yet.</p>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Kick off a draft, fill it in with your team, then submit for judging.
          </p>
          <button
            type="button"
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="btn-primary"
          >
            {startMutation.isPending ? 'Starting…' : 'Start project'}
          </button>
        </div>
      )}

      {project && (
        <ProjectEditor
          project={project}
          team={teamQuery.data ?? []}
          judgment={judgmentQuery.data ?? null}
          students={studentsQuery.data?.filter((s) => s.is_active) ?? []}
          onSaved={() => {
            void qc.invalidateQueries({ queryKey: ['projects', schoolId] });
            void qc.invalidateQueries({ queryKey: ['project-team', project.id] });
            void qc.invalidateQueries({ queryKey: ['projects'] });
            void qc.invalidateQueries({ queryKey: ['leaderboard'] });
          }}
          notify={notify}
        />
      )}
    </div>
  );
}

function Header({
  school, status,
}: {
  school: string | null;
  status?: Project['status'];
}) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{school ?? 'Your school'}</p>
        <h1>Project</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          The one team project your school submits for judging. Draft it, then submit when it's ready.
        </p>
      </div>
      {status && <StatusBadge status={status} />}
    </div>
  );
}

function StatusBadge({ status }: { status: Project['status'] }) {
  if (status === 'draft')     return <span className="badge-gray">draft</span>;
  if (status === 'submitted') return <span className="badge-teal">submitted</span>;
  return <span className="badge-green inline-flex items-center"><Trophy className="h-3 w-3 mr-1" aria-hidden="true" />judged</span>;
}

// -----------------------------------------------------------------
// Editor
// -----------------------------------------------------------------

function ProjectEditor({
  project, team, judgment, students, onSaved, notify,
}: {
  project: Project;
  team: TeamMemberRow[];
  judgment: ProjectJudgment | null;
  students: ClubMember[];
  onSaved: () => void;
  notify: (type: 'info' | 'success' | 'warning', title: string, body?: string) => void;
}) {
  const [title,       setTitle]       = useState(project.title);
  const [description, setDescription] = useState(project.description ?? '');
  const [repoUrl,     setRepoUrl]     = useState(project.repo_url ?? '');
  const [videoUrl,    setVideoUrl]    = useState(project.video_url ?? '');
  const [imageUrl,    setImageUrl]    = useState(project.image_url ?? '');

  // Team — { student_id → role } map
  const initialTeam = useMemo(() => {
    const m = new Map<string, string>();
    team.forEach((tm) => { m.set(tm.student_id, tm.role ?? ''); });
    return m;
  }, [team]);
  const [selectedTeam, setSelectedTeam] = useState<Map<string, string>>(initialTeam);

  useEffect(() => {
    setTitle(project.title);
    setDescription(project.description ?? '');
    setRepoUrl(project.repo_url ?? '');
    setVideoUrl(project.video_url ?? '');
    setImageUrl(project.image_url ?? '');
  }, [project.id, project.updated_at]);

  useEffect(() => { setSelectedTeam(initialTeam); }, [initialTeam]);

  const readOnly = project.status !== 'draft';

  const toggleStudent = (id: string) => {
    setSelectedTeam((cur) => {
      const next = new Map(cur);
      if (next.has(id)) next.delete(id);
      else next.set(id, '');
      return next;
    });
  };

  const setRole = (id: string, role: string) => {
    setSelectedTeam((cur) => {
      const next = new Map(cur);
      if (next.has(id)) next.set(id, role);
      return next;
    });
  };

  // Save: update project + replace team membership.
  const saveBaseMutation = useMutation({
    mutationFn: async (input: { submit: boolean }) => {
      const updates: Partial<Project> = {
        title:        title.trim() || 'Untitled project',
        description:  description.trim() || null,
        repo_url:     repoUrl.trim()  || null,
        video_url:    videoUrl.trim() || null,
        image_url:    imageUrl.trim() || null,
      };
      const { error: uErr } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', project.id);
      if (uErr) throw new Error(uErr.message);

      // Replace team membership in two steps. We delete the rows for
      // students who are no longer on the team and upsert the rest.
      const desiredIds = Array.from(selectedTeam.keys());
      const existingIds = team.map((t) => t.student_id);
      const toRemove = existingIds.filter((id) => !selectedTeam.has(id));
      if (toRemove.length > 0) {
        const { error: dErr } = await supabase
          .from('project_team_members')
          .delete()
          .eq('project_id', project.id)
          .in('student_id', toRemove);
        if (dErr) throw new Error(dErr.message);
      }
      if (desiredIds.length > 0) {
        const rows = desiredIds.map((studentId) => ({
          project_id: project.id,
          student_id: studentId,
          role:       (selectedTeam.get(studentId) ?? '').trim() || null,
        }));
        const { error: tErr } = await supabase
          .from('project_team_members')
          .upsert(rows, { onConflict: 'project_id,student_id' });
        if (tErr) throw new Error(tErr.message);
      }

      // Submit step: flip status + stamp submitted_at.
      if (input.submit) {
        const { error: sErr } = await supabase
          .from('projects')
          .update({ status: 'submitted', submitted_at: new Date().toISOString() })
          .eq('id', project.id);
        if (sErr) throw new Error(sErr.message);
      }
    },
    onSuccess: (_d, vars) => {
      notify(
        'success',
        vars.submit ? 'Project submitted' : 'Draft saved',
        vars.submit
          ? "We'll review it shortly."
          : 'You can keep editing until you submit.',
      );
      onSaved();
    },
    onError: (e) => {
      notify('warning', 'Save failed', e.message);
    },
  });

  const saving = saveBaseMutation.isPending;
  const errMsg = saveBaseMutation.error?.message ?? null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    saveBaseMutation.mutate({ submit: false });
  };

  const onSubmitForJudging = () => {
    if (!title.trim()) return;
    if (!window.confirm('Submit this project for judging? You won\'t be able to edit it after submission unless ChipuRobo re-opens it.')) return;
    saveBaseMutation.mutate({ submit: true });
  };

  return (
    <div className="space-y-6">
      {project.status === 'judged' && judgment && (
        <div role="region" aria-labelledby="judgment-heading" className="card p-5 border-2 border-emerald-500 bg-emerald-50/40">
          <h2 id="judgment-heading" className="m-0 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            Score: {judgment.score} / 100
          </h2>
          {judgment.comment && (
            <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">
              <span className="block text-xs uppercase tracking-wider text-emerald-700 mb-1">Judge's comment</span>
              {judgment.comment}
            </p>
          )}
          <p className="text-xs text-emerald-700 mt-3 inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Judged on {new Date(judgment.judged_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {readOnly && (
        <div role="status" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 inline-flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>
            Submitted projects can no longer be edited. Contact ChipuRobo if you need changes.
          </span>
        </div>
      )}

      <form onSubmit={onSubmit} aria-label="Edit project" className="card p-5 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="proj-title">
            Title<span aria-hidden="true" className="text-red-600 ml-0.5">*</span>
          </label>
          <input
            id="proj-title" type="text" required aria-required="true" className="field-input"
            value={title} onChange={(e) => setTitle(e.target.value)}
            readOnly={readOnly}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="proj-desc">Description</label>
          <textarea
            id="proj-desc" rows={4} className="field-input"
            value={description} onChange={(e) => setDescription(e.target.value)}
            readOnly={readOnly}
            placeholder="What did your team build? What problem does it solve?"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="proj-repo">
            <GitBranch className="h-3.5 w-3.5 inline mr-1 text-gray-500" aria-hidden="true" />
            Repository URL
          </label>
          <input
            id="proj-repo" type="url" className="field-input"
            placeholder="https://github.com/..."
            value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)}
            readOnly={readOnly}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="proj-video">
            <Video className="h-3.5 w-3.5 inline mr-1 text-gray-500" aria-hidden="true" />
            Video URL
          </label>
          <input
            id="proj-video" type="url" className="field-input"
            placeholder="https://..."
            value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
            readOnly={readOnly}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="proj-image">
            <ImageIcon className="h-3.5 w-3.5 inline mr-1 text-gray-500" aria-hidden="true" />
            Image URL
          </label>
          <input
            id="proj-image" type="url" className="field-input"
            placeholder="https://..."
            value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            readOnly={readOnly}
          />
        </div>

        {/* Team */}
        <div className="sm:col-span-2 pt-2 border-t border-warm-200">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span className="field-label !mb-0" id="proj-team-label">Team members</span>
            <span className="text-xs text-gray-500">
              {selectedTeam.size} selected
            </span>
          </div>

          {students.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No active students on the roster.</p>
          ) : (
            <div
              role="group"
              aria-labelledby="proj-team-label"
              className="border border-warm-200 rounded-md max-h-56 overflow-y-auto bg-warm-50/40"
            >
              {students.map((s) => {
                const checked = selectedTeam.has(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-2 px-3 py-2 text-sm border-b border-warm-200 last:border-b-0 ${
                      checked ? 'bg-teal-50/60' : 'hover:bg-warm-100/60'
                    } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => !readOnly && toggleStudent(s.id)}
                      disabled={readOnly}
                    />
                    <span className="flex-1 truncate">
                      <span className="font-medium text-gray-900">{s.full_name}</span>
                      {s.grade && <span className="text-xs text-gray-500"> · {s.grade}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {selectedTeam.size > 0 && (
            <div className="mt-3 border border-warm-200 rounded-md overflow-x-auto">
              <table className="data-table" aria-label="Selected team members and roles">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Role (optional)</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(selectedTeam.entries()).map(([studentId, role]) => {
                    const s = students.find((x) => x.id === studentId);
                    const teamRow = team.find((t) => t.student_id === studentId);
                    const fallbackName = teamRow?.student?.full_name ?? '—';
                    return (
                      <tr key={studentId}>
                        <td className="font-medium text-gray-900 whitespace-nowrap">
                          {s?.full_name ?? fallbackName}
                        </td>
                        <td>
                          <input
                            type="text"
                            className="field-input"
                            placeholder="e.g. Hardware, coding"
                            value={role}
                            onChange={(e) => setRole(studentId, e.target.value)}
                            aria-label={`Role for ${s?.full_name ?? fallbackName}`}
                            readOnly={readOnly}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Links preview when read-only */}
        {readOnly && (project.repo_url || project.video_url || project.image_url) && (
          <div className="sm:col-span-2 pt-2 border-t border-warm-200 flex flex-wrap gap-3 text-xs">
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-1 text-teal-700 hover:underline">
                <LinkIcon className="h-3 w-3" aria-hidden="true" /> Repo
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
        )}

        {errMsg && (
          <div role="alert" className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errMsg}
          </div>
        )}

        {!readOnly && (
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-warm-200 flex-wrap">
            <button type="submit" className="btn-secondary" disabled={saving || !title.trim()}>
              <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {saving ? 'Saving…' : 'Save draft'}
            </button>
            <button
              type="button"
              onClick={onSubmitForJudging}
              className="btn-primary"
              disabled={saving || !title.trim()}
            >
              <Send className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Submit for judging
            </button>
          </div>
        )}
      </form>

      {project.submitted_at && (
        <p className="text-xs text-gray-500">
          Submitted {new Date(project.submitted_at).toLocaleString()}.
        </p>
      )}
    </div>
  );
}
