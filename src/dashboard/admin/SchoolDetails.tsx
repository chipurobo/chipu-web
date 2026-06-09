import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type {
  ChipuEvent, ClubMember, EventType, School,
} from '../../lib/database.types';
import {
  ArrowLeft, Wrench, MapPin, Phone, Mail, User, Users, CalendarDays,
  Accessibility, CheckCircle2, AlertCircle, Megaphone, Laptop, MonitorPlay,
} from 'lucide-react';

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
  const [school,   setSchool]   = useState<School | null>(null);
  const [lead,     setLead]     = useState<SchoolLead | null>(null);
  const [events,   setEvents]   = useState<AttendedEvent[] | null>(null);
  const [students, setStudents] = useState<ClubMember[] | null>(null);
  const [err,      setErr]      = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) return;
    let cancelled = false;

    (async () => {
      // 1. School
      const sRes = await supabase.from('schools').select('*').eq('id', schoolId).maybeSingle();
      if (cancelled) return;
      if (sRes.error) { setErr(sRes.error.message); return; }
      setSchool(sRes.data as School);

      // 2. Lead teacher — admin_list_school_leads filters to this school client-side
      const lRes = await supabase.rpc('admin_list_school_leads');
      if (cancelled) return;
      if (lRes.error) { setErr(lRes.error.message); return; }
      const leadRow = (lRes.data as Array<SchoolLead & { school_id: string }>).find(
        (l) => l.school_id === schoolId,
      ) ?? null;
      setLead(leadRow);

      // 3. Events attached to this school + per-school attendance counts
      const eRes = await supabase
        .from('event_schools')
        .select(`
          attended_at,
          events ( * )
        `)
        .eq('school_id', schoolId);
      if (cancelled) return;
      if (eRes.error) { setErr(eRes.error.message); return; }

      const eventIds = (eRes.data as Array<{ events: ChipuEvent }>)
        .map((r) => r.events?.id)
        .filter(Boolean);
      let countsByEvent = new Map<string, number>();
      if (eventIds.length > 0) {
        const aRes = await supabase
          .from('event_attendances')
          .select('event_id')
          .eq('school_id', schoolId)
          .in('event_id', eventIds);
        if (cancelled) return;
        if (aRes.error) { setErr(aRes.error.message); return; }
        (aRes.data as { event_id: string }[]).forEach((r) =>
          countsByEvent.set(r.event_id, (countsByEvent.get(r.event_id) ?? 0) + 1),
        );
      }
      const attended: AttendedEvent[] = (eRes.data as Array<{ attended_at: string | null; events: ChipuEvent }>)
        .filter((r) => !!r.events)
        .map((r) => ({
          ...(r.events as ChipuEvent),
          attended_at: r.attended_at,
          students_marked: countsByEvent.get(r.events.id) ?? 0,
        }))
        .sort((a, b) => +new Date(b.start_at) - +new Date(a.start_at));
      setEvents(attended);

      // 4. Students
      const stRes = await supabase
        .from('club_members')
        .select('*')
        .eq('school_id', schoolId)
        .order('full_name');
      if (cancelled) return;
      if (stRes.error) { setErr(stRes.error.message); return; }
      setStudents(stRes.data as ClubMember[]);
    })();

    return () => { cancelled = true; };
  }, [schoolId]);

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
        <div className="card p-6 mt-4 text-sm text-red-700 bg-red-50 border-red-200">{err}</div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <BackLink />
        <p className="text-sm text-gray-500 mt-4">Loading…</p>
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
              <Wrench className="h-3 w-3 mr-1" />
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
        <StatCard label="Events attended" value={`${stats.attended} / ${stats.invited}`} color="bg-amber-500" />
      </div>

      {/* Overview */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-teal-700" />
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

      {/* Events */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="h-4 w-4 text-teal-700" />
          <h2 className="m-0">Events</h2>
          <span className="text-xs text-gray-500">{events?.length ?? 0}</span>
        </div>
        {!events && <p className="text-sm text-gray-500">Loading…</p>}
        {events && events.length === 0 && (
          <div className="card p-8 text-center">
            <CalendarDays className="h-7 w-7 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No events attached yet.</p>
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
                      <Icon className="h-4 w-4 text-gray-700" />
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
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        attended {new Date(e.attended_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <AlertCircle className="h-3.5 w-3.5" />
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
          <Users className="h-4 w-4 text-teal-700" />
          <h2 className="m-0">Students</h2>
          <span className="text-xs text-gray-500">{students?.length ?? 0}</span>
        </div>
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Grade</th>
                <th>Role</th>
                <th>Needs</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {!students && (
                <tr><td colSpan={6} className="text-center text-gray-500 py-8">Loading…</td></tr>
              )}
              {students && students.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-500 py-8">No students yet.</td></tr>
              )}
              {students?.map((s) => (
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
                        <Accessibility className="h-3 w-3 mr-1" />
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
      <ArrowLeft className="h-4 w-4 mr-1.5" />
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
      <Icon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-[0.7rem] uppercase tracking-wider text-gray-500 mb-0.5">{label}</div>
        <div className="text-sm text-gray-900 break-words">{children}</div>
      </div>
    </div>
  );
}
