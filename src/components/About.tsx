import React from 'react';
import { Target, Users, Lightbulb, Award, GraduationCap, Rocket, Globe, MapPin, Heart, Recycle } from 'lucide-react';

const About = () => {
  const achievements = [
    {
      icon: Users,
      title: "350+ Learners & 30+ Teachers",
      description: "Trained in two national AI & Robotics bootcamps"
    },
    {
      icon: GraduationCap,
      title: "15 Schools Onboarded",
      description: "Building Kenya's inclusive robotics network"
    },
    {
      icon: Award,
      title: "10 Code Clubs Launched",
      description: "Targeting 123 schools by 2026 with Raspberry Pi"
    },
    {
      icon: Recycle,
      title: "2 PET Recycling Machines",
      description: "Operating in Kenya & Nigeria for sustainable innovation"
    }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "From recycled parts to national programs, we pioneer new paths"
    },
    {
      icon: Heart,
      title: "Inclusion",
      description: "Universal access to STEM for learners who are deaf, blind, and all abilities"
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
      <div className="text-center mb-16">
        <MapPin className="h-16 w-16 text-primary-600 mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">From Nairobi to the Continent</h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
          We're not just teaching robotics — we're building Africa's innovation ecosystem
        </p>
      </div>

      {/* Story Section */}
      <div className="mb-24 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-900 p-12 rounded-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Our Story</h2>
        <div className="prose prose-lg max-w-4xl mx-auto text-gray-700 dark:text-gray-300">
          <p className="text-xl leading-relaxed mb-6">
            ChipuRobo began with a simple but powerful idea: technology education should be accessible, locally built, and designed for African realities. From humble beginnings working with recycled parts at the Nairobi Railway Museum, we've grown into a national movement.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            Today, we're pioneering inclusive STEM education that reaches learners of all abilities — including those who are deaf and blind. We transform plastic waste into innovation through PET recycling, creating the very robot parts our students use to learn. We've trained hundreds of learners and teachers, launched Code Clubs in schools, and established partnerships with global leaders like Microsoft, Raspberry Pi Foundation, and CEMASTEA.
          </p>
          <p className="text-lg leading-relaxed font-medium">
            Now, we're scaling across Kenya and beyond. Our Pan-African vision is taking shape — from shipping robotics kits to Nigeria, to building university partnerships, to launching <strong>Future Builders Season 1: National AI & Robotics Competition</strong>. This is just the beginning.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border-l-4 border-primary-600">
          <Target className="h-12 w-12 text-primary-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Making technology accessible, inclusive, and locally built.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            We equip the next generation with hands-on AI and robotics skills, merge sustainability with innovation through PET recycling, and ensure universal access to STEM education for all learners.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border-l-4 border-green-600">
          <Globe className="h-12 w-12 text-green-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Vision</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            A Pan-African innovation ecosystem powered by youth.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            We envision connected communities of learners, teachers, and innovators across Africa, leading the global AI revolution with solutions that reflect our values, culture, and aspirations.
          </p>
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Milestones That Matter</h2>
        <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-12">Our journey from August to October 2025</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {achievements.map((achievement, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center transform hover:scale-105 transition duration-300">
              <achievement.icon className="h-12 w-12 text-primary-600 dark:text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{achievement.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="bg-gradient-to-br from-gray-900 to-primary-900 dark:from-black dark:to-primary-950 rounded-2xl p-12">
        <h2 className="text-3xl font-bold text-center text-white mb-4">What Drives Us</h2>
        <p className="text-xl text-center text-gray-200 mb-12 max-w-3xl mx-auto">The principles guiding our Pan-African robotics movement</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg p-6 rounded-lg hover:bg-white/20 transition">
              <value.icon className="h-10 w-10 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
              <p className="text-gray-200">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default About;