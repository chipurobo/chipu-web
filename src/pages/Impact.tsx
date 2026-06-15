import { Link, useNavigate } from 'react-router-dom';
import {
  Megaphone, Laptop, Trophy, Users, GraduationCap, Accessibility,
  Globe, MapPin, Calendar, Download, ExternalLink,
} from 'lucide-react';

// =============================================================
// /impact
//
// Numbers come from the 2023–2025 baseline data sheet. Inclusive
// Robotics is treated as ONE Pan-African programme with three
// activities: YSK Outreach, Microsoft Bootcamps, Nationals (KSEF).
// Edit the constants below as new data lands.
// =============================================================

const PROGRAM_TOTALS = {
  schools:        550,
  students:       29022,
  teachers:       291,
  inclusive:      20,
  yearsCovered:  '2023 – 2025',
};

// === Three activities inside the Inclusive Robotics programme ===

const ACTIVITIES = [
  {
    icon: Megaphone,
    title: 'YSK Outreach',
    tagline: 'Beginner robotics workshops in schools across Kenya.',
    schools: 341,
    students: 17780,
    teachers: 74,
    rangeLabel: '2023 – 2024',
    regions: 'Nairobi · Machakos · Kiambu',
    accent: 'bg-teal-500',
  },
  {
    icon: Laptop,
    title: 'Microsoft Bootcamps',
    tagline: 'Three-day intermediate AI + robotics bootcamps with Microsoft ADC.',
    schools: 150,
    students: 948,
    teachers: 127,
    rangeLabel: '2025 – 2026',
    regions: 'Nairobi · Machakos · Kiambu · Kajiado',
    accent: 'bg-indigo-500',
  },
  {
    icon: Trophy,
    title: 'National Showcase',
    tagline: 'ChipuRobo-led showcase and competition at CEMASTEA. School heats, virtual regional judging, in-person finale. KSEF Track 14 submission is optional.',
    schools: 36,
    students: 180,
    teachers: 54,
    rangeLabel: '2025',
    regions: 'All 47 counties',
    accent: 'bg-amber-500',
  },
];

// === Partner programmes that amplify reach ===

const PARTNERSHIPS = [
  {
    name: 'Raspberry Pi Code Clubs',
    detail: '100 schools across all 47 counties · 10,000 students · 200 teachers · 15 inclusive schools',
  },
  {
    name: 'Microsoft ADC',
    detail: 'Technical enablement, AI curriculum and mentorship across every bootcamp cohort.',
  },
  {
    name: 'NIBF — Nairobi International Book Fair',
    detail: '6 schools · 54 students reached via STEM and Raspberry Pi demonstrations.',
  },
  {
    name: 'ChipuRobo Internships',
    detail: '3-month post-programme placements helping students commercialise their projects.',
  },
];

const TESTIMONIALS = [
  {
    quote: "ChipuRobo's inclusive approach opened my eyes to how technology can truly serve everyone. The Braille robotics challenge was groundbreaking.",
    author: 'Sarah Wanjiku',
    role: 'Special Education Teacher, Thika',
  },
  {
    quote: 'From plastic waste to functional robot parts — this programme shows our students that innovation starts with what we have around us.',
    author: 'David Kimani',
    role: 'Physics Teacher, Nakuru County',
  },
  {
    quote: "The Code Clubs have transformed our school's approach to technology. Our students are now confident programmers and problem-solvers.",
    author: 'Grace Achieng',
    role: 'Head Teacher, Kisumu',
  },
];

