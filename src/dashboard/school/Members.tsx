import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { ClubMember } from '../../lib/database.types';
import { UserPlus, Check, X, Upload, Accessibility } from 'lucide-react';
import { StudentBulkImport } from './StudentBulkImport';

/**
 * /dashboard/school/members
 *
 * The lead teacher digitises their roster here after sign-up. Add + edit +
 * mark inactive. RLS guarantees we can only ever read/write rows for our
 * own school, so we don't need to scope queries by school_id beyond the
 * convenience filter we send to keep the response small.
 */
export function SchoolMembers() {
  const { school } = useAuth();
  const [members, setMembers] = useState<ClubMember[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [importing, setImporting] = useState(false);

  // Add form
  const [addName, setAddName] = useState('');
  const [addGrade, setAddGrade] = useState('');
  const [addInClub, setAddInClub] = useState(true);
  const [addHasDisability, setAddHasDisability] = useState(false);
  const [addDisabilityNotes, setAddDisabilityNotes] = useState('');
  const [adding, setAdding] = useState(false);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');

  const load = async () => {
    if (!school) return;
    const { data, error } = await supabase
      .from('club_members')
      .select('*')
      .eq('school_id', school.id)
      .order('joined_at', { ascending: false });
    if (error) setErr(error.message);
    else setMembers(data as ClubMember[]);
  };

  useEffect(() => { void load(); }, [school?.id]);

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!school || !addName.trim()) return;
    setAdding(true);
    setErr(null);
    const { error } = await supabase.from('club_members').insert({
      school_id: school.id,
      full_name: addName.trim(),
      grade: addGrade.trim() || null,
      in_club: addInClub,
      has_disability: addHasDisability,
      disability_notes: addHasDisability ? (addDisabilityNotes.trim() || null) : null,
    });
    setAdding(false);
    if (error) {
      setErr(error.message);
    } else {
      setAddName('');
      setAddGrade('');
      setAddInClub(true);
      setAddHasDisability(false);
      setAddDisabilityNotes('');
      void load();
    }
  };

  const startEdit = (m: ClubMember) => {
    setEditingId(m.id);
    setEditName(m.full_name);
    setEditGrade(m.grade ?? '');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setErr(null);
    const { error } = await supabase
      .from('club_members')
      .update({ full_name: editName.trim(), grade: editGrade.trim() || null })
      .eq('id', editingId);
    if (error) setErr(error.message);
    setEditingId(null);
    void load();
  };

  const toggleActive = async (m: ClubMember) => {
    setErr(null);
    const { error } = await supabase
      .from('club_members')
      .update({ is_active: !m.is_active })
      .eq('id', m.id);
    if (error) setErr(error.message);
    void load();
  };

  const toggleInClub = async (m: ClubMember) => {
    setErr(null);
    const { error } = await supabase
      .from('club_members')
      .update({ in_club: !m.in_club })
      .eq('id', m.id);
    if (error) setErr(error.message);
    void load();
  };

  const visible = members?.filter((m) => showInactive || m.is_active) ?? null;
  const activeCount = members?.filter((m) => m.is_active).length ?? 0;
  const inactiveCount = (members?.length ?? 0) - activeCount;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            {school?.name ?? 'Your school'}
          </p>
          <h1>Students &amp; club members</h1>
          <p className="text-sm text-gray-600 mt-1">
            Anyone at the school who can hold a durable unit. Tick "in the code club" for kids
            on the official roster; leave it off for students outside the club who still use
            equipment.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="text-sm text-right">
            <div className="text-gray-700">{activeCount} active</div>
            {inactiveCount > 0 && (
              <button
                onClick={() => setShowInactive((s) => !s)}
                className="text-xs text-teal-700 hover:underline"
              >
                {showInactive ? 'Hide inactive' : `Show ${inactiveCount} inactive`}
              </button>
            )}
          </div>
          <button onClick={() => setImporting((v) => !v)} className="btn-secondary">
            <Upload className="h-4 w-4 mr-1.5" />
            Bulk import
          </button>
        </div>
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
          {err}
        </div>
      )}

      {importing && school && (
        <div className="mb-4">
          <StudentBulkImport
            schoolId={school.id}
            onClose={() => setImporting(false)}
            onAllDone={() => { void load(); }}
          />
        </div>
      )}

      {/* Add */}
      <div className="card p-4 mb-6">
        <form onSubmit={onAdd} className="space-y-3">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="field-label" htmlFor="addName">Full name</label>
              <input
                id="addName"
                type="text"
                required
                className="field-input"
                placeholder="e.g. Mary Wanjiku"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
              />
            </div>
            <div className="w-32">
              <label className="field-label" htmlFor="addGrade">Grade</label>
              <input
                id="addGrade"
                type="text"
                className="field-input"
                placeholder="Grade 7"
                value={addGrade}
                onChange={(e) => setAddGrade(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={adding || !addName.trim()}>
              <UserPlus className="h-4 w-4 mr-1.5" />
              Add student
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-1.5 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={addInClub}
                onChange={(e) => setAddInClub(e.target.checked)}
              />
              In the code club
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={addHasDisability}
                onChange={(e) => setAddHasDisability(e.target.checked)}
              />
              <Accessibility className="h-3.5 w-3.5 text-teal-700" />
              Has a disability
            </label>
            {addHasDisability && (
              <input
                type="text"
                className="field-input flex-1 min-w-[200px] !py-1 !text-xs"
                placeholder="Notes (e.g. Visual impairment, Hearing impairment, Wheelchair)"
                value={addDisabilityNotes}
                onChange={(e) => setAddDisabilityNotes(e.target.value)}
              />
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Grade</th>
              <th>Role</th>
              <th>Needs</th>
              <th>Joined</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!visible && (
              <tr><td colSpan={7} className="text-center text-gray-500 py-8">Loading…</td></tr>
            )}
            {visible && visible.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-8">
                  No students yet. Add the first one above.
                </td>
              </tr>
            )}
            {visible?.map((m) => (
              <tr key={m.id} className={m.is_active ? '' : 'opacity-60'}>
                {editingId === m.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        className="field-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="field-input"
                        value={editGrade}
                        onChange={(e) => setEditGrade(e.target.value)}
                      />
                    </td>
                    <td>
                      {m.in_club
                        ? <span className="badge-teal">code club</span>
                        : <span className="badge-gray">student</span>}
                    </td>
                    <td>
                      {m.has_disability ? (
                        <span
                          className="badge-terra inline-flex items-center"
                          title={m.disability_notes ?? ''}
                        >
                          <Accessibility className="h-3 w-3 mr-1" />
                          disability
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-xs text-gray-500">
                      {new Date(m.joined_at).toLocaleDateString()}
                    </td>
                    <td>—</td>
                    <td className="text-right whitespace-nowrap">
                      <button
                        onClick={saveEdit}
                        className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-md"
                        title="Save"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md ml-1"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="font-medium text-gray-900">{m.full_name}</td>
                    <td className="text-gray-700">{m.grade ?? '—'}</td>
                    <td>
                      {m.in_club
                        ? <span className="badge-teal">code club</span>
                        : <span className="badge-gray">student</span>}
                    </td>
                    <td>
                      {m.has_disability ? (
                        <span
                          className="badge-terra inline-flex items-center"
                          title={m.disability_notes ?? ''}
                        >
                          <Accessibility className="h-3 w-3 mr-1" />
                          {m.disability_notes
                            ? m.disability_notes.slice(0, 24)
                            : 'disability'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-xs text-gray-500">
                      {new Date(m.joined_at).toLocaleDateString()}
                    </td>
                    <td>
                      {m.is_active ? (
                        <span className="badge-green">active</span>
                      ) : (
                        <span className="badge-gray">inactive</span>
                      )}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <button
                        onClick={() => startEdit(m)}
                        className="text-xs text-teal-700 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleInClub(m)}
                        className="text-xs text-gray-500 hover:text-gray-900 ml-3"
                      >
                        {m.in_club ? 'Remove from club' : 'Add to club'}
                      </button>
                      <button
                        onClick={() => toggleActive(m)}
                        className="text-xs text-gray-500 hover:text-gray-900 ml-3"
                      >
                        {m.is_active ? 'Mark inactive' : 'Mark active'}
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
