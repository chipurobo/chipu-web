import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSchools, fetchMembersBySchool } from '../../lib/gql/queries';
import { bulkCreateLearners, createLearningAccount, fetchLearningAccounts, setTeacherStudents, type BulkLearnerResult, type BulkLearnerRow } from '../../lib/learningQueries';
import { supabase } from '../../lib/supabase';
import { admissionLogin } from '../../lib/learnerLogin';
import { learnerLabel } from '../../lib/learnerCopy';
import { parseSheet, downloadXlsx } from '../../lib/parseSheet';
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
  const school = schools.data?.find((item) => item.id === schoolId);
  const chosen = active.find((student) => student.id === studentId);
  // The login is derived from the school code and admission number when the
  // learner has one; only learners without an admission number get a typed username.
  const derivedLogin = chosen?.admission_number && school ? admissionLogin(school.code, chosen.admission_number) : '';
  function submit(event: FormEvent) { event.preventDefault(); mutation.mutate(); }
  return <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
    <div><h1>Learning accounts</h1><p className="text-sm text-gray-600 mt-2">Create teacher and learner logins, then choose which learners each teacher works with. Learners sign in with their school and admission number.</p></div>
    <div><label className="field-label" htmlFor="account-school">School</label>
      <select id="account-school" className="field-input" value={schoolId} onChange={(event) => {
        setSchoolId(event.target.value); setStudentId(''); setSelected([]); setEditing(null); setEditingSelected([]); mutation.reset(); update.reset();
      }}><option value="">Choose a school</option>{schools.data?.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></div>
    {error && <p role="alert" className="text-sm text-red-700">{error.message}</p>}
    {schoolId && <>
      {school && <p className="text-sm text-gray-600">School code: <code className="rounded bg-warm-100 px-1.5 py-0.5">{school.code}</code> · learner logins look like <code className="rounded bg-warm-100 px-1.5 py-0.5">{admissionLogin(school.code, '2026/014')}</code></p>}
      <BulkLearnerImport schoolId={schoolId} schoolCode={school?.code ?? ''} onDone={() => { void qc.invalidateQueries({ queryKey: ['learning-accounts'] }); void qc.invalidateQueries({ queryKey: ['members', schoolId] }); }} />
      <form onSubmit={submit} aria-label="Create learning account" className="card p-5 space-y-4">
        <h2 className="text-lg">Create a login</h2>
        <div><label className="field-label" htmlFor="account-type">Account type</label>
          <select id="account-type" className="field-input" value={role} onChange={(event) => { setRole(event.target.value as 'teacher' | 'learner'); setLogin(''); setSelected([]); mutation.reset(); }}>
            <option value="teacher">Teacher</option><option value="learner">Learner</option></select></div>
        {role === 'teacher' ? <div><label className="field-label" htmlFor="account-name">Teacher name</label>
          <input id="account-name" className="field-input" required maxLength={200} value={fullName} onChange={(event) => setFullName(event.target.value)} /></div>
          : <div><label className="field-label" htmlFor="account-learner">Learner on the roster</label>
            <select id="account-learner" className="field-input" required value={studentId} onChange={(event) => { setStudentId(event.target.value); const next = active.find((student) => student.id === event.target.value); setLogin(next?.admission_number && school ? admissionLogin(school.code, next.admission_number) : ''); }}>
              <option value="">Choose a learner</option>{active.filter((student) => !accounts.data?.some((account) => account.student_id === student.id)).map((student) => <option key={student.id} value={student.id}>{learnerLabel(student)}{student.full_name && student.admission_number ? ` · ${student.admission_number}` : ''}</option>)}</select></div>}
        <div><label className="field-label" htmlFor="account-login">{role === 'teacher' ? 'Teacher email' : 'Learner username'}</label>
          <input id="account-login" className="field-input" type={role === 'teacher' ? 'email' : 'text'} required value={login}
            autoCapitalize="off" autoComplete="off" onChange={(event) => setLogin(event.target.value)} readOnly={role === 'learner' && !!derivedLogin}
            pattern={role === 'learner' ? '[a-z0-9][a-z0-9._-]{2,31}' : undefined} />
          {role === 'learner' && (derivedLogin
            ? <p className="text-sm text-gray-600 mt-1">Built from the school code and the learner's admission number. The learner signs in by choosing their school and typing the admission number.</p>
            : <p className="text-sm text-gray-600 mt-1">This learner has no admission number on the roster, so type a username: 3–32 lowercase letters, numbers, dots, dashes or underscores.</p>)}</div>
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
          <div className="flex justify-between items-center gap-3 flex-wrap"><div><h3 className="text-base">{account.full_name}</h3><p className="text-sm text-gray-600">{account.role} · {account.login}{account.admission_number ? ` · admission ${account.admission_number}` : ''}</p></div>
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

/**
 * Import a whole roster of learners with logins from a spreadsheet. Rows go to
 * admin_bulk_create_learners in chunks of 200 so no single call is slow, and
 * the generated logins are offered as a download to hand to the school.
 */
function BulkLearnerImport({ schoolId, schoolCode, onDone }: { schoolId: string; schoolCode: string; onDone: () => void }) {
  const [rows, setRows] = useState<BulkLearnerRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [defaultPassword, setDefaultPassword] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BulkLearnerResult | null>(null);
  const run = useMutation({
    mutationFn: async () => {
      const total: BulkLearnerResult = { created: 0, skipped: 0, errors: [], logins: [] };
      for (let index = 0; index < rows.length; index += 200) {
        const part = await bulkCreateLearners(schoolId, rows.slice(index, index + 200), defaultPassword || null);
        total.created += part.created; total.skipped += part.skipped; total.errors.push(...part.errors); total.logins.push(...part.logins);
        setProgress(Math.min(rows.length, index + 200));
      }
      return total;
    },
    onSuccess: (total) => { setResult(total); onDone(); },
  });
  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    setParseError(null); setResult(null); setProgress(0);
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const sheet = await parseSheet(file);
      const pick = (row: Record<string, string>, keys: string[]) => { for (const key of Object.keys(row)) if (keys.includes(key.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'))) return String(row[key] ?? '').trim(); return ''; };
      const parsed = sheet.map((row) => ({
        full_name: pick(row, ['full_name', 'name', 'learner', 'student', 'learner_name']),
        admission_number: pick(row, ['admission_number', 'admission', 'adm', 'adm_no', 'admission_no']),
        grade: pick(row, ['grade', 'class', 'form']) || undefined,
        password: pick(row, ['password']) || undefined,
      }));
      const missing = parsed.filter((row) => !row.admission_number).length;
      if (missing) setParseError(`${missing} row${missing === 1 ? '' : 's'} have no admission number and will be skipped.`);
      setRows(parsed.filter((row) => row.admission_number));
    } catch (caught) { setParseError(caught instanceof Error ? caught.message : 'That file could not be read.'); setRows([]); }
  }
  const needsPassword = !defaultPassword && rows.some((row) => !row.password);
  return (
    <section className="card p-5 space-y-4" aria-label="Import learners">
      <div><h2 className="text-lg">Import learners from a spreadsheet</h2>
        <p className="text-sm text-gray-600 mt-1">Columns: <code>admission_number</code>, then optionally <code>grade</code>, <code>password</code> and <code>full_name</code>. Logins become <code>{schoolCode}-&lt;admission number&gt;</code>. Learners already on the roster are matched by admission number; learners who already have a login are left alone.</p></div>
      <div className="flex flex-wrap items-end gap-4">
        <label className="field-label">Spreadsheet (CSV or XLSX)<input className="mt-1 block text-sm" type="file" accept=".csv,.xlsx,.xls" onChange={(event) => void onFile(event)} /></label>
        <label className="field-label">Password for every learner<input className="field-input mt-1" type="text" minLength={8} autoComplete="off" value={defaultPassword} onChange={(event) => setDefaultPassword(event.target.value)} placeholder="Leave empty if the file has a password column" /></label>
        <button type="button" className="btn-secondary" onClick={() => downloadXlsx('chipurobo-learners-template.xlsx', [['admission_number', 'grade', 'password'], ['2026/014', '7', '']])}>Download template</button>
      </div>
      {fileName && <p className="text-sm text-gray-700">{fileName}: {rows.length} learner{rows.length === 1 ? '' : 's'} ready.</p>}
      {parseError && <p role="alert" className="text-sm text-amber-800">{parseError}</p>}
      {run.error && <p role="alert" className="text-sm text-red-700">{run.error.message}</p>}
      {run.isPending && <p role="status" className="text-sm">Creating logins… {progress} of {rows.length}</p>}
      {result && <div role="status" className="text-sm space-y-2">
        <p className="font-medium text-teal-800">{result.created} login{result.created === 1 ? '' : 's'} created · {result.skipped} already had one · {result.errors.length} failed.</p>
        {result.errors.length > 0 && <ul className="list-disc pl-5 text-red-700">{result.errors.slice(0, 20).map((item, index) => <li key={index}>{item.admission_number || 'row'}: {item.message}</li>)}</ul>}
        {result.logins.length > 0 && <button type="button" className="btn-secondary" onClick={() => downloadXlsx('chipurobo-learner-logins.xlsx', [['admission_number', 'login', 'password'], ...result.logins.map((item) => {
          const row = rows.find((candidate) => candidate.admission_number === item.admission_number);
          return [item.admission_number, item.login, row?.password ?? defaultPassword];
        })], 'Logins')}>Download logins and passwords</button>}
      </div>}
      <button type="button" className="btn-primary" disabled={!rows.length || needsPassword || run.isPending} onClick={() => run.mutate()}>
        {run.isPending ? 'Importing…' : `Create ${rows.length || ''} login${rows.length === 1 ? '' : 's'}`}
      </button>
      {needsPassword && rows.length > 0 && <p className="text-sm text-gray-600">Add a password for every learner, or a password column in the file.</p>}
    </section>
  );
}

function LearnerSelection({ students, value, onChange }: { students: ClubMember[]; value: string[]; onChange: (value: string[]) => void }) {
  return <fieldset className="space-y-2"><legend className="field-label">Learners in this teaching group</legend>
    {!students.length && <p className="text-sm text-gray-600">Add learners to the school roster first.</p>}
    <div className="grid sm:grid-cols-2 gap-2">{students.map((student) => <label key={student.id} className="inline-flex gap-2 items-center text-sm cursor-pointer">
      <input type="checkbox" checked={value.includes(student.id)} onChange={(event) => onChange(event.target.checked ? [...value, student.id] : value.filter((id) => id !== student.id))} />{learnerLabel(student)}
    </label>)}</div>
  </fieldset>;
}
