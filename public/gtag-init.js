// ============================================================================
// Google Analytics 4 bootstrap (measurement ID G-BRZM039CGC).
//
// This is the second half of Google's standard gtag.js snippet, which ships
// as an inline <script> block. It lives in its own same-origin file on
// purpose: script-src in security-headers.js deliberately has NO
// 'unsafe-inline', so pasting it inline into index.html would be blocked
// outright by CSP. Serving it from /public keeps that control intact —
// no 'unsafe-inline', and no sha256 hash that would silently break the tag
// the next time somebody reformats this file.
//
// index.html loads this BEFORE the googletagmanager.com tag so dataLayer
// already exists when that script starts draining the queue.
//
// Vite copies /public verbatim into dist/, so this is served at
// /gtag-init.js and is covered by script-src 'self'.
// ============================================================================

window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag('js', new Date());

// --- Record-id redaction -----------------------------------------------------
// Deliberately duplicated from src/lib/analytics.ts (keep the two in step).
// It cannot be imported: this file is served verbatim from /public and must
// run in <head> before gtag.js, whereas analytics.ts is inside the bundle and
// only executes once React has mounted.
//
// That ordering is the entire point. gtag.js captures the page location the
// moment it configures, and the enhanced-measurement events it fires on its
// own (scroll, click, file_download) inherit it. On a deep link straight to
// /dashboard/admin/schools/<uuid>, a scroll hit carrying the raw id would
// already be on the wire before any React code could redact it — this was
// observed, not theorised. So the first location gtag ever sees is redacted
// here; analytics.ts then keeps it redacted across client-side navigation.
var UUID_SEGMENT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function redactPath(pathname) {
  return pathname
    .split('/')
    .map(function (segment) {
      return UUID_SEGMENT.test(segment) ? ':id' : segment;
    })
    .join('/');
}

// Query strings are kept on the public site (that is where ?utm_source=…
// campaign attribution lives) and dropped inside /dashboard, where they are
// only ever app filters and may carry record ids.
var initialPath =
  redactPath(window.location.pathname) +
  (window.location.pathname.indexOf('/dashboard') === 0 ? '' : window.location.search);

// send_page_view is off because this is a React Router SPA: gtag would only
// ever fire one page_view (this initial load) and miss every client-side
// navigation after it. src/lib/analytics.ts sends them all instead, including
// the first, so the counts stay complete without double-counting the entry
// page. Turning this back on means removing RouteAnalytics in src/App.tsx.
gtag('config', 'G-BRZM039CGC', {
  send_page_view: false,
  page_path: initialPath,
  page_location: window.location.origin + initialPath,
});
