import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  School,
  Calendar,
  ArrowRight,
  Cpu,
  Zap,
  Trophy,
  Brain,
  Code,
  Cog,
  Eye,
  Target,
  Handshake,
} from 'lucide-react';

// --- ADC Bootcamp Data ---

const adcSessions = [
  {
    label: 'April Sprint',
    date: 'April 2025',
    participants: '210',
    blurb: 'Post-KSEF build week focused on advanced robotics and computer vision.',
    schools: 6,
  },
  {
    label: 'August Intensive',
    date: 'August 2025',
    participants: '142',
    blurb: 'Mid-year deep dive into AI cameras, Python control, and teamwork challenges.',
    schools: 6,
  },
  {
    label: 'December Finale',
    date: 'December 2025',
    participants: '158',
    blurb: 'Wrap projects, demo prototypes, and celebrate year-end milestones.',
    schools: 7,
  },
];

const adcStats = [
  { icon: Users, value: '800+', label: 'Learners & Teachers Trained' },
  { icon: School, value: '80', label: 'Schools Engaged' },
  { icon: Trophy, value: '500+', label: 'Certificates Awarded' },
  { icon: Zap, value: '30+', label: 'AI-Powered Robots Built' },
];

const curriculum = [
  { icon: Brain, title: 'AI Fundamentals', hours: '8 hrs', description: 'Machine learning, computer vision, and object detection.' },
  { icon: Code, title: 'Python Programming', hours: '6 hrs', description: 'Raspberry Pi, sensor integration, and robot control.' },
  { icon: Cog, title: 'Robotics Engineering', hours: '10 hrs', description: 'Hardware assembly, circuit design, and system integration.' },
  { icon: Eye, title: 'Computer Vision', hours: '6 hrs', description: 'Gesture recognition, tracking algorithms, and AI cameras.' },
  { icon: Target, title: 'Waste Recycling', hours: '6 hrs', description: 'PET machine assembly, filament creation, and 3D printing.' },
];

// --- Component ---

const Bootcamps = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/80 dark:from-black dark:to-primary-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="circuit-background" aria-hidden="true" />
        <div className="tech-ring tech-ring-1" aria-hidden="true" />
        <div className="tech-ring tech-ring-2" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-8">
              <GraduationCap className="h-8 w-8 text-emerald-400 animate-float" aria-hidden="true" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Bootcamps
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-6">
              Intensive, hands-on training programs where learners build real projects
              with robotics, AI, and emerging technologies. Run in partnership with
              leading technology organizations.
            </p>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              Each bootcamp is a compact sprint — typically 3 to 4 days — designed to
              give students and teachers practical skills they can take back to their
              schools and communities.
            </p>
          </div>
        </div>
      </section>

      {/* ===== ADC BOOTCAMP — FEATURED PROGRAM ===== */}
      <section className="section" aria-labelledby="adc-program-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 px-4 py-2 rounded-full text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
              <Cpu className="h-4 w-4 mr-2" aria-hidden="true" />
              Active Program
            </div>
            <h2 id="adc-program-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Microsoft ADC Bootcamps
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Holiday sprints hosted at Microsoft Africa Development Centre in Nairobi.
              Three cohorts completed in 2025, with nationwide expansion planned for 2026.
            </p>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {adcStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft-md border border-gray-100 dark:border-gray-700/50 text-center transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5"
              >
                <stat.icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" aria-hidden="true" />
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Sessions */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            2025 Sessions
          </h3>
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            {adcSessions.map((session) => (
              <article
                key={session.label}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft-md border border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{session.label}</h4>
                  <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full">
                    {session.date}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{session.blurb}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    {session.participants} participants
                  </span>
                  <span className="flex items-center">
                    <School className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    {session.schools} schools
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/microsoft"
              className="group inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              View Full Impact Report
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CURRICULUM ===== */}
      <section className="section-alt" aria-labelledby="curriculum-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="curriculum-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What Learners Build
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              30+ hours of hands-on training per bootcamp covering robotics, AI, and sustainability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curriculum.map((module) => (
              <div
                key={module.title}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft-md border border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mb-4">
                  <module.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{module.title}</h3>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-3">{module.hours}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW BOOTCAMPS WORK ===== */}
      <section className="section" aria-labelledby="how-it-works-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="how-it-works-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How Our Bootcamps Work
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              A consistent format across all partner programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft-md border border-gray-100 dark:border-gray-700/50 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Partner & Plan</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We work with a host organization to define the curriculum, venue,
                dates, and target schools for each sprint.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft-md border border-gray-100 dark:border-gray-700/50 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Build & Learn</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                3–4 day intensive bootcamp. 90% hands-on build time with mentors.
                Students work with real hardware and AI tools.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft-md border border-gray-100 dark:border-gray-700/50 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Demo & Certify</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Each sprint ends with a demo day. Participants receive
                CEMASTEA-validated certificates and take skills back to their schools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PARTNER WITH US CTA ===== */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-emerald-600 to-emerald-700 dark:from-primary-700 dark:to-emerald-800"
        aria-labelledby="partner-cta-title"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_70%)]" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="text-center">
            <Handshake className="h-12 w-12 text-white/80 mx-auto mb-6" aria-hidden="true" />
            <h2 id="partner-cta-title" className="text-3xl font-bold text-white mb-4">
              Host a Bootcamp
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              We partner with technology companies, research institutions, and
              organizations to bring hands-on STEM bootcamps to students across
              Africa. If you have the space and the mission, we bring the
              curriculum and the coaches.
            </p>
            <Link
              to="/contact"
              className="group inline-flex items-center justify-center bg-white text-primary-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 text-lg font-semibold hover:shadow-soft-xl"
            >
              Get in Touch
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Bootcamps;
