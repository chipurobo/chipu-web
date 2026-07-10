// ============================================================================
// /functions/v1/send-email — relays an email through SendKit.
//
// Runs on Supabase Edge Runtime (Deno). The SendKit API key never leaves
// the server. Frontend invokes this function via
//   supabase.functions.invoke('send-email', { body: { to, subject, html } })
// and supabase-js automatically forwards the user's JWT, so we can confirm
// the request is from an authenticated user before relaying.
//
// Required Supabase secrets:
//   SENDKIT_API_KEY  — sk_…  (set with `supabase secrets set SENDKIT_API_KEY=sk_…`)
//   SENDKIT_FROM     — "ChipuRobo <noreply@chipurobo.com>" (display name + from address)
//
// Deploy with:
//   supabase functions deploy send-email
// ============================================================================

// @ts-expect-error — Deno-only npm: specifier resolved by Supabase Edge Runtime
import { SendKit } from "npm:@sendkitdev/sdk";

// @ts-expect-error — Deno globals
const SENDKIT_API_KEY = Deno.env.get("SENDKIT_API_KEY");
// @ts-expect-error — Deno globals
const SENDKIT_FROM    = Deno.env.get("SENDKIT_FROM") ?? "ChipuRobo <noreply@chipurobo.com>";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type":                 "application/json",
};

interface Body {
  to:       string | string[];
  subject:  string;
  html?:    string;
  text?:    string;
  reply_to?: string;
}

// @ts-expect-error — Deno global
Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }),
      { status: 405, headers: corsHeaders });
  }

  // Require an Authorization header — the frontend always sends the user's
  // JWT via supabase.functions.invoke, so absent header = anonymous call.
  if (!req.headers.get("Authorization")) {
    return new Response(JSON.stringify({ error: "unauthorized" }),
      { status: 401, headers: corsHeaders });
  }

  if (!SENDKIT_API_KEY) {
    return new Response(JSON.stringify({ error: "SENDKIT_API_KEY is not set on the server" }),
      { status: 500, headers: corsHeaders });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid JSON body" }),
      { status: 400, headers: corsHeaders });
  }

  const { to, subject, html, text, reply_to } = body;
  if (!to || !subject || (!html && !text)) {
    return new Response(JSON.stringify({ error: "to, subject, and html|text are required" }),
      { status: 400, headers: corsHeaders });
  }

  try {
    const sendkit = new SendKit(SENDKIT_API_KEY);
    const result = await sendkit.emails.send({
      from:     SENDKIT_FROM,
      to,
      subject,
      html,
      text,
      reply_to,
    });

    if (result?.error) {
      return new Response(JSON.stringify({ error: result.error.message ?? String(result.error) }),
        { status: 502, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ id: result?.data?.id ?? null, ok: true }),
      { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message ?? "sendkit failure" }),
      { status: 502, headers: corsHeaders });
  }
});
