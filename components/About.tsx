import React from 'react';
import { Target, Users, Lightbulb, Award, GraduationCap, Rocket } from 'lucide-react';

const About = () => {
  const achievements = [
    {
      icon: Users,
      title: "8,000+ Students",
      description: "Trained and mentored in robotics and AI"
    },
    {
      icon: Award,
      title: "NITA Certified",
      description: "Government-recognized training programs"
    },
    {
      icon: Rocket,
      title: "100+ Robots",
      description: "Built by our students and team"
    }
  ];

  const values = [
    {
      title: "Innovation",
      description: "We push the boundaries of technology education in Africa"
    },
    {
      title: "Accessibility",
      description: "Making STEAM education available to all"
    },
    {
      title: "Excellence",
      description: "Maintaining high standards in all our programs"
    },
    {
      title: "Impact",
      description: "Creating lasting change in our communities"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About ChipuRobo</h1>
        <p className="text-xl text-gray-600">
          Empowering Africa's youth through STEAM education and robotics
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <Target className="h-12 w-12 text-green-600 mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            At ChipuRobo, we are dedicated to transforming education in Africa through innovative STEAM and robotics programs. Our mission is to equip the next generation with the skills they need to thrive in the digital age.
          </p>
          <p className="text-gray-600">
            We believe that by providing hands-on experience with cutting-edge technology, we can inspire and prepare young minds to become the leaders of tomorrow's technological revolution.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <Lightbulb className="h-12 w-12 text-green-600 mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
          <p className="text-gray-600 mb-6">
            We envision an Africa where every young person has access to quality STEAM education and the opportunity to develop skills in robotics and artificial intelligence.
          </p>
          <p className="text-gray-600">
            Through our programs, we aim to contribute to Africa's technological advancement and ensure our youth are well-positioned to participate in the global digital economy.
          </p>
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-md text-center">
              <achievement.icon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{achievement.title}</h3>
              <p className="text-gray-600">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="bg-gray-50 rounded-2xl p-12">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;