import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAssignments, fetchBlocklyProjects, startBlocklyLesson } from '../../lib/learningQueries';
import { LearnerPage, Hero, FriendlyAlert, Loading, EmptyNote } from './ui/LearnerKit';
import { LessonArt } from './ui/LearnerArt';

export function BlocklyProjects() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const projects = useQuery({ queryKey: ['blockly-projects'], queryFn: fetchBlocklyProjects });
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const start = useMutation({ mutationFn: startBlocklyLesson, onSuccess: (id) => {
    void qc.invalidateQueries({ queryKey: ['learning-assignments'] }); navigate(`/dashboard/assignments/${id}`);
  } });
  const error = projects.error ?? assignments.error ?? start.error;
  return (
    <LearnerPage>
      <Hero title={<>Big projects <span aria-hidden="true">🏗️</span></>} mood="think" blurb="Put everything you have learned into one build, then send it to your teacher.">
        <Link className="btn-secondary" to="/dashboard/my-learning"><span aria-hidden="true">← </span><span className="sr-only">Back to </span>Lessons</Link>
      </Hero>
      <FriendlyAlert error={error} />
      {projects.isPending && <Loading>Loading projects</Loading>}
      {!projects.isPending && !error && !projects.data?.length && <EmptyNote emoji="🔧" title="None yet" body="Your teacher or ChipuRobo will add big projects here soon." />}
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.data?.map((project) => {
          const existing = assignments.data?.find((assignment) => assignment.lesson_id === project.id);
          return (
            <article key={project.id} className="learner-card learner-card-hover flex flex-col overflow-hidden" aria-label={project.title}>
              <LessonArt theme="project" className="w-full" />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h2>{project.title}</h2>
                <p className="sr-only">{project.description}</p>
                {!!project.learning_plan?.requirements?.length && (
                  <div className="rounded-2xl bg-amber-50 p-3">
                    <h3 className="text-sm font-extrabold text-amber-900"><span aria-hidden="true">✅ </span>Done when</h3>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-amber-900">
                      {project.learning_plan.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
                    </ul>
                  </div>
                )}
                {existing ? <Link className="btn-primary mt-auto self-start" to={`/dashboard/assignments/${existing.id}`}>Continue<span className="sr-only"> {project.title}</span></Link>
                  : <button type="button" className="btn-play mt-auto self-start" disabled={start.isPending || assignments.isPending || !!assignments.error} onClick={() => start.mutate(project.id)}>
                    {start.isPending && start.variables === project.id ? 'Starting…' : <>Start<span className="sr-only"> {project.title}</span></>}</button>}
              </div>
            </article>
          );
        })}
      </div>
    </LearnerPage>
  );
}
