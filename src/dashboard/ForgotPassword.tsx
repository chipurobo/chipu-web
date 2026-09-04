import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getDashboardPath } from '../lib/dashboardUrl';
import { KeyRound, ArrowLeft } from 'lucide-react';

// =============================================================
// /dashboard/forgot-password
//
// Two things here are deliberate.
//
// The result is always the same sentence, whether or not the address has an
// account. Saying "no account with that email" turns this form into a way to
// discover which teachers are on the platform.
//
// It warns about @chipurobo.local. Accounts minted before real email logins
// sign in with an address at a domain that does not exist, so a reset can
// never reach them — the mail is not lost, it was never deliverable. Those
// accounts need an admin to move them onto a real address first, and saying so
// is better than letting someone wait for a message that cannot arrive.
// =============================================================

export function ForgotPassword() {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const isLocal = email.trim().toLowerCase().endsWith('@chipurobo.local');
  const looksLikeUsername = email.trim() !== '' && !email.includes('@');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}${getDashboardPath('/dashboard/reset-password')}` },
    );
    setBusy(false);
    // A transport failure is worth showing. "No such user" is not, and Supabase
    // does not report it anyway.
    if (err) { setError(err.message); return; }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="card p-8 w-full max-w-md">
        <h1 className="heading-display text-xl text-gray-900 flex items-center gap-2 mb-2">
          <KeyRound className="h-5 w-5 text-teal-700" aria-hidden="true" />
          Reset your password
        </h1>

        {sent ? (
          <>
            <p className="text-sm text-gray-700">
              If that address has a ChipuRobo account, a reset link is on its way. It expires
              after an hour.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Nothing arrived? Check spam, then ask ChipuRobo &mdash; an admin can set your
              password directly.
            </p>
          </>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the email address you sign in with and we will send you a link.
            </p>

            <div>
              <label className="field-label" htmlFor="fp-email">Email</label>
              <input
                id="fp-email" type="email" required className="field-input"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.ac.ke" autoComplete="username"
              />
            </div>

            {(isLocal || looksLikeUsername) && (
              <div role="status" className="text-sm bg-amber-50 border border-amber-300 rounded-md p-3 text-amber-900">
                Older ChipuRobo logins are a username at{' '}
                <span className="font-mono">@chipurobo.local</span>, which is not a real address
                &mdash; no email can reach it. Ask ChipuRobo to move your login onto your own
                email, and resets will work from then on.
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <Link to="/dashboard/login" className="text-sm text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 mt-6">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
