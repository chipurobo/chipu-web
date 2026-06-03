import { Link } from 'react-router-dom';
import { Brain, Megaphone, GraduationCap, Repeat, ArrowRight } from 'lucide-react';
import { getCurrentHackathon, getCurrentHackathonNavLabel } from '../data/hackathons';

const stages = [
  {
    n: '01',
    icon: Megaphone,
    title: 'Outreach from YSK',
    body: 'School visits, Code Clubs, and teacher briefings through the Young Scientists Kenya (YSK) network — the entry point for every student.',
    bg: 'bg-teal-50',
    color: 'text-teal-600',
    anchor: '/inclusive-robotics#outreach',
  },
  {
    n: '02',
    icon: GraduationCap,
    title: 'Bootcamps at Microsoft',
    body: 'Intensive 3–4 day sprints at Microsoft Africa Development Centre — AI, computer vision, robotics, Python on Raspberry Pi. 800+ trained in 2025.',
    bg: 'bg-amber-50',
    color: 'text-amber-600',
    anchor: '/inclusive-robotics#bootcamps',
  },
  {
    n: '03',
    icon: Repeat,
    title: 'Training Across the Year',
    body: 'KSEF research support for Senior & Junior Secondary, weekly Code Clubs, and termly teacher refreshers — from January to December.',
    bg: 'bg-terracotta-50',
    color: 'text-terracotta-600',
    anchor: '/inclusive-robotics#year-round',
  },
];

const Programs = () => {
  const currentHack = getCurrentHackathon();
  const hackLabel = getCurrentHackathonNavLabel();

  return (
    <div className="bg-warm-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200">
        <div className="code-bg absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <p className="font-pixel text-[0.55rem] sm:text-[0.65rem] tracking-[0.25em] text-terracotta-600 mb-5 uppercase">
            // programs
          </p>
          <h1 className="heading-display text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-[1.2]">
            Inclusive Robotics
          </h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            One flagship program runs year-round across Kenya: a three-stage pipeline that takes a learner from
            first school visit, through an intensive Microsoft ADC bootcamp, into a full year of training and
            competitive showcases.
          </p>
        </div>
      </section>

      {/* Program card — Inclusive Robotics */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/inclusive-robotics"
            className="group block bg-white rounded-2xl border border-gray-100 shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className="p-8 sm:p-10">
              <div className="bg-teal-50 inline-flex p-3 rounded-xl mb-5 w-fit">
                <Brain className="h-6 w-6 text-teal-600" aria-hidden="true" />
              </div>
              <p className="font-pixel text-[0.55rem] tracking-widest text-terracotta-600 mb-2 uppercase">
                Year-round · 3 stages
              </p>
              <h2 className="heading-display text-xl md:text-2xl text-gray-900 mb-3">Inclusive Robotics</h2>
              <p className="text-gray-700 leading-relaxed mb-8 max-w-3xl">
                Our flagship program. CBC aligned, Braille and KSL ready, mentored from outreach through nationals.
              </p>

              <div className="grid sm:grid-cols-3 gap-5">
                {stages.map((s) => (
                  <div key={s.n} className="rounded-xl border border-warm-200 p-5 bg-warm-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-pixel text-sm text-terracotta-600">{s.n}</span>
                      <span className={`${s.bg} inline-flex p-1.5 rounded-lg`}>
                        <s.icon className={`h-4 w-4 ${s.color}`} aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{s.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{s.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center text-terracotta-600 group-hover:text-terracotta-700 font-medium text-sm transition-colors">
                Explore the full program
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Hackathons cross-link */}
      <section className="py-12 bg-warm-100/60 border-y border-warm-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-pixel text-[0.55rem] tracking-[0.25em] text-gray-500 mb-2 uppercase">
                // also from chipurobo
              </p>
              <h3 className="text-base font-semibold text-gray-900">
                Looking for our hackathon?{currentHack ? ` ${hackLabel} is up next — ${currentHack.dateDisplay}.` : ''}
              </h3>
            </div>
            <Link
              to="/hackathons"
              className="inline-flex items-center text-terracotta-600 hover:text-terracotta-700 font-medium text-sm transition-colors"
            >
              See {hackLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gray-900 py-20 sm:py-24 scanlines">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.12),transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="heading-display text-2xl sm:text-3xl mb-6">Want To Run Inclusive Robotics?</h2>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            We partner with schools, technology companies, and inclusive-ed organizations to bring this program to more learners.
          </p>
          <Link to="/contact" className="btn-cta">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Programs;
