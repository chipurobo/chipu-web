import { Target, Users, Lightbulb, GraduationCap, Globe, MapPin, Recycle } from 'lucide-react';

const About = () => {
  const achievements = [
    {
      icon: Users,
      title: "800+ Learners Reached",
      description: "Through AI Literacy Bootcamps and Code Clubs in 2025"
    },
    {
      icon: GraduationCap,
      title: "60+ Schools & CBC Aligned",
      description: "Partnered with Raspberry Pi Foundation, integrated with national curriculum frameworks"
    },
    {
      icon: Recycle,
      title: "PET Recycling Innovation",
      description: "Converting plastic waste to 3D printing materials across 13 locations"
    }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation & Inclusion",
      description: "Pioneer new paths while ensuring universal access to STEM for learners of all abilities"
    },
    {
      icon: Recycle,
      title: "Sustainability",
      description: "Transforming PET waste into robot parts and empowering communities"
    },
    {
      icon: Globe,
      title: "Pan-African Vision",
      description: "Building a connected innovation ecosystem across the continent"
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/80 dark:from-black dark:to-primary-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-emerald-400 mx-auto mb-6" aria-hidden="true" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Inclusive AI & Robotics Education
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              We deliver practical AI and robotics lessons with locally fabricated kits across Kenya.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section" aria-labelledby="about-story-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-900 p-10 sm:p-14 rounded-2xl border border-emerald-200/50 dark:border-gray-700">
            <h2 id="about-story-title" className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
              Our Story
            </h2>
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl border-l-4 border-emerald-500 shadow-soft-sm">
                <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                  ChipuRobo offers inclusive, hands-on AI and robotics education using locally fabricated kits to bridge classrooms and emerging tech.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl border-l-4 border-blue-500 shadow-soft-sm">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Programs such as AI Literacy Bootcamps and Raspberry Pi-powered Code Clubs reach learners of every ability with Braille and KSL-ready tools.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl border-l-4 border-green-500 shadow-soft-sm">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  Partnerships with eKitabu, Microsoft ADC, Raspberry Pi, and CEMASTEA align us to CBC and fuel PET recycling labs that supply filament for classes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-alt" aria-labelledby="mission-vision-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="mission-vision-title" className="sr-only">Mission and Vision</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-soft-md border border-gray-100 dark:border-gray-700/50 hover:shadow-soft-lg transition-all duration-300">
              <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-xl w-fit mb-6">
                <Target className="h-10 w-10 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h3>
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-300">
                  Deliver inclusive AI and robotics training with locally built equipment.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  We weave digital fabrication into CBC, launch Code Clubs, and design accessible kits for every learner.
                </p>
              </div>
            </article>

            <article className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-soft-md border border-gray-100 dark:border-gray-700/50 hover:shadow-soft-lg transition-all duration-300">
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl w-fit mb-6">
                <Globe className="h-10 w-10 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Our Vision
              </h3>
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-300">
                  Build Kenya's leading inclusive tech education network.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Every student should access AI and robotics through locally fabricated, inclusive tools.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="section" aria-labelledby="achievements-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="achievements-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Milestones That Matter
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Highlights from August to October 2025
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <article
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-soft-md border border-gray-100 dark:border-gray-700/50 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg"
                aria-labelledby={`achievement-title-${index}`}
              >
                <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-xl w-fit mx-auto mb-6">
                  <achievement.icon className="h-10 w-10 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <h3 id={`achievement-title-${index}`} className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {achievement.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {achievement.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-4 sm:mx-6 lg:mx-8 mb-20 sm:mb-28 lg:mb-32">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/80 dark:from-black dark:to-primary-950 rounded-2xl p-10 sm:p-14" aria-labelledby="values-title">
          <div className="text-center mb-12">
            <h2 id="values-title" className="text-3xl font-bold text-white mb-4">
              What Drives Us
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Principles powering our Pan-African robotics work
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <article
                key={index}
                className="bg-white/5 backdrop-blur-lg p-6 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 hover:-translate-y-1"
                aria-labelledby={`value-title-${index}`}
              >
                <div className="bg-green-500/10 p-3 rounded-xl w-fit mb-5">
                  <value.icon className="h-8 w-8 text-green-400" aria-hidden="true" />
                </div>
                <h3 id={`value-title-${index}`} className="text-lg font-semibold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
