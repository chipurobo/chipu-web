import { Calendar, Gamepad2, Users, Clock, Trophy, CheckCircle } from 'lucide-react';

const phases = [
  { title: 'Kit Primer', detail: 'Meet Cyberbrick components, sensors, and safety basics.' },
  { title: 'Build Sprint', detail: 'Assemble a soccer-ready chassis with kicking mechanics.' },
  { title: 'Code & Compete', detail: 'Program movement, test strategies, and enter league play.' }
];

const quickFacts = [
  { label: 'Audience', value: 'Junior Secondary (12–15)' },
  { label: 'Format', value: '8 weeks • Term 2' },
  { label: 'Focus', value: 'Soccer robotics & teamwork' }
];

const takeaways = [
  'Practical mechanical design and wiring skills.',
  'Introductory programming using block or text options.',
  'Tournament experience that builds confidence and teamwork.'
];

const JSS = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/80 dark:from-black dark:to-primary-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
          <div className="text-center text-white">
            <div className="inline-flex items-center bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-4">
              <Calendar className="h-4 w-4 mr-2" /> Term 2 • Junior Secondary
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">JSS Cyberbrick League</h1>
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
              A compact edutainment program where students build and code soccer robots without wading through endless manuals.
            </p>
            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl inline-flex items-center text-sm uppercase tracking-wide">
              <Clock className="h-4 w-4 mr-2" /> Enrollment opens soon
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
          {phases.map((phase) => (
            <article key={phase.title} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-soft-md transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{phase.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{phase.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-4 sm:grid-cols-3">
          {quickFacts.map((fact) => (
            <div key={fact.label} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-700/50 text-center transition-all duration-300">
              <p className="text-xs uppercase text-green-600 tracking-wide">{fact.label}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{fact.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-soft-md transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Gamepad2 className="h-5 w-5 text-green-500 mr-2" />
              Weekly Rhythm
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li>Week 1: kit primer + team formations.</li>
              <li>Weeks 2–4: robot build sprints with mentor reviews.</li>
              <li>Weeks 5–6: programming labs and scrimmages.</li>
              <li>Weeks 7–8: league matches and showcase day.</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-soft-md transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Users className="h-5 w-5 text-emerald-500 mr-2" />
              What Students Take Away
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              {takeaways.map((item) => (
                <li key={item} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/80 dark:from-black dark:to-primary-950 py-20 sm:py-28 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Trophy className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
          <h3 className="text-3xl font-semibold tracking-tight mb-3">Kick Off the League</h3>
          <p className="text-lg text-gray-300 mb-8">
            ChipuRobo supplies kits, mentors, and a ready-made format so schools only focus on the fun stuff: building and competing.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-white text-green-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-soft-xl">Notify Me</button>
            <button className="border border-white/10 px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-soft-md">Download Info</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JSS;
