import React from 'react';
import { Target, Users, Lightbulb, Award, GraduationCap, Rocket, Globe, MapPin, Heart, Recycle } from 'lucide-react';

const About = () => {
  const achievements = [
    {
      icon: Users,
      title: "800+ Learners Reached",
      description: "Through AI Literacy Bootcamps and Code Clubs in 2025"
    },
    {
      icon: GraduationCap,
      title: "60+ Schools Engaged",
      description: "Partnered with Raspberry Pi Foundation across Kenya"
    },
    {
      icon: Award,
      title: "CBC Alignment",
      description: "Integrated with national curriculum frameworks"
    },
    {
      icon: Recycle,
      title: "PET Recycling Program",
      description: "Converting plastic waste to 3D printing materials"
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
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Inclusive AI & Robotics Education</h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
          Delivering hands-on technology education with locally fabricated robotics kits across Kenya
        </p>
      </div>

      {/* Story Section */}
      <div className="mb-24 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-900 p-12 rounded-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Our Story</h2>
        <div className="prose prose-lg max-w-4xl mx-auto text-gray-700 dark:text-gray-300">
          <p className="text-xl leading-relaxed mb-6">
            ChipuRobo delivers inclusive, hands-on AI and robotics education across Kenya, focusing on locally fabricated robotics kits and digital fabrication. We bridge the gap between traditional education and emerging technologies through practical, accessible learning experiences.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            Our programs include AI Literacy Bootcamps, Code Clubs in secondary schools powered by Raspberry Pi Foundation, and innovative inclusive robotics initiatives that reach learners of all abilities. We've pioneered accessibility solutions including Braille challenges and inclusive technology tools.
          </p>
          <p className="text-lg leading-relaxed font-medium">
            Through partnerships with eKitabu, Microsoft ADC, Raspberry Pi Foundation, and CEMASTEA, we're aligned with national frameworks like KSEF and the Competency-Based Curriculum (CBC). Our PET recycling program transforms plastic waste into 3D printing materials, creating a sustainable learning ecosystem.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border-l-4 border-primary-600">
          <Target className="h-12 w-12 text-primary-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            To deliver inclusive, hands-on AI and robotics education across Kenya using locally fabricated solutions.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            We integrate digital fabrication with national curriculum frameworks, establish Code Clubs in secondary schools, and ensure accessibility for learners of all abilities through innovative technology solutions.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border-l-4 border-green-600">
          <Globe className="h-12 w-12 text-green-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Vision</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Building Kenya's leading inclusive technology education network.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            We envision a future where every Kenyan student has access to quality AI and robotics education, with locally fabricated tools and inclusive design that ensures no learner is left behind.
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