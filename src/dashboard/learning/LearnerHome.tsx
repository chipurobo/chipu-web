/**
 * Learners have no home page and no menu: signing in opens their lesson.
 * Work a teacher set comes first; otherwise it is the next open lesson on the
 * path, or the last lesson when everything is done. A lesson that has not
 * been started yet is started here.
 */
import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAssignments, fetchSubmissions, startBlocklyLesson } from '../../lib/learningQueries';
import { useLearnerCourse } from './useLearnerCourse';
import { buildPath, nextUp } from '../../lib/learnerPath';
import { LearnerPage, FriendlyAlert, Loading, EmptyNote } from './ui/LearnerKit';

export function LearnerHome() {
  const qc = useQueryClient();
  const { lessons, projects } = useLearnerCourse();
  const assignments = useQuery({ queryKey: ['learning-assignments'], queryFn: () => fetchAssignments() });
  const submissions = useQuery({ queryKey: ['learning-submissions'], queryFn: () => fetchSubmissions() });
  const start = useMutation({ mutationFn: startBlocklyLesson, onSuccess: () => void qc.invalidateQueries({ queryKey: ['learning-assignments'] }) });
  const ready = lessons.isSuccess && assignments.isSuccess && submissions.isSuccess;
  const path = buildPath({ lessons: lessons.data, projects: projects.data, assignments: assignments.data, submissions: submissions.data });
  const { teacher, item } = nextUp(path, assignments.data, submissions.data);
  const target = item ?? path[path.length - 1] ?? null;
  const assignmentId = teacher?.id ?? target?.assignmentId ?? start.data ?? null;
  const asked = useRef(false);

  useEffect(() => {
    if (!ready || assignmentId || !target || asked.current) return;
    asked.current = true;
    start.mutate(target.lesson.id);
  }, [ready, assignmentId, target, start]);

  const error = lessons.error ?? assignments.error ?? submissions.error ?? start.error;
  if (assignmentId) return <Navigate to={`/dashboard/assignments/${assignmentId}`} replace />;
  return (
    <LearnerPage className="max-w-3xl">
      <FriendlyAlert error={error} />
      {!error && (!ready || target) && <Loading>Opening your lesson</Loading>}
      {!error && ready && !target && <EmptyNote emoji="📚" title="No lesson yet" body="Ask your teacher what to do today." />}
    </LearnerPage>
  );
}
