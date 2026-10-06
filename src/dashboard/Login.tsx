import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Sparkles } from 'lucide-react';

function normaliseLogin(input: string, kind: 'teacher' | 'learner' | 'admin'): string {
  const value = input.trim().toLowerCase();
  return value.includes('@') ? value : `${value}@${kind === 'learner' ? 'learners.chipurobo.local' : 'chipurobo.local'}`;
}

export function Login() {
  const navigate = useNavigate();
  const { signIn, signOut, sessionExpired } = useAuth();
  const [kind, setKind] = useState<'teacher' | 'learner' | 'admin'>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(normaliseLogin(email, kind), password);
    if (err) {
      setError(err);
      setSubmitting(false);
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) { setSubmitting(false); setError('Your session ended. Please sign in again.'); return; }
    const { data: account, error: accountError } = await supabase.from('profiles').select('role').eq('id', sessionData.session.user.id).single();
    const accepted = kind === 'teacher' ? ['teacher', 'school_lead'] : [kind];
    if (accountError || !account || !accepted.includes(account.role)) {
      await signOut();
      setSubmitting(false);
      setError('These credentials do not match the selected account type. Choose the correct sign-in option.');
      return;
    }
    setSubmitting(false);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="admin-zone min-h-screen bg-warm-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center mb-8">
          <picture>
            <source srcSet="/img/logo.webp" type="image/webp" />
            <img src="/img/logo.png" alt="" width={32} height={32} className="h-8 w-8 pixel-crisp" />
          </picture>
          <span className="ml-3 font-pixel text-xs tracking-wider text-gray-900 uppercase">
            ChipuRobo<span className="text-teal-500">_</span>
          </span>
        </Link>

        <div className="card p-6 sm:p-8">
          <h1 className="mb-1">Sign in to ChipuRobo</h1>
          <p className="text-sm text-gray-600 mb-6">
            Sign in with the account your school or ChipuRobo gave you.
          </p>

          {/* Surfaced if the session ended unexpectedly — token refresh
              failed, signed out from another tab, or idle timeout fired. */}
          {sessionExpired && (
            <div
              role="status"
              className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2"
            >
              Your session ended. Please sign in again.
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <fieldset className="flex gap-3 flex-wrap">
              <legend className="field-label">Sign in as</legend>
              {(['teacher', 'learner', 'admin'] as const).map((option) => <label key={option} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="login-kind" value={option} checked={kind === option}
                  onChange={() => { setKind(option); setError(null); }} />
                {option === 'teacher' ? 'Teacher' : option === 'learner' ? 'Learner' : 'Admin'}
              </label>)}
            </fieldset>
            <div>
              <label className="field-label" htmlFor="email">{kind === 'learner' ? 'Learner username' : 'Email'}</label>
              <input
                id="email"
                type="text"
                required
                aria-required="true"
                autoComplete="username"
                autoCapitalize="off"
                spellCheck={false}
                className="field-input"
                placeholder={kind === 'learner' ? 'your.username' : 'you@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                aria-required="true"
                autoComplete="current-password"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="text-sm text-center mt-3 mb-0">
              <Link to="/dashboard/forgot-password" className="!text-teal-800 hover:underline">
                Forgot your password?
              </Link>
            </p>
          </form>

          <div className="text-xs text-gray-500 mt-6 text-center flex flex-col gap-2">
            <Link
              to="/dashboard/welcome"
              className="!text-teal-800 hover:underline inline-flex items-center justify-center"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              Take the tour
            </Link>
            <Link to="/" className="text-gray-500 hover:text-gray-900">
              ← Back to chipurobo.com
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
