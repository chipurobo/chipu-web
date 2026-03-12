import { useNavigate } from 'react-router-dom';
import { Beaker, Calendar, Rocket, Target, BookOpen, Award, CheckCircle } from 'lucide-react';

const highlights = [
  { title: 'CBC aligned', detail: 'January–December workflow mirrors KSEF and CEMASTEA rubrics.' },
  { title: 'Hands-on research', detail: 'Learners prototype with robotics, AI, and sustainability kits.' },
  { title: 'Mentor network', detail: 'Teachers and ChipuRobo coaches guide journals and demos.' }
];

const timeline = [
  { month: 'Jan', note: 'Kickoff, research plans, and hypothesis drafting.' },
  { month: 'Feb', note: 'Run experiments, collect data, and log results.' },
  { month: 'Mar', note: 'Polish prototypes and rehearse presentations.' },
  { month: 'Apr', note: 'School showcases and nationals window.' },
  { month: 'May–Aug', note: 'Extend successful projects and mentor new briefs.' },
  { month: 'Sep–Dec', note: 'Support follow-up research and prep next cohort.' }
];

const extras = [
  'Digital research planner templates.',
  'Loaner sensors and fabrication support.',
  'Pitch coaching for regional qualifiers.'
];

const KSEF = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-900">
      <section className="relative overflow-hidden bg-gradient-to-r from-[#012b1c] via-[#047857] to-[#10b981] dark:from-black dark:via-[#022c22] dark:to-[#047857]">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center text-white">
          <div className="inline-flex items-center bg-white/20 px-4 py-2 rounded-full mb-4">
            <Calendar className="h-4 w-4 mr-2" /> Term 1 Research Sprint
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">KSEF Program</h1>
          <p className="text-lg md:text-xl mb-8">
            Year-long support that gets Junior and Senior students exhibition-ready and keeps them iterating past April nationals.
          </p>
          <button
            onClick={() => navigate('/register-2026')}
            className="bg-white text-green-700 px-7 py-3 rounded-lg font-semibold inline-flex items-center justify-center"
          >
            <Rocket className="h-5 w-5 mr-2" />
            Join 2026 Cohort
          </button>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-14 grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-14">
        <div className="bg-gradient-to-br from-green-50/70 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-green-100 dark:border-gray-700">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Beaker className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
            Four-Step Timeline
          </h3>
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {timeline.map((point) => (
              <div key={point.month} className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-sm font-semibold text-green-600 dark:text-green-300">{point.month}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">{point.note}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
            Nationals typically land in April, but ChipuRobo labs and mentors stay active through December so projects can evolve year-round.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16 grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-green-50 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Target className="h-5 w-5 text-emerald-500 mr-2" />
            What Learners Gain
          </h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li>Structured research logs that mirror CBC assessment.</li>
            <li>Prototype time with sensors, PET recycling labs, and AI kits.</li>
            <li>Pitch coaching ahead of school and regional juries.</li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-green-50 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <BookOpen className="h-5 w-5 text-green-500 mr-2" />
            Included Extras
          </h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            {extras.map((extra) => (
              <li key={extra} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                {extra}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#022c22] dark:bg-black py-16">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <Award className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
          <h3 className="text-3xl font-semibold mb-3">Launch Your KSEF Exhibit</h3>
          <p className="text-base mb-8">
            We distill the sprawling research cycle into a simple sprint so schools can compete without burning extra hours.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/register-2026')} className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold">
              Register Now
            </button>
            <button onClick={() => navigate('/contact')} className="border border-white/40 px-6 py-3 rounded-lg">
              Talk to the Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KSEF;
