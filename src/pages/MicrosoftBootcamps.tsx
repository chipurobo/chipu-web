import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  School,
  ArrowRight,
  Cpu,
  Brain,
  Code,
  Cog,
  Eye,
  Target,
  Handshake,
  Megaphone,
  MapPin,
} from 'lucide-react';

// === Microsoft ADC Bootcamp totals ===
// Source: ChipuRobo baseline data sheet. Aggregated across all cohorts.

const adcStats = [
  { icon: Users,     value: '948',  label: 'Students reached' },
  { icon: Megaphone, value: '127',  label: 'Teachers trained' },
  { icon: School,    value: '150',  label: 'School engagements' },
  { icon: MapPin,    value: '4',    label: 'Counties' },
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
            Running since 2025 · expanding nationwide in 2026.
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
            <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">Impact</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
