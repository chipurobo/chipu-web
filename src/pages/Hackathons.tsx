import { Shield, Lock, Brain, MapPin, Clock, Users, Calendar, ExternalLink, Mail, CheckCircle, AlertTriangle } from 'lucide-react';

const REGISTRATION_URL = 'https://forms.office.com/r/pieXytidhj?origin=QRCode&qrcodeorigin=presentation';

const tracks = [
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'Banking app vulnerabilities & secure API development',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Lock,
    title: 'Privacy Shield',
    description: 'Financial data privacy & encryption systems',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    icon: Brain,
    title: 'Fraud Intelligence',
    description: 'AI/ML-powered fraud detection for Kenyan finance',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
];

const schedule = [
  { day: 'Day 1 — April 16', items: ['Opening ceremony & keynote', 'Track briefings & team formation', 'Hacking begins', 'Mentor office hours'] },
  { day: 'Day 2 — April 17', items: ['Workshops & skill sessions', 'Continued hacking', 'Mid-point check-ins', 'Evening demos (optional)'] },
  { day: 'Day 3 — April 18', items: ['Final hacking sprint', 'Project submissions', 'Demo presentations', 'Judging & closing ceremony'] },
];

const faq = [
  { q: 'Who can participate?', a: 'Any student aged 14–19. No prior cybersecurity or coding experience required — just curiosity and willingness to learn.' },
  { q: 'Do I need a team?', a: 'Teams are 3–5 members. You can come with a team or form one at the event during team formation on Day 1.' },
  { q: 'What should I bring?', a: 'A laptop (charged), charger, student ID, and enthusiasm. Meals, materials, and mentors are provided.' },
  { q: 'Is it really free?', a: 'Yes — 100% free entry. Meals, mentors, and materials are fully covered.' },
  { q: 'What if I have no coding experience?', a: 'FinSec is beginner-friendly. We provide workshops, starter templates, and dedicated mentors for each track.' },
];

const Hackathons = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.08),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-sm text-gray-300 mb-6">
              Youth Hackathon &middot; Ages 14–19
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-4">
              <span className="text-emerald-400">FIN</span>
              <span className="text-white">SEC</span>
            </h1>

            <p className="text-xl md:text-2xl font-bold text-gray-200 tracking-wide mb-6">
              HACK. <span className="text-emerald-400">DEFEND.</span> PROTECT.
            </p>

            <p className="text-gray-400 text-lg mb-8 max-w-xl">
              A 3-day youth hackathon focused on financial security — building real solutions for banking vulnerabilities, data privacy, and fraud detection in Kenya.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <span className="inline-flex items-center bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm text-white">
                <Calendar className="h-4 w-4 mr-2 text-emerald-400" /> April 16–18, 2026
              </span>
              <span className="inline-flex items-center bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm text-white">
                <Clock className="h-4 w-4 mr-2 text-emerald-400" /> 8:00 AM – 4:00 PM daily
              </span>
              <span className="inline-flex items-center bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm text-white">
                <MapPin className="h-4 w-4 mr-2 text-red-400" /> Railways Museum, Nairobi
              </span>
              <span className="inline-flex items-center bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm text-white">
                <Users className="h-4 w-4 mr-2 text-emerald-400" /> Teams of 3–5
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href={REGISTRATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3.5 rounded-xl font-semibold inline-flex items-center transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
              >
                Register Now <ExternalLink className="h-4 w-4 ml-2" />
              </a>
              <div className="flex items-center bg-red-500/10 border border-red-500/20 px-5 py-3.5 rounded-xl">
                <AlertTriangle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                <span className="text-sm text-red-300 font-medium">Deadline: April 12, 2026</span>
              </div>
            </div>
          </div>

          {/* Free badge */}
          <div className="absolute top-8 right-8 lg:top-12 lg:right-16">
            <div className="bg-emerald-500 text-white rounded-full h-20 w-20 flex flex-col items-center justify-center font-bold shadow-lg shadow-emerald-500/30">
              <span className="text-xs">100%</span>
              <span className="text-sm font-black">FREE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">Hackathon Tracks</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choose one of three challenge tracks. Each focuses on a critical area of financial cybersecurity in the Kenyan context.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {tracks.map((track) => (
              <div
                key={track.title}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700/50 shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`${track.bg} inline-flex p-3 rounded-xl mb-4`}>
                  <track.icon className={`h-6 w-6 ${track.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{track.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{track.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-20 sm:py-28 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">3-Day Schedule</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12">8:00 AM – 4:00 PM each day at Railways Museum, Nairobi</p>
          <div className="grid gap-6 md:grid-cols-3">
            {schedule.map((day) => (
              <div key={day.day} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-4">{day.day}</h3>
                <ul className="space-y-3">
                  {day.items.map((item) => (
                    <li key={item} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faq.map((item) => (
              <div key={item.q} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.q}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code of Conduct */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Code of Conduct</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700/50">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              FinSec is dedicated to providing a friendly, safe, and welcoming environment for all participants, regardless of age, disability, gender, nationality, race, religion, sexuality, or similar personal characteristic.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              All attendees, sponsors, partners, volunteers, and staff are required to agree with this code of conduct. Organizers will enforce it throughout the event. We expect cooperation from all participants to ensure a safe environment for everybody.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                Be respectful and inclusive in all interactions.
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                Harassment of any kind will not be tolerated.
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                Report any concerns to event organizers immediately.
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                Use tools and access responsibly — ethical hacking only.
              </li>
            </ul>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              Adapted from the{' '}
              <a
                href="https://hackclub.com/conduct/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 underline hover:no-underline"
              >
                Hack Club Code of Conduct
              </a>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA / Register */}
      <section className="relative overflow-hidden bg-gray-900 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.12),transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Ready to Hack, Defend & Protect?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Join the next generation of cybersecurity builders at FinSec. Free entry, meals provided, and mentors on-hand for all skill levels.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3.5 rounded-xl font-semibold inline-flex items-center transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
            >
              Register Your Team <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Mail className="h-4 w-4" />
            <span>Questions? Email </span>
            <a href="mailto:sydiantech@gmail.com" className="text-emerald-400 hover:underline">
              sydiantech@gmail.com
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-6">ChipuRobo &times; Sydian Tech</p>
        </div>
      </section>
    </div>
  );
};

export default Hackathons;
