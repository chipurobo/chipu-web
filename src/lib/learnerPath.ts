/**
 * The learner's path through the Blockly course: lessons in order, with each
 * level's big project straight after its last lesson. Mirrors
 * public.blockly_lesson_prerequisite() and start_blockly_lesson(): a lesson
 * opens when the one before it has been sent, and a teacher can open any
 * lesson early by setting it. Change both or neither.
 */
import type { Lesson } from './database.types';
import type { LearningLevel } from './learningFramework';
import type { CompetencyEvidence, LearningAssignment, LearningSubmission } from './learningRecords';
import { activityStatus, type ActivityStatus } from './learnerCopy';

export type PathState = 'done' | 'open' | 'locked';

export interface PathItem {
  lesson: Lesson;
  number: number;
  level: LearningLevel;
  project: boolean;
  state: PathState;
  status: ActivityStatus | null;
  assignmentId: string | null;
  /** Title of the lesson to finish first, for locked items. */
  after: string | null;
}

const levelOf = (lesson: Lesson): LearningLevel => lesson.learning_plan?.level ?? 'beginner';

export function buildPath(input: {
  lessons?: Lesson[]; projects?: Lesson[]; assignments?: LearningAssignment[];
  submissions?: LearningSubmission[]; evidence?: CompetencyEvidence[];
}): PathItem[] {
  const lessons = [...(input.lessons ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const projects = input.projects ?? [];
  const assignments = input.assignments ?? [];
  const sentLessons = new Set(assignments
    .filter((assignment) => input.submissions?.some((submission) => submission.assignment_id === assignment.id))
    .map((assignment) => assignment.lesson_id));
  const ordered: { lesson: Lesson; before: Lesson | null; project: boolean }[] = [];
  lessons.forEach((lesson, index) => {
    ordered.push({ lesson, before: lessons[index - 1] ?? null, project: false });
    const next = lessons[index + 1];
    if (!next || levelOf(next) !== levelOf(lesson)) {
      for (const project of projects.filter((item) => levelOf(item) === levelOf(lesson))) ordered.push({ lesson: project, before: lesson, project: true });
    }
  });
  return ordered.map(({ lesson, before, project }, index) => {
    const assignment = assignments.find((item) => item.lesson_id === lesson.id) ?? null;
    const status = assignment ? activityStatus(assignment.id, input.submissions, input.evidence) : null;
    const done = sentLessons.has(lesson.id);
    const open = done || !!assignment || !before || sentLessons.has(before.id);
    return {
      lesson, number: index + 1, level: levelOf(lesson), project,
      state: done ? 'done' : open ? 'open' : 'locked',
      status, assignmentId: assignment?.id ?? null, after: open ? null : before?.title ?? null,
    };
  });
}

/** What to do next: work a teacher set comes first, then the next open lesson on the path. */
export function nextUp(path: PathItem[], assignments: LearningAssignment[] | undefined, submissions: LearningSubmission[] | undefined) {
  const teacherSet = (assignments ?? []).filter((assignment) => assignment.self_started === false
    && !submissions?.some((submission) => submission.assignment_id === assignment.id));
  const fromTeacher = teacherSet.sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999'))[0];
  if (fromTeacher) return { teacher: fromTeacher, item: path.find((item) => item.lesson.id === fromTeacher.lesson_id) ?? null };
  return { teacher: null, item: path.find((item) => item.state === 'open') ?? null };
}
