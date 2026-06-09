import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import type { ChipuEvent, EventType, School } from '../../lib/database.types';
import {
  CalendarDays, Plus, X, Trash2, MapPin, Link as LinkIcon,
  Megaphone, Laptop, MonitorPlay, Users, CheckCircle2, Clock,
} from 'lucide-react';

// =============================================================
// /dashboard/admin/events
//
// Admin-only data entry for events (outreach + bootcamps). Attach the
// schools that are coming, then click "Mark attended" once they show up —
// the mark_school_attended RPC cascades attendance to every active
// student at that school.
// =============================================================

interface EventRow extends ChipuEvent {
  event_schools: {
    school_id:   string;
    attended_at: string | null;
    schools:     Pick<School, 'id' | 'name'> | null;
  }[];
  attendance_count: number;          // computed client-side from a separate fetch
}

const TYPE_LABEL: Record<EventType, string> = {
  outreach:          'Outreach',
  bootcamp_physical: 'Bootcamp (physical)',
  bootcamp_webinar:  'Bootcamp (webinar)',
};

const TYPE_ICON: Record<EventType, typeof Megaphone> = {
  outreach:          Megaphone,
  bootcamp_physical: Laptop,
  bootcamp_webinar:  MonitorPlay,
};

const TYPE_ACCENT: Record<EventType, string> = {
  outreach:          'bg-teal-500',
  bootcamp_physical: 'bg-amber-500',
  bootcamp_webinar:  'bg-indigo-500',
};

export function AdminEvents() {
  const [events,  setEvents]  = useState<EventRow[] | null>(null);
  const [schools, setSchools] = useState<School[] | null>(null);
  const [err,     setErr]     = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setErr(null);
    const [eRes, sRes, aRes] = await Promise.all([
      supabase
        .from('events')
        .select(`
          *,
          event_schools (
            school_id,
            attended_at,
            schools ( id, name )
          )
        `)
        .order('start_at', { ascending: false }),
      supabase.from('schools').select('id, name, county').order('name'),
      supabase
        .from('event_attendances')
        .select('event_id'),
    ]);

    if (eRes.error)  { setErr(eRes.error.message);  return; }
    if (sRes.error)  { setErr(sRes.error.message);  return; }
    if (aRes.error)  { setErr(aRes.error.message);  return; }

    // Count attendances per event in JS — small dataset, no need for a view.
    const counts = new Map<string, number>();
    (aRes.data as { event_id: string }[]).forEach((r) =>
      counts.set(r.event_id, (counts.get(r.event_id) ?? 0) + 1),
    );

    const rows = (eRes.data as unknown as EventRow[]).map((e) => ({
      ...e,
      attendance_count: counts.get(e.id) ?? 0,
    }));
    setEvents(rows);
    setSchools(sRes.data as School[]);
  };

  useEffect(() => { void load(); }, []);

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this activity? Attached schools and attendance records will be wiped.')) return;
    setErr(null);
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) setErr(error.message);
    else void load();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Admin</p>
          <h1>Activities</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Outreach trips and bootcamps. Attach the schools that are taking part, then mark them
            attended once they show up — every active student at the school is auto-credited.
          </p>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className="btn-primary w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {creating ? 'Cancel' : 'New activity'}
        </button>
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {creating && schools && (
        <NewEventForm
          allSchools={schools}
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); void load(); }}
        />
      )}

      {/* Activity list */}
      <section className="space-y-4">
        {!events && <p className="text-sm text-gray-500">Loading…</p>}
        {events && events.length === 0 && (
          <div className="card p-10 text-center">
            <CalendarDays className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No activities yet.</p>
            <p className="text-xs text-gray-500 mt-1">Create your first one with the button above.</p>
          </div>
        )}
        {events?.map((e) => (
          <EventCard
            key={e.id}
            event={e}
            allSchools={schools ?? []}
            onChanged={load}
            onDelete={() => onDelete(e.id)}
          />
        ))}
      </section>
    </div>
  );
}

// -----------------------------------------------------------------
// Per-event card with attached schools + actions
// -----------------------------------------------------------------

