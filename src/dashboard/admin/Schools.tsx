import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { School, SchoolType } from '../../lib/database.types';
import { KENYA_COUNTIES } from '../../lib/counties';
import { Wrench, Plus, X, Check, KeyRound, Upload, Pencil, Trash2, Send, AlertCircle } from 'lucide-react';
import { SchoolBulkImport } from './SchoolBulkImport';
import { sendEmail } from '../../lib/sendEmail';
import { getDashboardPath } from '../../lib/dashboardUrl';
import { useNotifications } from '../../lib/notifications';

// =============================================================
// Email derivation
//
// Single source of truth: a teacher's login email IS derived from their
// full name. We slug the full name to lowercase-dots and append a stable
// "@chipurobo.local" domain so it can ride Supabase Auth's email-based
// flow without the teacher needing a real inbox. Examples:
//   "Mary Wanjiku"  → "mary.wanjiku@chipurobo.local"
//   "John O'Brien"  → "john.obrien@chipurobo.local"
//   "Naïve Person"  → "naive.person@chipurobo.local"
// =============================================================
export const CHIPUROBO_EMAIL_DOMAIN = 'chipurobo.local';

function deriveUsername(fullName: string): string {
  return fullName
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')   // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, '')
    .trim()
    .replace(/\s+/g, '.')
    .replace(/\.+/g, '.')
    .slice(0, 32);
}

function deriveLoginEmail(fullName: string): string {
  const u = deriveUsername(fullName);
  return u ? `${u}@${CHIPUROBO_EMAIL_DOMAIN}` : '';
}

// Re-attach the @chipurobo.local suffix to a stored username for display.
function usernameToLoginEmail(username: string): string {
  return username.includes('@') ? username : `${username}@${CHIPUROBO_EMAIL_DOMAIN}`;
}

interface SchoolLead {
  user_id:     string;
  username:    string;
  full_name:   string | null;
  phone:       string | null;
  school_id:   string | null;
  school_name: string | null;
}

interface NewCreds {
  school:        string;
  username:      string;
  password:      string;
  contactEmail?: string | null;   // teacher's real address — enables the Send button
}

/**
 * /dashboard/admin/schools
 *
 * Schools live here. Admin can create new ones (RPC creates auth user +
 * school + code_club + promotes profile), see/edit every school lead's
 * username, and reset their password. All credentials writes use
 * SECURITY DEFINER RPCs in 20260601000010_admin_manages_credentials.sql.
 */
