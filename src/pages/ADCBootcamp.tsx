import { useNavigate } from 'react-router-dom';
import { Calendar, Monitor, Rocket, Users, Trophy, Zap, Cpu, CheckCircle } from 'lucide-react';

const bootcampSessions = [
  {
    label: 'April Sprint',
    blurb: 'Post-KSEF build week focused on advanced robotics and computer vision.',
    badge: '4 days'
  },
  {
    label: 'August Intensive',
    blurb: 'Mid-year deep dive into AI cameras, Python control, and teamwork challenges.',
    badge: '4 days'
  },
  {
    label: 'December Finale',
    blurb: 'Wrap projects, demo prototypes, and celebrate year-end milestones.',
    badge: '4 days'
  }
];

const fastFacts = [
  { icon: Users, title: '150+ learners', detail: 'Per holiday cohort across schools.' },
  { icon: Cpu, title: 'Full lab access', detail: 'Hosted at Microsoft ADC in Westlands.' },
  { icon: Zap, title: 'Hands-on first', detail: '90% build time with local mentors.' },
  { icon: Trophy, title: 'Demo day', detail: 'Each sprint ends with showcases.' }
];

const readinessSteps = [
  'Pick a holiday window and confirm slots with ChipuRobo staff.',
  'Learners bring laptops; all other kits and meals are covered.',
  'Expect daily workshops 9 AM–4 PM plus optional evening labs.'
];

const ADCBootcamp = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/80 dark:from-black dark:to-primary-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
          <div className="text-center text-white">
            <div className="inline-flex items-center bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-5">
              <Calendar className="h-4 w-4 mr-2" />
              April • August • December Bootcamps
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Microsoft ADC Bootcamps</h1>
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
              Compact holiday sprints mixing robotics, AI, and demo days right inside Microsoft Africa Data Centres.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="bg-white text-green-700 px-8 py-3 rounded-xl font-semibold inline-flex items-center justify-center mx-auto transition-all duration-200 hover:shadow-soft-xl"
            >
              <Monitor className="h-5 w-5 mr-2" />
              Reserve Slots
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
          {bootcampSessions.map((session) => (
            <article key={session.label} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft-md border border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{session.label}</h2>
                <span className="text-sm font-medium bg-gray-900/10 dark:bg-white/5 px-3 py-1 rounded-full">{session.badge}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{session.blurb}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-2">
          {fastFacts.map((fact) => (
            <div key={fact.title} className="flex items-start bg-gradient-to-br from-green-50/60 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-green-100 dark:border-gray-700/50 transition-all duration-300">
              <fact.icon className="h-10 w-10 text-green-600 dark:text-green-400 mr-4" />
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{fact.title}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{fact.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft-md border border-gray-100 dark:border-gray-700/50">
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">Quick Readiness Checklist</h3>
            <ul className="space-y-3">
              {readinessSteps.map((step) => (
                <li key={step} className="flex items-start text-gray-600 dark:text-gray-400 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  {step}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/register-2026')}
                className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold transition-all duration-200 hover:shadow-soft-md"
              >
                <Rocket className="h-4 w-4 mr-2 inline" />
                Register Interest
              </button>
              <button
                onClick={() => navigate('/about')}
                className="px-5 py-2 rounded-xl border border-green-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 transition-all duration-200 hover:shadow-soft-md"
              >
                Learn About ChipuRobo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ADCBootcamp;