function EventCard({
  event, allSchools, onChanged, onDelete,
}: {
  event: EventRow;
  allSchools: School[];
  onChanged: () => void;
  onDelete: () => void;
}) {
  const Icon = TYPE_ICON[event.event_type];
  const accent = TYPE_ACCENT[event.event_type];

  const [adding, setAdding] = useState(false);
  const [picker, setPicker] = useState('');
  const [localErr, setLocalErr] = useState<string | null>(null);

  const attendedCount = event.event_schools.filter((s) => s.attended_at).length;
  const invitedCount  = event.event_schools.length;

  const attachedIds = new Set(event.event_schools.map((s) => s.school_id));
  const availableSchools = allSchools.filter((s) => !attachedIds.has(s.id));

  const attach = async (e: FormEvent) => {
    e.preventDefault();
    if (!picker) return;
    setAdding(true);
    setLocalErr(null);
    const { error } = await supabase.rpc('attach_school_to_event', {
      p_event_id:  event.id,
      p_school_id: picker,
    });
    setAdding(false);
    if (error) setLocalErr(error.message);
    else { setPicker(''); onChanged(); }
  };

  const markAttended = async (schoolId: string) => {
    setLocalErr(null);
    const { error } = await supabase.rpc('mark_school_attended', {
      p_event_id:  event.id,
      p_school_id: schoolId,
    });
    if (error) setLocalErr(error.message);
    else onChanged();
  };

  const unmarkAttended = async (schoolId: string) => {
    setLocalErr(null);
    const { error } = await supabase.rpc('unmark_school_attended', {
      p_event_id:  event.id,
      p_school_id: schoolId,
    });
    if (error) setLocalErr(error.message);
    else onChanged();
  };

  const removeSchool = async (schoolId: string) => {
    if (!window.confirm('Remove this school from the activity? Any student attendances will be deleted.')) return;
    setLocalErr(null);
    const { error } = await supabase
      .from('event_schools')
      .delete()
      .eq('event_id', event.id)
      .eq('school_id', schoolId);
    if (error) setLocalErr(error.message);
    else onChanged();
  };

  return (
    <article className="card overflow-hidden relative">
      <div className={`h-1 ${accent}`} />

      {/* Delete pinned to the top-right — same spot on every card, never wraps */}
      <button
        type="button"
        onClick={onDelete}
        title="Delete activity"
        aria-label="Delete activity"
        className="absolute top-3 right-3 z-10 p-1.5 rounded-md text-gray-400 hover:text-red-700 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="p-4 sm:p-5 pr-12">
        {/* Header */}
        <div className="mb-3 flex items-start gap-3 min-w-0">
          <div className="mt-0.5 p-2 rounded-md bg-warm-100 flex-shrink-0">
            <Icon className="h-5 w-5 text-gray-700" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-base">{event.title}</h2>
            <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{TYPE_LABEL[event.event_type]}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(event.start_at)}
                {event.end_at && ` → ${formatDate(event.end_at)}`}
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}
              {event.url && (
                <a href={event.url} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1 text-teal-700 hover:underline">
                  <LinkIcon className="h-3 w-3" />
                  Link
                </a>
              )}
            </div>
            {event.description && (
              <p className="text-sm text-gray-700 mt-2">{event.description}</p>
            )}
          </div>
        </div>

        {/* Attendance summary */}
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warm-100 text-gray-700">
            <Users className="h-3 w-3" /> {invitedCount} school{invitedCount === 1 ? '' : 's'} taking part
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> {attendedCount} attended
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-800">
            {event.attendance_count} student attendance{event.attendance_count === 1 ? '' : 's'}
          </span>
        </div>

        {/* Attached schools list */}
        {event.event_schools.length > 0 && (
          <div className="border border-warm-200 rounded-md overflow-hidden mb-3">
            <table className="data-table">
              <thead>
                <tr>
                  <th>School</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {event.event_schools.map((es) => (
                  <tr key={es.school_id}>
                    <td className="text-sm font-medium text-gray-900">
                      {es.schools?.name ?? '—'}
                    </td>
                    <td>
                      {es.attended_at ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          attended {new Date(es.attended_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">invited</span>
                      )}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {es.attended_at ? (
                        <button
                          onClick={() => unmarkAttended(es.school_id)}
                          className="text-xs text-gray-500 hover:text-gray-900"
                        >
                          Unmark
                        </button>
                      ) : (
                        <button
                          onClick={() => markAttended(es.school_id)}
                          className="text-xs text-teal-700 hover:underline"
                        >
                          Mark attended
                        </button>
                      )}
                      <button
                        onClick={() => removeSchool(es.school_id)}
                        className="text-xs text-red-700 hover:underline ml-3"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Attach-school picker */}
        {availableSchools.length > 0 ? (
          <form onSubmit={attach} className="flex gap-2 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="field-label" htmlFor={`attach-${event.id}`}>Attach a school</label>
              <select
                id={`attach-${event.id}`}
                className="field-select"
                value={picker}
                onChange={(e) => setPicker(e.target.value)}
              >
                <option value="" disabled>— pick a school —</option>
                {availableSchools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.county ? ` · ${s.county}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-secondary" disabled={adding || !picker}>
              <Plus className="h-4 w-4 mr-1.5" />
              Attach
            </button>
          </form>
        ) : (
          <p className="text-xs text-gray-500 italic">Every school is already attached to this event.</p>
        )}

        {localErr && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-2">
            {localErr}
          </div>
        )}
      </div>
    </article>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// -----------------------------------------------------------------
// New event form
// -----------------------------------------------------------------

const TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'outreach',          label: 'Outreach'             },
  { value: 'bootcamp_physical', label: 'Bootcamp — physical'  },
  { value: 'bootcamp_webinar',  label: 'Bootcamp — webinar'   },
];

function NewEventForm({
  allSchools, onClose, onCreated,
}: {
  allSchools: School[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title,       setTitle]       = useState('');
  const [type,        setType]        = useState<EventType>('outreach');
  const [description, setDescription] = useState('');
  const [startAt,     setStartAt]     = useState('');
  const [endAt,       setEndAt]       = useState('');
  const [location,    setLocation]    = useState('');
  const [url,         setUrl]         = useState('');
  const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const needsLocation = type === 'outreach' || type === 'bootcamp_physical';
  const needsUrl      = type === 'bootcamp_webinar';

  const toggleSchool = (id: string) => {
    setSelectedSchools((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startAt) return;
    setSaving(true);
    setErr(null);

    // 1. Insert the event and grab its id.
    const { data: created, error } = await supabase
      .from('events')
      .insert({
        title:       title.trim(),
        description: description.trim() || null,
        event_type:  type,
        start_at:    new Date(startAt).toISOString(),
        end_at:      endAt ? new Date(endAt).toISOString() : null,
        location:    needsLocation ? (location.trim() || null) : null,
        url:         needsUrl      ? (url.trim()      || null) : null,
      })
      .select('id')
      .single();

    if (error || !created) {
      setSaving(false);
      setErr(error?.message ?? 'Failed to create activity.');
      return;
    }

    // 2. Attach the selected schools in one bulk insert.
    if (selectedSchools.size > 0) {
      const rows = Array.from(selectedSchools).map((school_id) => ({
        event_id:  created.id,
        school_id,
      }));
      const { error: aErr } = await supabase.from('event_schools').insert(rows);
      if (aErr) {
        setSaving(false);
        setErr(`Activity created but attaching schools failed: ${aErr.message}`);
        return;
      }
    }

    setSaving(false);
    onCreated();
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="m-0">New activity</h2>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="ev-title">Title</label>
          <input
            id="ev-title" type="text" required className="field-input"
            placeholder="e.g. Strathmore outreach — March 2026"
            value={title} onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="ev-type">Type</label>
          <select
            id="ev-type" className="field-select"
            value={type} onChange={(e) => setType(e.target.value as EventType)}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="ev-start">Start</label>
          <input
            id="ev-start" type="datetime-local" required className="field-input"
            value={startAt} onChange={(e) => setStartAt(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="ev-end">End (optional)</label>
          <input
            id="ev-end" type="datetime-local" className="field-input"
            value={endAt} onChange={(e) => setEndAt(e.target.value)}
          />
        </div>

        {needsLocation && (
          <div>
            <label className="field-label" htmlFor="ev-loc">Venue (optional)</label>
            <input
              id="ev-loc" type="text" className="field-input"
              placeholder="e.g. Kibera Primary, Hall A"
              value={location} onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        )}

        {needsUrl && (
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="ev-url">Webinar link (optional)</label>
            <input
              id="ev-url" type="url" className="field-input"
              placeholder="https://…"
              value={url} onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="ev-desc">Description (optional)</label>
          <textarea
            id="ev-desc" rows={3} className="field-input"
            placeholder="What is it, who's leading it…"
            value={description} onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Attach schools right here — no two-step dance */}
        <div className="sm:col-span-2 pt-2 border-t border-warm-200">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
            <div>
              <label className="field-label !mb-0">Attach schools</label>
              <p className="text-xs text-gray-500">
                Pick everyone coming. You can mark them attended after the event happens.
              </p>
            </div>
            {allSchools.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">{selectedSchools.size} selected</span>
                <button
                  type="button"
                  onClick={() => setSelectedSchools(new Set(allSchools.map((s) => s.id)))}
                  className="text-teal-700 hover:underline"
                >
                  Select all
                </button>
                <span className="text-gray-300">·</span>
                <button
                  type="button"
                  onClick={() => setSelectedSchools(new Set())}
                  className="text-gray-500 hover:text-gray-900"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          {allSchools.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No schools registered yet.</p>
          ) : (
            <div className="border border-warm-200 rounded-md max-h-48 overflow-y-auto bg-warm-50/50">
              {allSchools.map((s) => {
                const checked = selectedSchools.has(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-b border-warm-200 last:border-b-0 ${
                      checked ? 'bg-teal-50/60' : 'hover:bg-warm-100/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSchool(s.id)}
                    />
                    <span className="flex-1 truncate">
                      <span className="font-medium text-gray-900">{s.name}</span>
                      {s.county && <span className="text-xs text-gray-500"> · {s.county}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {err && (
          <div className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {err}
          </div>
        )}

        <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-warm-200">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving || !title.trim() || !startAt}>
            {saving
              ? 'Saving…'
              : selectedSchools.size > 0
                ? `Create activity & attach ${selectedSchools.size} school${selectedSchools.size === 1 ? '' : 's'}`
                : 'Create activity'}
          </button>
        </div>
      </form>
    </div>
  );
}
