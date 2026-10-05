import { getDashboardPath } from './dashboardUrl';
import { sendEmail } from './sendEmail';

// =============================================================
// The welcome email a newly onboarded teacher receives.
//
// This lives here rather than inside the credentials card because two places
// send it — the single-school form and the bulk import — and they were only
// ever going to drift. The bulk import previously sent nothing at all: it
// downloaded a CSV of every login and plaintext password for an admin to
// distribute by hand, which is a list of live credentials sitting in someone's
// Downloads folder.
//
// password is optional. When only a login email changed there is no new
// password to send, and the row is left out rather than rendered blank.
// =============================================================

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface InviteInput {
  school:     string;
  loginEmail: string;
  password?:  string | null;
}

export interface InviteBody {
  subject: string;
  text:    string;
  html:    string;
}

export function buildInvite({ school, loginEmail, password }: InviteInput): InviteBody {
  const loginUrl = getDashboardPath('/dashboard/login');

  const text =
`Hi,

Your ChipuRobo code-club dashboard is ready.

  School:   ${school}
  Login:    ${loginUrl}
  Email:    ${loginEmail}${password ? `\n  Password: ${password}` : ''}

Please sign in and let us know if anything looks off.

— ChipuRobo`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#1f2937;max-width:520px;">
      <h2 style="margin:0 0 8px;">Welcome to ChipuRobo</h2>
      <p>Your code-club dashboard for <strong>${escapeHtml(school)}</strong> is ready.</p>
      <table style="border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Login</td>
            <td style="padding:4px 0;"><a href="${escapeHtml(loginUrl)}">${escapeHtml(loginUrl)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Email</td>
            <td style="padding:4px 0;font-family:monospace;">${escapeHtml(loginEmail)}</td></tr>
        ${password
          ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;">Password</td>
                 <td style="padding:4px 0;font-family:monospace;">${escapeHtml(password)}</td></tr>`
          : ''}
      </table>
      <p style="color:#6b7280;font-size:13px;">Please sign in and let us know if anything looks off.</p>
      <p style="color:#6b7280;font-size:13px;">— ChipuRobo</p>
    </div>`;

  return { subject: `Your ChipuRobo dashboard — ${school}`, text, html };
}

/** Send the invite. Never throws — the account already exists either way, and
 *  a failed email must not be reported as a failed onboarding. */
export async function sendInvite(
  to: string,
  input: InviteInput,
): Promise<{ ok: boolean; error: string | null }> {
  const { subject, text, html } = buildInvite(input);
  const { ok, error } = await sendEmail({ to, subject, html, text });
  return { ok, error: error ?? null };
}
