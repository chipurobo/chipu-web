import {
  Cpu,
  Brain,
  Rocket,
  Briefcase,
  Calendar,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// =============================================================
// /kesho — current hackathon page.
//
// EVERYTHING IS HARDCODED. When a new hackathon comes around,
// edit the content of this file directly (or rename and re-route)
// and update the matching pieces in:
//   • src/App.tsx        — the route + page-title switch
//   • src/components/layout/Navbar.tsx — the nav label + link
//   • src/components/layout/Footer.tsx — the footer link
//   • src/pages/Home.tsx — the announcement pill
// =============================================================

const tracks = [
  {
    icon: Cpu,
    title: 'Future Robotics',
    description: 'Robotics, automation, and digital fabrication — design, build, and code machines that solve real community challenges.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: Brain,
    title: 'AI & Code',
    description: 'Programming, machine learning, and AI applied to local problems — language, agriculture, healthcare, accessibility.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Rocket,
    title: 'Innovation & Entrepreneurship',
    description: 'Take a working prototype and pitch it as a venture — go-to-market, sustainability, careers, and the future of work.',
    color: 'text-terracotta-600',
    bg: 'bg-terracotta-50',
  },
];

const audience = [
  { icon: Users, title: 'Students', body: 'Junior & Senior Secondary — host school plus neighbouring schools in the region.' },
  { icon: Briefcase, title: 'Teachers', body: 'STEM educators and career guidance staff observing and co-mentoring.' },
  { icon: Rocket, title: 'Industry Pros', body: 'Engineers, founders, and researchers running practical workshops.' },
  { icon: Cpu, title: 'Tech Partners', body: 'Organisations bringing tools, kits, and career-pathway exposure.' },
];

const schedule = [
  {
    day: 'Day 1 — July 11',
    items: [
      'Opening ceremony & welcome',
      'Theme keynote — "Kesho: building tomorrow"',
      'Track briefings & team formation',
      'Hacking begins · industry mentor office hours',
    ],
  },
  {
    day: 'Day 2 — July 12',
    items: [
      'Final hacking sprint',
      'Career talks · panel with industry professionals',
      'Demo presentations',
      'Judging & closing ceremony',
    ],
  },
];

const faq = [
  { q: 'Who can participate?', a: 'Students from the host school and neighbouring schools in the region, plus teachers, industry professionals, and technology partners. Open to all skill levels.' },
  { q: 'Where is the event?', a: 'Hosted at a school in partnership with eKitabu and ChipuRobo. Final venue is announced once the host school confirms.' },
  { q: 'Do I need a team?', a: 'Teams of 3–5 work best. You can come with a team or form one on the morning of Day 1.' },
  { q: 'What should I bring?', a: 'A laptop (charged), charger, student ID, and curiosity. Meals, materials, and mentors are provided.' },
  { q: 'What if I have no coding experience?', a: 'Kesho is beginner-friendly. We run quick workshops, starter templates, and have mentors on every track.' },
  { q: 'How will solutions be judged?', a: 'On relevance to the community challenge, technical execution, presentation, and feasibility as a future product or career direction.' },
];

const Hackathons = () => {
  return (
    <div className="bg-warm-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200">
        <div className="code-bg absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center bg-white border border-warm-200 px-4 py-1.5 rounded-full text-sm text-gray-700 mb-6">
              <span className="font-pixel text-[0.55rem] tracking-widest text-terracotta-600 mr-3">HACK</span>
              STEM · Technology · Careers · 2-day
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-4 heading-display">
              <span className="text-teal-600">KESHO</span>
            </h1>

            <p className="text-xl md:text-2xl font-bold text-gray-700 tracking-wide mb-3">
              BUILD. <span className="text-teal-600">INNOVATE.</span> SOLVE.
            </p>
            <p className="font-pixel text-[0.55rem] tracking-[0.25em] text-terracotta-600 mb-6 uppercase">
              // theme: tomorrow
            </p>

            <p className="text-gray-600 text-lg mb-8 max-w-xl leading-relaxed">
              A 2-day STEM, Technology and Careers hackathon preparing young people for the future — robotics,
              AI, programming, digital fabrication, innovation, entrepreneurship, and emerging tech careers.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <span className="inline-flex items-center bg-white border border-warm-200 px-4 py-2 rounded-lg text-sm text-gray-800">
                <Calendar className="h-4 w-4 mr-2 text-teal-600" /> July 11–12, 2026
              </span>
              <span className="inline-flex items-center bg-white border border-warm-200 px-4 py-2 rounded-lg text-sm text-gray-800">
                <Clock className="h-4 w-4 mr-2 text-teal-600" /> 8:00 AM – 4:00 PM daily
              </span>
              <span className="inline-flex items-center bg-white border border-warm-200 px-4 py-2 rounded-lg text-sm text-gray-800">
                <MapPin className="h-4 w-4 mr-2 text-terracotta-600" /> Host school + neighbouring schools
              </span>
              <span className="inline-flex items-center bg-white border border-warm-200 px-4 py-2 rounded-lg text-sm text-gray-800">
                <Users className="h-4 w-4 mr-2 text-teal-600" /> Teams of 3–5
              </span>
            </div>

            <div className="inline-flex items-center bg-terracotta-50 border border-terracotta-200 px-5 py-3 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-terracotta-600 mr-2 flex-shrink-0" />
              <span className="text-sm text-terracotta-700 font-medium">Schools: host applications open</span>
            </div>
          </div>

          {/* Free + partners badge */}
          <div className="absolute top-8 right-4 sm:right-8 lg:top-12 lg:right-16 text-right">
            <div className="bg-terracotta-500 text-white rounded-full h-20 w-20 flex flex-col items-center justify-center font-bold shadow-soft-lg ml-auto">
              <span className="text-xs">100%</span>
              <span className="text-sm font-black">FREE</span>
            </div>
            <p className="font-pixel text-[0.55rem] tracking-widest text-gray-500 mt-3 uppercase">
              eKitabu × ChipuRobo
            </p>
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">Three Future-Focused Tracks</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Pick one. Each is mentored by working engineers, founders, or researchers — and judged on real-world
              impact, not slideware.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {tracks.map((t) => (
              <div
                key={t.title}
                className="bg-white rounded-xl p-8 border border-gray-100 shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`${t.bg} inline-flex p-3 rounded-xl mb-4`}>
                  <t.icon className={`h-6 w-6 ${t.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="py-16 sm:py-20 bg-warm-100/60 border-y border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">Who's in the Room</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Students build alongside the people who actually work in the fields they're being invited into.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {audience.map((a) => (
              <article
                key={a.title}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-soft-sm hover:shadow-soft-md transition-all duration-300"
              >
                <div className="bg-teal-50 inline-flex p-3 rounded-xl mb-4">
                  <a.icon className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{a.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{a.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3 text-center">2-Day Schedule</h2>
          <p className="text-base text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            8:00 AM – 4:00 PM each day · host school venue
          </p>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {schedule.map((day) => (
              <div key={day.day} className="bg-white rounded-xl p-6 border border-gray-100 shadow-soft-md">
                <h3 className="text-base font-semibold text-teal-600 mb-4">{day.day}</h3>
                <ul className="space-y-3">
                  {day.items.map((item) => (
                    <li key={item} className="flex items-start text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host info */}
      <section className="py-16 sm:py-20 bg-warm-100/60 border-y border-warm-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-100 shadow-soft-md">
            <p className="font-pixel text-[0.55rem] tracking-[0.25em] text-terracotta-600 mb-5 uppercase">
              // for schools
            </p>
            <h2 className="heading-display text-xl md:text-2xl text-gray-900 mb-4">
              Host Kesho At Your School
            </h2>
            <p className="text-gray-700 leading-relaxed">
              eKitabu and ChipuRobo are inviting schools to host the 2026 event on 11–12 July. We bring the
              curriculum, the mentors, and the kits. The host school provides the venue and invites neighbouring
              schools to join. The hackathon strengthens STEM education, digital literacy, innovation, and career
              awareness across the region.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-10 text-center">FAQ</h2>
          <div className="space-y-6">
            {faq.map((item) => (
              <div key={item.q} className="border-b border-gray-200 pb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hackathons;
