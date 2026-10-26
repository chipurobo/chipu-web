import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Blocks, Check, Eye, EyeOff, GraduationCap, Lightbulb, Loader2, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { fetchSchoolLoginOptions, type SchoolLoginOption } from '../lib/learningQueries';
import { admissionLogin, learnerEmail, learnerPassword, normaliseAdmissionNumber } from '../lib/learnerLogin';
import { Mascot } from './learning/ui/LearnerArt';
import './Login.css';

type LoginKind = 'teacher' | 'learner' | 'admin';
const roles = [
  { id: 'learner', name: 'Learner', description: 'Learn & explore', icon: GraduationCap },
  { id: 'teacher', name: 'Teacher', description: 'Guide your class', icon: Users },
  { id: 'admin', name: 'Admin', description: 'Manage schools', icon: ShieldCheck },
] as const;

function normaliseLogin(input: string, kind: LoginKind): string {
  const value = input.trim().toLowerCase();
  return value.includes('@') ? value : `${value}@${kind === 'learner' ? 'learners.chipurobo.local' : 'chipurobo.local'}`;
}

export function Login() {
  const navigate = useNavigate();
  const { signIn, signOut, sessionExpired } = useAuth();
  const [kind, setKind] = useState<LoginKind>('learner');
  const [email, setEmail] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [admission, setAdmission] = useState('');
  const schools = useQuery({ queryKey: ['school-login-options'], queryFn: fetchSchoolLoginOptions, enabled: kind === 'learner' });
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  function showError(message: string) {
    setError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    let identity = normaliseLogin(email, kind);
    let secret = password;
    if (kind === 'learner') {
      if (!schoolCode) {
        showError('Find and choose your school first.');
        setSubmitting(false);
        return;
      }
      const number = normaliseAdmissionNumber(admission);
      if (!/^[0-9]{4}$/.test(number)) {
        showError('Your admission number is 4 digits, like 0001.');
        setSubmitting(false);
        return;
      }
      const login = admissionLogin(schoolCode, number);
      identity = learnerEmail(login);
      secret = learnerPassword(login);
    }
    try {
      const { error: err } = await signIn(identity, secret);
      if (err) {
        showError(/invalid login credentials/i.test(err)
          ? kind === 'learner'
            ? 'We couldn’t find that learner. Check your school and admission number, or ask your teacher.'
            : 'Those details didn’t match. Check your email or username and password, then try again.'
          : /fetch|network|connection/i.test(err)
            ? 'We couldn’t connect. Check your internet connection and try again.'
            : err);
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { showError('Your session ended. Please sign in again.'); return; }
      const { data: account, error: accountError } = await supabase.from('profiles').select('role').eq('id', sessionData.session.user.id).single();
      const accepted = kind === 'teacher' ? ['teacher', 'school_lead'] : [kind];
      if (accountError || !account || !accepted.includes(account.role)) {
        await signOut();
        showError('This account uses a different sign-in option. Choose Learner, Teacher or Admin above and try again.');
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch {
      showError('We couldn’t connect. Check your internet connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <a className="login-skip" href="#login-form">Skip to sign in</a>
      <header className="login-header">
        <Link to="/" className="login-brand" aria-label="ChipuRobo home">
          <img src="/img/logo.webp" alt="" width={42} height={42} />
          <span>ChipuRobo<span className="login-brand-dot">.</span></span>
        </Link>
        <Link to="/" className="login-back"><ArrowLeft size={16} aria-hidden="true" /> Back to website</Link>
      </header>

      <main className="login-main">
        <section className="login-welcome" aria-labelledby="login-welcome-title">
          <span className="login-eyebrow"><span aria-hidden="true" /> A SPACE FOR CURIOUS MINDS</span>
          <h2 id="login-welcome-title">Little ideas.<br /><span>Big possibilities.</span></h2>
          <p>Build, play and discover what you can do.<br />Your next adventure starts right here.</p>
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
          <p className="login-welcome-note">A little practice. A lot of possibility.</p>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card-heading">
            <h1 id="login-title">Sign in to ChipuRobo</h1>
            <p>Good to see you! Choose how you’re joining us.</p>
          </div>
          {sessionExpired && <div role="status" className="login-notice">Your session ended. Please sign in again.</div>}

          <form id="login-form" tabIndex={-1} onSubmit={onSubmit} aria-label="Sign in" aria-busy={submitting}>
            <fieldset className="login-roles" disabled={submitting}>
              <legend>I’m signing in as</legend>
              <div className="login-role-grid">
                {roles.map(({ id, name, description, icon: Icon }) => <label key={id} className={`login-role ${kind === id ? 'is-selected' : ''}`}>
                  <input type="radio" name="login-kind" value={id} aria-label={name} checked={kind === id}
                    onChange={() => { setKind(id); setError(null); setShowPassword(false); }} />
                  <span className="login-role-icon" aria-hidden="true"><Icon size={22} /></span>
                  <span className="login-role-name">{name}</span>
                  <span className="login-role-description" aria-hidden="true">{description}</span>
                  {kind === id && <Check className="login-role-check" size={14} aria-hidden="true" />}
                </label>)}
              </div>
            </fieldset>

            <div className="login-instructions" id="login-instructions" aria-live="polite">
              {kind === 'learner'
                ? <><GraduationCap size={20} aria-hidden="true" /><p><strong>Just your school and number.</strong><span>No password needed.</span></p></>
                : <>{kind === 'teacher' ? <Users size={20} aria-hidden="true" /> : <ShieldCheck size={20} aria-hidden="true" />}<p><strong>{kind === 'teacher' ? 'Ready for your next class?' : 'Welcome back, admin.'}</strong><span>Enter your email or username and password.</span></p></>}
            </div>

            <fieldset className="login-fields" disabled={submitting} aria-describedby="login-instructions">
              <legend className="sr-only">{kind === 'learner' ? 'Learner details' : kind === 'teacher' ? 'Teacher details' : 'Admin details'}</legend>
              {kind === 'learner' ? <>
                <SchoolPicker schools={schools.data ?? []} loading={schools.isPending} failed={schools.isError} onRetry={() => void schools.refetch()}
                  value={schoolCode} onChange={(code) => { setSchoolCode(code); setError(null); }} />
                <div className="login-field">
                  <label htmlFor="admission">Admission number</label>
                  <input id="admission" type="text" inputMode="numeric" pattern="[0-9]{1,4}" maxLength={4} required autoComplete="username" autoCapitalize="off" spellCheck={false}
                    className="login-input login-admission" placeholder="0001" aria-describedby="admission-help" value={admission} onChange={(e) => { setAdmission(e.target.value.replace(/[^0-9]/g, '')); setError(null); }} />
                  <p id="admission-help" className="login-field-help">Your teacher’s number. Typing 1 works for 0001.</p>
                </div>
              </> : <>
                <div className="login-field">
                  <label htmlFor="email">Email or username</label>
                  <input id="email" type="text" required autoComplete="username" autoCapitalize="off" spellCheck={false} className="login-input"
                    placeholder="Your email or username" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} />
                </div>
                <div className="login-field">
                  <label htmlFor="password">Password</label>
                  <div className="login-password">
                    <input id="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" className="login-input"
                      placeholder="Your password" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} />
                    <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-controls="password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                    </button>
                  </div>
                  <Link to="/dashboard/forgot-password" className="login-forgot">Forgot your password?</Link>
                </div>
              </>}
            </fieldset>

            {error && <div id="login-error" ref={errorRef} tabIndex={-1} role="alert" className="login-error">{error}</div>}
            <button type="submit" className="login-submit" disabled={submitting || (kind === 'learner' && !schools.isSuccess)}>
              {submitting ? <><Loader2 size={19} className="login-spinner" aria-hidden="true" /> Signing in…</> : <>Sign in <ArrowRight size={19} aria-hidden="true" /></>}
            </button>
            <p className="login-help">{kind === 'learner' ? 'Need a hand? Ask your teacher to help you sign in.' : 'Need sign-in details? Contact your school or the ChipuRobo team.'}</p>
          </form>
          <span role="status" className="sr-only">{submitting ? 'Signing you in. Please wait.' : ''}</span>
          <div className="login-tour"><span>New to ChipuRobo?</span><Link to="/dashboard/welcome"><Sparkles size={16} aria-hidden="true" /> Take the tour <ArrowRight size={15} aria-hidden="true" /></Link></div>
        </section>
      </main>
      <footer className="login-footer">A place for every learner. A chance for every idea.</footer>
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
        aria-describedby="school-help"
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{loading ? 'Loading schools…' : 'Choose your school'}</option>
        {schools.map((school) => <option key={school.id} value={school.code}>{school.name}</option>)}
      </select>
      <p id="school-help" className="login-field-help">Pick your school from the list.</p>
      {failed && <div id="school-error" role="alert" className="login-school-error">We couldn’t load the schools. Check your connection. <button type="button" onClick={onRetry}>Try again</button></div>}
    </div>
  );
}
