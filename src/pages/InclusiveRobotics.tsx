import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  GraduationCap,
  Calendar,
  Clock,
  Users,
  School,
  ArrowRight,
  CheckCircle,
  Brain,
  Code,
  Cog,
  Eye,
  Target,
  Award,
  Trophy,
  Cpu,
  Zap,
  MapPin,
  Wrench,
  Beaker,
  BookOpen,
  Repeat,
} from 'lucide-react';

// =============================================================
// Inclusive Robotics — ChipuRobo's flagship year-round program.
// Three stages take a learner from first school visit all the
// way to a year of training and competitive showcases.
// =============================================================

// === Stage 1: Outreach from YSK ===
const outreachActivities = [
  {
    icon: School,
    title: 'YSK School Visits',
    body: 'On-site demos and robotics try-outs at Young Scientists Kenya (YSK) network schools — Junior and Senior Secondary.',
  },
  {
    icon: Code,
    title: 'Code Clubs',
    body: 'Weekly after-school clubs co-run with the Raspberry Pi Foundation — 66 active across 47+ counties.',
  },
  {
    icon: Wrench,
    title: 'Teacher Briefings',
    body: 'Hands-on workshops with inclusive curriculum: Braille worksheets, KSL videos, neurodiverse-friendly pacing.',
  },
];

const outreachStats = [
  { value: '66', label: 'Active Code Clubs' },
  { value: '60+', label: 'YSK Partner Schools' },
  { value: '47+', label: 'Counties Reached' },
  { value: '50+', label: 'Teachers Briefed' },
];

// === Stage 2: Microsoft Bootcamps data ===
const adcSessions = [
  { label: 'April Sprint', date: 'April 2025', participants: '210', schools: 6 },
  { label: 'August Intensive', date: 'August 2025', participants: '142', schools: 6 },
  { label: 'December Finale', date: 'December 2025', participants: '158', schools: 7 },
];

const adcStats = [
  { icon: Users, value: '800+', label: 'Learners Trained' },
  { icon: School, value: '80', label: 'Schools' },
  { icon: Trophy, value: '500+', label: 'Certificates' },
  { icon: Zap, value: '30+', label: 'AI Robots Built' },
];

const curriculum = [
  { icon: Brain, title: 'AI Fundamentals', hours: '8 hrs' },
  { icon: Code, title: 'Python on Pi', hours: '6 hrs' },
  { icon: Cog, title: 'Robotics Eng.', hours: '10 hrs' },
  { icon: Eye, title: 'Computer Vision', hours: '6 hrs' },
  { icon: Target, title: 'PET Recycling', hours: '6 hrs' },
];

