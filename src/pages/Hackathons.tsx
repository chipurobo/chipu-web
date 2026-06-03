import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle,
  Archive,
} from 'lucide-react';
import { getCurrentHackathon, getPastHackathons } from '../data/hackathons';

// =============================================================
// /hackathons — the single hackathon page.
//
// Renders whichever event is currently `status: 'current'` in
// src/data/hackathons.ts. When a new hackathon starts, flip the
// statuses in the data file — no code change needed here.
// =============================================================

const Hackathons = () => {
  const current = getCurrentHackathon();
  const past = getPastHackathons();

  // Fallback if no current event is configured.
  if (!current) {
    return (
      <div className="bg-warm-50">
        <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200">
          <div className="code-bg absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
            <p className="font-pixel text-[0.55rem] tracking-[0.25em] text-terracotta-600 mb-5 uppercase">
              // hackathons
            </p>
            <h1 className="heading-display text-3xl md:text-4xl text-gray-900 mb-6">
              Between Events
            </h1>
            <p className="text-base text-gray-700 max-w-2xl mx-auto">
              No hackathon is currently scheduled. Check back soon for the next event, or
              browse past hackathons below.
            </p>
          </div>
        </section>
        <PastSection past={past} />
      </div>
    );
  }

  return (
    <div className="bg-warm-50">
      {/* =================================================
          HERO — current hackathon
      ================================================= */}
      <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200">
        <div className="code-bg absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center bg-white border border-warm-200 px-4 py-1.5 rounded-full text-sm text-gray-700 mb-6">
              <span className="font-pixel text-[0.55rem] tracking-widest text-terracotta-600 mr-3">
                {current.pillTag}
              </span>
              {current.pill}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-4 heading-display">
              <span className="text-teal-600">{current.headlineWord}</span>
              {current.headlineSubword && (
                <>
                  {' '}
                  <span className="text-gray-900">{current.headlineSubword}</span>
                </>
              )}
            </h1>

            <p className="text-xl md:text-2xl font-bold text-gray-700 tracking-wide mb-3">
              {current.tagline.first}{' '}
              <span className="text-teal-600">{current.tagline.accent}</span>{' '}
              {current.tagline.last}
            </p>

            {current.theme && (
              <p className="font-pixel text-[0.55rem] tracking-[0.25em] text-terracotta-600 mb-6 uppercase">
                // theme: {current.theme.toLowerCase()}
              </p>
            )}

            <p className="text-gray-600 text-lg mb-8 max-w-xl leading-relaxed">
              {current.description}
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <span className="inline-flex items-center bg-white border border-warm-200 px-4 py-2 rounded-lg text-sm text-gray-800">
                <Calendar className="h-4 w-4 mr-2 text-teal-600" />
                {current.dateDisplay}
              </span>
              <span className="inline-flex items-center bg-white border border-warm-200 px-4 py-2 rounded-lg text-sm text-gray-800">
                <Clock className="h-4 w-4 mr-2 text-teal-600" />
                {current.timeDisplay}
              </span>
              <span className="inline-flex items-center bg-white border border-warm-200 px-4 py-2 rounded-lg text-sm text-gray-800">
                <MapPin className="h-4 w-4 mr-2 text-terracotta-600" />
                {current.venue}
              </span>
              <span className="inline-flex items-center bg-white border border-warm-200 px-4 py-2 rounded-lg text-sm text-gray-800">
                <Users className="h-4 w-4 mr-2 text-teal-600" />
                {current.teamSize}
              </span>
            </div>

            {current.registrationCallout && (
              <div className="inline-flex items-center bg-terracotta-50 border border-terracotta-200 px-5 py-3 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-terracotta-600 mr-2 flex-shrink-0" />
                <span className="text-sm text-terracotta-700 font-medium">
                  {current.registrationCallout}
                </span>
              </div>
            )}
          </div>

          {/* Free + partners badge */}
          <div className="absolute top-8 right-4 sm:right-8 lg:top-12 lg:right-16 text-right">
            <div className="bg-terracotta-500 text-white rounded-full h-20 w-20 flex flex-col items-center justify-center font-bold shadow-soft-lg ml-auto">
              <span className="text-xs">100%</span>
              <span className="text-sm font-black">FREE</span>
            </div>
            <p className="font-pixel text-[0.55rem] tracking-widest text-gray-500 mt-3 uppercase">
              {current.partner}
            </p>
          </div>
        </div>
      </section>

      {/* =================================================
          TRACKS
      ================================================= */}
      {current.tracks.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">
                Hackathon Tracks
              </h2>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                Choose one of the challenge tracks below. Each is mentored by working professionals
                and judged on real-world impact.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {current.tracks.map((t) => (
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
      )}

      {/* =================================================
          AUDIENCE (optional)
      ================================================= */}
      {current.audience && current.audience.length > 0 && (
        <section className="py-16 sm:py-20 bg-warm-100/60 border-y border-warm-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3">
                Who's in the Room
              </h2>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                Students build alongside the people who actually work in the fields they're being
                invited into.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {current.audience.map((a) => (
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
      )}

      {/* =================================================
          SCHEDULE
      ================================================= */}
      {current.schedule.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-3 text-center">
              {current.schedule.length}-Day Schedule
            </h2>
            <p className="text-base text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              {current.timeDisplay} · {current.venue}
            </p>
            <div className={`grid gap-6 max-w-4xl mx-auto ${current.schedule.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {current.schedule.map((day) => (
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
      )}

      {/* =================================================
          HOST BLOCK (optional)
      ================================================= */}
      {current.hostBlock && (
        <section className="py-16 sm:py-20 bg-warm-100/60 border-y border-warm-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-100 shadow-soft-md">
              <p className="font-pixel text-[0.55rem] tracking-[0.25em] text-terracotta-600 mb-5 uppercase">
                {current.hostBlock.eyebrow}
              </p>
              <h2 className="heading-display text-xl md:text-2xl text-gray-900 mb-4">
                {current.hostBlock.title}
              </h2>
              <p className="text-gray-700 leading-relaxed">{current.hostBlock.body}</p>
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          FAQ
      ================================================= */}
      {current.faq.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="heading-display text-2xl md:text-3xl text-gray-900 mb-10 text-center">FAQ</h2>
            <div className="space-y-6">
              {current.faq.map((item) => (
                <div key={item.q} className="border-b border-gray-200 pb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{item.q}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          PAST EVENTS — archive
      ================================================= */}
      <PastSection past={past} />

    </div>
  );
};

// =============================================================
// Past hackathons archive — reusable across the empty + filled states.
// =============================================================

const PastSection = ({ past }: { past: ReturnType<typeof getPastHackathons> }) => {
  if (past.length === 0) return null;

  return (
    <section id="archive" className="scroll-mt-20 py-16 sm:py-20 bg-warm-100/60 border-y border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="font-pixel text-[0.6rem] sm:text-[0.65rem] tracking-widest text-gray-500 uppercase">
            // archive
          </span>
          <span className="h-px flex-1 bg-warm-200" aria-hidden="true" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {past.map((p) => (
            <article
              key={p.slug}
              className="bg-white rounded-xl border border-gray-100 shadow-soft-sm p-6"
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <Archive className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-pixel text-[0.55rem] tracking-widest text-gray-500 uppercase">
                  Past · {p.headlineWord}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{p.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{p.shortBlurb}</p>
              <div className="text-xs text-gray-500 space-y-1.5 mb-4">
                <p className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-2" />
                  {p.dateDisplay}
                </p>
                <p className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-2" />
                  {p.venue}
                </p>
              </div>
              {/* Tracks summary */}
              {p.tracks.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="font-pixel text-[0.55rem] tracking-widest text-gray-500 mb-2 uppercase">
                    Tracks
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {p.tracks.map((t) => (
                      <li key={t.title}>· {t.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hackathons;
