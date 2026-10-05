// ============================================================================
// Google Analytics 4 — page_view tracking for a client-side-routed app.
//
// gtag.js sends exactly ONE page_view of its own: the one fired when the
// script first loads. Every navigation in this app is a React Router
// pushState, so with the stock snippet alone GA records the entry page and
// then nothing for the rest of the session. The dashboard is reached almost
// entirely by client-side navigation, so it would be close to invisible.
//
// GA4 "enhanced measurement" has a browser-history option meant to cover
// this, but it is a property-level toggle this repo cannot assert, and it was
// verified NOT firing against this property — a pushState navigation produced
// no page_view. Sending them ourselves is deterministic and survives someone
// flipping settings in the GA console. public/gtag-init.js therefore sets
// send_page_view: false, so gtag's automatic first hit cannot double-count
// with the one this module sends on mount.
// ============================================================================

const MEASUREMENT_ID = 'G-BRZM039CGC';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Path segments that look like a UUID are replaced before anything is sent to
// Google. Dashboard routes embed record ids — /dashboard/admin/schools/:schoolId,
// /dashboard/certificate/:issuanceId, /dashboard/school/lessons/:lessonId — which
// identify individual schools and the learners a certificate was issued to.
// Those are not ours to hand to a third-party analytics vendor, and as raw ids
// they would also shatter the reports into one row per record. Collapsing them
// keeps the per-screen traffic counts, which is the thing actually worth having.
const UUID_SEGMENT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function redactPath(pathname: string): string {
  return pathname
    .split('/')
    .map((segment) => (UUID_SEGMENT.test(segment) ? ':id' : segment))
    .join('/');
}

/**
 * Query strings are kept on the public site because that is where campaign
 * attribution lives (?utm_source=…) and GA4 reads it off page_location. They
 * are dropped inside /dashboard, where a query string is only ever an app
 * filter and may carry record ids.
 */
function pageQuery(pathname: string, search: string): string {
  return pathname.startsWith('/dashboard') ? '' : search;
}

export function trackPageView(pathname: string, search: string): void {
  // Absent when the tag is blocked by CSP, an ad blocker, or an offline dev
  // run. Analytics must never be the reason a navigation throws.
  if (typeof window.gtag !== 'function') return;

  const path = redactPath(pathname) + pageQuery(pathname, search);
  const location = `${window.location.origin}${path}`;

  // 'set' before 'event', and not just event-level parameters, because the
  // page location rides on EVERY hit — including the enhanced-measurement
  // events (scroll, click, file_download) that gtag fires on its own and that
  // we never call directly. Passing page_location only on the page_view would
  // leave those automatic hits reporting window.location verbatim, which is
  // exactly the raw /dashboard/.../<uuid> URL the redaction above exists to
  // keep out of Google. 'set' makes the redacted value the default for
  // everything that follows.
  window.gtag('set', {
    page_path: path,
    page_location: location,
    page_title: document.title,
  });

  window.gtag('event', 'page_view', {
    send_to: MEASUREMENT_ID,
    page_path: path,
    page_location: location,
    page_title: document.title,
  });
}