// === Stage 3: Training Across the Year ===
// KSEF nationals event clock — used to anchor the year for both Senior
// and Junior research tracks.
const EVENT_START = new Date('2026-03-29T08:00:00+03:00');
const EVENT_END = new Date('2026-04-05T18:00:00+03:00');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getCountdown(): { timeLeft: TimeLeft; status: 'upcoming' | 'live' | 'ended' } {
  const now = new Date();
  if (now >= EVENT_END) return { timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 }, status: 'ended' };
  if (now >= EVENT_START) {
    const diff = EVENT_END.getTime() - now.getTime();
    return {
      timeLeft: {
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff / 3_600_000) % 24),
        minutes: Math.floor((diff / 60_000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      },
      status: 'live',
    };
  }
  const diff = EVENT_START.getTime() - now.getTime();
  return {
    timeLeft: {
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor((diff / 3_600_000) % 24),
      minutes: Math.floor((diff / 60_000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    },
    status: 'upcoming',
  };
}

const yearTimeline = [
  { month: 'Jan', note: 'Term-1 kickoff. KSEF research plans, JSS Cyberbrick league setup.' },
  { month: 'Feb', note: 'Experiments, data collection, weekly mentor reviews.' },
  { month: 'Mar', note: 'Prototype polish, exhibit rehearsal, KSEF heats.' },
  { month: 'Apr', note: 'KSEF nationals window · school showcases.' },
  { month: 'May–Aug', note: 'Term-2 league play, Code Club projects, teacher refresher.' },
  { month: 'Sep–Dec', note: 'Term-3 research extension, end-of-year demo day, next-cohort prep.' },
];

const yearActivities = [
  {
    icon: BookOpen,
    title: 'KSEF Research Support',
    body: 'Year-round mentoring for both Senior Secondary and Junior Secondary teams running KSEF-aligned research projects.',
  },
  {
    icon: Repeat,
    title: 'Weekly Code Clubs',
    body: 'Term-by-term club programming with Scratch, Python, and physical computing kits — all delivered with inclusive worksheets.',
  },
  {
    icon: Wrench,
    title: 'Continuous Teacher Training',
    body: 'Termly refreshers, classroom resources, and mentor visits so teachers can run the program on their own.',
  },
];

const InclusiveRobotics = () => {
  const [countdown, setCountdown] = useState(getCountdown);
  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(interval);
  }, []);
  const { timeLeft, status } = countdown;

  return (
    <div className="bg-warm-50">
      {/* ============================================================
          HERO
      ============================================================ */}
      <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200">
        <div className="code-bg absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <p className="font-pixel text-[0.55rem] sm:text-[0.65rem] tracking-[0.25em] text-terracotta-600 mb-5 uppercase">
            // programs
          </p>
          <h1 className="heading-display text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-[1.2]">
            One Year-Round Program · Three Stages
          </h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed mb-10">
            A learner meets us during outreach from the Young Scientists Kenya (YSK) network, comes up through
            an intensive Microsoft ADC bootcamp, and then trains across the year — KSEF research, Code Clubs,
            and ongoing mentoring. One program, three stages, CBC aligned.
          </p>

          {/* Stage navigator */}
          <ol className="flex flex-wrap justify-center gap-3 text-sm">
            <li>
              <a href="#outreach" className="inline-flex items-center px-4 py-2 bg-white border border-warm-200 rounded-lg text-gray-800 hover:border-teal-500 transition-colors">
                <span className="font-pixel text-[0.6rem] text-terracotta-600 mr-2">01</span>
                Outreach (YSK)
              </a>
            </li>
            <li>
              <a href="#bootcamps" className="inline-flex items-center px-4 py-2 bg-white border border-warm-200 rounded-lg text-gray-800 hover:border-teal-500 transition-colors">
                <span className="font-pixel text-[0.6rem] text-terracotta-600 mr-2">02</span>
                Microsoft Bootcamps
              </a>
            </li>
            <li>
              <a href="#year-round" className="inline-flex items-center px-4 py-2 bg-white border border-warm-200 rounded-lg text-gray-800 hover:border-teal-500 transition-colors">
                <span className="font-pixel text-[0.6rem] text-terracotta-600 mr-2">03</span>
                Training Across the Year
              </a>
            </li>
          </ol>
        </div>
      </section>

      {/* ============================================================
          STAGE 01 — OUTREACH (YSK)
      ============================================================ */}
      <section id="outreach" className="scroll-mt-20 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="font-pixel text-base text-terracotta-600">01</span>
              <span className="h-px w-12 bg-warm-300" aria-hidden="true" />
              <span className="font-pixel text-[0.65rem] tracking-widest text-gray-500 uppercase">Stage</span>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 mb-5">
              <Megaphone className="h-6 w-6 text-teal-600" aria-hidden="true" />
            </div>
            <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">Outreach from YSK</h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl">
              We start where learners are — through the Young Scientists Kenya (YSK) network of schools. School
              visits, Code Clubs, and teacher briefings put every interested student within reach of a robot
              and a trained teacher.
            </p>
          </div>

          {/* Activities */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {outreachActivities.map((a) => (
              <article key={a.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300">
                <div className="bg-teal-50 inline-flex p-3 rounded-xl mb-4">
                  <a.icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{a.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{a.body}</p>
              </article>
            ))}
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {outreachStats.map((s) => (
              <div key={s.label} className="bg-white border border-warm-200 rounded-xl py-5 text-center">
                <p className="font-pixel text-xl sm:text-2xl text-gray-900 mb-2">{s.value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          STAGE 02 — MICROSOFT BOOTCAMPS
      ============================================================ */}
      <section id="bootcamps" className="scroll-mt-20 py-16 sm:py-20 bg-warm-100/60 border-y border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="font-pixel text-base text-terracotta-600">02</span>
              <span className="h-px w-12 bg-warm-300" aria-hidden="true" />
              <span className="font-pixel text-[0.65rem] tracking-widest text-gray-500 uppercase">Stage</span>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 mb-5">
              <GraduationCap className="h-6 w-6 text-amber-600" aria-hidden="true" />
            </div>
            <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">Microsoft Bootcamps</h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mb-2">
              Intensive 3–4 day sprints at Microsoft Africa Development Centre in Nairobi. Students from
              outreach schools step up to build AI-powered robots alongside ADC engineers.
            </p>
            <p className="text-sm text-gray-500 max-w-2xl">
              Three cohorts completed in 2025 · nationwide expansion planned for 2026.
            </p>
          </div>

          {/* Active badge */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center bg-teal-50 border border-teal-200 px-4 py-1.5 rounded-full text-teal-700 text-sm font-medium">
              <Cpu className="h-4 w-4 mr-2" aria-hidden="true" />
              Active Program
            </div>
          </div>

          {/* Impact stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {adcStats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-6 shadow-soft-md border border-gray-100 text-center hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300">
                <stat.icon className="h-7 w-7 text-teal-600 mx-auto mb-3" aria-hidden="true" />
                <p className="font-pixel text-2xl sm:text-3xl text-gray-900 mb-2">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Sessions */}
          <h3 className="heading-display text-xl text-gray-900 mb-6 text-center">2025 Sessions</h3>
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            {adcSessions.map((session) => (
              <article key={session.label} className="bg-white rounded-xl p-6 shadow-soft-md border border-gray-100 hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{session.label}</h4>
                  <span className="text-xs font-medium bg-teal-50 text-teal-700 px-3 py-1 rounded-full">{session.date}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center"><Users className="h-3.5 w-3.5 mr-1" aria-hidden="true" />{session.participants} participants</span>
                  <span className="flex items-center"><School className="h-3.5 w-3.5 mr-1" aria-hidden="true" />{session.schools} schools</span>
                </div>
              </article>
            ))}
          </div>

          {/* Curriculum mini-grid */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-100 shadow-soft-sm mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-5 text-center">30+ hours per bootcamp</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {curriculum.map((m) => (
                <div key={m.title} className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-2">
                    <m.icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                  <p className="text-xs text-teal-600">{m.hours}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link to="/microsoft-bootcamps" className="group inline-flex items-center text-terracotta-600 hover:text-terracotta-700 font-medium text-sm transition-colors">
              Full Microsoft Bootcamps detail
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          STAGE 03 — TRAINING ACROSS THE YEAR
      ============================================================ */}
      <section id="year-round" className="scroll-mt-20 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="font-pixel text-base text-terracotta-600">03</span>
              <span className="h-px w-12 bg-warm-300" aria-hidden="true" />
              <span className="font-pixel text-[0.65rem] tracking-widest text-gray-500 uppercase">Stage</span>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-terracotta-50 border border-terracotta-200 mb-5">
              <Repeat className="h-6 w-6 text-terracotta-600" aria-hidden="true" />
            </div>
            <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">Training Across the Year</h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mb-2">
              Bootcamps end, but the work doesn't. KSEF research support, weekly Code Clubs, and termly teacher
              refreshers keep students iterating from January through December — for both Senior and Junior
              Secondary cohorts.
            </p>
            <div className="inline-flex items-center bg-white border border-warm-200 px-4 py-1.5 rounded-full text-sm text-gray-700 mt-2">
              <Calendar className="h-4 w-4 mr-2 text-teal-600" />
              KSEF Nationals: March 29 – April 5, 2026
            </div>
          </div>

          {/* Activities */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {yearActivities.map((a) => (
              <article key={a.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300">
                <div className="bg-terracotta-50 inline-flex p-3 rounded-xl mb-4">
                  <a.icon className="h-5 w-5 text-terracotta-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{a.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{a.body}</p>
              </article>
            ))}
          </div>

          {/* KSEF Countdown */}
          {status !== 'ended' && (
            <div className="max-w-lg mx-auto mb-12">
              <p className="text-sm font-medium text-teal-600 mb-4 flex items-center justify-center">
                <Clock className="h-4 w-4 mr-1.5" aria-hidden="true" />
                {status === 'live' ? 'KSEF is live — ends in' : 'KSEF nationals start in'}
              </p>
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Min' },
                  { value: timeLeft.seconds, label: 'Sec' },
                ].map((unit) => (
                  <div key={unit.label} className="bg-white border border-warm-200 rounded-xl py-4 px-2 text-center">
                    <p className="font-pixel text-xl sm:text-2xl text-gray-900 tabular-nums">{String(unit.value).padStart(2, '0')}</p>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{unit.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {status === 'ended' && (
            <p className="text-center text-base text-teal-600 font-medium mb-12">
              The 2026 KSEF exhibition has concluded. Next cohort prep kicks off in September.
            </p>
          )}

          {/* Year timeline */}
          <div className="bg-gradient-to-br from-warm-100 to-warm-50 rounded-xl p-6 sm:p-8 border border-gray-200 mb-10">
            <h3 className="text-lg font-semibold tracking-tight text-gray-900 mb-6 flex items-center">
              <Beaker className="h-5 w-5 text-teal-600 mr-2" />
              Year Timeline
            </h3>
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              {yearTimeline.map((p) => (
                <div key={p.month} className="p-4 bg-white rounded-xl shadow-soft-sm border border-gray-100 text-center">
                  <p className="text-sm font-semibold text-teal-600">{p.month}</p>
                  <p className="text-xs text-gray-600 mt-2">{p.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What learners gain */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-soft-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="h-5 w-5 text-teal-600 mr-2" />
                What Learners Gain
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start"><CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" /> Continuous mentoring from cohort kickoff through nationals.</li>
                <li className="flex items-start"><CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" /> Hands-on time with sensors, PET recycling labs, AI kits.</li>
                <li className="flex items-start"><CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" /> Pitch coaching for school heats, regional juries, and nationals.</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-soft-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Award className="h-5 w-5 text-teal-600 mr-2" />
                Included Extras
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start"><CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" /> Digital research planner templates.</li>
                <li className="flex items-start"><CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" /> Loaner sensors, Raspberry Pi kits, and fabrication support.</li>
                <li className="flex items-start"><CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" /> Termly teacher refreshers and classroom resources.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA
      ============================================================ */}
      <section className="relative overflow-hidden bg-gray-900 py-20 sm:py-24 scanlines">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.12),transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <MapPin className="h-10 w-10 text-teal-400 mx-auto mb-4" />
          <h2 className="heading-display text-2xl sm:text-3xl mb-4">Run This Program At Your School</h2>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            We bring the YSK outreach, the Microsoft bootcamp partnership, and the year-round training. You bring the learners.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="btn-cta">Talk to the Team</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InclusiveRobotics;
