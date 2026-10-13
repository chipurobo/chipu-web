import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { fetchSchoolLoginOptions } from '../lib/learningQueries';
import { admissionLogin, learnerEmail, learnerPassword, normaliseAdmissionNumber } from '../lib/learnerLogin';
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
  // Learners sign in with their school and four-digit admission number only.
  // The account's password is derived from the login (see learnerLogin.ts).
  const [schoolCode, setSchoolCode] = useState('');
  const [admission, setAdmission] = useState('');
  const schools = useQuery({ queryKey: ['school-login-options'], queryFn: fetchSchoolLoginOptions, enabled: kind === 'learner' });
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    let identity = normaliseLogin(email, kind);
    let secret = password;
    if (kind === 'learner') {
      const number = normaliseAdmissionNumber(admission);
      if (!/^[0-9]{4}$/.test(number)) { setError('Your admission number is 4 digits, like 0014.'); setSubmitting(false); return; }
      const login = admissionLogin(schoolCode, number);
      identity = learnerEmail(login);
      secret = learnerPassword(login);
    }
    const { error: err } = await signIn(identity, secret);
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
            {kind === 'learner'
              ? 'Pick your school and type your admission number. Ask your teacher if you forget it!'
              : 'Sign in with the account your school or ChipuRobo gave you.'}
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
            {kind === 'learner' ? <>
              <div>
                <label className="field-label" htmlFor="school"><span aria-hidden="true">🏫 </span>School</label>
                <select id="school" required aria-required="true" className="field-select" value={schoolCode} onChange={(e) => setSchoolCode(e.target.value)}>
                  <option value="">{schools.isPending ? 'Loading schools…' : 'Choose your school'}</option>
                  {schools.data?.map((school) => <option key={school.id} value={school.code}>{school.name}</option>)}
                </select>
                {schools.error && <p className="field-error">We couldn't load the school list. Check your connection and try again.</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="admission"><span aria-hidden="true">🔢 </span>Admission number</label>
                <input id="admission" type="text" inputMode="numeric" pattern="[0-9]{1,4}" maxLength={4} required aria-required="true" autoComplete="username" autoCapitalize="off" spellCheck={false}
                  className="field-input text-2xl tracking-[0.3em]" placeholder="0014" value={admission} onChange={(e) => setAdmission(e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
            </> : <div>
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="text"
                required
                aria-required="true"
                autoComplete="username"
                autoCapitalize="off"
                spellCheck={false}
                className="field-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>}
            {kind !== 'learner' && <div>
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
            </div>}

            {error && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>

            {kind !== 'learner' && <p className="text-sm text-center mt-3 mb-0">
              <Link to="/dashboard/forgot-password" className="!text-teal-800 hover:underline">
                Forgot your password?
              </Link>
            </p>}
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
