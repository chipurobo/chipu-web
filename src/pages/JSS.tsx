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
      <section className="relative overflow-hidden bg-gradient-to-r from-[#012414] via-[#035f3f] to-[#0ea463] dark:from-black dark:via-[#013222] dark:to-[#047857]">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center text-white">
          <div className="inline-flex items-center bg-white/20 px-4 py-2 rounded-full mb-4">
            <Calendar className="h-4 w-4 mr-2" /> Term 2 • Junior Secondary
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">JSS Cyberbrick League</h1>
          <p className="text-lg md:text-xl mb-8">
            A compact edutainment program where students build and code soccer robots without wading through endless manuals.
          </p>
          <div className="bg-white/15 px-6 py-3 rounded-xl inline-flex items-center text-sm uppercase tracking-wide">
            <Clock className="h-4 w-4 mr-2" /> Enrollment opens soon
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-14 grid gap-6 md:grid-cols-3">
        {phases.map((phase) => (
          <article key={phase.title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{phase.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{phase.detail}</p>
          </article>
        ))}
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-14 grid gap-4 sm:grid-cols-3">
        {quickFacts.map((fact) => (
          <div key={fact.label} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-xs uppercase text-green-600 tracking-wide">{fact.label}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{fact.value}</p>
          </div>
        ))}
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16 grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Gamepad2 className="h-5 w-5 text-green-500 mr-2" />
            Weekly Rhythm
          </h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li>Week 1: kit primer + team formations.</li>
            <li>Weeks 2–4: robot build sprints with mentor reviews.</li>
            <li>Weeks 5–6: programming labs and scrimmages.</li>
            <li>Weeks 7–8: league matches and showcase day.</li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Users className="h-5 w-5 text-emerald-500 mr-2" />
            What Students Take Away
          </h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            {takeaways.map((item) => (
              <li key={item} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gray-900 dark:bg-black py-16">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <Trophy className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
          <h3 className="text-3xl font-semibold mb-3">Kick Off the League</h3>
          <p className="text-base mb-8">
            ChipuRobo supplies kits, mentors, and a ready-made format so schools only focus on the fun stuff: building and competing.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold">Notify Me</button>
            <button className="border border-white/40 px-6 py-3 rounded-lg">Download Info</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JSS;
