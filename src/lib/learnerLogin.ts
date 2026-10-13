/**
 * How a learner's login is built from their school and admission number.
 * Mirrors public.admission_login() and public.learner_password() in the
 * database. Change both or neither.
 *
 * Learners have no password of their own: they pick their school and type
 * their four-digit admission number. The account behind them still has a
 * password, derived from the login by the fixed rule below.
 */
export const LEARNER_LOGIN_DOMAIN = 'learners.chipurobo.local';

/** "7" → "0007"; "0042" → "0042". Anything that is not 1–4 digits comes back unchanged so validation can reject it. */
export function normaliseAdmissionNumber(input: string): string {
  const digits = input.trim();
  return /^[0-9]{1,4}$/.test(digits) ? digits.padStart(4, '0') : digits;
}

/** "likoni-vi" + "0014" → "likoni-vi-0014" */
export function admissionLogin(schoolCode: string, admissionNumber: string): string {
  const code = schoolCode.trim().toLowerCase();
  const admission = admissionNumber.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${code}-${admission}`;
}

export function learnerPassword(login: string): string {
  return `chipu-learner-${login.trim().toLowerCase()}-2026`;
}

export function isValidLearnerLogin(login: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{2,31}$/.test(login);
}

export function learnerEmail(login: string): string {
  return `${login}@${LEARNER_LOGIN_DOMAIN}`;
}
