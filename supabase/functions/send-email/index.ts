// ============================================================================
// /functions/v1/send-email — relays an email through SendKit.
//
// Runs on Supabase Edge Runtime (Deno). The SendKit API key never leaves
// the server. Frontend invokes this function via
//   supabase.functions.invoke('send-email', { body: { to, subject, html } })
// and supabase-js automatically forwards the user's JWT.
//
// SECURITY (2026-07-18): this function used to be an open relay. It ran with
// `verify_jwt = false`, and its only check was that an Authorization header
// was PRESENT — never that the token was valid. Any string passed, so anyone
// on the internet could send arbitrary HTML to arbitrary recipients from
// noreply@chipurobo.com, with our SPF/DKIM alignment behind it. Combined
// with `Access-Control-Allow-Origin: *`, any web page could drive it from a
// visitor's browser.
//
// The token is now verified against the project and the caller must resolve
// to a real user. Origins are allowlisted, and recipients/payloads are
// bounded so a compromised account cannot use this as a bulk mailer.
//
// Required Supabase secrets:
//   SENDKIT_API_KEY  — sk_…  (set with `supabase secrets set SENDKIT_API_KEY=sk_…`)
//   SENDKIT_FROM     — "ChipuRobo <noreply@chipurobo.com>" (display name + from address)
//
// SUPABASE_URL and SUPABASE_ANON_KEY are injected by the platform.
//
// Deploy with:
//   supabase functions deploy send-email
// ============================================================================

// @ts-expect-error — Deno-only npm: specifier resolved by Supabase Edge Runtime
import { SendKit } from "npm:@sendkitdev/sdk";
// @ts-expect-error — Deno-only npm: specifier resolved by Supabase Edge Runtime
import { createClient } from "npm:@supabase/supabase-js@2";

// @ts-expect-error — Deno globals
const env = (k: string): string | undefined => Deno.env.get(k);

const SENDKIT_API_KEY = env("SENDKIT_API_KEY");
const SENDKIT_FROM    = env("SENDKIT_FROM") ?? "ChipuRobo <noreply@chipurobo.com>";
const SUPABASE_URL    = env("SUPABASE_URL");
const SUPABASE_ANON   = env("SUPABASE_ANON_KEY");

// Origins permitted to invoke this function from a browser. Anything else
// gets no CORS grant, so a hostile page cannot drive it with a visitor's
// session.
const ALLOWED_ORIGINS = [
  "https://chipurobo.com",
  "https://www.chipurobo.com",
  "http://localhost:5173",
];

// Bounds. Generous for real dashboard traffic, hostile to bulk abuse.
const MAX_RECIPIENTS   = 10;
const MAX_SUBJECT_LEN  = 300;
const MAX_BODY_LEN     = 100_000;
const EMAIL_RE         = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

interface Body {
  to:        string | string[];
  subject:   string;
  html?:     string;
  text?:     string;
  reply_to?: string;
}

function headersFor(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin":  allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary":                         "Origin",
    "Content-Type":                 "application/json",
  };
}

const fail = (status: number, error: string, h: Record<string, string>) =>
  new Response(JSON.stringify({ error }), { status, headers: h });

// Verify the caller's JWT against the project. Returns the user id, or null
// if the token is absent, malformed, expired, or not ours.
async function resolveCaller(req: Request): Promise<string | null> {
  const authorization = req.headers.get("Authorization");
  if (!authorization || !SUPABASE_URL || !SUPABASE_ANON) return null;

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: { headers: { Authorization: authorization } },
    auth:   { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser();
  return error || !data?.user ? null : data.user.id;
}

// @ts-expect-error — Deno global
Deno.serve(async (req: Request) => {
  const cors = headersFor(req.headers.get("Origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  if (req.method !== "POST") {
    return fail(405, "method not allowed", cors);
  }

  const callerId = await resolveCaller(req);
  if (!callerId) {
    return fail(401, "unauthorized", cors);
  }

  if (!SENDKIT_API_KEY) {
    return fail(500, "SENDKIT_API_KEY is not set on the server", cors);
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return fail(400, "invalid JSON body", cors);
  }

  const { to, subject, html, text, reply_to } = body;
  if (!to || !subject || (!html && !text)) {
    return fail(400, "to, subject, and html|text are required", cors);
  }

  const recipients = (Array.isArray(to) ? to : [to]).map((r) => String(r).trim());
  if (recipients.length === 0 || recipients.length > MAX_RECIPIENTS) {
    return fail(400, `to must contain between 1 and ${MAX_RECIPIENTS} recipients`, cors);
  }
  if (!recipients.every((r) => EMAIL_RE.test(r))) {
    return fail(400, "every recipient must be a valid email address", cors);
  }
  if (reply_to !== undefined && !EMAIL_RE.test(String(reply_to).trim())) {
    return fail(400, "reply_to must be a valid email address", cors);
  }
  if (String(subject).length > MAX_SUBJECT_LEN) {
    return fail(400, "subject is too long", cors);
  }
  if ((html?.length ?? 0) > MAX_BODY_LEN || (text?.length ?? 0) > MAX_BODY_LEN) {
    return fail(400, "message body is too long", cors);
  }

  try {
    const sendkit = new SendKit(SENDKIT_API_KEY);
    const result = await sendkit.emails.send({
      from: SENDKIT_FROM,
      to:   recipients,
      subject,
      html,
      text,
      reply_to,
    });

    if (result?.error) {
      return fail(502, result.error.message ?? String(result.error), cors);
    }

    return new Response(JSON.stringify({ id: result?.data?.id ?? null, ok: true }),
      { status: 200, headers: cors });
  } catch (e) {
    return fail(502, (e as Error).message ?? "sendkit failure", cors);
  }
});
