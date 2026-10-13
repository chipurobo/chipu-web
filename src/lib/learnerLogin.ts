/**
 * How a learner's login is built from their school and admission number.
 * Mirrors public.admission_login() in the database. Change both or neither.
 */
export const LEARNER_LOGIN_DOMAIN = 'learners.chipurobo.local';

/** "lik" + "2026/014" → "lik-2026-014" */
export function admissionLogin(schoolCode: string, admissionNumber: string): string {
  const code = schoolCode.trim().toLowerCase();
  const admission = admissionNumber.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${code}-${admission}`;
}

export function isValidLearnerLogin(login: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{2,31}$/.test(login);
}

export function learnerEmail(login: string): string {
  return `${login}@${LEARNER_LOGIN_DOMAIN}`;
}
