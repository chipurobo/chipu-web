import {
  Mic,
  GraduationCap,
  Rocket,
  Code,
  FlaskConical,
  Landmark,
  Bell,
} from 'lucide-react';

// --- Data ---

interface GuestType {
  icon: React.ElementType;
  title: string;
  description: string;
}

const guestTypes: GuestType[] = [
  {
    icon: GraduationCap,
    title: 'Teachers & Educators',
    description:
      'Classroom practitioners integrating technology into learning across the continent.',
  },
  {
    icon: Rocket,
    title: 'Founders & Builders',
    description:
      'People starting companies and organizations that solve local problems with technology.',
  },
  {
    icon: Code,
    title: 'Engineers & Developers',
    description:
      'Technical practitioners building tools, platforms, and infrastructure for Africa.',
  },
  {
    icon: FlaskConical,
    title: 'Researchers',
    description:
      'Academics and applied researchers advancing knowledge in AI, robotics, and education.',
  },
  {
    icon: Landmark,
    title: 'Policymakers',
    description:
      'People shaping the regulatory and institutional environment for technology education.',
  },
];

// --- Component ---

const Podcast = () => {
  return (
    <div>
      {/* ===== A. HERO SECTION ===== */}
      <section className="relative hero-gradient overflow-hidden">
        <div className="circuit-background" aria-hidden="true" />
        <div className="tech-ring tech-ring-1" aria-hidden="true" />
        <div className="tech-ring tech-ring-2" aria-hidden="true" />
        <div className="tech-ring tech-ring-3" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-8">
              <Mic
                className="h-8 w-8 text-emerald-400 animate-float"
                aria-hidden="true"
              />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
              Africa Builds
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 font-medium mb-4">
              Conversations with the people shaping how Africa learns and builds
              technology.
            </p>

            <p className="text-base text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed">
              Each episode will feature a teacher, founder, researcher, engineer, or
              policymaker working on technology education across the continent.
              No pitches. No hype. Just honest conversations about what it takes
              to build.
            </p>

            <p className="text-sm text-gray-500 mb-10">
              Available on YouTube and Spotify
            </p>

            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl text-lg font-semibold">
              <Bell
                className="mr-2 h-5 w-5 text-emerald-400"
                aria-hidden="true"
              />
              Coming Soon
            </div>
          </div>
        </div>
      </section>

      {/* ===== B. COMING SOON TEASER ===== */}
      <section
        className="section"
        aria-labelledby="coming-soon-title"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              id="coming-soon-title"
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
            >
              We Are Getting Ready
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Africa Builds is currently in production. We are lining up our first
              guests and preparing to bring you long-form conversations with the
              people doing meaningful work in technology education across the
              continent.
            </p>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft-md border border-gray-100 dark:border-gray-700/50 p-8 sm:p-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                What to Expect
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-3 text-left max-w-lg mx-auto">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5" aria-hidden="true" />
                  <span>In-depth conversations with educators, founders, researchers, engineers, and policymakers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5" aria-hidden="true" />
                  <span>Video on YouTube, audio and video on Spotify</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5" aria-hidden="true" />
                  <span>Stories from across the continent — grounded, honest, and free of hype</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== C. ABOUT THE PODCAST ===== */}
      <section
        className="section-alt"
        aria-labelledby="about-podcast-title"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <h2
                id="about-podcast-title"
                className="text-3xl font-bold text-gray-900 dark:text-white mb-6"
              >
                Why This Podcast Exists
              </h2>

              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                  Africa's technology education landscape is growing fast, but
                  the stories behind that growth are rarely told. The people
                  doing the work — teachers adapting curricula, researchers
                  publishing from under-resourced labs, founders building with
                  local constraints — are not often heard outside their
                  immediate communities.
                </p>
                <p>
                  Africa Builds exists to change that. Each episode will be a
                  long-form conversation with someone working at the
                  intersection of technology and education on the continent. We
                  will talk about what they are building, why it matters, and what
                  they have learned along the way.
                </p>
                <p>
                  This is not a promotional platform. It is a record of the
                  work being done — told by the people doing it.
                </p>
              </div>
            </div>

            {/* Visual card — guest highlights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft-md border border-gray-100 dark:border-gray-700/50 p-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Voices on the Podcast
              </h3>

              <div className="space-y-5">
                {[
                  {
                    icon: GraduationCap,
                    label: 'Educators',
                    detail: 'Teachers and instructors from across Africa',
                  },
                  {
                    icon: Rocket,
                    label: 'Founders',
                    detail: 'Startup and organization builders',
                  },
                  {
                    icon: FlaskConical,
                    label: 'Researchers',
                    detail: 'University and applied research voices',
                  },
                  {
                    icon: Landmark,
                    label: 'Policymakers',
                    detail: 'People shaping technology education policy',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                      <item.icon
                        className="h-5 w-5 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== D. FEATURED GUESTS SECTION ===== */}
      <section
        className="section"
        aria-labelledby="guest-types-title"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              id="guest-types-title"
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Who We Will Talk To
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Africa Builds will feature people from across the technology education
              ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {guestTypes.map((type) => (
              <div
                key={type.title}
                className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft-md border border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-4">
                  <type.icon
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                  {type.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {type.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== E. CTA SECTION ===== */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-emerald-600 to-emerald-700 dark:from-primary-700 dark:to-emerald-800"
        aria-labelledby="podcast-cta-title"
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_70%)]"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="text-center">
            <h2
              id="podcast-cta-title"
              className="text-3xl font-bold text-white mb-4"
            >
              Stay Tuned
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Africa Builds is coming soon. Episodes will be available on
              YouTube and Spotify. Follow ChipuRobo to be the first to know
              when we launch.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Podcast;
