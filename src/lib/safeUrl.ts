// =============================================================
// URL sanitisation for user-supplied links.
//
// Project and event URLs are written by school leads and rendered as
// anchors in the admin dashboard. `<input type="url">` accepts
// `javascript:alert(1)` as valid, and a lead can bypass the form entirely
// by calling supabase.from('projects').update(...) on their own row — RLS
// permits it. An admin clicking such a link would execute the author's
// script in the dashboard origin, where the session token lives.
//
// Anything that is not plainly http(s) is treated as unrenderable.
// =============================================================

/**
 * Returns the URL if it parses as http(s), otherwise null.
 *
 * Callers should render the link only when this returns non-null — the
 * null case means "refuse to link", not "link to something else".
 */
export function safeHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null; // relative, malformed, or scheme-less
  }

  return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? trimmed : null;
}

/** Hostname without a leading `www.`, for link subtitles. Falls back to ''. */
export function domainOf(raw: string | null | undefined): string {
  const safe = safeHttpUrl(raw);
  if (!safe) return '';
  try {
    return new URL(safe).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