export function AdminSchools() {
  const [schools, setSchools] = useState<School[] | null>(null);
  const [leads,   setLeads]   = useState<SchoolLead[] | null>(null);
  const [err,     setErr]     = useState<string | null>(null);

  const [creating, setCreating]         = useState(false);
  const [importing, setImporting]       = useState(false);
  const [editingLead, setEditingLead]   = useState<SchoolLead | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [lastCreated, setLastCreated]   = useState<NewCreds | null>(null);
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [deleting, setDeleting]         = useState(false);

  const load = async () => {
    const [sRes, lRes] = await Promise.all([
      supabase.from('schools').select('*').order('created_at', { ascending: false }),
      supabase.rpc('admin_list_school_leads'),
    ]);
    if (sRes.error) setErr(sRes.error.message);
    else setSchools(sRes.data as School[]);
    if (lRes.error) setErr(lRes.error.message);
    else setLeads(lRes.data as SchoolLead[]);
  };

  useEffect(() => { void load(); }, []);

  const leadBySchool = useMemo(() => {
    const m = new Map<string, SchoolLead>();
    leads?.forEach((l) => { if (l.school_id) m.set(l.school_id, l); });
    return m;
  }, [leads]);

  const toggleSelected = (id: string) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!schools) return;
    setSelected((cur) => {
      if (cur.size === schools.length) return new Set();
      return new Set(schools.map((s) => s.id));
    });
  };

  // Bulk-delete: hit admin_delete_school once per id. Each call is its own
  // transaction so a failure on one school doesn't roll back the others.
  const deleteSchools = async (ids: string[]) => {
    if (ids.length === 0) return;
    const summary = ids.length === 1
      ? `Delete this school?\n\nThis wipes its students, orders, units, stock, and the lead-teacher login. This cannot be undone.`
      : `Delete ${ids.length} schools?\n\nThis wipes their students, orders, units, stock, and lead-teacher logins. This cannot be undone.`;
    if (!window.confirm(summary)) return;

    setDeleting(true);
    setErr(null);
    const failures: { id: string; message: string }[] = [];
    for (const id of ids) {
      const { error } = await supabase.rpc('admin_delete_school', { p_school_id: id });
      if (error) failures.push({ id, message: error.message });
    }
    setDeleting(false);

    if (failures.length > 0) {
      const sampleNames = failures
        .map((f) => schools?.find((s) => s.id === f.id)?.name ?? f.id)
        .slice(0, 3)
        .join(', ');
      setErr(
        `${failures.length} of ${ids.length} schools couldn't be deleted (e.g. ${sampleNames}). ` +
        `First error: ${failures[0].message}`,
      );
    }
    setSelected(new Set());
    void load();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Admin</p>
          <h1>Schools</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Create schools, manage their lead-teacher credentials, and reset passwords. Schools
            don't self-register — share the email + temp password with the teacher manually.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => { setImporting(true); setCreating(false); setEditingLead(null); setLastCreated(null); }}
            className="btn-secondary flex-1 sm:flex-none justify-center"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Bulk import
          </button>
          <button
            onClick={() => { setCreating(true); setImporting(false); setEditingLead(null); setLastCreated(null); }}
            className="btn-primary flex-1 sm:flex-none justify-center"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create school
          </button>
        </div>
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {lastCreated && (
        <CredentialsCard
          title={`${lastCreated.school} created`}
          school={lastCreated.school}
          username={lastCreated.username}
          password={lastCreated.password}
          contactEmail={lastCreated.contactEmail ?? null}
          onDismiss={() => setLastCreated(null)}
        />
      )}

      {creating && (
        <CreateSchoolForm
          onClose={() => setCreating(false)}
          onCreated={(c) => {
            setCreating(false);
            setLastCreated(c);
            void load();
          }}
        />
      )}

      {importing && (
        <SchoolBulkImport
          onClose={() => setImporting(false)}
          onAllDone={() => { void load(); }}
        />
      )}

      {editingLead && (
        <EditCredentialsPanel
          lead={editingLead}
          contactEmail={
            schools?.find((s) => s.id === editingLead.school_id)?.contact_email ?? null
          }
          onClose={() => setEditingLead(null)}
          onSaved={(c) => {
            setEditingLead(null);
            if (c) setLastCreated(c);
            void load();
          }}
        />
      )}

      {editingSchool && (
        <EditSchoolPanel
          school={editingSchool}
          onClose={() => setEditingSchool(null)}
          onSaved={() => { setEditingSchool(null); void load(); }}
        />
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-sm text-gray-500">
          {schools ? `${schools.length} registered` : '…'}
        </span>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-700">
              {selected.size} selected
            </span>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => deleteSchools(Array.from(selected))}
              disabled={deleting}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {deleting ? 'Deleting…' : `Delete ${selected.size}`}
            </button>
          </div>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-8">
                <input
                  type="checkbox"
                  aria-label="Select all schools"
                  checked={!!schools && schools.length > 0 && selected.size === schools.length}
                  ref={(el) => {
                    if (el) el.indeterminate = selected.size > 0 && selected.size < (schools?.length ?? 0);
                  }}
                  onChange={toggleAll}
                />
              </th>
              <th>Name</th>
              <th>Type</th>
              <th>Maker</th>
              <th>County</th>
              <th>Lead teacher</th>
              <th>Email (login)</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!schools && (
              <tr><td colSpan={8} className="text-center text-gray-500 py-8">Loading…</td></tr>
            )}
            {schools && schools.length === 0 && (
              <tr><td colSpan={8} className="text-center text-gray-500 py-8">No schools yet.</td></tr>
            )}
            {schools?.map((s) => {
              const lead = leadBySchool.get(s.id);
              const isSelected = selected.has(s.id);
              return (
                <tr key={s.id} className={isSelected ? 'bg-warm-100/60' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${s.name}`}
                      checked={isSelected}
                      onChange={() => toggleSelected(s.id)}
                    />
                  </td>
                  <td>
                    <Link
                      to={`/dashboard/admin/schools/${s.id}`}
                      className="font-medium text-gray-900 hover:text-teal-700 hover:underline"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td>
                    <span className={
                      s.type === 'special' ? 'badge-terra' :
                      s.type === 'integrated' ? 'badge-amber' :
                      'badge-teal'
                    }>{s.type}</span>
                  </td>
                  <td>
                    {s.is_maker_space ? (
                      <span className="badge-green inline-flex items-center">
                        <Wrench className="h-3 w-3 mr-1" />maker
                      </span>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="text-sm">{s.county ?? '—'}</td>
                  <td className="text-sm">
                    <div className="text-gray-800">{lead?.full_name ?? s.contact_name ?? '—'}</div>
                    {(lead?.phone || s.contact_phone) && (
                      <div className="text-xs text-gray-500">{lead?.phone ?? s.contact_phone}</div>
                    )}
                  </td>
                  <td className="text-sm font-mono">
                    {lead
                      ? usernameToLoginEmail(lead.username)
                      : <span className="text-xs text-gray-400 italic">no lead</span>}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditingSchool(s);
                        setEditingLead(null);
                        setCreating(false);
                        setLastCreated(null);
                      }}
                      className="text-xs text-teal-700 hover:underline inline-flex items-center"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    {lead && (
                      <button
                        onClick={() => {
                          setEditingLead(lead);
                          setEditingSchool(null);
                          setCreating(false);
                          setLastCreated(null);
                        }}
                        className="text-xs text-teal-700 hover:underline inline-flex items-center ml-3"
                      >
                        <KeyRound className="h-3 w-3 mr-1" />
                        Credentials
                      </button>
                    )}
                    <button
                      onClick={() => deleteSchools([s.id])}
                      disabled={deleting}
                      className="text-xs text-red-700 hover:underline inline-flex items-center ml-3 disabled:opacity-60"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const SCHOOL_TYPES: { value: SchoolType; label: string }[] = [
  { value: 'mainstream', label: 'Mainstream' },
  { value: 'integrated', label: 'Integrated' },
  { value: 'special',    label: 'Special'    },
];

function CreateSchoolForm({
  onClose, onCreated,
}: {
  onClose: () => void;
  onCreated: (c: NewCreds) => void;
}) {
  const [schoolName,   setSchoolName]   = useState('');
  const [county,       setCounty]       = useState('');
  const [type,         setType]         = useState<SchoolType>('mainstream');
  const [isMaker,      setIsMaker]      = useState(false);
  const [latitude,     setLatitude]     = useState<string>('');
  const [longitude,    setLongitude]    = useState<string>('');

  const [fullName,     setFullName]     = useState('');
  const [phone,        setPhone]        = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [password,     setPassword]     = useState(() => generatePassword());

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Username is ALWAYS slug(full_name). No separate field, no override.
  const username = useMemo(() => deriveUsername(fullName), [fullName]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    if (username.length < 3) {
      setSubmitting(false);
      setErr('Full name must contain at least 3 valid characters.');
      return;
    }

    // Parse + validate coordinates before talking to the server.
    const lat = latitude.trim() === '' ? null : Number(latitude);
    const lng = longitude.trim() === '' ? null : Number(longitude);
    if ((lat !== null && (Number.isNaN(lat) || lat < -90  || lat > 90))
     || (lng !== null && (Number.isNaN(lng) || lng < -180 || lng > 180))) {
      setSubmitting(false);
      setErr('Coordinates must be valid decimal degrees (lat -90..90, lng -180..180).');
      return;
    }

    const { data, error } = await supabase.rpc('create_school_with_lead', {
      p_username:       username,
      p_password:       password,
      p_full_name:      fullName.trim(),
      p_phone:          phone.trim(),
      p_contact_email:  contactEmail.trim() || null,
      p_school_name:    schoolName.trim(),
      p_county:         county.trim() || null,
      p_school_type:    type,
      p_is_maker_space: isMaker,
      // Roster starts empty; the lead teacher adds students once they log in.
      p_member_count:   0,
    });
    if (error) {
      setSubmitting(false);
      setErr(error.message);
      return;
    }

    // The RPC returns a table; the row holds user_id + school_id. If coords
    // were typed, patch them onto the school straight after creation. Admin
    // RLS lets us update any school.
    const row = Array.isArray(data) ? data[0] : data;
    const schoolId: string | undefined = row?.school_id;
    if (schoolId && (lat !== null || lng !== null)) {
      const { error: uErr } = await supabase
        .from('schools')
        .update({ latitude: lat, longitude: lng })
        .eq('id', schoolId);
      if (uErr) {
        setSubmitting(false);
        setErr(`School created but coordinates failed to save: ${uErr.message}`);
        return;
      }
    }

    setSubmitting(false);
    onCreated({
      school:       schoolName.trim(),
      username,
      password,
      contactEmail: contactEmail.trim() || null,
    });
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="m-0">Create school</h2>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">School</p>
        </div>

        <div>
          <label className="field-label" htmlFor="sname">School name</label>
          <input
            id="sname" type="text" required className="field-input"
            value={schoolName} onChange={(e) => setSchoolName(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="county">County</label>
          <select
            id="county" required className="field-select"
            value={county} onChange={(e) => setCounty(e.target.value)}
          >
            <option value="" disabled>— select a county —</option>
            {KENYA_COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="type">Type</label>
          <select
            id="type" className="field-select" value={type}
            onChange={(e) => setType(e.target.value as SchoolType)}
          >
            {SCHOOL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isMaker} onChange={(e) => setIsMaker(e.target.checked)} />
            <Wrench className="h-3.5 w-3.5 text-teal-700" />
            This school is a maker space (fulfils orders from other schools)
          </label>
        </div>

        <div>
          <label className="field-label" htmlFor="lat">Latitude (optional)</label>
          <input
            id="lat"
            type="number"
            step="any"
            min={-90}
            max={90}
            className="field-input font-mono"
            placeholder="-1.2921"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="lng">Longitude (optional)</label>
          <input
            id="lng"
            type="number"
            step="any"
            min={-180}
            max={180}
            className="field-input font-mono"
            placeholder="36.8219"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
          <p className="field-help">
            Any school with coordinates shows up on the public map. Lookup on{' '}
            <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"
               className="text-teal-700 hover:underline">Google Maps</a>{' '}
            — right-click the location and copy the lat,lng pair.
          </p>
        </div>

        <div className="sm:col-span-2 pt-2 border-t border-warm-200">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Lead teacher login</p>
        </div>

        <div>
          <label className="field-label" htmlFor="fname">Full name</label>
          <input
            id="fname" type="text" required className="field-input"
            value={fullName} onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="phone">Phone</label>
          <input
            id="phone" type="tel" className="field-input" placeholder="+254 …"
            value={phone} onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="email">Teacher's email (for your records)</label>
          <input
            id="email" type="email" className="field-input"
            value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
          />
          <p className="field-help">Optional — kept on the school record so you know how to reach them.</p>
        </div>

        <div>
          <label className="field-label">Email (auto)</label>
          <input
            type="text" readOnly
            className="field-input font-mono bg-warm-100 text-gray-700"
            value={username ? deriveLoginEmail(fullName) : '— enter a full name above —'}
            tabIndex={-1}
          />
          <p className="field-help">
            The teacher logs in with this email. It's derived from the full name above.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="pw">Temporary password</label>
          <div className="flex gap-2">
            <input
              id="pw" type="text" required minLength={8}
              className="field-input font-mono"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button" onClick={() => setPassword(generatePassword())}
              className="btn-secondary !px-3" title="Regenerate"
            >↻</button>
          </div>
          <p className="field-help">
            You'll see this once after saving — copy and email it to the teacher manually.
          </p>
        </div>

        {err && (
          <div className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {err}
          </div>
        )}

        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-warm-200">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create school'}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditSchoolPanel({
  school, onClose, onSaved,
}: {
  school: School;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name,         setName]         = useState(school.name);
  const [type,         setType]         = useState<SchoolType>(school.type);
  const [county,       setCounty]       = useState<string>(school.county ?? '');
  const [isMaker,      setIsMaker]      = useState(school.is_maker_space);
  const [contactPhone, setContactPhone] = useState<string>(school.contact_phone ?? '');
  const [contactEmail, setContactEmail] = useState<string>(school.contact_email ?? '');
  const [latitude,     setLatitude]     = useState<string>(school.latitude  != null ? String(school.latitude)  : '');
  const [longitude,    setLongitude]    = useState<string>(school.longitude != null ? String(school.longitude) : '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);

    const lat = latitude.trim()  === '' ? null : Number(latitude);
    const lng = longitude.trim() === '' ? null : Number(longitude);
    if ((lat !== null && (Number.isNaN(lat) || lat < -90  || lat > 90))
     || (lng !== null && (Number.isNaN(lng) || lng < -180 || lng > 180))) {
      setSaving(false);
      setErr('Coordinates must be valid decimal degrees (lat -90..90, lng -180..180).');
      return;
    }

    const { error } = await supabase
      .from('schools')
      .update({
        name:           name.trim(),
        type,
        county:         county.trim() || null,
        is_maker_space: isMaker,
        contact_phone:  contactPhone.trim() || null,
        contact_email:  contactEmail.trim() || null,
        latitude:       lat,
        longitude:      lng,
      })
      .eq('id', school.id);

    setSaving(false);
    if (error) setErr(error.message);
    else onSaved();
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="m-0">Edit school — {school.name}</h2>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900">
          <X className="h-4 w-4" />
        </button>
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="ename">School name</label>
          <input
            id="ename" type="text" required className="field-input"
            value={name} onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="ecounty">County</label>
          <select
            id="ecounty" className="field-select"
            value={county} onChange={(e) => setCounty(e.target.value)}
          >
            <option value="">— none —</option>
            {KENYA_COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="etype">Type</label>
          <select
            id="etype" className="field-select"
            value={type} onChange={(e) => setType(e.target.value as SchoolType)}
          >
            {SCHOOL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isMaker} onChange={(e) => setIsMaker(e.target.checked)} />
            <Wrench className="h-3.5 w-3.5 text-teal-700" />
            This school is a maker space
          </label>
        </div>

        <div>
          <label className="field-label" htmlFor="elat">Latitude</label>
          <input
            id="elat" type="number" step="any" min={-90} max={90}
            className="field-input font-mono" placeholder="-1.2921"
            value={latitude} onChange={(e) => setLatitude(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="elng">Longitude</label>
          <input
            id="elng" type="number" step="any" min={-180} max={180}
            className="field-input font-mono" placeholder="36.8219"
            value={longitude} onChange={(e) => setLongitude(e.target.value)}
          />
          <p className="field-help">
            Any school with coordinates appears on the public map.
          </p>
        </div>

        <div>
          <label className="field-label" htmlFor="ephone">Contact phone</label>
          <input
            id="ephone" type="tel" className="field-input"
            value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="eemail">Contact email</label>
          <input
            id="eemail" type="email" className="field-input"
            value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-warm-200">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving || !name.trim()}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditCredentialsPanel({
  lead, contactEmail, onClose, onSaved,
}: {
  lead: SchoolLead;
  contactEmail: string | null;
  onClose: () => void;
  onSaved: (creds: NewCreds | null) => void;
}) {
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Username is locked — it's always derived from the lead's full name when
  // the school was created. Editing it would break the "one consistent
  // naming scheme" invariant, so we just display it read-only.

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setSaving(true); setErr(null);
    const { error } = await supabase.rpc('admin_reset_lead_password', {
      p_user_id:      lead.user_id,
      p_new_password: password,
    });
    setSaving(false);
    if (error) {
      setErr(error.message);
    } else {
      onSaved({
        school:       lead.school_name ?? '—',
        username:     lead.username,
        password,
        contactEmail,
      });
      setPassword('');
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="m-0">Credentials — {lead.school_name ?? '—'}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Teacher: {lead.full_name ?? '—'} · Email:{' '}
            <span className="font-mono">{usernameToLoginEmail(lead.username)}</span>
          </p>
        </div>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900">
          <X className="h-4 w-4" />
        </button>
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
          {err}
        </div>
      )}

      <form onSubmit={savePassword} className="border border-warm-200 rounded-md p-3 bg-warm-50">
        <h3 className="m-0 mb-2 flex items-center text-sm">
          <KeyRound className="h-3.5 w-3.5 mr-1 text-teal-700" />
          Reset password
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            minLength={8}
            className="field-input font-mono"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setPassword(generatePassword())}
            className="btn-secondary !px-2"
            title="Generate"
          >↻</button>
        </div>
        <p className="field-help">
          On save you'll see the password once — copy and share it with the teacher.
        </p>
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="btn-primary !py-1 !px-3 !text-xs"
            disabled={saving || password.length < 8}
          >
            {saving ? 'Saving…' : 'Reset password'}
          </button>
        </div>
      </form>
    </div>
  );
}

function CredentialsCard({
  title, school, username, password, contactEmail, onDismiss,
}: {
  title: string;
  school: string; username: string; password: string;
  contactEmail?: string | null;
  onDismiss: () => void;
}) {
  const { notify } = useNotifications();
  const [sending, setSending] = useState(false);
  const [result, setResult]   = useState<
    | { state: 'idle' }
    | { state: 'sent';  to: string }
    | { state: 'error'; message: string }
  >({ state: 'idle' });

  const loginEmail = usernameToLoginEmail(username);
  const loginUrl   = getDashboardPath('/dashboard/login');

  const text =
`Hi,

Your ChipuRobo code-club dashboard is ready.

  School:   ${school}
  Login:    ${loginUrl}
  Email:    ${loginEmail}
  Password: ${password}

Please sign in and let us know if anything looks off.

— ChipuRobo`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#1f2937;max-width:560px;">
      <h2 style="margin:0 0 8px;">Welcome to ChipuRobo</h2>
      <p>Your code-club dashboard for <strong>${escapeHtml(school)}</strong> is ready.</p>
      <table style="border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Login</td>
            <td style="padding:4px 0;"><a href="${escapeHtml(loginUrl)}">${escapeHtml(loginUrl)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Email</td>
            <td style="padding:4px 0;font-family:monospace;">${escapeHtml(loginEmail)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Password</td>
            <td style="padding:4px 0;font-family:monospace;">${escapeHtml(password)}</td></tr>
      </table>
      <p style="color:#6b7280;font-size:13px;">Please sign in and let us know if anything looks off.</p>
      <p style="color:#6b7280;font-size:13px;">— ChipuRobo</p>
    </div>`;

  const doSend = async () => {
    if (!contactEmail) return;
    setSending(true);
    setResult({ state: 'idle' });
    const { ok, error } = await sendEmail({
      to:      contactEmail,
      subject: `Your ChipuRobo dashboard — ${school}`,
      html,
      text,
    });
    setSending(false);
    if (ok) {
      setResult({ state: 'sent', to: contactEmail });
      notify('success', 'Credentials emailed', `Sent to ${contactEmail}.`);
    } else {
      const message = error ?? 'send failed';
      setResult({ state: 'error', message });
      notify('warning', 'Email failed to send', message);
    }
  };

  return (
    <div className="card p-5 border-2 border-teal-500 bg-teal-50/40">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="m-0">{title}</h2>
          <p className="text-sm text-gray-600 mt-0.5">
            {contactEmail
              ? <>Send the credentials to <span className="font-mono">{contactEmail}</span> now — the password is only visible here.</>
              : 'No teacher email is on record. Add one to the school before you can send credentials.'}
          </p>
        </div>
        <button onClick={onDismiss} className="p-1 text-gray-500 hover:text-gray-900" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>

      <pre className="text-xs font-mono whitespace-pre-wrap bg-white border border-warm-200 rounded-md p-3 overflow-x-auto">
        {text}
      </pre>

      {result.state === 'sent' && (
        <div className="mt-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 flex items-center gap-2">
          <Check className="h-4 w-4 flex-shrink-0" />
          <span>Sent to <strong>{result.to}</strong>.</span>
        </div>
      )}
      {result.state === 'error' && (
        <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium">Couldn't send the email.</div>
            <div className="text-xs text-red-700/80 mt-0.5">{result.message}</div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-3">
        <button
          type="button"
          onClick={doSend}
          disabled={!contactEmail || sending}
          title={contactEmail ? `Send to ${contactEmail}` : 'No teacher email on record'}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending
            ? 'Sending…'
            : result.state === 'sent'
              ? <><Check className="h-4 w-4 mr-1.5" />Resend</>
              : <><Send className="h-4 w-4 mr-1.5" />{contactEmail ? `Send to ${contactEmail}` : 'No email on file'}</>}
        </button>
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generatePassword(): string {
  const a = 'abcdefghjkmnpqrstuvwxyz23456789';
  const len = 6;
  const pick = () => Array.from({ length: len }, () => a[Math.floor(Math.random() * a.length)]).join('');
  return `${pick()}-${pick()}`;
}
