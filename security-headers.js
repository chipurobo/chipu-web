// ============================================================================
// Security response headers — source of truth.
//
// Consumed directly by server.js. vercel.json and netlify.toml restate the
// same values because those are static config formats that cannot import
// JavaScript; keep all three in step when changing anything here.
//
// Notes on the policy:
//   • script-src has NO 'unsafe-inline'. index.html must stay free of inline
//     <script> blocks and inline event-handler attributes (onload=, onclick=)
//     or they will be blocked. This is the control that would have contained
//     the stored javascript: URL XSS in the project links.
//   • style-src DOES allow 'unsafe-inline': React and Leaflet both set style
//     attributes at runtime. Inline styles cannot exfiltrate a session token,
//     so the trade is worth it where inline scripts would not be.
//   • img-src allows any https origin — OpenStreetMap tiles are served from
//     several rotating subdomains and school cover images are arbitrary URLs.
//   • frame-ancestors 'none' is the clickjacking control for /dashboard.
// ============================================================================

export const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-src 'none'",
].join('; ');

export const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};
