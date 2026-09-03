import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../lib/notifications';
import { generatePassword } from '../../lib/password';
import { sendInvite } from '../../lib/inviteEmail';
import {
  fetchSchoolById,
  fetchEventSchoolsWithEvent,
  fetchEventAttendances,
  fetchMembersBySchool,
} from '../../lib/gql/queries';
import type {
  ChipuEvent, EventType,
} from '../../lib/database.types';
import {
  ArrowLeft, Wrench, MapPin, Phone, Mail, User, Users, CalendarDays,
  Accessibility, CheckCircle2, AlertCircle, Megaphone, Laptop, MonitorPlay,
} from 'lucide-react';
import { Pagination, usePaged } from '../components/Pagination';
import { SkeletonRows } from '../components/Skeletons';

interface SchoolLead {
  user_id:   string;
  username:  string;
  full_name: string | null;
  phone:     string | null;
}

interface AttendedEvent extends ChipuEvent {
  attended_at:     string | null;
  students_marked: number;
}

const TYPE_ICON: Record<EventType, typeof Megaphone> = {
  outreach:          Megaphone,
  bootcamp_physical: Laptop,
  bootcamp_webinar:  MonitorPlay,
};

const TYPE_LABEL: Record<EventType, string> = {
  outreach:          'Outreach',
  bootcamp_physical: 'Bootcamp (physical)',
  bootcamp_webinar:  'Bootcamp (webinar)',
};

/**
 * /dashboard/admin/schools/:schoolId
 *
 * Admin-only deep-dive on a single school. Three sections:
 *   • Overview  — type, location, contact, lead teacher
 *   • Events    — every event the school is attached to + per-school attendance count
 *   • Students  — full active roster, disability flag highlighted
 */
