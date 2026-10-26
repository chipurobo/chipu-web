import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Blocks, Eye, EyeOff, Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import type { UserRole } from '../lib/database.types';
import { fetchSchoolLoginOptions, type SchoolLoginOption } from '../lib/learningQueries';
import { admissionLogin, learnerEmail, learnerPassword, normaliseAdmissionNumber } from '../lib/learnerLogin';
import { Mascot } from './learning/ui/LearnerArt';
import './Login.css';

const STAFF_ROLES: UserRole[] = ['teacher', 'school_lead', 'admin'];

/**
 * Signs in, then checks the account belongs on this page. Returns an error
 * message to show, or null once the learner or teacher is on their dashboard.
 */
function useSignIn(accepted: UserRole[], wrongPageMessage: string, failedMessage: string) {
  const navigate = useNavigate();
  const { signIn, signOut } = useAuth();

  return async (identity: string, secret: string): Promise<string | null> => {
    try {
      const { error } = await signIn(identity, secret);
      if (error) {
        return /invalid login credentials/i.test(error) ? failedMessage
          : /fetch|network|connection/i.test(error) ? 'We couldn’t connect. Check your internet connection and try again.'
          : error;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return 'Your session ended. Please sign in again.';
      const { data: account, error: accountError } = await supabase.from('profiles').select('role').eq('id', sessionData.session.user.id).single();
      if (accountError || !account || !accepted.includes(account.role)) {
        await signOut();
        return wrongPageMessage;
      }
      if (account.role === 'learner') {
        try { sessionStorage.setItem('chipurobo:learner-welcome', '1'); } catch { /* private mode */ }
      }
      if (account.role === 'learner') {
        try { sessionStorage.setItem('chipurobo:learner-welcome', '1'); } catch { /* private mode */ }
      }
      navigate('/dashboard', { replace: true });
      return null;
    } catch {
      return 'We couldn’t connect. Check your internet connection and try again.';
    }
  };
}

/** chipurobo.com/dashboard/learner — school and admission number, nothing else. */
export function LearnerLogin() {
  const schools = useQuery({ queryKey: ['school-login-options'], queryFn: fetchSchoolLoginOptions });
  const [schoolCode, setSchoolCode] = useState('');
  const [admission, setAdmission] = useState('');
  const form = useLoginForm();
  const signIn = useSignIn(
    ['learner'],
    'This page is for learners. Teachers sign in on the teacher page.',
    'We couldn’t find that learner. Check your school and admission number, or ask your teacher.',
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!schoolCode) { form.showError('Choose your school first.'); return; }
    const number = normaliseAdmissionNumber(admission);
    if (!/^[0-9]{4}$/.test(number)) { form.showError('Your admission number is 4 digits, like 0001.'); return; }
    const login = admissionLogin(schoolCode, number);
    void form.run(() => signIn(learnerEmail(login), learnerPassword(login)));
  };

  return (
    <LoginShell title="Learner sign in" form={form} onSubmit={onSubmit} canSubmit={schools.isSuccess}>
      <SchoolPicker schools={schools.data ?? []} loading={schools.isPending} failed={schools.isError} onRetry={() => void schools.refetch()}
        value={schoolCode} onChange={(code) => { setSchoolCode(code); form.clearError(); }} />
      <div className="login-field">
        <label htmlFor="admission">Admission number</label>
        <input id="admission" type="text" inputMode="numeric" pattern="[0-9]{1,4}" maxLength={4} required autoComplete="username" autoCapitalize="off" spellCheck={false}
          className="login-input login-admission" placeholder="0001" value={admission} onChange={(e) => { setAdmission(e.target.value.replace(/[^0-9]/g, '')); form.clearError(); }} />
      </div>
    </LoginShell>
  );
}

/** chipurobo.com/dashboard/teacher — email or username and password. Admins and school leads sign in here too. */
export function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const form = useLoginForm();
  const signIn = useSignIn(
    STAFF_ROLES,
    'This page is for teachers. Learners sign in at chipurobo.com/dashboard/learner.',
    'Those details didn’t match. Check your email or username and password, then try again.',
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    void form.run(() => signIn(value.includes('@') ? value : `${value}@chipurobo.local`, password));
  };

  return (
    <LoginShell title="Teacher sign in" form={form} onSubmit={onSubmit} canSubmit>
      <div className="login-field">
        <label htmlFor="email">Email or username</label>
        <input id="email" type="text" required autoComplete="username" autoCapitalize="off" spellCheck={false} className="login-input"
          placeholder="Your email or username" value={email} onChange={(e) => { setEmail(e.target.value); form.clearError(); }} />
      </div>
      <div className="login-field">
        <label htmlFor="password">Password</label>
        <div className="login-password">
          <input id="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" className="login-input"
            placeholder="Your password" value={password} onChange={(e) => { setPassword(e.target.value); form.clearError(); }} />
          <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-controls="password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        </div>
        <Link to="/dashboard/forgot-password" className="login-forgot">Forgot your password?</Link>
      </div>
    </LoginShell>
  );
}

function useLoginForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const showError = (message: string) => {
    setError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
  };
  const run = async (attempt: () => Promise<string | null>) => {
    setError(null);
    setSubmitting(true);
    const message = await attempt();
    setSubmitting(false);
    if (message) showError(message);
  };
  return { submitting, error, errorRef, showError, clearError: () => setError(null), run };
}

function LoginShell({ title, form, onSubmit, canSubmit, children }: {
  title: string; form: ReturnType<typeof useLoginForm>; onSubmit: (e: FormEvent) => void; canSubmit: boolean; children: ReactNode;
}) {
  const { sessionExpired } = useAuth();
  const { submitting, error, errorRef } = form;
  // The page title is the first thing a screen reader says on arrival.
  useEffect(() => { document.title = `${title} · ChipuRobo`; }, [title]);

  return (
    <div className="login-page">
      <a className="login-skip" href="#login-form">Skip to sign in</a>
      <header className="login-header">
        <Link to="/" className="login-brand" aria-label="ChipuRobo home">
          <img src="/img/logo.webp" alt="" width={42} height={42} />
          <span>ChipuRobo<span className="login-brand-dot" aria-hidden="true">.</span></span>
        </Link>
        <Link to="/" className="login-back"><ArrowLeft size={16} aria-hidden="true" /> Back to website</Link>
      </header>

      <main className="login-main">
        <section className="login-welcome" aria-labelledby="login-welcome-title">
          <span className="login-eyebrow"><span aria-hidden="true" /> A space for curious minds</span>
          <h2 id="login-welcome-title">Little ideas.<br />{' '}<span>Big possibilities.</span></h2>
          <div className="login-art" role="img" aria-label="A friendly robot surrounded by building blocks, a light bulb and a star.">
            <div aria-hidden="true" className="login-art-scene">
              <div className="login-art-orbit" />
              <div className="login-art-disc" />
              <Mascot size={260} mood="happy" className="login-mascot" />
              <div className="login-sticker login-sticker-build"><Blocks size={25} /><span>Build it.</span></div>
              <div className="login-sticker login-sticker-idea"><Lightbulb size={28} /></div>
              <div className="login-sticker login-sticker-play"><Sparkles size={23} /><span>Try something new!</span></div>
              <span className="login-art-dot login-art-dot-one" />
              <span className="login-art-dot login-art-dot-two" />
              <span className="login-art-plus">+</span>
            </div>
          </div>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <h1 id="login-title">{title}</h1>
          {sessionExpired && <div role="status" className="login-notice">Your session ended. Please sign in again.</div>}

          <form id="login-form" tabIndex={-1} onSubmit={onSubmit} aria-busy={submitting}>
            {/* Only here to disable every field while signing in. The heading
                already names the form, so it is not announced as a group. */}
            <fieldset className="login-fields" role="none" disabled={submitting}>
              {children}
            </fieldset>
            {error && <div id="login-error" ref={errorRef} tabIndex={-1} role="alert" className="login-error">{error}</div>}
            <button type="submit" className="login-submit" disabled={submitting || !canSubmit}>
              {submitting ? <><Loader2 size={19} className="login-spinner" aria-hidden="true" /> Signing in…</> : <>Sign in <ArrowRight size={19} aria-hidden="true" /></>}
            </button>
          </form>
          <span role="status" className="sr-only">{submitting ? 'Signing you in. Please wait.' : ''}</span>
        </section>
      </main>
    </div>
  );
}

/** School dropdown for learners. Nobody should have to type or spell a school name. */
function SchoolPicker({ schools, loading, failed, onRetry, value, onChange }: {
  schools: SchoolLoginOption[]; loading: boolean; failed: boolean; onRetry: () => void;
  value: string; onChange: (code: string) => void;
}) {
  return (
    <div className="login-field">
      <label htmlFor="school">School</label>
      <select
        id="school"
        className="login-input"
        required
        disabled={loading || failed}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{loading ? 'Loading schools…' : 'Choose your school'}</option>
        {schools.map((school) => <option key={school.id} value={school.code}>{school.name}</option>)}
      </select>
      {failed && <div id="school-error" role="alert" className="login-school-error">We couldn’t load the schools. Check your connection. <button type="button" onClick={onRetry}>Try again</button></div>}
    </div>
  );
}
