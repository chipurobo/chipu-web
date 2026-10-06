import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSchools, fetchMembersBySchool } from '../../lib/gql/queries';
import { createLearningAccount, fetchLearningAccounts, setTeacherStudents } from '../../lib/learningQueries';
import { supabase } from '../../lib/supabase';
import type { ClubMember } from '../../lib/database.types';

export function LearningAccounts() {
  const qc = useQueryClient();
  const schools = useQuery({ queryKey: ['schools'], queryFn: fetchSchools });
  const [schoolId, setSchoolId] = useState('');
  const [role, setRole] = useState<'teacher' | 'learner'>('teacher');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editingSelected, setEditingSelected] = useState<string[]>([]);
  const students = useQuery({ queryKey: ['members', schoolId], queryFn: () => fetchMembersBySchool(schoolId), enabled: !!schoolId });
  const accounts = useQuery({ queryKey: ['learning-accounts', schoolId], queryFn: () => fetchLearningAccounts(schoolId), enabled: !!schoolId });
  const memberships = useQuery({ queryKey: ['teacher-students', schoolId], queryFn: async () => {
    const { data, error } = await supabase.from('teacher_students').select('*');
    if (error) throw new Error(error.message);
    return data as { teacher_id: string; student_id: string }[];
  }, enabled: !!schoolId });
  const mutation = useMutation({ mutationFn: () => createLearningAccount({ schoolId, role, login, password, fullName, studentId, teacherStudentIds: selected }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['learning-accounts'] }); void qc.invalidateQueries({ queryKey: ['teacher-students'] }); setPassword(''); } });
  const update = useMutation({ mutationFn: () => setTeacherStudents(editing!, editingSelected), onSuccess: () => {
    void qc.invalidateQueries({ queryKey: ['teacher-students'] }); setEditing(null); setEditingSelected([]);
  } });
  const active = students.data?.filter((student) => student.is_active) ?? [];
  const error = schools.error ?? students.error ?? accounts.error ?? memberships.error;
  function submit(event: FormEvent) { event.preventDefault(); mutation.mutate(); }
  return <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
    <div><h1>Learning accounts</h1><p className="text-sm text-gray-600 mt-2">Create teacher and learner logins, then choose which learners each teacher works with.</p></div>
    <div><label className="field-label" htmlFor="account-school">School</label>
      <select id="account-school" className="field-input" value={schoolId} onChange={(event) => {
        setSchoolId(event.target.value); setStudentId(''); setSelected([]); setEditing(null); setEditingSelected([]); mutation.reset(); update.reset();
      }}><option value="">Choose a school</option>{schools.data?.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></div>
    {error && <p role="alert" className="text-sm text-red-700">{error.message}</p>}
    {schoolId && <>
      <form onSubmit={submit} aria-label="Create learning account" className="card p-5 space-y-4">
        <h2 className="text-lg">Create a login</h2>
        <div><label className="field-label" htmlFor="account-type">Account type</label>
          <select id="account-type" className="field-input" value={role} onChange={(event) => { setRole(event.target.value as 'teacher' | 'learner'); setLogin(''); setSelected([]); mutation.reset(); }}>
            <option value="teacher">Teacher</option><option value="learner">Learner</option></select></div>
        {role === 'teacher' ? <div><label className="field-label" htmlFor="account-name">Teacher name</label>
          <input id="account-name" className="field-input" required maxLength={200} value={fullName} onChange={(event) => setFullName(event.target.value)} /></div>
          : <div><label className="field-label" htmlFor="account-learner">Learner on the roster</label>
            <select id="account-learner" className="field-input" required value={studentId} onChange={(event) => setStudentId(event.target.value)}>
              <option value="">Choose a learner</option>{active.filter((student) => !accounts.data?.some((account) => account.student_id === student.id)).map((student) => <option key={student.id} value={student.id}>{student.full_name}</option>)}</select></div>}
        <div><label className="field-label" htmlFor="account-login">{role === 'teacher' ? 'Teacher email' : 'Learner username'}</label>
          <input id="account-login" className="field-input" type={role === 'teacher' ? 'email' : 'text'} required value={login}
            autoCapitalize="off" autoComplete="off" onChange={(event) => setLogin(event.target.value)}
            pattern={role === 'learner' ? '[a-z0-9][a-z0-9._-]{2,31}' : undefined} />
          {role === 'learner' && <p className="text-sm text-gray-600 mt-1">3–32 lowercase letters, numbers, dots, dashes or underscores. Learners do not need an email address.</p>}</div>
        <div><label className="field-label" htmlFor="account-password">Initial password</label>
          <input id="account-password" className="field-input" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
        {role === 'teacher' && <LearnerSelection students={active} value={selected} onChange={setSelected} />}
        {mutation.error && <p role="alert" className="text-sm text-red-700">{mutation.error.message}</p>}
        {mutation.isSuccess && <p role="status" className="text-sm text-teal-800">{mutation.data.role === 'teacher' ? 'Teacher' : 'Learner'} login created: {mutation.data.login}. Share the initial password directly with the account holder.</p>}
        <button className="btn-primary" type="submit" disabled={mutation.isPending || students.isPending || accounts.isPending}>{mutation.isPending ? 'Creating…' : 'Create login'}</button>
      </form>
      <section className="space-y-3" aria-label="Existing learning accounts"><h2 className="text-lg">Existing logins</h2>
        {accounts.isPending && <p role="status">Loading logins…</p>}
        {accounts.data?.length === 0 && <p className="text-sm text-gray-600">No teacher or learner logins yet.</p>}
        {accounts.data?.map((account) => <article key={account.id} className="card p-4 space-y-3">
          <div className="flex justify-between items-center gap-3 flex-wrap"><div><h3 className="text-base">{account.full_name}</h3><p className="text-sm text-gray-600">{account.role} · {account.login}</p></div>
            {account.role === 'teacher' && <button type="button" className="btn-secondary" onClick={() => { setEditing(account.id); update.reset(); setEditingSelected((memberships.data ?? []).filter((row) => row.teacher_id === account.id).map((row) => row.student_id)); }}>Manage learners</button>}</div>
          {editing === account.id && <div className="space-y-3"><LearnerSelection students={active} value={editingSelected} onChange={setEditingSelected} />
            {update.error && <p role="alert" className="text-sm text-red-700">{update.error.message}</p>}
            <div className="flex gap-3"><button type="button" className="btn-primary" disabled={update.isPending} onClick={() => update.mutate()}>Save teaching group</button><button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button></div>
          </div>}
        </article>)}
      </section>
    </>}
  </div>;
}

function LearnerSelection({ students, value, onChange }: { students: ClubMember[]; value: string[]; onChange: (value: string[]) => void }) {
  return <fieldset className="space-y-2"><legend className="field-label">Learners in this teaching group</legend>
    {!students.length && <p className="text-sm text-gray-600">Add learners to the school roster first.</p>}
    <div className="grid sm:grid-cols-2 gap-2">{students.map((student) => <label key={student.id} className="inline-flex gap-2 items-center text-sm cursor-pointer">
      <input type="checkbox" checked={value.includes(student.id)} onChange={(event) => onChange(event.target.checked ? [...value, student.id] : value.filter((id) => id !== student.id))} />{student.full_name}
    </label>)}</div>
  </fieldset>;
}