export function AdminSchoolDetails() {
  const { schoolId } = useParams<{ schoolId: string }>();

  const schoolQuery = useQuery({
    queryKey: ['schools', schoolId],
    queryFn: () => fetchSchoolById(schoolId!),
    enabled: !!schoolId,
  });

  const leadsQuery = useQuery({
    queryKey: ['school-leads'],
    queryFn: async (): Promise<Array<SchoolLead & { school_id: string }>> => {
      const { data, error } = await supabase.rpc('admin_list_school_leads');
      if (error) throw new Error(error.message);
      return data as Array<SchoolLead & { school_id: string }>;
    },
  });

  // Events attached to this school + per-school attendance counts in one query.
  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: fetchEventSchoolsWithEvent,
  });

  const attendancesQuery = useQuery({
    queryKey: ['event-attendances'],
    queryFn: fetchEventAttendances,
  });

  const studentsQuery = useQuery({
    queryKey: ['members', schoolId],
    queryFn: () => fetchMembersBySchool(schoolId!),
    enabled: !!schoolId,
  });

  const school = schoolQuery.data ?? null;
  const lead = useMemo<SchoolLead | null>(() => {
    if (!leadsQuery.data || !schoolId) return null;
    return leadsQuery.data.find((l) => l.school_id === schoolId) ?? null;
  }, [leadsQuery.data, schoolId]);

  const events: AttendedEvent[] | null = useMemo(() => {
    if (!eventsQuery.data || !schoolId) return null;
    const rowsForSchool = eventsQuery.data.filter((r) => r.school_id === schoolId && r.event);
    const countsByEvent = new Map<string, number>();
    (attendancesQuery.data ?? []).forEach((r) => {
      if (r.school_id !== schoolId) return;
      countsByEvent.set(r.event_id, (countsByEvent.get(r.event_id) ?? 0) + 1);
    });
    return rowsForSchool
      .map((r) => ({
        ...(r.event as ChipuEvent),
        attended_at: r.attended_at,
        students_marked: countsByEvent.get(r.event_id) ?? 0,
      }))
      .sort((a, b) => +new Date(b.start_at) - +new Date(a.start_at));
  }, [eventsQuery.data, attendancesQuery.data, schoolId]);

  const students = studentsQuery.data ?? null;

  const { paged: pagedStudents, page, setPage, totalPages } = usePaged(students, 25);

  const err =
    schoolQuery.error?.message
    ?? leadsQuery.error?.message
    ?? eventsQuery.error?.message
    ?? attendancesQuery.error?.message
    ?? studentsQuery.error?.message
    ?? null;

  const stats = useMemo(() => ({
    students:  students?.length ?? 0,
    inClub:    students?.filter((s) => s.in_club).length ?? 0,
    disabilities: students?.filter((s) => s.has_disability).length ?? 0,
    attended:  events?.filter((e) => e.attended_at).length ?? 0,
    invited:   events?.length ?? 0,
  }), [students, events]);

  if (err) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <BackLink />
        <div role="alert" className="card p-6 mt-4 text-sm text-red-700 bg-red-50 border-red-200">{err}</div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <BackLink />
        <p role="status" className="text-sm text-gray-500 mt-4">Loading…</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-8">
      <BackLink />

      {/* Hero */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="m-0">{school.name}</h1>
          <span className={
            school.type === 'special' ? 'badge-terra' :
            school.type === 'integrated' ? 'badge-amber' :
            'badge-teal'
          }>{school.type}</span>
          {school.is_maker_space && (
            <span className="badge-green inline-flex items-center">
              <Wrench className="h-3 w-3 mr-1" aria-hidden="true" />
              maker space
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 max-w-2xl">
          Admin view — overview, attached events, and the full student roster.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Students"  value={stats.students}  color="bg-teal-500" />
        <StatCard label="In club"   value={stats.inClub}    color="bg-indigo-500" />
        <StatCard label="Disability flagged" value={stats.disabilities} color="bg-terracotta-500" />
        <StatCard label="Activities attended" value={`${stats.attended} / ${stats.invited}`} color="bg-amber-500" />
      </div>

      {/* Overview */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-teal-700" aria-hidden="true" />
          <h2 className="m-0">Overview</h2>
        </div>
        <div className="card p-5 grid sm:grid-cols-2 gap-4 text-sm">
          <Row icon={MapPin} label="County">{school.county ?? '—'}</Row>
          <Row icon={MapPin} label="Coordinates">
            {school.latitude != null && school.longitude != null
              ? <span className="font-mono">{school.latitude}, {school.longitude}</span>
              : '—'}
          </Row>
          <Row icon={User}   label="Lead teacher">{lead?.full_name ?? school.contact_name ?? '—'}</Row>
          <Row icon={Mail}   label="Login email">
            {lead ? <span className="font-mono">{lead.username}@chipurobo.local</span> : '—'}
          </Row>
          <Row icon={Phone}  label="Phone">{lead?.phone ?? school.contact_phone ?? '—'}</Row>
          <Row icon={Mail}   label="Contact email">{school.contact_email ?? '—'}</Row>
          <Row icon={CalendarDays} label="Registered">
            {new Date(school.created_at).toLocaleDateString()}
          </Row>
        </div>
      </section>

      {/* Teachers — the second one onwards. create_school_with_lead makes a
          school and its first teacher together, so this is the only way to add
          another, and SessionRegister has needed it all along. */}
      <SchoolTeachers schoolId={schoolId!} schoolName={school.name} />

      {/* Activities */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="h-4 w-4 text-teal-700" aria-hidden="true" />
          <h2 className="m-0">Activities</h2>
          <span className="text-xs text-gray-500">{events?.length ?? 0}</span>
        </div>
        {!events && <p role="status" className="text-sm text-gray-500">Loading…</p>}
        {events && events.length === 0 && (
          <div className="card p-8 text-center">
            <CalendarDays className="h-7 w-7 text-gray-300 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm text-gray-500">No activities attached yet.</p>
          </div>
        )}
        {events && events.length > 0 && (
          <div className="card divide-y divide-warm-200">
            {events.map((e) => {
              const Icon = TYPE_ICON[e.event_type];
              return (
                <div key={e.id} className="px-4 py-3 flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-warm-100 mt-0.5 flex-shrink-0">
                      <Icon className="h-4 w-4 text-gray-700" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900">{e.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {TYPE_LABEL[e.event_type]} · {new Date(e.start_at).toLocaleDateString()}
                        {e.location && <> · {e.location}</>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs flex-shrink-0">
                    {e.attended_at ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        attended {new Date(e.attended_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        invited
                      </span>
                    )}
                    <span className="text-gray-500">
                      {e.students_marked} student attendance{e.students_marked === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Students */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-teal-700" aria-hidden="true" />
          <h2 className="m-0">Students</h2>
          <span className="text-xs text-gray-500">{students?.length ?? 0}</span>
        </div>
        <div className="card overflow-x-auto">
          <table className="data-table" aria-label="Students at this school">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Grade</th>
                <th scope="col">Role</th>
                <th scope="col">Needs</th>
                <th scope="col">Status</th>
                <th scope="col">Joined</th>
              </tr>
            </thead>
            <tbody>
              {!students && (
                <SkeletonRows rows={5} cols={6} label="Loading students" />
              )}
              {students && students.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-500 py-8">No students yet.</td></tr>
              )}
              {pagedStudents?.map((s) => (
                <tr key={s.id} className={s.is_active ? '' : 'opacity-60'}>
                  <td className="font-medium text-gray-900">{s.full_name}</td>
                  <td className="text-sm text-gray-700">{s.grade ?? '—'}</td>
                  <td>
                    {s.in_club
                      ? <span className="badge-teal">code club</span>
                      : <span className="badge-gray">student</span>}
                  </td>
                  <td>
                    {s.has_disability ? (
                      <span className="badge-terra inline-flex items-center" title={s.disability_notes ?? ''}>
                        <Accessibility className="h-3 w-3 mr-1" aria-hidden="true" />
                        {s.disability_notes ? s.disability_notes.slice(0, 24) : 'disability'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td>
                    {s.is_active
                      ? <span className="badge-green">active</span>
                      : <span className="badge-gray">inactive</span>}
                  </td>
                  <td className="text-xs text-gray-500">
                    {new Date(s.joined_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </section>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/dashboard/admin/schools"
      className="inline-flex items-center text-sm text-teal-700 hover:underline"
    >
      <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
      All schools
    </Link>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="card p-3 flex items-center gap-3">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
      <div className="min-w-0">
        <div className="text-2xl font-semibold text-gray-900 leading-none">{value}</div>
        <div className="text-xs text-gray-500 mt-1">{label}</div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon, label, children,
}: { icon: typeof User; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <Icon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <div className="text-[0.7rem] uppercase tracking-wider text-gray-500 mb-0.5">{label}</div>
        <div className="text-sm text-gray-900 break-words">{children}</div>
      </div>
    </div>
  );
}

// =============================================================
// Add a teacher to a school that already exists.
//
// The account is created and the welcome email goes out in one action, using
// the same invite as every other onboarding path. The temporary password is
// shown once afterwards, because a send can fail and the admin still has to be
// able to pass it on.
// =============================================================
function SchoolTeachers({ schoolId, schoolName }: { schoolId: string; schoolName: string }) {
  const qc = useQueryClient();
  const { notify } = useNotifications();

  const [open, setOpen]         = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState(() => generatePassword());
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState<string | null>(null);
  const [created, setCreated]   = useState<{ email: string; password: string; emailed: boolean } | null>(null);

  const { data: teachers } = useQuery({
    queryKey: ['school-teachers', schoolId],
    queryFn: async () => unwrapProfiles(
      await supabase.from('profiles')
        .select('id, full_name, phone, role')
        .eq('school_id', schoolId)
        .order('full_name'),
    ),
  });

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const login = email.trim().toLowerCase();
    const { error } = await supabase.rpc('add_teacher_to_school', {
      p_login_email: login,
      p_password:    password,
      p_full_name:   fullName.trim(),
      p_phone:       phone.trim(),
      p_school_id:   schoolId,
    });
    if (error) { setBusy(false); setErr(error.message); return; }

    const invite = await sendInvite(login, {
      school: schoolName, loginEmail: login, password,
    });
    setBusy(false);
    setCreated({ email: login, password, emailed: invite.ok });
    setFullName(''); setEmail(''); setPhone(''); setPassword(generatePassword());
    setOpen(false);
    void qc.invalidateQueries({ queryKey: ['school-teachers', schoolId] });
    notify(
      invite.ok ? 'success' : 'warning',
      'Teacher added',
      invite.ok ? `Welcome email sent to ${login}.`
                : `Account created, but the email did not send: ${invite.error ?? 'send failed'}`,
    );
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <User className="h-4 w-4 text-teal-700" aria-hidden="true" />
        <h2 className="m-0">Teachers</h2>
        <span className="text-xs text-gray-500">{teachers?.length ?? 0}</span>
        <button type="button" className="btn-secondary ml-auto text-sm" onClick={() => setOpen((v) => !v)}>
          {open ? 'Cancel' : 'Add teacher'}
        </button>
      </div>

      {created && (
        <div className="card p-4 mb-3 border-teal-300 bg-teal-50">
          <p className="text-sm text-gray-900 m-0">
            <strong>{created.email}</strong> can sign in now.{' '}
            {created.emailed
              ? 'Their welcome email has been sent.'
              : 'The welcome email did not send — pass these on yourself.'}
          </p>
          <p className="text-sm font-mono mt-1 mb-0">Temporary password: {created.password}</p>
        </div>
      )}

      {open && (
        <form onSubmit={submit} className="card p-4 mb-3 grid gap-3 sm:grid-cols-2">
          {err && <p role="alert" className="text-sm text-red-700 sm:col-span-2 m-0">{err}</p>}
          <div>
            <label className="field-label" htmlFor="tt-name">Full name</label>
            <input id="tt-name" className="field-input" required value={fullName}
                   onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="tt-email">Email (their login)</label>
            <input id="tt-email" type="email" className="field-input" required value={email}
                   onChange={(e) => setEmail(e.target.value)} placeholder="teacher@school.ac.ke" />
          </div>
          <div>
            <label className="field-label" htmlFor="tt-phone">Phone</label>
            <input id="tt-phone" className="field-input" value={phone}
                   onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="tt-pw">Temporary password</label>
            <div className="flex gap-2">
              <input id="tt-pw" className="field-input font-mono" minLength={8} value={password}
                     onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="btn-secondary !px-2" aria-label="Generate password"
                      onClick={() => setPassword(generatePassword())}>↻</button>
            </div>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={busy || !emailOk || !fullName.trim()}>
              {busy ? 'Adding…' : 'Add teacher and send welcome email'}
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="data-table" aria-label={`Teachers at ${schoolName}`}>
          <thead><tr><th>Name</th><th>Phone</th><th>Role</th></tr></thead>
          <tbody>
            {(teachers ?? []).length === 0 && (
              <tr><td colSpan={3} className="text-sm text-gray-500 italic">No teachers yet.</td></tr>
            )}
            {(teachers ?? []).map((t) => (
              <tr key={t.id}>
                <td className="text-sm">{t.full_name ?? '—'}</td>
                <td className="text-sm">{t.phone ?? '—'}</td>
                <td className="text-sm">{t.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function unwrapProfiles(res: { data: unknown; error: { message: string } | null }) {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as Array<{ id: string; full_name: string | null; phone: string | null; role: string }>;
}
