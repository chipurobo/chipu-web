import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  School,
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

// === Microsoft ADC Bootcamp data ===

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

const MicrosoftBootcamps = () => {
  return (
    <div className="bg-warm-50">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200">
        <div className="code-bg absolute inset-0 opacity-30" aria-hidden="true" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 mb-6">
            <GraduationCap className="h-6 w-6 text-amber-600" aria-hidden="true" />
          </div>
          <p className="font-pixel text-[0.55rem] sm:text-[0.65rem] tracking-[0.25em] text-terracotta-600 mb-5 uppercase">
            // microsoft adc · holiday sprints
          </p>
          <h1 className="heading-display text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-[1.2]">
            Microsoft Bootcamps
          </h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto mb-4">
            Intensive 3–4 day bootcamps hosted at Microsoft Africa Development Centre in Nairobi. Students and
            teachers build AI-powered robots, computer-vision projects, and Python-controlled hardware alongside
            ADC engineers.
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Three cohorts completed in 2025 · nationwide expansion planned for 2026.
          </p>
        </div>
      </section>

      {/* ===== IMPACT STATS ===== */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-teal-50 border border-teal-200 px-4 py-1.5 rounded-full text-teal-700 text-sm font-medium mb-4">
              <Cpu className="h-4 w-4 mr-2" aria-hidden="true" />
              Active Program
            </div>
            <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">2025 Impact</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {adcStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 shadow-soft-md border border-gray-100 text-center hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300"
              >
                <stat.icon className="h-8 w-8 text-teal-600 mx-auto mb-3" aria-hidden="true" />
                <p className="font-pixel text-2xl sm:text-3xl text-gray-900 mb-2">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Sessions */}
          <h3 className="heading-display text-xl md:text-2xl text-gray-900 mb-8 text-center">
            2025 Sessions
          </h3>
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            {adcSessions.map((session) => (
              <article
                key={session.label}
                className="bg-white rounded-xl p-6 shadow-soft-md border border-gray-100 hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{session.label}</h4>
                  <span className="text-xs font-medium bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
                    {session.date}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{session.blurb}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
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
              className="group inline-flex items-center text-terracotta-600 hover:text-terracotta-700 font-medium transition-colors"
            >
              View Full Microsoft Partnership Report
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CURRICULUM ===== */}
      <section className="py-16 sm:py-20 bg-warm-100/60 border-y border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">What Learners Build</h2>
            <p className="text-base sm:text-lg text-gray-600">
              30+ hours of hands-on training per bootcamp covering robotics, AI, and sustainability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curriculum.map((module) => (
              <div
                key={module.title}
                className="bg-white rounded-xl p-6 shadow-soft-md border border-gray-100 hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-4">
                  <module.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{module.title}</h3>
                <p className="text-xs font-medium text-teal-600 mb-3">{module.hours}</p>
                <p className="text-sm text-gray-600">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW BOOTCAMPS WORK ===== */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">How Our Bootcamps Work</h2>
            <p className="text-base sm:text-lg text-gray-600">A consistent format every cohort.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '1', title: 'Partner & Plan', body: 'We work with Microsoft ADC to define the curriculum, venue, dates, and target schools for each sprint.' },
              { n: '2', title: 'Build & Learn', body: '3–4 day intensive bootcamp. 90% hands-on build time with mentors. Students work with real hardware and AI tools.' },
              { n: '3', title: 'Demo & Certify', body: 'Each sprint ends with a demo day. Participants receive CEMASTEA-validated certificates and take skills back to their schools.' },
            ].map((step) => (
              <div key={step.n} className="bg-white rounded-xl p-8 shadow-soft-md border border-gray-100 text-center">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                  <span className="font-pixel text-base text-teal-600">{step.n}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PARTNER WITH US CTA ===== */}
      <section className="relative overflow-hidden bg-gray-900 py-20 sm:py-24 scanlines">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.12),transparent_70%)]" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Handshake className="h-12 w-12 text-teal-400 mx-auto mb-6" aria-hidden="true" />
          <h2 className="heading-display text-2xl md:text-3xl text-white mb-4">Host a Bootcamp</h2>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            We partner with technology companies, research institutions, and organizations to bring hands-on STEM
            bootcamps to students across Africa. If you have the space and the mission, we bring the curriculum
            and the coaches.
          </p>
          <Link to="/contact" className="btn-cta">
            Get in Touch
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default MicrosoftBootcamps;
