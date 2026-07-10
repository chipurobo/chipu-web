import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
  fetchProjectForSchool,
  fetchProjectTeamWithStudent,
  fetchProjectJudgment,
  fetchMembersBySchool,
  type ProjectTeamMemberWithStudent,
} from '../../lib/gql/queries';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../lib/notifications';
import type {
  Project, ProjectJudgment, ClubMember,
} from '../../lib/database.types';
import {
  FolderKanban, Save, Send, ExternalLink, Image as ImageIcon, Video, GitBranch,
  Trophy, CheckCircle2, AlertCircle, Users, Calendar, Lock,
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

type TeamMemberRow = ProjectTeamMemberWithStudent;

export function SchoolProject() {
  const { school } = useAuth();
  const qc = useQueryClient();
  const { notify } = useNotifications();
  const schoolId    = school?.id ?? null;
  const programmeId = school?.programme_id ?? null;

  const projectQuery = useQuery({
    queryKey: ['projects', schoolId],
    queryFn: () => fetchProjectForSchool(schoolId!, programmeId!),
    enabled: !!schoolId && !!programmeId,
  });

  const project = projectQuery.data ?? null;

  const teamQuery = useQuery({
    queryKey: ['project-team', project?.id],
    queryFn: () => fetchProjectTeamWithStudent(project!.id),
    enabled: !!project?.id,
  });

  const judgmentQuery = useQuery({
    queryKey: ['project-judgments', project?.id],
    queryFn: () => fetchProjectJudgment(project!.id),
    enabled: !!project?.id && project?.status === 'judged',
  });

  const studentsQuery = useQuery({
    queryKey: ['members', schoolId],
    queryFn: () => fetchMembersBySchool(schoolId!),
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
    // Re-seed the form only when the project identity/version changes —
    // depending on the field values themselves would clobber in-progress
    // edits on every keystroke echoed back through the cache.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Once a project is submitted (or judged) the form goes away and we show
  // a polished summary instead. Keeps the editing state for drafts only.
  if (readOnly) {
    return (
      <ProjectSummary
        project={project}
        team={team}
        judgment={judgment}
      />
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} aria-label="Edit project" className="card p-5 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="proj-title">
            Title<span aria-hidden="true" className="text-red-600 ml-0.5">*</span>
          </label>
          <input
            id="proj-title" type="text" required aria-required="true" className="field-input"
            value={title} onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="proj-desc">Description</label>
          <textarea
            id="proj-desc" rows={4} className="field-input"
            value={description} onChange={(e) => setDescription(e.target.value)}
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
                    className={`flex items-center gap-2 px-3 py-2 text-sm border-b border-warm-200 last:border-b-0 cursor-pointer ${
                      checked ? 'bg-teal-50/60' : 'hover:bg-warm-100/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStudent(s.id)}
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

        {errMsg && (
          <div role="alert" className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errMsg}
          </div>
        )}

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
      </form>
    </div>
  );
}

// =============================================================
// ProjectSummary — rendered after submission. No form fields, no
// "greyed-out" controls. Reads like a polished project page:
//   • Hero card: title + status + submitted-on
//   • Optional cover image
//   • Description as prose
//   • Repository / Video as proper link buttons
//   • Team roster with role chips
//   • If judged: prominent score panel + judge's comment
// =============================================================
function ProjectSummary({
  project, team, judgment,
}: {
  project:  Project;
  team:     TeamMemberRow[];
  judgment: ProjectJudgment | null;
}) {
  const isJudged    = project.status === 'judged' && judgment;
  const isImageHttp = !!project.image_url && /^https?:\/\//i.test(project.image_url);

  return (
    <div className="space-y-6">
      {/* Score panel — only when judged. Lives ABOVE the project card
          so the school sees their result the moment the page loads. */}
      {isJudged && judgment && (
        <section
          role="region"
          aria-labelledby="judgment-heading"
          className="card overflow-hidden border-2 border-emerald-500"
        >
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/30 px-5 sm:px-7 py-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 text-white shadow-soft-md">
                <Trophy className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-emerald-700 font-medium">Judge's score</p>
                <h2 id="judgment-heading" className="m-0 text-3xl tabular-nums">
                  {judgment.score}<span className="text-base text-gray-500 font-normal"> / 100</span>
                </h2>
                <p className="text-xs text-emerald-700 mt-1 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Judged on {new Date(judgment.judged_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {judgment.comment && (
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <p className="text-xs uppercase tracking-wider text-emerald-700 font-medium mb-1.5">
                  Judge's comment
                </p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {judgment.comment}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Project card */}
      <article className="card overflow-hidden">
        {/* Cover image, if provided */}
        {isImageHttp && (
          <div className="bg-warm-100 border-b border-warm-200">
            <img
              src={project.image_url!}
              alt={`Cover image for ${project.title}`}
              loading="lazy"
              decoding="async"
              className="w-full max-h-80 object-cover"
            />
          </div>
        )}

        <div className="p-5 sm:p-7">
          <header className="mb-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warm-100 text-gray-700">
                <Lock className="h-3 w-3" aria-hidden="true" />
                {project.status === 'judged' ? 'Judged' : 'Submitted'}
              </span>
              {project.submitted_at && (
                <span className="text-gray-500 inline-flex items-center gap-1 normal-case tracking-normal">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  {new Date(project.submitted_at).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              )}
            </div>
            <h2 className="m-0 text-2xl sm:text-3xl">{project.title}</h2>
          </header>

          {project.description && (
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
              {project.description}
            </p>
          )}

          {/* Resource links */}
          {(project.repo_url || project.video_url || (project.image_url && !isImageHttp)) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
              {project.repo_url && (
                <ResourceLink
                  href={project.repo_url}
                  icon={GitBranch}
                  label="Repository"
                  detail={domainOf(project.repo_url)}
                />
              )}
              {project.video_url && (
                <ResourceLink
                  href={project.video_url}
                  icon={Video}
                  label="Demo video"
                  detail={domainOf(project.video_url)}
                />
              )}
              {project.image_url && !isImageHttp && (
                <ResourceLink
                  href={project.image_url}
                  icon={ImageIcon}
                  label="Image"
                  detail={domainOf(project.image_url)}
                />
              )}
            </div>
          )}

          {/* Team roster */}
          <section aria-labelledby="team-roster-heading" className="pt-4 border-t border-warm-200">
            <h3
              id="team-roster-heading"
              className="text-xs uppercase tracking-wider text-gray-500 m-0 mb-3 inline-flex items-center gap-1.5"
            >
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              Team {team.length > 0 && <span className="text-gray-400">· {team.length}</span>}
            </h3>
            {team.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No team members listed.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0 m-0">
                {team.map((tm) => {
                  const name = tm.student?.full_name ?? 'Student';
                  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
                  return (
                    <li
                      key={tm.student_id}
                      className="flex items-center gap-3 px-3 py-2 bg-warm-50 rounded-md border border-warm-200"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-500/10 text-teal-700 font-semibold text-xs flex-shrink-0"
                      >
                        {initials || '–'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {tm.role || (tm.student?.grade ? `Grade ${tm.student.grade}` : 'Team member')}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Footer: locked-state hint */}
        <div className="border-t border-warm-200 bg-warm-50 px-5 sm:px-7 py-3 text-xs text-gray-600 inline-flex items-center gap-2 w-full">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" aria-hidden="true" />
          Submitted projects can no longer be edited. Contact ChipuRobo if you need changes.
        </div>
      </article>
    </div>
  );
}

// Small button-like resource card used for Repo / Video / Image links.
function ResourceLink({
  href, icon: Icon, label, detail,
}: {
  href:   string;
  icon:   typeof GitBranch;
  label:  string;
  detail: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 px-3 py-2.5 border border-warm-200 rounded-md hover:border-teal-500 hover:bg-teal-50/30 transition-colors"
    >
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-teal-500/10 text-teal-700 flex-shrink-0">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-gray-900">{label}</span>
        <span className="block text-xs text-gray-500 truncate">{detail}</span>
      </span>
      <ExternalLink
        aria-hidden="true"
        className="h-3.5 w-3.5 text-gray-400 group-hover:text-teal-700 transition-colors flex-shrink-0"
      />
    </a>
  );
}

function domainOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}
