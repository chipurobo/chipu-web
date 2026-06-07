import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, School, Wrench, Bot } from 'lucide-react';

// =============================================================
// /dashboard/welcome
//
// Two-slide pre-login splash. Next → Next → Sign in, plus a Skip.
// Marks the user as "seen" in localStorage so Login knows not to
// auto-redirect again.
// =============================================================

const STORAGE_KEY = 'chipurobo:onboarding-seen';

interface Slide {
  title: string;
  body:  ReactNode;
  visual: ReactNode;
}

const slides: Slide[] = [
  {
    title: 'Welcome to ChipuRobo',
    body:  'A Kenyan platform that wires classrooms together with inclusive robotics.',
    visual: (
      <div className="w-24 h-24 rounded-2xl bg-teal-100 flex items-center justify-center">
        <Bot className="h-12 w-12 text-teal-700" strokeWidth={1.4} />
      </div>
    ),
  },
  {
    title: 'Three roles, one network',
    body:  'Schools run code clubs. Maker spaces build the kits. ChipuRobo keeps every club stocked.',
    visual: (
      <div className="flex items-center gap-4">
        <RoleIcon Icon={School}  color="#0d9488" />
        <Dot />
        <RoleIcon Icon={Wrench}  color="#dc6b4a" />
        <Dot />
        <RoleIcon Icon={Bot}     color="#0f766e" />
      </div>
    ),
  },
];

export function Welcome() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const last = slides.length - 1;

  const finish = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* private mode */ }
    navigate('/dashboard/login');
  };
  const next = () => (step < last ? setStep((s) => s + 1) : finish());

  const s = slides[step];

  return (
    <div className="admin-zone min-h-screen bg-warm-50 flex flex-col">
      {/* Top bar: brand + skip */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4">
        <Link to="/" className="flex items-center">
          <picture>
            <source srcSet="/img/logo.webp" type="image/webp" />
            <img src="/img/logo.png" alt="" width={28} height={28} className="h-7 w-7 pixel-crisp" />
          </picture>
          <span className="ml-2 font-pixel text-[0.65rem] tracking-wider text-gray-900 uppercase">
            ChipuRobo<span className="text-teal-500">_</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={finish}
          className="text-xs text-gray-600 hover:text-gray-900"
        >
          Skip
        </button>
      </header>

      {/* Slide */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-10">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-8">{s.visual}</div>
          <h1 className="font-pixel text-lg sm:text-xl text-gray-900 mb-4">{s.title}</h1>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-8">
            {s.body}
          </p>

          {/* Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-gray-900' : 'w-2 bg-warm-200'
                }`}
              />
            ))}
          </div>

          <button type="button" onClick={next} className="btn-primary w-full justify-center">
            {step === last ? 'Sign in' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </button>
        </div>
      </main>
    </div>
  );
}

function RoleIcon({ Icon, color }: { Icon: typeof School; color: string }) {
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center"
      style={{ background: `${color}15`, border: `1.5px solid ${color}` }}
    >
      <Icon className="h-5 w-5" style={{ color }} strokeWidth={1.6} />
    </div>
  );
}

function Dot() {
  return <span className="w-1 h-1 rounded-full bg-warm-300" />;
}
