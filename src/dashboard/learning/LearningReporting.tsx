import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchSchools } from '../../lib/gql/queries';
import { fetchLearningStudents } from '../../lib/learningQueries';
import {
  saveAttendance,
  fetchPilotReport,
  observeTask,
  downloadArtifact,
} from '../../lib/learningOutcomes';

const labels: Record<string, string> = {
  enrolled_learners: 'Learners on roster',
  learners_with_accounts: 'Learners with logins',
  active_learners: 'Learners who signed in',
  retained_learners: 'Learners active all period',
  quiz_attempts: 'Quiz tries',
  passed_quiz_attempts: 'Quiz passes',
  learners_passing_quizzes: 'Learners who passed a quiz',
  submissions: 'Work sent',
  learners_submitting: 'Learners who sent work',
  project_artifacts: 'Projects sent',
  evidence_reviews: 'Reviews you gave',
  level_awards: 'Levels awarded',
  teacher_logins: 'Teacher sign-ins',
  resource_opens: 'Lessons opened',
  attendance_present: 'Present',
  attendance_recorded: 'Attendance recorded',
  observed_tasks: 'Tasks observed',
  independent_tasks: 'Done independently',
  tasks_with_barriers: 'Tasks with barriers',
};
const groups: { title: string; emoji: string; keys: string[] }[] = [
  { title: 'Learners', emoji: '🧑‍🎓', keys: ['enrolled_learners', 'learners_with_accounts', 'active_learners', 'retained_learners'] },
  { title: 'Learning', emoji: '🧩', keys: ['resource_opens', 'submissions', 'learners_submitting', 'project_artifacts', 'evidence_reviews', 'level_awards'] },
  { title: 'Quizzes', emoji: '🧠', keys: ['quiz_attempts', 'passed_quiz_attempts', 'learners_passing_quizzes'] },
  { title: 'Attendance and observations', emoji: '📋', keys: ['attendance_recorded', 'attendance_present', 'observed_tasks', 'independent_tasks', 'tasks_with_barriers', 'teacher_logins'] },
];
const today = () => new Date().toISOString().slice(0, 10);
export function LearningReporting() {
  const { profile, school } = useAuth();
  const admin = profile?.role === 'admin';
  const qc = useQueryClient();
  const schools = useQuery({ queryKey: ['schools'], queryFn: fetchSchools, enabled: admin });
  const [selectedSchool, setSchool] = useState('');
  const schoolId = admin ? selectedSchool : (school?.id ?? '');
  const [from, setFrom] = useState(new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(today());
  const report = useQuery({
    queryKey: ['learning-report', schoolId, from, to],
    queryFn: () => fetchPilotReport(schoolId, from, to),
    enabled: !!schoolId && !!from && !!to,
  });
  const students = useQuery({
    queryKey: ['learning-students', schoolId],
    queryFn: () => fetchLearningStudents(schoolId),
    enabled: !!schoolId,
  });
  const [attendanceDate, setAttendanceDate] = useState(today());
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const attendanceSave = useMutation({
    mutationFn: () => saveAttendance(schoolId, attendanceDate, attendance),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['learning-report'] });
      setAttendance({});
    },
  });
  const [student, setStudent] = useState('');
  const [task, setTask] = useState('Open a Blockly lesson, run a program and submit work');
  const [independent, setIndependent] = useState(false);
  const [barrier, setBarrier] = useState('');
  const observation = useMutation({
    mutationFn: () => observeTask(student, task, independent, barrier),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['learning-report'] });
      setBarrier('');
    },
  });
  const error = report.error ?? students.error ?? schools.error;
  const r = report.data;
  return (
    <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 max-w-6xl space-y-6">
      <h1>Reports</h1>
      <p className="text-sm text-gray-600">Counts for your learners over a date range.</p>
      <div className="card p-5 flex gap-4 flex-wrap items-end">
        {admin && (
          <label className="field-label">
            School
            <select
              className="field-select"
              value={selectedSchool}
              onChange={(e) => {
                setSchool(e.target.value);
                setStudent('');
                setAttendance({});
              }}
            >
              <option value="">Choose a school</option>
              {schools.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="field-label">
          From date
          <input
            type="date"
            required
            className="field-input"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="field-label">
          To date
          <input
            type="date"
            required
            className="field-input"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <button
          className="btn-secondary"
          disabled={!r || report.isFetching || !!error}
          onClick={() =>
            downloadArtifact(
              'chipurobo-learning-report.csv',
              `Metric,Value\n${Object.entries(r!)
                .map(
                  ([key, value]) =>
                    `"${(labels[key] ?? key).replace(/"/g, '""')}","${String(value).replace(/"/g, '""')}"`,
                )
                .join('\n')}`,
              'text/csv',
            )
          }
        >
          <span aria-hidden="true">⬇️ </span>Export report CSV
        </button>
      </div>
      {error && (
        <p role="alert" className="text-red-700">
          {error.message}
        </p>
      )}
      {schoolId && report.isPending && <p role="status">Loading report…</p>}
      {r && (
        <>
          <p className="text-sm text-gray-600">Dates are inclusive in {r.timezone}.</p>
          {groups.map((group) => (
            <section key={group.title} aria-label={group.title} className="space-y-3">
              <h2 className="text-base"><span aria-hidden="true">{group.emoji} </span>{group.title}</h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {group.keys.map((key) => (
                  <li className="card p-4" key={key}>
                    <p className="text-2xl font-semibold leading-none text-gray-900">{r[key] ?? 0}</p>
                    <p className="mt-1 text-sm text-gray-700">{labels[key]}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="text-sm">
            <span aria-hidden="true">🤝 </span>Done independently:{' '}
            {Number(r.observed_tasks) > 0
              ? `${Math.round((100 * Number(r.independent_tasks)) / Number(r.observed_tasks))}% of ${r.observed_tasks} observed`
              : 'no observations yet'}
          </p>
          <details className="text-sm text-gray-700">
            <summary className="cursor-pointer text-teal-700">How these numbers are counted</summary>
            <p className="mt-2">{r.cohort}. The active roster is the denominator; account coverage is reported separately. Activity tracking starts with this release and does not reconstruct historical logins.</p>
            <p className="mt-2">Dashboard activity is exposure, quiz passes are knowledge checks, submissions are artifacts and level awards are reviewed decisions. Active all period means activity in both halves of the selected period; it is not a programme retention estimate. Repeated submissions and decisions are counted as events.</p>
            <p className="mt-2">Latest observation per learner and task in this period is counted. Access-group targets require the agreed M&amp;E cohort; no diagnoses are collected here. Formal baseline, midline and endline assessments remain in the wider M&amp;E system.</p>
          </details>
        </>
      )}
      {schoolId && (
        <form
          aria-label="Learning attendance"
          className="card p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            attendanceSave.mutate();
          }}
        >
          <h2><span aria-hidden="true">📋 </span>Attendance</h2>
          <p className="text-sm text-gray-600">Learners left as Not recorded are skipped.</p>
          <label className="field-label">
            Date
            <input
              required
              type="date"
              max={today()}
              className="field-input max-w-xs"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {students.data?.map((s) => (
            <label key={s.id} className="field-label">
              {s.full_name}
              <select
                className="field-select"
                value={s.id in attendance ? String(attendance[s.id]) : ''}
                onChange={(e) =>
                  setAttendance((a) => {
                    const n = { ...a };
                    if (e.target.value === '') delete n[s.id];
                    else n[s.id] = e.target.value === 'true';
                    return n;
                  })
                }
              >
                <option value="">Not recorded</option>
                <option value="true">Present</option>
                <option value="false">Absent</option>
              </select>
            </label>
          ))}
          </div>
          {attendanceSave.error && (
            <p role="alert" className="text-red-700">
              {attendanceSave.error.message}
            </p>
          )}
          {attendanceSave.isSuccess && <p role="status"><span aria-hidden="true">✅ </span>Learning attendance saved.</p>}
          <button
            className="btn-primary"
            disabled={!Object.keys(attendance).length || attendanceSave.isPending}
          >
            Save learning attendance
          </button>
        </form>
      )}
      {schoolId && (
        <form
          aria-label="Core task observation"
          className="card p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            observation.mutate();
          }}
        >
          <h2><span aria-hidden="true">👀 </span>Task observation</h2>
          <p className="text-sm text-gray-600">Watch a learner do a task. Note barriers and support, never diagnoses.</p>
          <label className="field-label">
            Observed learner
            <select
              required
              className="field-select"
              value={student}
              onChange={(e) => setStudent(e.target.value)}
            >
              <option value="">Choose a learner</option>
              {students.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Core task
            <input
              required
              maxLength={200}
              className="field-input"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
          </label>
          <label className="flex gap-3 items-start text-sm">
            <input
              type="checkbox"
              checked={independent}
              onChange={(e) => setIndependent(e.target.checked)}
            />
            Done independently (with agreed support)
          </label>
          <label className="field-label">
            Notes
            <textarea
              maxLength={5000}
              className="field-input"
              value={barrier}
              onChange={(e) => setBarrier(e.target.value)}
            />
          </label>
          {observation.error && (
            <p role="alert" className="text-red-700">
              {observation.error.message}
            </p>
          )}
          {observation.isSuccess && <p role="status">Task observation saved.</p>}
          <button className="btn-primary" disabled={observation.isPending || !student}>
            Save task observation
          </button>
        </form>
      )}
    </div>
  );
}
