import { useQuery } from '@tanstack/react-query';
import { fetchBlocklyLessons, fetchBlocklyProjects, fetchMyLearningCourse } from '../../lib/learningQueries';

/**
 * The learner's own Blockly course. CBC classroom learners get one simple
 * activity per pathway; coding-club learners get the Beginner, Intermediate
 * and Expert course. The server enforces the same split in
 * start_blockly_lesson(), so this only decides what is shown.
 */
export function useLearnerCourse() {
  const course = useQuery({ queryKey: ['learning-course'], queryFn: fetchMyLearningCourse });
  const ready = course.isSuccess;
  const lessons = useQuery({ queryKey: ['blockly-lessons', course.data ?? 'all'], queryFn: () => fetchBlocklyLessons(course.data ?? null), enabled: ready });
  const projects = useQuery({ queryKey: ['blockly-projects', course.data ?? 'all'], queryFn: () => fetchBlocklyProjects(course.data ?? null), enabled: ready });
  return { course: course.data ?? null, lessons, projects };
}
