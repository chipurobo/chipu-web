import type { UserRole } from './database.types';

/** Learners and teachers each have their own sign-in link. */
export const LEARNER_LOGIN_PATH = '/dashboard/learner';
export const TEACHER_LOGIN_PATH = '/dashboard/teacher';

/** Dashboard areas only staff use. Signed-out visitors here go to the teacher sign-in. */
const STAFF_PATHS = ['/dashboard/admin', '/dashboard/school', '/dashboard/learning-reports', '/dashboard/leaderboard', '/dashboard/certificate'];

/** Where someone with this role signs in. School leads and admins use the teacher page. */
export function loginPathForRole(role?: UserRole | null): string {
  return role && role !== 'learner' ? TEACHER_LOGIN_PATH : LEARNER_LOGIN_PATH;
}

/** Sign-in page for a signed-out visitor who tried to open this dashboard path. */
export function loginPathForPage(pathname: string): string {
  return STAFF_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ? TEACHER_LOGIN_PATH : LEARNER_LOGIN_PATH;
}
