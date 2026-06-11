import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../lib/notifications';
import type {
  CertificateTemplate, CertificateIssuance, CertAudience, School, ClubMember,
} from '../../lib/database.types';
import {
  Award, Plus, X, Trash2, Pencil, GraduationCap, UserCog, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { useDialog } from '../../lib/useDialog';
import { SkeletonRows, SkeletonCards } from '../components/Skeletons';

// =============================================================
// /dashboard/admin/certifications
//
// Two-tab admin surface:
//   Templates — curated catalogue of certificates (CRUD)
//   Issue     — pick a template + recipient(s), issue
// Plus a "Recent issuances" feed at the bottom.
//
// No public verification — visibility is admin / school lead / teacher.
// =============================================================

interface SchoolLead {
  user_id:     string;
  username:    string;
  full_name:   string | null;
  school_id:   string | null;
  school_name: string | null;
}

interface IssuanceRow extends CertificateIssuance {
  templates: Pick<CertificateTemplate, 'id' | 'title' | 'audience'> | null;
  schools:   Pick<School, 'id' | 'name'> | null;
  student:   Pick<ClubMember, 'id' | 'full_name'> | null;
  teacher:   Pick<SchoolLead, 'user_id' | 'full_name'> | null;
}

type Tab = 'templates' | 'issue';

export function AdminCertifications() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('issue');

  const templatesQuery = useQuery({
    queryKey: ['templates'],
    queryFn: async (): Promise<CertificateTemplate[]> => {
      const { data, error } = await supabase
        .from('certificate_templates')
        .select('*')
        .order('title');
      if (error) throw new Error(error.message);
      return data as CertificateTemplate[];
    },
  });

  const schoolsQuery = useQuery({
    queryKey: ['schools'],
    queryFn: async (): Promise<School[]> => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      if (error) throw new Error(error.message);
      return data as School[];
    },
  });

  const leadsQuery = useQuery({
    queryKey: ['school-leads'],
    queryFn: async (): Promise<SchoolLead[]> => {
      const { data, error } = await supabase.rpc('admin_list_school_leads');
      if (error) throw new Error(error.message);
      return data as SchoolLead[];
    },
  });

  const issuancesQuery = useQuery({
    queryKey: ['issuances', { scope: 'admin' }],
    queryFn: async (): Promise<IssuanceRow[]> => {
      const { data, error } = await supabase
        .from('certificate_issuances')
        .select(`
          *,
          templates:template_id ( id, title, audience ),
          schools:school_id     ( id, name ),
          student:student_id    ( id, full_name )
        `)
        .order('issued_at', { ascending: false })
        .limit(30);
      if (error) throw new Error(error.message);
      return data as unknown as IssuanceRow[];
    },
  });

  const templates = templatesQuery.data ?? null;
  const schools   = schoolsQuery.data ?? null;
  const leads     = leadsQuery.data ?? null;

  // Stitch teacher info from the leads list (teacher_id = profiles.id = auth users id).
  const recent: IssuanceRow[] | null = (() => {
    if (!issuancesQuery.data) return null;
    const leadsMap = new Map<string, SchoolLead>(
      (leads ?? []).map((l) => [l.user_id, l]),
    );
    return issuancesQuery.data.map((r) => ({
      ...r,
      teacher: r.teacher_id ? leadsMap.get(r.teacher_id) ?? null : null,
    }));
  })();

  const err =
    templatesQuery.error?.message
    ?? schoolsQuery.error?.message
    ?? leadsQuery.error?.message
    ?? issuancesQuery.error?.message
    ?? null;

  const invalidateAll = () => {
    void qc.invalidateQueries({ queryKey: ['templates'] });
    void qc.invalidateQueries({ queryKey: ['issuances', { scope: 'admin' }] });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Admin</p>
        <h1>Certifications</h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Curate a template catalogue and issue certificates to students or teachers. Recipients
          and their school leads can see what's been awarded — nothing is public.
        </p>
      </div>

      {err && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        <TabButton active={tab === 'issue'}    onClick={() => setTab('issue')}>Issue</TabButton>
        <TabButton active={tab === 'templates'} onClick={() => setTab('templates')}>Templates</TabButton>
      </div>

      {tab === 'templates' && (
        <TemplatesPanel templates={templates} onChanged={invalidateAll} />
      )}

      {tab === 'issue' && (
        <IssuePanel
          templates={templates ?? []}
          schools={schools ?? []}
          leads={leads ?? []}
          onIssued={invalidateAll}
        />
      )}

      <RecentIssuances rows={recent} />
    </div>
  );
}

function TabButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
        active
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white text-gray-700 border-warm-200 hover:bg-warm-100'
      }`}
    >
      {children}
    </button>
  );
}

// -----------------------------------------------------------------
// Templates CRUD
// -----------------------------------------------------------------

function TemplatesPanel({
  templates, onChanged,
}: { templates: CertificateTemplate[] | null; onChanged: () => void }) {
  const [editing, setEditing] = useState<CertificateTemplate | null>(null);
  const [creating, setCreating] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('certificate_templates').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { onChanged(); },
    onError: (e) => { alert(e.message); },
  });

  const onDelete = (id: string) => {
    if (!window.confirm('Delete this template? Existing issuances using it will block the delete.')) return;
    deleteMutation.mutate(id);
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-end gap-3 flex-wrap">
        <h2 className="m-0">Template catalogue</h2>
        <button
          onClick={() => { setCreating(true); setEditing(null); }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" /> New template
        </button>
      </div>

      {(creating || editing) && (
        <TemplateForm
          initial={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); onChanged(); }}
        />
      )}

      <div className="card overflow-x-auto">
        <table className="data-table" aria-label="Certificate templates">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Audience</th>
              <th scope="col">Programme</th>
              <th scope="col">State</th>
              <th scope="col" className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!templates && (
              <SkeletonRows rows={4} cols={5} label="Loading templates" />
            )}
            {templates && templates.length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-500 py-8">No templates yet.</td></tr>
            )}
            {templates?.map((t) => (
              <tr key={t.id} className={t.is_active ? '' : 'opacity-60'}>
                <td className="whitespace-normal">
                  <div className="font-medium text-gray-900">{t.title}</div>
                  {t.description && (
                    <div className="text-xs text-gray-500 line-clamp-2 max-w-md">{t.description}</div>
                  )}
                </td>
                <td>
                  {t.audience === 'student'
                    ? <span className="badge-teal inline-flex items-center"><GraduationCap className="h-3 w-3 mr-1" aria-hidden="true" />student</span>
                    : <span className="badge-amber inline-flex items-center"><UserCog className="h-3 w-3 mr-1" aria-hidden="true" />teacher</span>}
                </td>
                <td className="text-sm">{t.programme ?? '—'}</td>
                <td>
                  {t.is_active
                    ? <span className="badge-green">active</span>
                    : <span className="badge-gray">inactive</span>}
                </td>
                <td className="text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(t); setCreating(false); }}
                          className="text-xs text-teal-700 hover:underline inline-flex items-center">
                    <Pencil className="h-3 w-3 mr-1" aria-hidden="true" /> Edit
                  </button>
                  <button onClick={() => onDelete(t.id)}
                          className="text-xs text-red-700 hover:underline ml-3 inline-flex items-center">
                    <Trash2 className="h-3 w-3 mr-1" aria-hidden="true" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TemplateForm({
  initial, onClose, onSaved,
}: {
  initial: CertificateTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [title,        setTitle]        = useState(initial?.title ?? '');
  const [description,  setDescription]  = useState(initial?.description ?? '');
  const [programme,    setProgramme]    = useState(initial?.programme ?? '');
  const [audience,     setAudience]     = useState<CertAudience>(initial?.audience ?? 'student');
  const [duration,     setDuration]     = useState(initial?.duration_text ?? '');
  const [criteria,     setCriteria]     = useState(initial?.criteria_text ?? '');
  const [heroColor,    setHeroColor]    = useState(initial?.hero_color ?? '#0d9488');
  const [isActive,     setIsActive]     = useState(initial?.is_active ?? true);

  const dialogRef = useDialog<HTMLDivElement>({ open: true, onClose, trapFocus: false });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title:         title.trim(),
        description:   description.trim() || null,
        programme:     programme.trim() || null,
        audience,
        duration_text: duration.trim() || null,
        criteria_text: criteria.trim() || null,
        hero_color:    heroColor || null,
        is_active:     isActive,
      };
      const { error } = isEdit
        ? await supabase.from('certificate_templates').update(payload).eq('id', initial!.id)
        : await supabase.from('certificate_templates').insert(payload);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { onSaved(); },
  });

  const saving = saveMutation.isPending;
  const err = saveMutation.error?.message ?? null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    saveMutation.mutate();
  };

  return (
    <div ref={dialogRef} role="region" aria-labelledby="template-form-heading" className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="m-0" id="template-form-heading">{isEdit ? 'Edit template' : 'New template'}</h2>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900" aria-label="Close template form">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <form onSubmit={onSubmit} aria-labelledby="template-form-heading" className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="template-title">Title<span aria-hidden="true" className="text-red-600 ml-0.5">*</span></label>
          <input id="template-title" className="field-input" required aria-required="true" value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 placeholder="e.g. Inclusive Robotics — Beginner" />
        </div>

        <div>
          <label className="field-label" htmlFor="template-audience">Audience</label>
          <select id="template-audience" className="field-select" value={audience}
                  onChange={(e) => setAudience(e.target.value as CertAudience)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="template-programme">Programme</label>
          <input id="template-programme" className="field-input" value={programme}
                 onChange={(e) => setProgramme(e.target.value)}
                 placeholder="e.g. Inclusive Robotics" />
        </div>

        <div>
          <label className="field-label" htmlFor="template-duration">Duration</label>
          <input id="template-duration" className="field-input" value={duration}
                 onChange={(e) => setDuration(e.target.value)}
                 placeholder="e.g. 8 weeks" />
        </div>

        <div>
          <label className="field-label" htmlFor="template-hero-color">Hero color</label>
          <div className="flex items-center gap-2">
            <input id="template-hero-color" type="color" value={heroColor}
                   onChange={(e) => setHeroColor(e.target.value)}
                   className="h-9 w-12 rounded border border-warm-200 bg-white" />
            <input id="template-hero-color-hex" aria-label="Hero color hex value" className="field-input font-mono" value={heroColor}
                   onChange={(e) => setHeroColor(e.target.value)} />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="template-description">Description</label>
          <textarea id="template-description" rows={2} className="field-input" value={description}
                    onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="template-criteria">Criteria</label>
          <textarea id="template-criteria" rows={2} className="field-input" value={criteria}
                    onChange={(e) => setCriteria(e.target.value)}
                    placeholder="What does it take to earn this?" />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isActive}
                   onChange={(e) => setIsActive(e.target.checked)} />
            Active — show in the issue picker
          </label>
        </div>

        {err && (
          <div role="alert" className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {err}
          </div>
        )}

        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-warm-200">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving || !title.trim()}>
            {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Create template')}
          </button>
        </div>
      </form>
    </div>
  );
}

// -----------------------------------------------------------------
// Issue panel
// -----------------------------------------------------------------

function IssuePanel({
  templates, schools, leads, onIssued,
}: {
  templates: CertificateTemplate[];
  schools: School[];
  leads: SchoolLead[];
  onIssued: () => void;
}) {
  const { notify } = useNotifications();
  const [templateId, setTemplateId] = useState('');
  const [schoolId,   setSchoolId]   = useState('');
  const [studentIds, setStudentIds] = useState<Set<string>>(new Set());
  const [teacherId,  setTeacherId]  = useState('');
  const [notes,      setNotes]      = useState('');
  const [localErr,   setLocalErr]   = useState<string | null>(null);

  const activeTemplates = templates.filter((t) => t.is_active);
  const template = activeTemplates.find((t) => t.id === templateId);
  const audience: CertAudience | null = template?.audience ?? null;

  useEffect(() => {
    if (!templateId && activeTemplates.length > 0) setTemplateId(activeTemplates[0].id);
  }, [activeTemplates.length]);

  // Students at the selected school — only fetched when issuing to students.
  const studentsQuery = useQuery({
    queryKey: ['members', schoolId],
    queryFn: async (): Promise<ClubMember[]> => {
      const { data, error } = await supabase
        .from('club_members')
        .select('id, full_name, grade, in_club, is_active, has_disability, disability_notes, joined_at, created_at, school_id')
        .eq('school_id', schoolId)
        .order('full_name');
      if (error) throw new Error(error.message);
      return data as ClubMember[];
    },
    enabled: audience === 'student' && !!schoolId,
  });
  // Filter to active client-side (cache stays compatible with school Members.tsx).
  const students: ClubMember[] | null = (audience === 'student' && schoolId)
    ? (studentsQuery.data?.filter((m) => m.is_active) ?? null)
    : null;

  // Whenever school changes, clear selection.
  useEffect(() => { setStudentIds(new Set()); }, [schoolId, audience]);

  // Teachers list filtered by selected school
  const teachersForSchool = useMemo(
    () => leads.filter((l) => l.school_id === schoolId),
    [leads, schoolId],
  );
  useEffect(() => { setTeacherId(''); }, [schoolId]);

  const issueStudentsMutation = useMutation({
    mutationFn: async (input: { templateId: string; schoolId: string; studentIds: string[]; notes: string }) => {
      const { data: count, error } = await supabase.rpc('admin_bulk_issue_student_certificate', {
        p_template_id: input.templateId,
        p_school_id:   input.schoolId,
        p_student_ids: input.studentIds,
        p_notes:       input.notes.trim() || null,
      });
      if (error) throw new Error(error.message);
      return (count as number) ?? input.studentIds.length;
    },
    onSuccess: (n) => {
      notify('success', `Issued ${n} certificate${n === 1 ? '' : 's'}`, `${template?.title ?? ''}.`);
      setStudentIds(new Set());
      setNotes('');
      onIssued();
    },
    onError: (e) => { notify('warning', 'Issuance failed', e.message); },
  });

  const issueTeacherMutation = useMutation({
    mutationFn: async (input: { templateId: string; teacherId: string; schoolId: string; notes: string }) => {
      const { error } = await supabase.from('certificate_issuances').insert({
        template_id: input.templateId,
        teacher_id:  input.teacherId,
        school_id:   input.schoolId,
        notes:       input.notes.trim() || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      notify('success', 'Certificate issued', template?.title ?? '');
      setTeacherId('');
      setNotes('');
      onIssued();
    },
    onError: (e) => { notify('warning', 'Issuance failed', e.message); },
  });

  const submitting = issueStudentsMutation.isPending || issueTeacherMutation.isPending;
  const err =
    localErr
    ?? studentsQuery.error?.message
    ?? issueStudentsMutation.error?.message
    ?? issueTeacherMutation.error?.message
    ?? null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalErr(null);
    if (!template || !schoolId) return;
    if (audience === 'student') {
      if (studentIds.size === 0) { setLocalErr('Pick at least one student.'); return; }
      issueStudentsMutation.mutate({
        templateId: template.id,
        schoolId,
        studentIds: Array.from(studentIds),
        notes,
      });
    } else {
      if (!teacherId) { setLocalErr('Pick a teacher.'); return; }
      issueTeacherMutation.mutate({
        templateId: template.id,
        teacherId,
        schoolId,
        notes,
      });
    }
  };

  return (
    <section role="region" aria-labelledby="issue-panel-heading">
      <h2 id="issue-panel-heading" className="sr-only">Issue certificate</h2>
      <form onSubmit={onSubmit} aria-labelledby="issue-panel-heading" className="card p-5 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="issue-template">Template</label>
          {activeTemplates.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No active templates. Add one in the Templates tab.
            </p>
          ) : (
            <select id="issue-template" className="field-select" value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}>
              {activeTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} — {t.audience}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="field-label" htmlFor="issue-school">School<span aria-hidden="true" className="text-red-600 ml-0.5">*</span></label>
          <select id="issue-school" className="field-select" value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)} required aria-required="true">
            <option value="" disabled>— pick a school —</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.county ? ` · ${s.county}` : ''}
              </option>
            ))}
          </select>
        </div>

        {audience === 'teacher' && (
          <div>
            <label className="field-label" htmlFor="issue-teacher">Teacher</label>
            <select id="issue-teacher" className="field-select" value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    disabled={teachersForSchool.length === 0}>
              <option value="">{
                teachersForSchool.length === 0
                  ? '— no teachers at this school —'
                  : '— pick a teacher —'
              }</option>
              {teachersForSchool.map((l) => (
                <option key={l.user_id} value={l.user_id}>{l.full_name ?? l.username}</option>
              ))}
            </select>
          </div>
        )}

        {audience === 'student' && (
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <span className="field-label !mb-0" id="issue-students-label">Students</span>
              {students && students.length > 0 && (
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>{studentIds.size} selected</span>
                  <button type="button"
                          onClick={() => setStudentIds(new Set(students.map((s) => s.id)))}
                          className="text-teal-700 hover:underline">Select all</button>
                  <span className="text-gray-300">·</span>
                  <button type="button"
                          onClick={() => setStudentIds(new Set())}
                          className="text-gray-500 hover:text-gray-900">Clear</button>
                </div>
              )}
            </div>
            {!schoolId ? (
              <p className="text-sm text-gray-500 italic">Pick a school first.</p>
            ) : !students ? (
              <p role="status" className="text-sm text-gray-500">Loading students…</p>
            ) : students.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No active students at this school.</p>
            ) : (
              <div role="group" aria-labelledby="issue-students-label" className="border border-warm-200 rounded-md max-h-48 overflow-y-auto bg-warm-50/40">
                {students.map((s) => {
                  const checked = studentIds.has(s.id);
                  return (
                    <label key={s.id}
                           className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-b border-warm-200 last:border-b-0 ${
                             checked ? 'bg-teal-50/60' : 'hover:bg-warm-100/60'
                           }`}>
                      <input type="checkbox" checked={checked}
                             onChange={() => {
                               setStudentIds((cur) => {
                                 const next = new Set(cur);
                                 if (next.has(s.id)) next.delete(s.id);
                                 else next.add(s.id);
                                 return next;
                               });
                             }} />
                      <span className="flex-1 truncate">
                        <span className="font-medium text-gray-900">{s.full_name}</span>
                        {s.grade && <span className="text-xs text-gray-500"> · {s.grade}</span>}
                        {!s.in_club && <span className="text-xs text-gray-400"> · non-club</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="issue-notes">Notes (optional)</label>
          <input id="issue-notes" className="field-input" value={notes}
                 onChange={(e) => setNotes(e.target.value)}
                 placeholder="Anything specific to add to this issuance" />
        </div>

        {err && (
          <div role="alert" className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{err}</span>
          </div>
        )}

        <div className="sm:col-span-2 flex justify-end pt-2 border-t border-warm-200">
          <button type="submit"
                  className="btn-primary"
                  disabled={
                    submitting
                    || !template
                    || !schoolId
                    || (audience === 'student' && studentIds.size === 0)
                    || (audience === 'teacher' && !teacherId)
                  }>
            {submitting
              ? 'Issuing…'
              : audience === 'student'
                ? `Issue to ${studentIds.size} student${studentIds.size === 1 ? '' : 's'}`
                : 'Issue certificate'}
          </button>
        </div>
      </form>
    </section>
  );
}