const Impact = () => {
  const navigate = useNavigate();

  const downloadImpactData = () => {
    const rows: (string | number)[][] = [
      ['ChipuRobo Impact — Inclusive Robotics Programme'],
      ['Years covered', PROGRAM_TOTALS.yearsCovered],
      [],
      ['Metric',            'Value'],
      ['Schools',           PROGRAM_TOTALS.schools],
      ['Students reached',  PROGRAM_TOTALS.students],
      ['Teachers trained',  PROGRAM_TOTALS.teachers],
      ['Inclusive schools', PROGRAM_TOTALS.inclusive],
      [],
      ['Report generated', new Date().toLocaleDateString()],
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ChipuRobo_Impact.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-warm-50">
      {/* === Hero === */}
      <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200">
        <div className="code-bg absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <p className="font-pixel text-teal-600 text-[0.65rem] tracking-widest mb-3 uppercase">
              // Impact · {PROGRAM_TOTALS.yearsCovered}
            </p>
            <h1 className="heading-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4">
              Inclusive Robotics
            </h1>
            <p className="text-lg text-gray-700 mb-3 max-w-2xl mx-auto">
              One programme. Pan-African in scope. Three activities feeding the same mission.
            </p>
            <p className="inline-flex items-center gap-1.5 text-sm text-gray-500 mb-8">
              <Globe className="h-4 w-4" aria-hidden="true" />
              Anchored in Kenya · scaling Pan-Africa
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={downloadImpactData}
                className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-3 rounded-xl transition-colors text-base font-semibold inline-flex items-center justify-center"
              >
                <Download className="mr-2 h-5 w-5" aria-hidden="true" />
                Download impact CSV
              </button>
              <Link
                to="/programs"
                className="bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-xl hover:bg-warm-100 transition-colors text-base font-semibold inline-flex items-center justify-center"
              >
                <ExternalLink className="mr-2 h-5 w-5" aria-hidden="true" />
                See the programme
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === Totals strip === */}
      <section className="py-10 sm:py-14 border-b border-warm-200" aria-label="Programme totals">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard icon={GraduationCap} label="Schools touched" value={PROGRAM_TOTALS.schools.toLocaleString()} />
            <StatCard icon={Users}         label="Students reached" value={PROGRAM_TOTALS.students.toLocaleString()} />
            <StatCard icon={Megaphone}     label="Teachers trained" value={PROGRAM_TOTALS.teachers.toLocaleString()} />
            <StatCard icon={Accessibility} label="Inclusive schools" value={PROGRAM_TOTALS.inclusive.toLocaleString()} />
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            Across {PROGRAM_TOTALS.yearsCovered}. Some schools appear in more than one activity.
          </p>
        </div>
      </section>

      {/* === Three activities === */}
      <section className="py-12 sm:py-16" aria-labelledby="activities-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="activities-heading" className="heading-display text-3xl font-bold tracking-tight text-gray-900 mb-2">
              Activities inside the programme
            </h2>
            <p className="text-base text-gray-600">YSK Outreach · Microsoft Bootcamps · Nationals (KSEF)</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ACTIVITIES.map((a) => (
              <article key={a.title} className="bg-white rounded-xl border border-warm-200 overflow-hidden shadow-soft-md hover:shadow-soft-lg transition-shadow flex flex-col">
                <div className={`h-1 ${a.accent}`} aria-hidden="true" />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-md bg-warm-100">
                      <a.icon className="h-5 w-5 text-gray-700" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 m-0">{a.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-5">{a.tagline}</p>

                  <dl className="grid grid-cols-3 gap-2 mb-5">
                    <Stat label="Schools"  value={a.schools.toLocaleString()} />
                    <Stat label="Students" value={a.students.toLocaleString()} />
                    <Stat label="Teachers" value={a.teachers.toLocaleString()} />
                  </dl>

                  <div className="text-xs text-gray-500 flex items-center gap-1.5 mb-3">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    {a.rangeLabel}
                  </div>
                  <div className="text-xs text-gray-500 flex items-start gap-1.5 mt-auto">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    {a.regions}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* === Inclusion focus ===
          Names of partner schools are deliberately not shown for the
          protection of learners and educators at those schools. */}
      <section className="section-alt py-12 sm:py-16" aria-labelledby="inclusive-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Accessibility className="h-8 w-8 text-teal-600 mx-auto mb-3" aria-hidden="true" />
          <h2 id="inclusive-heading" className="heading-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3">
            Built inclusive by design
          </h2>
          <p className="text-base text-gray-700">
            {PROGRAM_TOTALS.inclusive} partner schools serving visually impaired
            and other neurodiverse learners. Sustained engagement, not one-offs.
          </p>
        </div>
      </section>

      {/* === Partners + amplifiers === */}
      <section className="py-12 sm:py-16" aria-labelledby="partners-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 id="partners-heading" className="heading-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">
              Partners that amplify reach
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {PARTNERSHIPS.map((p) => (
              <div key={p.name} className="card p-5">
                <h3 className="text-base font-semibold text-gray-900 m-0 mb-1.5">{p.name}</h3>
                <p className="text-sm text-gray-600 m-0">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Voices === */}
      <section className="relative overflow-hidden bg-gray-900 py-12 sm:py-16" aria-labelledby="voices-heading">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="voices-heading" className="heading-display text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Voices from the field
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <figure key={t.author} className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-xl p-6">
                <blockquote className="text-gray-200 italic mb-4 text-sm leading-relaxed">"{t.quote}"</blockquote>
                <figcaption>
                  <div className="text-white font-semibold text-sm">{t.author}</div>
                  <div className="text-gray-400 text-xs">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* === 2026 CTA === */}
      <section className="relative overflow-hidden bg-gray-900 border-t border-white/5 py-12 sm:py-16">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-display text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Ready for 2026?
          </h2>
          <p className="text-base text-gray-300 mb-7">
            Mission target: 4 million youth across Africa by 2030.
          </p>
          <button
            type="button"
            onClick={() => navigate('/register-2026')}
            className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-3 rounded-xl transition-colors text-base font-semibold"
          >
            Register for 2026
          </button>
        </div>
      </section>
    </div>
  );
};

// === Reusable bits ===

function StatCard({
  icon: Icon, label, value,
}: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-warm-200 p-5 sm:p-6 text-center">
      <Icon className="h-6 w-6 text-teal-600 mx-auto mb-2" aria-hidden="true" />
      <div className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-none mb-1">{value}</div>
      <div className="text-xs text-gray-600 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.65rem] uppercase tracking-wider text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-base font-semibold text-gray-900 m-0">{value}</dd>
    </div>
  );
}

export default Impact;
