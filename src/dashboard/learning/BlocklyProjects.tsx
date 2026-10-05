import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAssignments, fetchBlocklyProjects, startBlocklyLesson } from '../../lib/learningQueries';
import { learningLevels } from '../../lib/learningFramework';

export function BlocklyProjects() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const projects = useQuery({ queryKey: ['blockly-projects'], queryFn: fetchBlocklyProjects });
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const start = useMutation({ mutationFn: startBlocklyLesson, onSuccess: (id) => {
    void qc.invalidateQueries({ queryKey: ['learning-assignments'] }); navigate(`/dashboard/assignments/${id}`);
  } });
  const error = projects.error ?? assignments.error ?? start.error;
  return <div className="learning-zone px-4 sm:px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
    <div><h1>Capstone projects</h1><p className="text-sm text-gray-600 mt-2">Put your learning together in Blockly. Choose a project, solve its brief, test your program and submit it for teacher review.</p></div>
    <Link className="btn-secondary" to="/dashboard/my-learning">Back to my learning</Link>
    {error && <p role="alert" className="text-sm text-red-700">{error.message}</p>}
    {projects.isPending && <p role="status">Loading capstone projects…</p>}
    {!projects.isPending && !error && !projects.data?.length && <p className="text-sm text-gray-600">No capstone projects are available yet.</p>}
    <div className="grid sm:grid-cols-2 gap-4">{projects.data?.map((project) => {
      const existing = assignments.data?.find((assignment) => assignment.lesson_id === project.id);
      return <article key={project.id} className="card p-5 space-y-3 flex flex-col" aria-label={project.title}>
        <span className="badge-teal self-start">{learningLevels.find((level) => level.id === project.learning_plan?.level)?.title}</span>
        <h2 className="text-lg">{project.title}</h2><p className="text-sm text-gray-600">{project.description}</p>
        <details className="text-sm"><summary className="cursor-pointer underline">Completion criteria</summary><ul className="list-disc pl-5 mt-2 space-y-1">
          {project.learning_plan?.requirements?.map((requirement) => <li key={requirement}>{requirement}</li>)}
        </ul></details>
        {existing ? <Link className="btn-primary self-start mt-auto" to={`/dashboard/assignments/${existing.id}`}>Continue project</Link>
          : <button type="button" className="btn-primary self-start mt-auto" disabled={start.isPending || assignments.isPending || !!assignments.error} onClick={() => start.mutate(project.id)}>
            {start.isPending && start.variables === project.id ? 'Starting…' : 'Start project in Blockly'}</button>}
      </article>;
    })}</div>
  </div>;
}
