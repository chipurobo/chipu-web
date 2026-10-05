import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchAssignments, fetchBlocklyLessons, fetchEvidence, fetchSubmissions, startBlocklyLesson } from '../../lib/learningQueries';
import { learningLevels, learningPathways, type LearningLevel } from '../../lib/learningFramework';

export function MyLearning() {
  const { profile, school } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [level, setLevel] = useState<LearningLevel | 'all'>('all');
  const lessons = useQuery({ queryKey: ['blockly-lessons'], queryFn: fetchBlocklyLessons });
  const start = useMutation({ mutationFn: startBlocklyLesson, onSuccess: (id) => {
    void qc.invalidateQueries({ queryKey: ['learning-assignments'] }); navigate(`/dashboard/assignments/${id}`);
  } });
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions() });
  const reviews = useQuery({ queryKey: ['competency-evidence'], queryFn: () => fetchEvidence() });
  const error = assignments.error ?? submissions.error ?? reviews.error ?? lessons.error;
  return (
    <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
      <div><p className="text-sm text-gray-600">{school?.name ?? 'Your learning dashboard'}</p>
        <h1>My learning</h1><p className="text-sm text-gray-600 mt-2">Hello, {profile?.full_name?.split(' ')[0] ?? 'there'}. Start a Blockly lesson, build your program and read your teacher's feedback.</p></div>
      <div className="flex gap-3 flex-wrap"><Link className="btn-secondary" to="/dashboard/my-progress">View my progress</Link>
        <Link className="btn-primary" to="/dashboard/my-projects">Open capstone projects</Link></div>
      {error && <p role="alert" className="text-red-700 text-sm">{error.message}</p>}
      {(assignments.isPending || submissions.isPending || reviews.isPending) && <p role="status">Loading your learning…</p>}
      {!assignments.isPending && !error && !assignments.data?.length && <div className="card p-5"><h2 className="text-lg">No assigned activities yet</h2><p className="text-sm text-gray-600">Start a Blockly lesson below. Activities your teacher assigns will also appear here.</p></div>}
      <div className="grid sm:grid-cols-2 gap-4">
        {assignments.data?.map((assignment) => {
          const submitted = submissions.data?.some((item) => item.assignment_id === assignment.id);
          const reviewed = reviews.data?.some((item) => item.assignment_id === assignment.id);
          return <article key={assignment.id} className="card p-5 flex flex-col gap-3">
            <p className="text-sm text-gray-600">{learningPathways.find((path) => path.id === assignment.learning_plan.pathwayId)?.title}</p>
            <h2 className="text-lg">{assignment.title}</h2>
            <div className="flex flex-wrap gap-2"><span className="badge-teal">{learningLevels.find((level) => level.id === assignment.learning_plan.level)?.title}</span>
              <span className="badge-gray">{reviewed ? 'Feedback available' : submitted ? 'Submitted' : 'Ready to start'}</span></div>
            {assignment.due_date && <p className="text-sm text-gray-600">Due {assignment.due_date}</p>}
            <Link className="btn-primary self-start mt-auto" to={`/dashboard/assignments/${assignment.id}`}>{reviewed ? 'Open activity and feedback' : submitted ? 'View my submission' : 'Start activity'}</Link>
          </article>;
        })}
      </div>
      <section className="space-y-4" aria-label="Blockly lessons">
        <div><h2 className="text-xl">Blockly lessons</h2><p className="text-sm text-gray-600">Choose a lesson to start. Your blocks and submissions belong to your account.</p></div>
        <div><label className="field-label" htmlFor="lesson-learning-level">Learning level</label>
          <select id="lesson-learning-level" className="field-input max-w-xs" value={level} onChange={(event) => setLevel(event.target.value as LearningLevel | 'all')}>
            <option value="all">All levels</option>{learningLevels.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select></div>
        {lessons.isPending && <p role="status">Loading Blockly lessons…</p>}
        {start.error && <p role="alert" className="text-red-700 text-sm">{start.error.message}</p>}
        <div className="grid sm:grid-cols-2 gap-4">
          {lessons.data?.filter((lesson) => lesson.learning_plan?.delivery === 'blockly' && (level === 'all' || lesson.learning_plan.level === level)).map((lesson) => {
            const existing = assignments.data?.find((assignment) => assignment.lesson_id === lesson.id);
            return <article key={lesson.id} className="card p-5 flex flex-col gap-3" aria-label={`Blockly lesson: ${lesson.title}`}>
              <span className="badge-teal self-start">{learningLevels.find((item) => item.id === lesson.learning_plan?.level)?.title}</span>
              <h3 className="text-lg">{lesson.title}</h3><p className="text-sm text-gray-600">{lesson.description}</p>
              {existing ? <Link className="btn-primary self-start mt-auto" to={`/dashboard/assignments/${existing.id}`}>Continue lesson</Link>
                : <button type="button" className="btn-primary self-start mt-auto" disabled={start.isPending || assignments.isPending || !!assignments.error} onClick={() => start.mutate(lesson.id)}>
                  {start.isPending && start.variables === lesson.id ? 'Starting…' : 'Start lesson'}</button>}
            </article>;
          })}
        </div>
      </section>
    </div>
  );
}
