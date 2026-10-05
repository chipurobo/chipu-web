import { supabase } from './supabase';

// =============================================================
// Thin client wrapper around the send-email edge function.
//
// The SendKit API key lives ONLY on the server (Supabase secret).
// This helper invokes the edge function with the user's JWT — the
// function uses the key, never exposes it.
//
// Usage:
//   const { error } = await sendEmail({
//     to: 'mary@example.com',
//     subject: 'Your ChipuRobo login',
//     html: '<p>Hi Mary,</p><p>…</p>',
//   });
//   if (error) toast.warning(error);
// =============================================================

export interface SendEmailInput {
  to:        string | string[];
  subject:   string;
  html?:     string;
  text?:     string;
  reply_to?: string;
}

export interface SendEmailResult {
  ok:    boolean;
  id?:   string | null;
  error: string | null;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: input,
  });
  if (error) {
    return { ok: false, error: error.message ?? 'send failed' };
  }
  if (data?.error) {
    return { ok: false, error: data.error };
  }
  return { ok: true, id: data?.id ?? null, error: null };
}
