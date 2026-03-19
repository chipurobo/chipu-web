import { useNavigate } from 'react-router-dom';
import { Calendar, Monitor, Users, Trophy, Zap, CheckCircle } from 'lucide-react';

const hackathons = [
  { title: 'April Kickoff', note: 'Post-KSEF jam hosted by recent graduates with robotics and AI briefs.' },
  { title: 'August Fusion', note: 'Mid-year mashup where JSS and KSEF squads co-build cross-program prototypes.' },
  { title: 'December Finale', note: 'Wrap-year capstone that showcases the best builds and ships fresh ideas.' }
];

const logistics = [
  '3-day build windows during each holiday break.',
  'Hosted inside the ChipuRobo workshop with full tool access.',
  'Meals, mentors, and materials fully covered.',
  'Open to ChipuRobo schools plus invited independents.'
];

const Hackathons = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/80 dark:from-black dark:to-primary-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
          <div className="text-center text-white">
            <div className="inline-flex items-center bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-4">
              <Calendar className="h-4 w-4 mr-2" /> April • August • December
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Holiday Hackathons</h1>
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
              Fast build sprints where students prototype, test, and demo without slogging through long agendas.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="bg-white text-green-700 px-8 py-3 rounded-xl font-semibold inline-flex items-center justify-center transition-all duration-200 hover:shadow-soft-xl"
            >
              <Monitor className="h-5 w-5 mr-2" />
              Join The Next Sprint
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
          {hackathons.map((event) => (
            <article key={event.title} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-soft-md transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{event.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{event.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green-50/70 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 border border-green-100 dark:border-gray-700/50">
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4 flex items-center">
              <Zap className="h-5 w-5 text-yellow-400 mr-2" />
              Quick Logistics
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              {logistics.map((item) => (
                <li key={item} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 text-center transition-all duration-300">
                <Users className="h-6 w-6 mx-auto text-green-600 dark:text-green-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Peer-led squads mix alumni mentors with current cohorts.</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 text-center transition-all duration-300">
                <Trophy className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Every sprint ends with live demos and recognition.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/80 dark:from-black dark:to-primary-950 py-20 sm:py-28 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h3 className="text-3xl font-semibold tracking-tight mb-3">Build, Test, Show</h3>
          <p className="text-lg text-gray-300 mb-8">
            ChipuRobo hackathons compress learning into three focused days so schools can keep momentum between terms.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/contact')} className="bg-white text-green-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-soft-xl">
              Register Team
            </button>
            <button onClick={() => navigate('/impact')} className="border border-white/10 px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-soft-md">
              View Past Builds
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hackathons;
