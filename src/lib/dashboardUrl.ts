// =============================================================
// Public dashboard URL used in outgoing emails.
//
// Outgoing emails (credentials, order notifications) need a URL the
// recipient can actually visit. `window.location.origin` works when
// the admin is on chipurobo.com but breaks when they're running
// dev on http://localhost:5173 — the teacher can't click that.
//
// Resolution order:
//   1. VITE_DASHBOARD_URL                   (set per-env via Vercel / .env.local)
//   2. window.location.origin if not localhost
//   3. https://chipurobo.com                (production fallback)
// =============================================================

const PRODUCTION_FALLBACK = 'https://chipurobo.com';

export function getDashboardUrl(): string {
  const fromEnv = import.meta.env.VITE_DASHBOARD_URL as string | undefined;
  if (fromEnv) return stripTrailingSlash(fromEnv);

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (!/localhost|127\.0\.0\.1/.test(origin)) {
      return stripTrailingSlash(origin);
    }
  }

  return PRODUCTION_FALLBACK;
}

export function getDashboardPath(path: string): string {
  const base = getDashboardUrl();
  if (!path.startsWith('/')) path = '/' + path;
  return base + path;
}

function stripTrailingSlash(s: string): string {
  return s.endsWith('/') ? s.slice(0, -1) : s;
}
