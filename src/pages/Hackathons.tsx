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
      <section className="relative overflow-hidden bg-gradient-to-r from-[#012414] via-[#026b45] to-[#0fb274] dark:from-black dark:via-[#013222] dark:to-[#047857]">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center text-white">
          <div className="inline-flex items-center bg-white/20 px-4 py-2 rounded-full mb-4">
            <Calendar className="h-4 w-4 mr-2" /> April • August • December
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Holiday Hackathons</h1>
          <p className="text-lg md:text-xl mb-8">
            Fast build sprints where students prototype, test, and demo without slogging through long agendas.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center"
          >
            <Monitor className="h-5 w-5 mr-2" />
            Join The Next Sprint
          </button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14 grid gap-6 md:grid-cols-3">
        {hackathons.map((event) => (
          <article key={event.title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{event.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{event.note}</p>
          </article>
        ))}
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-br from-green-50/70 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-green-100 dark:border-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Zap className="h-5 w-5 text-yellow-400 mr-2" />
            Quick Logistics
          </h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            {logistics.map((item) => (
              <li key={item} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-50 dark:border-gray-700 text-center">
              <Users className="h-6 w-6 mx-auto text-green-600 dark:text-green-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Peer-led squads mix alumni mentors with current cohorts.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
              <Trophy className="h-6 w-6 mx-auto text-amber-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Every sprint ends with live demos and recognition.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#022c22] dark:bg-black py-16">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h3 className="text-3xl font-semibold mb-3">Build, Test, Show</h3>
          <p className="text-base mb-8">
            ChipuRobo hackathons compress learning into three focused days so schools can keep momentum between terms.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/contact')} className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold">
              Register Team
            </button>
            <button onClick={() => navigate('/impact')} className="border border-white/40 px-6 py-3 rounded-lg">
              View Past Builds
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hackathons;
