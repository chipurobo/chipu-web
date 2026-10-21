import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import {
  fetchAssignments,
  fetchSubmissions,
  fetchEvidence,
  fetchLearningStudents,
} from '../../lib/learningQueries';
import {
  fetchPortfolio,
  savePortfolio,
  removePortfolio,
  fetchCbcAssessments,
  fetchQuizAttempts,
  downloadArtifact,
  type PortfolioItem,
} from '../../lib/learningOutcomes';
import { fetchSchools } from '../../lib/gql/queries';
import { cbcLevels, competencies } from '../../lib/learningFramework';
import { SubmissionDetails } from './LearnerSubmission';
import { artThemeFor, friendlyDate, ratingLook } from '../../lib/learnerCopy';
import type { ReviewBand } from '../../lib/learningRecords';
import { LearnerPage, FriendlyAlert, Loading, EmptyNote } from './ui/LearnerKit';
import { LessonArt } from './ui/LearnerArt';

export function LearningPortfolio() {
  const { profile, school } = useAuth();
  const learner = profile?.role === 'learner';
  const admin = profile?.role === 'admin';
  const [selectedSchool, setSelectedSchool] = useState('');
  const schoolId = admin ? selectedSchool : school?.id;
  const schools = useQuery({ queryKey: ['schools'], queryFn: fetchSchools, enabled: admin });
  const qc = useQueryClient();
  const items = useQuery({ queryKey: ['learning-portfolio'], queryFn: fetchPortfolio });
  const submissions = useQuery({
    queryKey: ['learning-submissions'],
    queryFn: () => fetchSubmissions(),
  });
  const assignments = useQuery({
    queryKey: ['learning-assignments'],
    queryFn: () => fetchAssignments(),
  });
  const reviews = useQuery({ queryKey: ['competency-evidence'], queryFn: () => fetchEvidence() });
  const decisions = useQuery({ queryKey: ['cbc-assessments'], queryFn: fetchCbcAssessments });
  const attempts = useQuery({ queryKey: ['quiz-attempts'], queryFn: fetchQuizAttempts });
  const students = useQuery({
    queryKey: ['learning-students', schoolId],
    queryFn: () => fetchLearningStudents(schoolId!),
    enabled: !!schoolId,
  });
  const [student, setStudent] = useState('');
  const [selection, setSelection] = useState('');
  const [title, setTitle] = useState('');
  const [reflection, setReflection] = useState('');
  const studentId = learner ? students.data?.[0]?.id : student;
  const save = useMutation({
    mutationFn: () => savePortfolio(selection, title, reflection),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['learning-portfolio'] });
      setSelection('');
      setTitle('');
      setReflection('');
    },
  });
  const remove = useMutation({
    mutationFn: removePortfolio,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['learning-portfolio'] });
    },
  });
  const error =
    items.error ??
    submissions.error ??
    assignments.error ??
    reviews.error ??
    decisions.error ??
    attempts.error ??
    students.error ??
    schools.error;
  const loading =
    [items, submissions, assignments, reviews, decisions, attempts].some((q) => q.isPending) ||
    (!!schoolId && students.isPending);
  const ownItems = (items.data ?? []).filter((i) => i.student_id === studentId);
  const visible = ownItems;
  function exportPortfolio() {
    const work = (submissions.data ?? []).filter((s) =>
      ownItems.some((i) => i.submission_id === s.id),
    );
    downloadArtifact(
      'chipurobo-portfolio.json',
      JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          learner: students.data?.find((s) => s.id === studentId)?.full_name,
          items: ownItems,
          submissions: work,
          assignments: assignments.data?.filter((a) => work.some((s) => s.assignment_id === a.id)),
          reviews: reviews.data?.filter(
            (e) =>
              e.student_id === studentId && work.some((s) => s.assignment_id === e.assignment_id),
          ),
          quizzes: attempts.data?.filter((a) => a.student_id === studentId),
          cbc_assessments: decisions.data?.filter((d) => d.student_id === studentId),
        },
        null,
        2,
      ),
      'application/json',
    );
  }
  if (learner) {
    const pick = (id: string) => {
      setSelection(id);
      const item = items.data?.find((i) => i.submission_id === id);
      const sub = submissions.data?.find((s) => s.id === id);
      setTitle(item?.title ?? assignments.data?.find((a) => a.id === sub?.assignment_id)?.title ?? '');
      setReflection(item?.reflection ?? '');
    };
    return (
      <LearnerPage className="max-w-3xl">
        <h1 className="learner-title">My showcase <span aria-hidden="true">🖼️</span></h1>
        <p className="text-base font-semibold">Your favourite work. Only you and your teachers can see it.</p>
        <FriendlyAlert error={error} />
        {loading && <Loading>Opening your showcase</Loading>}
        {!loading && !error && !visible.length && (
          <EmptyNote emoji="🖼️" title="Nothing here yet" body="Send some work from a lesson, then pick your favourite to put up here." />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((item: PortfolioItem) => {
            const sub = submissions.data?.find((s) => s.id === item.submission_id);
            const assignment = assignments.data?.find((a) => a.id === sub?.assignment_id);
            const capstone = assignment?.learning_plan.activityKind === 'capstone';
            return (
              <article className="learner-card flex flex-col overflow-hidden" key={item.id} aria-label={item.title}>
                <LessonArt theme={assignment ? artThemeFor(assignment.title, { pathwayId: assignment.learning_plan.pathwayId, capstone }) : 'print'} className="w-full max-h-40" />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h2>{item.title}</h2>
                  {item.reflection && <p className="whitespace-pre-wrap text-base">{item.reflection}</p>}
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    {assignment && (
                      <Link className="btn-secondary" to={`/dashboard/assignments/${assignment.id}`}>Open<span className="sr-only"> {item.title}</span></Link>
                    )}
                    <button type="button" className="btn-secondary" disabled={remove.isPending} onClick={() => remove.mutate(item.id)}>
                      Remove<span className="sr-only"> {item.title} from my showcase</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <FriendlyAlert error={remove.error} />

        {!!submissions.data?.length && <form
          aria-labelledby="add-heading"
          className="learner-card p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <h2 id="add-heading">Add work</h2>
          <fieldset className="space-y-2">
            <legend className="field-label">Which work?</legend>
            {submissions.data.map((s) => (
              <label key={s.id} className="choice-tile">
                <input type="radio" required name="showcase-work" value={s.id} checked={selection === s.id} onChange={() => pick(s.id)} />
                <span className="flex-1">{assignments.data?.find((a) => a.id === s.assignment_id)?.title ?? 'My work'}</span>
                <span className="text-sm font-semibold opacity-80">{friendlyDate(s.submitted_at)}</span>
              </label>
            ))}
          </fieldset>
          {selection && <>
            <label className="field-label">
              Title
              <input required maxLength={200} className="field-input mt-1.5 font-semibold" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="field-label">
              Why do you like it? <span className="font-normal text-slate-600">(you can skip this)</span>
              <textarea maxLength={5000} className="field-input mt-1.5 font-semibold" rows={2} value={reflection} onChange={(e) => setReflection(e.target.value)} />
            </label>
          </>}
          <FriendlyAlert error={save.error} />
          {save.isSuccess && <p role="status" className="text-base font-bold text-teal-800"><span aria-hidden="true">✅ </span>Added<span className="sr-only"> to your showcase</span></p>}
          <button className="btn-play" disabled={!selection || save.isPending}>
            {save.isPending ? 'Adding…' : 'Add'}<span className="sr-only"> to my showcase</span>
          </button>
        </form>}

      </LearnerPage>
    );
  }
  return (
    <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 max-w-6xl space-y-6">
      <h1>{admin ? 'Learner portfolios' : 'Portfolios'}</h1>
      <p className="text-sm text-gray-600">Work each learner chose to keep, with your feedback.</p>
      {admin && (
        <label className="field-label">
          School
          <select
            className="field-select max-w-sm"
            value={selectedSchool}
            onChange={(e) => {
              setSelectedSchool(e.target.value);
              setStudent('');
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
      {!learner && (
        <label className="field-label">
          Learner
          <select
            className="field-select max-w-sm"
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
      )}
      {error && (
        <p role="alert" className="text-red-700">
          {error.message}
        </p>
      )}
      {loading && <p role="status">Loading portfolio evidence…</p>}
      {learner && (
        <form
          aria-label="Add portfolio evidence"
          className="card p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <h2>Add or update submitted work</h2>
          <label className="field-label">
            Submitted work
            <select
              required
              className="field-select"
              value={selection}
              onChange={(e) => {
                setSelection(e.target.value);
                const item = items.data?.find((i) => i.submission_id === e.target.value);
                const sub = submissions.data?.find((s) => s.id === e.target.value);
                setTitle(
                  item?.title ??
                    assignments.data?.find((a) => a.id === sub?.assignment_id)?.title ??
                    '',
                );
                setReflection(item?.reflection ?? '');
              }}
            >
              <option value="">Choose your submission</option>
              {submissions.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {assignments.data?.find((a) => a.id === s.assignment_id)?.title ?? 'Activity'} ·{' '}
                  {new Date(s.submitted_at).toLocaleString()}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Portfolio title
            <input
              required
              maxLength={200}
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="field-label">
            Portfolio reflection
            <textarea
              maxLength={5000}
              className="field-input"
              rows={3}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
          </label>
          {save.error && (
            <p role="alert" className="text-red-700">
              {save.error.message}
            </p>
          )}
          {save.isSuccess && <p role="status">Portfolio evidence saved.</p>}
          <button className="btn-primary" disabled={!selection || save.isPending}>
            {save.isPending ? 'Saving…' : 'Save portfolio evidence'}
          </button>
        </form>
      )}
      {studentId && (
        <>
          <div className="flex gap-4 flex-wrap items-end">
            <button
              className="btn-secondary"
              disabled={loading || !!error}
              onClick={exportPortfolio}
            >
              Export portfolio evidence
            </button>
          </div>
          {!loading && !error && !visible.length && (
            <p>
              No portfolio items yet. Submit an activity, then add it to the portfolio.
            </p>
          )}
          {visible.map((item: PortfolioItem) => {
            const sub = submissions.data?.find((s) => s.id === item.submission_id);
            const assignment = assignments.data?.find((a) => a.id === sub?.assignment_id);
            return (
              <article className="card p-5 space-y-4" key={item.id}>
                <h2>{item.title}</h2>
                <p className="text-sm text-gray-600">
                  {assignment?.learning_plan.activityKind === 'capstone'
                    ? 'Project'
                    : 'Lesson'}
                </p>
                <p className="text-sm">
                  Skills:{' '}
                  {assignment?.learning_plan.competencyIds
                    .map((id) => competencies.find((c) => c.id === id)?.title)
                    .join(', ')}
                </p>
                {item.reflection && (
                  <p className="whitespace-pre-wrap text-sm">
                    Portfolio reflection: {item.reflection}
                  </p>
                )}
                {sub && <SubmissionDetails submission={sub} />}
                {reviews.data
                  ?.filter(
                    (e) =>
                      e.student_id === item.student_id &&
                      e.assignment_id === sub?.assignment_id &&
                      (!e.submission_id || e.submission_id === sub?.id),
                  )
                  .map((e) => (
                    <div className="border-t pt-3 text-sm" key={e.id}>
                      <p>Teacher feedback · {new Date(e.recorded_at).toLocaleString()}</p>
                      <p className="whitespace-pre-wrap">{e.feedback}</p>
                      <ul className="list-disc pl-5">
                        {Object.entries(e.reviews).map(([id, band]) => (
                          <li key={id}>
                            {competencies.find((c) => c.id === id)?.title}: {ratingLook[band as ReviewBand]?.label ?? band}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                {assignment && (
                  <Link
                    className="underline text-sm"
                    to={`/dashboard/assignments/${assignment.id}`}
                  >
                    Open activity and feedback
                  </Link>
                )}
                {learner && (
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(item.id)}
                  >
                    Remove from portfolio
                  </button>
                )}
              </article>
            );
          })}
          {remove.error && (
            <p role="alert" className="text-red-700">
              {remove.error.message}
            </p>
          )}
          <section className="card p-5 space-y-3" aria-label="Portfolio progression">
            <h2>CBC assessments</h2>
            {!decisions.data?.some((d) => d.student_id === studentId) && <p className="text-sm text-gray-600">None yet.</p>}
            {decisions.data
              ?.filter((d) => d.student_id === studentId)
              .map((d) => (
                <p key={d.id} className="text-sm">
                  {cbcLevels.find((level) => level.id === d.performance_level)?.title}: {new Date(d.decided_at).toLocaleDateString()} ·{' '}
                  {d.comment}
                </p>
              ))}
            <Link
              className="underline text-sm"
              to={learner ? '/dashboard/my-progress' : '/dashboard/school/progress'}
            >
              Open progress
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
