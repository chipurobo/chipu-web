import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { fetchLearningStudents, assignLesson, fetchAssignments } from '../../lib/learningQueries';
import type { Lesson } from '../../lib/database.types';
import { hasUsableLearningPlan } from '../../lib/learningRecords';

export function AssignLessonForm({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const { school } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const members = useQuery({ queryKey: ['learning-students', school?.id],
    queryFn: () => fetchLearningStudents(school!.id), enabled: !!school });
  const active = members.data?.filter((member) => member.is_active) ?? [];
  const mutation = useMutation({
    mutationFn: () => assignLesson({ lessonId: lesson.id, schoolId: school!.id,
      studentIds: selected, instructions, dueDate }),
    onSuccess: (id) => { void qc.invalidateQueries({ queryKey: ['learning-assignments'] }); navigate(`/dashboard/assignments/${id}`); },
  });
  function submit(event: FormEvent) { event.preventDefault(); mutation.mutate(); }
  return (
    <form onSubmit={submit} className="card p-4 space-y-4 learning-zone" aria-label={`Assign ${lesson.title}`}>
      <h2 className="text-lg">Assign: {lesson.title}</h2>
      <fieldset className="space-y-2">
        <legend className="field-label">Students</legend>
        {members.isPending && <p role="status">Loading students…</p>}
        {members.error && <p role="alert" className="text-red-700">{members.error.message}</p>}
        {active.length > 0 && <button type="button" className="text-sm underline text-teal-700"
          onClick={() => setSelected(selected.length === active.length ? [] : active.map((member) => member.id))}>
          {selected.length === active.length ? 'Clear selection' : 'Select all active students'}
        </button>}
        <div className="grid sm:grid-cols-2 gap-2">
          {active.map((member) => <label key={member.id} className="flex gap-2 items-center text-sm cursor-pointer">
            <input type="checkbox" checked={selected.includes(member.id)} onChange={(event) => setSelected(event.target.checked
              ? [...selected, member.id] : selected.filter((id) => id !== member.id))} />{member.full_name}
          </label>)}
        </div>
        {!members.isPending && !members.error && !active.length && <p className="text-sm">Add active students under Students before assigning a lesson.</p>}
      </fieldset>
      <div>
        <label className="field-label" htmlFor="assignment-instructions">Instructions for this class</label>
        <textarea id="assignment-instructions" className="field-input" rows={3} maxLength={10000}
          value={instructions} onChange={(event) => setInstructions(event.target.value)} />
      </div>
      <div>
        <label className="field-label" htmlFor="assignment-due-date">Due date (optional)</label>
        <input id="assignment-due-date" className="field-input max-w-xs" type="date" value={dueDate}
          onChange={(event) => setDueDate(event.target.value)} />
      </div>
      {mutation.error && <p role="alert" className="text-sm text-red-700">{mutation.error.message}</p>}
      <div className="flex gap-3 flex-wrap">
        <button type="submit" className="btn-primary" disabled={!selected.length || !school || !hasUsableLearningPlan(lesson.learning_plan) || mutation.isPending}>
          {mutation.isPending ? 'Assigning…' : 'Assign to selected students'}
        </button>
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel assignment</button>
      </div>
    </form>
  );
}

export function LessonAssignments({ lesson }: { lesson: Lesson }) {
  const [assigning, setAssigning] = useState(false);
  const assignments = useQuery({ queryKey: ['learning-assignments', lesson.id], queryFn: () => fetchAssignments(lesson.id) });
  return (
    <section className="card p-4 space-y-4 learning-zone" aria-label="Learning assignments">
      <div className="flex justify-between gap-3 flex-wrap items-center">
        <h2 className="text-lg">Learning assignments</h2>
        <button type="button" className="btn-primary" disabled={!hasUsableLearningPlan(lesson.learning_plan)}
          onClick={() => setAssigning(true)}>Assign lesson</button>
      </div>
      {!hasUsableLearningPlan(lesson.learning_plan) && <p className="text-sm text-gray-600">ChipuRobo needs to set the learning outcomes for this lesson before you can assign it.</p>}
      {assigning && <AssignLessonForm lesson={lesson} onClose={() => setAssigning(false)} />}
      {assignments.isPending && <p role="status">Loading assignments…</p>}
      {assignments.error && <p role="alert" className="text-sm text-red-700">{assignments.error.message}</p>}
      {assignments.data?.length === 0 && <p className="text-sm text-gray-600">No assignments yet.</p>}
      <ul className="list-none m-0 p-0 space-y-2">
        {assignments.data?.map((assignment) => <li key={assignment.id} className="flex justify-between gap-3 flex-wrap text-sm">
          <span>{assignment.title} · {assignment.due_date ? `Due ${assignment.due_date}` : 'No due date'}</span>
          <Link className="text-teal-700 underline" to={`/dashboard/assignments/${assignment.id}`}>Review assignment</Link>
        </li>)}
      </ul>
    </section>
  );
}
