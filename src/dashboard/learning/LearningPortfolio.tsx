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
  fetchDecisions,
  fetchQuizAttempts,
  downloadArtifact,
  type PortfolioItem,
} from '../../lib/learningOutcomes';
import { fetchSchools } from '../../lib/gql/queries';
import { competencies, learningLevels } from '../../lib/learningFramework';
import { SubmissionDetails } from './LearnerSubmission';
import { artThemeFor, friendlyDate, levelLook, ratingLook } from '../../lib/learnerCopy';
import type { ReviewBand } from '../../lib/learningRecords';
import { LearnerPage, Hero, LevelChip, SkillChip, FriendlyAlert, Loading, EmptyNote } from './ui/LearnerKit';
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
  const decisions = useQuery({ queryKey: ['progression-decisions'], queryFn: fetchDecisions });
  const attempts = useQuery({ queryKey: ['quiz-attempts'], queryFn: fetchQuizAttempts });
  const students = useQuery({
    queryKey: ['learning-students', schoolId],
    queryFn: () => fetchLearningStudents(schoolId!),
    enabled: !!schoolId,
  });
  const [student, setStudent] = useState('');
  const [level, setLevel] = useState('all');
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
  const visible = ownItems.filter(
    (i) =>
      level === 'all' ||
      assignments.data?.find(
        (a) => a.id === submissions.data?.find((s) => s.id === i.submission_id)?.assignment_id,
      )?.learning_plan.level === level,
  );
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
          progression: decisions.data?.filter((d) => d.student_id === studentId),
        },
        null,
        2,
      ),
      'application/json',
    );
  }
  if (learner) {
    const outcomeLook = { awarded: { emoji: '🎉', label: 'Level up!' }, deferred: { emoji: '💪', label: 'Not yet, keep going' }, revoked: { emoji: '🔁', label: 'Needs another look' } } as const;
    return (
      <LearnerPage>
        <Hero title={<>Showcase <span aria-hidden="true">🖼️</span></>} blurb="Your favourite work, all in one place. Only you and your teachers can see it." mood="cheer" />
        <FriendlyAlert error={error} />
        {loading && <Loading>Opening your showcase</Loading>}
        <form
          aria-label="Add portfolio evidence"
          className="learner-card p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <h2><span aria-hidden="true">➕ </span>Add</h2>
          <label className="field-label">
            <span aria-hidden="true">📨 </span>Work
            <select
              required
              className="field-select mt-1.5 font-semibold"
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
              <option value="">Choose…</option>
              {submissions.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {assignments.data?.find((a) => a.id === s.assignment_id)?.title ?? 'Activity'} ·{' '}
                  {friendlyDate(s.submitted_at)}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            <span aria-hidden="true">🏷️ </span>Title
            <input required maxLength={200} className="field-input mt-1.5 font-semibold" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="field-label">
            <span aria-hidden="true">💛 </span>Why?
            <textarea maxLength={5000} className="field-input mt-1.5 font-semibold" rows={3} value={reflection} onChange={(e) => setReflection(e.target.value)} />
          </label>
          <FriendlyAlert error={save.error} />
          {save.isSuccess && <p role="status" className="text-sm font-bold text-emerald-800"><span aria-hidden="true">✅ </span>Added<span className="sr-only"> to your showcase</span></p>}
          <button className="btn-play" disabled={!selection || save.isPending}>
            {save.isPending ? 'Adding…' : 'Add'}<span className="sr-only"> to my showcase</span>
          </button>
        </form>
        {studentId && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <fieldset className="flex flex-wrap gap-2">
                <legend className="sr-only">Portfolio level</legend>
                {([{ id: 'all', emoji: '✨', title: 'All' }, ...learningLevels.map((l) => ({ id: l.id, emoji: levelLook[l.id].emoji, title: l.title }))]).map((option) => (
                  <label key={option.id} className="learner-pill text-xl" title={option.title}>
                    <input type="radio" name="portfolio-level" value={option.id} checked={level === option.id} onChange={() => setLevel(option.id)} />
                    <span aria-hidden="true">{option.emoji}</span><span className="sr-only">{option.title}</span>
                  </label>
                ))}
              </fieldset>
              <button className="btn-secondary" disabled={loading || !!error} onClick={exportPortfolio}>
                <span aria-hidden="true">⬇️</span> Download<span className="sr-only"> my showcase</span>
              </button>
            </div>
            {!loading && !error && !visible.length && (
              <EmptyNote emoji="🖼️" title="Nothing yet" body="Send some work from a lesson, then pick your favourite to put up here." />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {visible.map((item: PortfolioItem) => {
                const sub = submissions.data?.find((s) => s.id === item.submission_id);
                const assignment = assignments.data?.find((a) => a.id === sub?.assignment_id);
                const capstone = assignment?.learning_plan.activityKind === 'capstone';
                return (
                  <article className="learner-card flex flex-col overflow-hidden" key={item.id} aria-label={item.title}>
                    <LessonArt theme={assignment ? artThemeFor(assignment.title, { pathwayId: assignment.learning_plan.pathwayId, capstone }) : 'print'} className="w-full" />
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <h2>{item.title}</h2>
                      <div className="flex flex-wrap gap-2">
                        <LevelChip level={assignment?.learning_plan.level} />
                        <span title={capstone ? 'Big project' : 'Lesson'} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm"><span aria-hidden="true">{capstone ? '🏗️' : '🧩'}</span><span className="sr-only">{capstone ? 'Big project' : 'Lesson'}</span></span>
                      </div>
                      {!!assignment?.learning_plan.competencyIds.length && (
                        <ul className="flex flex-wrap gap-2" aria-label="Skills">
                          {assignment.learning_plan.competencyIds.map((id) => <li key={id}><SkillChip id={id} /></li>)}
                        </ul>
                      )}
                      {item.reflection && (
                        <p className="whitespace-pre-wrap rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-950"><span aria-hidden="true">💛 </span>{item.reflection}</p>
                      )}
                      {sub && <SubmissionDetails submission={sub} friendly />}
                      {reviews.data
                        ?.filter(
                          (e) =>
                            e.student_id === item.student_id &&
                            e.assignment_id === sub?.assignment_id &&
                            (!e.submission_id || e.submission_id === sub?.id),
                        )
                        .map((e) => (
                          <div className="rounded-2xl bg-emerald-50 p-3 text-sm" key={e.id}>
                            <p className="font-bold text-emerald-900"><span aria-hidden="true">💌 </span><span className="sr-only">Teacher said, </span>{friendlyDate(e.recorded_at)}</p>
                            <p className="whitespace-pre-wrap text-emerald-950">{e.feedback}</p>
                            <ul className="mt-2 flex flex-wrap gap-2">
                              {Object.entries(e.reviews).map(([id, band]) => (
                                <li key={id}><SkillChip id={id as (typeof competencies)[number]['id']} band={band as ReviewBand} /></li>
                              ))}
                            </ul>
                          </div>
                        ))}
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
            <section className="learner-card p-5 space-y-3" aria-label="Portfolio progression">
              <h2><span aria-hidden="true">🏅 </span>Level ups</h2>
              {!decisions.data?.some((d) => d.student_id === studentId) && <p className="text-sm text-slate-600"><span aria-hidden="true">— </span>None yet<span className="sr-only">. When your teacher moves you up a level, it will show here.</span></p>}
              {decisions.data
                ?.filter((d) => d.student_id === studentId)
                .map((d) => (
                  <p key={d.id} className="text-sm font-semibold text-slate-800">
                    <span aria-hidden="true">{outcomeLook[d.outcome].emoji} </span>{levelLook[d.level].title}: {outcomeLook[d.outcome].label} · {friendlyDate(d.decided_at)}{d.reason ? ` · ${d.reason}` : ''}
                  </p>
                ))}
              <Link className="btn-secondary self-start" to="/dashboard/my-progress"><span aria-hidden="true">🗺️</span> Journey</Link>
            </section>
          </>
        )}
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
            <label className="field-label">
              Portfolio level
              <select
                className="field-select"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="all">All levels</option>
                {learningLevels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </label>
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
              No portfolio items at this level. Submit an activity, then add it to your portfolio.
            </p>
          )}
          {visible.map((item: PortfolioItem) => {
            const sub = submissions.data?.find((s) => s.id === item.submission_id);
            const assignment = assignments.data?.find((a) => a.id === sub?.assignment_id);
            return (
              <article className="card p-5 space-y-4" key={item.id}>
                <h2>{item.title}</h2>
                <p className="text-sm text-gray-600">
                  {learningLevels.find((l) => l.id === assignment?.learning_plan.level)?.title ?? assignment?.learning_plan.level} ·{' '}
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
            <h2>Level decisions</h2>
            {!decisions.data?.some((d) => d.student_id === studentId) && <p className="text-sm text-gray-600">None yet.</p>}
            {decisions.data
              ?.filter((d) => d.student_id === studentId)
              .map((d) => (
                <p key={d.id} className="text-sm">
                  {levelLook[d.level].title}: {d.outcome} · {new Date(d.decided_at).toLocaleDateString()} ·{' '}
                  {d.reason}
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
