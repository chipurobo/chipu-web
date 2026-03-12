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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Hero Section */}
      <section className="text-center mb-16" aria-labelledby="about-hero-title">
        <div className="mb-6" aria-hidden="true">
          <MapPin className="h-16 w-16 text-primary-600 mx-auto animate-pulse-slow" />
        </div>
        <h1 id="about-hero-title" className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 dyslexic-text">
          Inclusive AI & Robotics Education
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto dyslexic-text">
          We deliver practical AI and robotics lessons with locally fabricated kits across Kenya.
        </p>
      </section>

      {/* Story Section */}
      <section className="mb-24" aria-labelledby="about-story-title">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-900 p-12 rounded-2xl border border-emerald-200 dark:border-gray-700">
          <h2 id="about-story-title" className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 dyslexic-text">
            Our Story
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border-l-4 border-emerald-500 shadow-sm">
              <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 dyslexic-text">
                ChipuRobo offers inclusive, hands-on AI and robotics education using locally fabricated kits to bridge classrooms and emerging tech.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border-l-4 border-blue-500 shadow-sm">
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 dyslexic-text">
                Programs such as AI Literacy Bootcamps and Raspberry Pi-powered Code Clubs reach learners of every ability with Braille and KSL-ready tools.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border-l-4 border-green-500 shadow-sm">
              <p className="text-lg leading-relaxed font-medium text-gray-700 dark:text-gray-300 dyslexic-text">
                Partnerships with eKitabu, Microsoft ADC, Raspberry Pi, and CEMASTEA align us to CBC and fuel PET recycling labs that supply filament for classes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mb-24" aria-labelledby="mission-vision-title">
        <h2 id="mission-vision-title" className="sr-only">Mission and Vision</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <article className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-lg w-fit mb-6">
              <Target className="h-12 w-12 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 dyslexic-text">
              Our Mission
            </h3>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 dyslexic-text">
                Deliver inclusive AI and robotics training with locally built equipment.
              </p>
              <p className="text-gray-600 dark:text-gray-300 dyslexic-text">
                We weave digital fabrication into CBC, launch Code Clubs, and design accessible kits for every learner.
              </p>
            </div>
          </article>
          
          <article className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg w-fit mb-6">
              <Globe className="h-12 w-12 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 dyslexic-text">
              Our Vision
            </h3>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 dyslexic-text">
                Build Kenya's leading inclusive tech education network.
              </p>
              <p className="text-gray-600 dark:text-gray-300 dyslexic-text">
                Every student should access AI and robotics through locally fabricated, inclusive tools.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Achievements */}
      <section className="mb-24" aria-labelledby="achievements-title">
        <div className="text-center mb-12">
          <h2 id="achievements-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-4 dyslexic-text">
            Milestones That Matter
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 dyslexic-text">
            Highlights from August to October 2025
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <article 
              key={index} 
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center transform hover:scale-105 transition duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600"
              aria-labelledby={`achievement-title-${index}`}
            >
              <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-lg w-fit mx-auto mb-6">
                <achievement.icon className="h-12 w-12 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <h3 id={`achievement-title-${index}`} className="text-xl font-semibold text-gray-900 dark:text-white mb-3 dyslexic-text">
                {achievement.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 dyslexic-text">
                {achievement.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-gradient-to-br from-gray-900 to-primary-900 dark:from-black dark:to-primary-950 rounded-2xl p-12" aria-labelledby="values-title">
        <div className="text-center mb-12">
          <h2 id="values-title" className="text-3xl font-bold text-white mb-4 dyslexic-text">
            What Drives Us
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto dyslexic-text">
            Principles powering our Pan-African robotics work
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <article 
              key={index} 
              className="bg-white/10 backdrop-blur-lg p-6 rounded-xl hover:bg-white/20 transition border border-white/20 hover:border-white/30"
              aria-labelledby={`value-title-${index}`}
            >
              <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-6">
                <value.icon className="h-10 w-10 text-green-400" aria-hidden="true" />
              </div>
              <h3 id={`value-title-${index}`} className="text-xl font-semibold text-white mb-3 dyslexic-text">
                {value.title}
              </h3>
              <p className="text-gray-200 dyslexic-text">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
};

export default About;
