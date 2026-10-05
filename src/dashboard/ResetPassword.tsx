import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { KeyRound, ArrowLeft } from 'lucide-react';

// =============================================================
// /dashboard/reset-password
//
// Where the emailed link lands. GoTrue returns the recovery tokens in the URL
// fragment and supabase-js exchanges them for a session — which is why
// detectSessionInUrl had to be turned on. That session is what authorises
// updateUser() below; there is no separate token to hand about.
//
// The page waits for that exchange before deciding anything. Rendering the
// form immediately would show "this link is invalid" for the moment between
// mount and the SDK finishing, which is exactly when a worried person reads it.
// =============================================================

type Phase = 'checking' | 'ready' | 'invalid' | 'done';

export function ResetPassword() {
  const [phase, setPhase]       = useState<Phase>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Fires when supabase-js has consumed the fragment.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setPhase('ready');
    });

    // And cover the case where it had already finished before we subscribed.
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setPhase((p) => (p === 'checking' ? (data.session ? 'ready' : 'invalid') : p));
    });

    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = password.length >= 8 && confirm === password;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) { setError(err.message); return; }
    setPhase('done');
    // The recovery session is a live session. Signing out means the new
    // password gets used at least once, rather than the person being carried
    // into the dashboard without ever typing it.
    await supabase.auth.signOut();
    // Deliberately no automatic redirect. /dashboard/login bounces anyone who
    // has not seen the welcome carousel straight into it, so an auto-navigate
    // lands people in a marketing carousel moments after a password reset.
    // They click when they are ready instead.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="card p-8 w-full max-w-md">
        <h1 className="heading-display text-xl text-gray-900 flex items-center gap-2 mb-3">
          <KeyRound className="h-5 w-5 text-teal-700" aria-hidden="true" />
          Choose a new password
        </h1>

        {phase === 'checking' && (
          <p role="status" className="text-sm text-gray-600">Checking your link…</p>
        )}

        {phase === 'invalid' && (
          <>
            <p className="text-sm text-gray-700">
              This link has expired or has already been used. Reset links last an hour and work
              once.
            </p>
            <Link to="/dashboard/forgot-password" className="btn-primary mt-4 inline-flex">
              Send a new link
            </Link>
          </>
        )}

        {phase === 'done' && (
          <>
            <p role="status" className="text-sm text-gray-700">
              Password changed. Sign in with your new password.
            </p>
            <Link to="/dashboard/login" className="btn-primary mt-4 inline-flex">
              Go to sign in
            </Link>
          </>
        )}

        {phase === 'ready' && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="rp-pw">New password</label>
              <input
                id="rp-pw" type="password" required minLength={8} className="field-input"
                value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <p className="field-help">At least 8 characters.</p>
              {tooShort && <p className="text-xs text-terracotta-700 mt-1">Too short.</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="rp-confirm">Confirm password</label>
              <input
                id="rp-confirm" type="password" required className="field-input"
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
              {mismatch && <p className="text-xs text-terracotta-700 mt-1">These do not match.</p>}
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={busy || !canSubmit}>
              {busy ? 'Saving…' : 'Save new password'}
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
