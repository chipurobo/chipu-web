import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { fetchMembersBySchoolJoinedDesc } from '../../lib/gql/queries';
import { useAuth } from '../../lib/auth';
import type { ClubMember } from '../../lib/database.types';
import { UserPlus, Check, X, Upload, Accessibility } from 'lucide-react';
import { StudentBulkImport } from './StudentBulkImport';
import { Pagination, usePaged } from '../components/Pagination';
import { SkeletonRows } from '../components/Skeletons';

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
  const qc = useQueryClient();
  const schoolId = school?.id ?? null;

  const [showInactive, setShowInactive] = useState(false);
  const [importing, setImporting] = useState(false);

  // Add form
  const [addName, setAddName] = useState('');
  const [addGrade, setAddGrade] = useState('');
  const [addInClub, setAddInClub] = useState(true);
  const [addHasDisability, setAddHasDisability] = useState(false);
  const [addDisabilityNotes, setAddDisabilityNotes] = useState('');

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');

  const { data: members, error: queryErr } = useQuery({
    queryKey: ['members', schoolId],
    queryFn: () => fetchMembersBySchoolJoinedDesc(schoolId!),
    enabled: !!schoolId,
  });

  const addMutation = useMutation({
    mutationFn: async (input: {
      name: string; grade: string; inClub: boolean;
      hasDisability: boolean; disabilityNotes: string;
    }) => {
      const { error } = await supabase.from('club_members').insert({
        school_id: schoolId!,
        full_name: input.name.trim(),
        grade: input.grade.trim() || null,
        in_club: input.inClub,
        has_disability: input.hasDisability,
        disability_notes: input.hasDisability ? (input.disabilityNotes.trim() || null) : null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setAddName('');
      setAddGrade('');
      setAddInClub(true);
      setAddHasDisability(false);
      setAddDisabilityNotes('');
    },
    onSettled: () => { void qc.invalidateQueries({ queryKey: ['members', schoolId] }); },
  });

  const editMutation = useMutation({
    mutationFn: async (input: { id: string; name: string; grade: string }) => {
      const { error } = await supabase
        .from('club_members')
        .update({ full_name: input.name.trim(), grade: input.grade.trim() || null })
        .eq('id', input.id);
      if (error) throw new Error(error.message);
    },
    onSettled: () => { void qc.invalidateQueries({ queryKey: ['members', schoolId] }); },
  });

  // Single-field flip → optimistic.
  const toggleActiveMutation = useMutation({
    mutationFn: async (m: ClubMember) => {
      const { error } = await supabase
        .from('club_members')
        .update({ is_active: !m.is_active })
        .eq('id', m.id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (m) => {
      await qc.cancelQueries({ queryKey: ['members', schoolId] });
      const previous = qc.getQueryData<ClubMember[]>(['members', schoolId]);
      qc.setQueryData<ClubMember[]>(['members', schoolId], (rows) =>
        rows?.map((r) => (r.id === m.id ? { ...r, is_active: !m.is_active } : r)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(['members', schoolId], ctx.previous);
    },
    onSettled: () => { void qc.invalidateQueries({ queryKey: ['members', schoolId] }); },
  });

  const toggleInClubMutation = useMutation({
    mutationFn: async (m: ClubMember) => {
      const { error } = await supabase
        .from('club_members')
        .update({ in_club: !m.in_club })
        .eq('id', m.id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (m) => {
      await qc.cancelQueries({ queryKey: ['members', schoolId] });
      const previous = qc.getQueryData<ClubMember[]>(['members', schoolId]);
      qc.setQueryData<ClubMember[]>(['members', schoolId], (rows) =>
        rows?.map((r) => (r.id === m.id ? { ...r, in_club: !m.in_club } : r)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(['members', schoolId], ctx.previous);
    },
    onSettled: () => { void qc.invalidateQueries({ queryKey: ['members', schoolId] }); },
  });

  const err =
    queryErr?.message
    ?? addMutation.error?.message
    ?? editMutation.error?.message
    ?? toggleActiveMutation.error?.message
    ?? toggleInClubMutation.error?.message
    ?? null;
  const adding = addMutation.isPending;

  const onAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!schoolId || !addName.trim()) return;
    addMutation.mutate({
      name: addName,
      grade: addGrade,
      inClub: addInClub,
      hasDisability: addHasDisability,
      disabilityNotes: addDisabilityNotes,
    });
  };

  const startEdit = (m: ClubMember) => {
    setEditingId(m.id);
    setEditName(m.full_name);
    setEditGrade(m.grade ?? '');
  };

  const saveEdit = () => {
    if (!editingId) return;
    editMutation.mutate({ id: editingId, name: editName, grade: editGrade });
    setEditingId(null);
  };

  const toggleActive = (m: ClubMember) => toggleActiveMutation.mutate(m);
  const toggleInClub = (m: ClubMember) => toggleInClubMutation.mutate(m);

  const visible = members?.filter((m) => showInactive || m.is_active) ?? null;
  const activeCount = members?.filter((m) => m.is_active).length ?? 0;
  const inactiveCount = (members?.length ?? 0) - activeCount;

  const { paged: pagedVisible, page, setPage, totalPages } = usePaged(visible, 25);

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
        <div className="flex gap-3 items-center flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-sm">
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
            <Upload className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Bulk import
          </button>
        </div>
      </div>

      {err && (
        <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
          {err}
        </div>
      )}

      {importing && school && (
        <div className="mb-4">
          <StudentBulkImport
            schoolId={school.id}
            onClose={() => setImporting(false)}
            onAllDone={() => { void qc.invalidateQueries({ queryKey: ['members', schoolId] }); }}
          />
        </div>
      )}

      {/* Add */}
      <div role="region" aria-label="Add student" className="card p-4 mb-6">
        <form onSubmit={onAdd} aria-label="Add student" className="space-y-3">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="field-label" htmlFor="add-student-name">Full name<span aria-hidden="true" className="text-red-600 ml-0.5">*</span></label>
              <input
                id="add-student-name"
                type="text"
                required
                aria-required="true"
                className="field-input"
                placeholder="e.g. Mary Wanjiku"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
              />
            </div>
            <div className="w-32">
              <label className="field-label" htmlFor="add-student-grade">Grade</label>
              <input
                id="add-student-grade"
                type="text"
                className="field-input"
                placeholder="Grade 7"
                value={addGrade}
                onChange={(e) => setAddGrade(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={adding || !addName.trim()}>
              <UserPlus className="h-4 w-4 mr-1.5" aria-hidden="true" />
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
              <Accessibility className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
              Has a disability
            </label>
            {addHasDisability && (
              <input
                type="text"
                aria-label="Disability notes"
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
        <table className="data-table" aria-label="Students and club members">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Grade</th>
              <th scope="col">Role</th>
              <th scope="col">Needs</th>
              <th scope="col">Joined</th>
              <th scope="col">Status</th>
              <th scope="col" className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!visible && (
              <SkeletonRows rows={5} cols={7} label="Loading students" />
            )}
            {visible && visible.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-8">
                  No students yet. Add the first one above.
                </td>
              </tr>
            )}
            {pagedVisible?.map((m) => (
              <tr key={m.id} className={m.is_active ? '' : 'opacity-60'}>
                {editingId === m.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        aria-label="Full name"
                        className="field-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        aria-label="Grade"
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
                          <Accessibility className="h-3 w-3 mr-1" aria-hidden="true" />
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
                        aria-label="Save"
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md ml-1"
                        title="Cancel"
                        aria-label="Cancel edit"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
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
                          <Accessibility className="h-3 w-3 mr-1" aria-hidden="true" />
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
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
