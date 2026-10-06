import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchSchools } from '../../lib/gql/queries';
import { fetchLearningStudents } from '../../lib/learningQueries';
import {
  saveAttendance,
  fetchPilotReport,
  fetchPolicies,
  approveProgressionPolicy,
  observeTask,
  downloadArtifact,
} from '../../lib/learningOutcomes';

const labels: Record<string, string> = {
  enrolled_learners: 'Active roster learners',
  learners_with_accounts: 'Learners with logins',
  active_learners: 'Learners active on the dashboard',
  retained_learners: 'Learners active in both halves of this period',
  quiz_attempts: 'Quiz attempts',
  passed_quiz_attempts: 'Quiz attempts meeting pass mark',
  learners_passing_quizzes: 'Learners meeting a quiz pass mark',
  submissions: 'Work submissions',
  learners_submitting: 'Learners submitting work',
  project_artifacts: 'Capstone artifacts',
  evidence_reviews: 'Evidence reviews',
  level_awards: 'Level award decisions',
  teacher_logins: 'Teachers logging in',
  resource_opens: 'Resource opens',
  attendance_present: 'Present attendance entries',
  attendance_recorded: 'Recorded attendance entries',
  observed_tasks: 'Observed core tasks',
  independent_tasks: 'Independently completed core tasks',
  tasks_with_barriers: 'Tasks with reported barriers',
};
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
  const policies = useQuery({
    queryKey: ['progression-policies'],
    queryFn: fetchPolicies,
    enabled: admin,
  });
  const [notes, setNotes] = useState('');
  const [confirm, setConfirm] = useState(false);
  const approve = useMutation({
    mutationFn: () => approveProgressionPolicy(notes),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['progression-policies'] });
      void qc.invalidateQueries({ queryKey: ['progression-readiness'] });
      setConfirm(false);
      setNotes('');
    },
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
  const error = report.error ?? students.error ?? schools.error ?? policies.error;
  const r = report.data;
  return (
    <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 max-w-6xl space-y-6">
      <h1>Learning reports</h1>
      <p className="text-sm">
        Report exposure, knowledge checks, submitted artifacts and teacher decisions for your
        accessible cohort. Formal baseline, midline and endline assessments remain in the wider
        M&amp;E system.
      </p>
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
          Export report CSV
        </button>
      </div>
      {error && (
        <p role="alert" className="text-red-700">
          {error.message}
        </p>
      )}
      {schoolId && report.isPending && <p role="status">Loading learning report…</p>}
      {r && (
        <>
          <p className="text-sm">
            {r.cohort}. Dates are inclusive in {r.timezone}. The active roster is the denominator;
            account coverage is reported separately. Activity tracking starts with this release and
            does not reconstruct historical logins.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(labels).map(([key, label]) => (
              <article className="card p-5" key={key}>
                <h2 className="text-base">{label}</h2>
                <p className="text-2xl mt-3">{r[key] ?? 0}</p>
              </article>
            ))}
          </div>
          <p className="text-sm">
            Dashboard activity is exposure, quiz passes are knowledge checks, submissions are
            artifacts and level awards are reviewed decisions. Retention means activity in both
            halves of the selected period; it is not a programme retention estimate. Repeated
            submissions and decisions are counted as events.
          </p>
          <p className="text-sm">
            Independent task completion:{' '}
            {Number(r.observed_tasks) > 0
              ? `${Math.round((100 * Number(r.independent_tasks)) / Number(r.observed_tasks))}% of ${r.observed_tasks} observed learner/task pairs`
              : 'No observations recorded; the 80% target cannot be assessed'}
            . Latest observation per learner and task in this period is counted. Access-group
            targets require the agreed M&amp;E cohort; no diagnoses are collected here.
          </p>
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
          <h2>Record lesson attendance</h2>
          <p className="text-sm">
            Choose Present or Absent for each learner attending this session. Learners left as Not
            recorded are excluded.
          </p>
          <label className="field-label">
            Session date
            <input
              required
              type="date"
              max={today()}
              className="field-input max-w-xs"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </label>
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
          {attendanceSave.error && (
            <p role="alert" className="text-red-700">
              {attendanceSave.error.message}
            </p>
          )}
          {attendanceSave.isSuccess && <p role="status">Learning attendance saved.</p>}
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
          <h2>Record a core task observation</h2>
          <p className="text-sm">
            Observe the task with the learner. Record access barriers and accommodations without
            diagnoses or personal case details.
          </p>
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
            Completed independently with agreed access accommodations
          </label>
          <label className="field-label">
            Barrier and retest notes
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
      {admin && (
        <section className="card p-5 space-y-4" aria-label="Progression criteria review">
          <h2>Progression criteria review</h2>
          <p className="text-sm">
            Current policy: {policies.data?.[0]?.name} ·{' '}
            {policies.data?.[0]?.approved ? 'Approved for ChipuRobo decisions' : 'Awaiting review'}
          </p>
          <p className="text-sm">{policies.data?.[0]?.review_notes}</p>
          <p className="text-sm">
            The proposed criteria require demonstrated competency evidence, a passed knowledge
            check, a demonstrated Blockly capstone and any previous level. Approving these criteria
            creates a versioned ChipuRobo policy; it does not certify official KICD alignment.
          </p>
          <form
            aria-label="Approve progression criteria"
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              approve.mutate();
            }}
          >
            <label className="field-label">
              Curriculum review and approval notes
              <textarea
                required
                minLength={20}
                maxLength={5000}
                className="field-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <label className="flex gap-3 text-sm">
              <input
                required
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
              />
              I have reviewed and approve these criteria for ChipuRobo progression decisions.
            </label>
            {approve.error && (
              <p role="alert" className="text-red-700">
                {approve.error.message}
              </p>
            )}
            {approve.isSuccess && <p role="status">New progression policy approved.</p>}
            <button className="btn-primary" disabled={approve.isPending || !confirm}>
              Approve a new policy version
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
