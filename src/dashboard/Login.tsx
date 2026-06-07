import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

// Self-signup is intentionally absent. Schools (and their lead-teacher
// logins) are created by ChipuRobo admins on /dashboard/admin/schools.
// The teacher receives username + temp password by email manually.
//
// Login is USERNAME + password. Internally we map username →
// "<username>@chipurobo.local" before calling Supabase. If a value
// containing "@" is typed (legacy admin accounts), we pass it through
// unchanged.
function usernameToEmail(input: string): string {
  const v = input.trim().toLowerCase();
  return v.includes('@') ? v : `${v}@chipurobo.local`;
}

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(usernameToEmail(username), password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
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
            Use the email + password ChipuRobo sent you. Don't have credentials yet?
            Get in touch with the ChipuRobo team.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                autoCapitalize="off"
                spellCheck={false}
                className="field-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="text-xs text-gray-500 mt-6 text-center">
            <Link to="/" className="text-teal-700 hover:underline">
              ← Back to chipurobo.com
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