// -----------------------------------------------------------------
// Recent issuances feed
// -----------------------------------------------------------------

function RecentIssuances({ rows }: { rows: IssuanceRow[] | null }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Award className="h-4 w-4 text-teal-700" aria-hidden="true" />
        <h2 className="m-0">Recent issuances</h2>
        <span className="text-xs text-gray-500">{rows?.length ?? 0}</span>
      </div>
      {!rows ? (
        <SkeletonCards count={4} label="Loading recent issuances" />
      ) : rows.length === 0 ? (
        <div className="card p-8 text-center">
          <Award className="h-7 w-7 text-gray-300 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-gray-500">No certificates issued yet.</p>
        </div>
      ) : (
        <div className="card divide-y divide-warm-200">
          {rows.map((r) => (
            <div key={r.id} className="px-4 py-3 flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-warm-100 mt-0.5 flex-shrink-0">
                  {r.templates?.audience === 'teacher'
                    ? <UserCog className="h-4 w-4 text-gray-700" aria-hidden="true" />
                    : <GraduationCap className="h-4 w-4 text-gray-700" aria-hidden="true" />}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">{r.templates?.title ?? '—'}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    To <span className="text-gray-700">{r.student?.full_name ?? r.teacher?.full_name ?? '—'}</span>
                    {' · '}{r.schools?.name ?? '—'}
                  </div>
                  {r.notes && (
                    <div className="text-xs text-gray-600 italic mt-1">"{r.notes}"</div>
                  )}
                </div>
              </div>
              <div className="text-xs text-emerald-700 inline-flex items-center gap-1 flex-shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {new Date(r.issued_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
