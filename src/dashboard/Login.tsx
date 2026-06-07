import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Sparkles } from 'lucide-react';

const ONBOARDING_KEY = 'chipurobo:onboarding-seen';

// Self-signup is intentionally absent. Schools (and their lead-teacher
// logins) are created by ChipuRobo admins on /dashboard/admin/schools.
// The teacher receives email + temp password from the admin manually.
//
// Login is EMAIL + password. The field is forgiving — if the user pastes
// only the "username" half of their school-lead login (e.g. "mary.wanjiku"),
// we transparently append "@chipurobo.local" before calling Supabase.
function normaliseEmail(input: string): string {
  const v = input.trim().toLowerCase();
  return v.includes('@') ? v : `${v}@chipurobo.local`;
}

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // First-time visitors land on the welcome carousel.
  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(ONBOARDING_KEY) === '1'; } catch { /* ignore */ }
    if (!seen) navigate('/dashboard/welcome', { replace: true });
  }, [navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(normaliseEmail(email), password);
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
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="text"
                required
                autoComplete="email"
                autoCapitalize="off"
                spellCheck={false}
                className="field-input"
                placeholder="you@example.com"
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

          <div className="text-xs text-gray-500 mt-6 text-center flex flex-col gap-2">
            <Link
              to="/dashboard/welcome"
              className="text-teal-700 hover:underline inline-flex items-center justify-center"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
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
