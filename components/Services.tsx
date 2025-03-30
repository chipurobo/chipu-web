import React from 'react';
import { Code, Notebook as Robot, Cpu, BookOpen, Calendar, Clock, Users, Award, Brain, ChevronRight } from 'lucide-react';

const Services = () => {
  const mainPrograms = [
    {
      icon: Robot,
      title: "Robotics Bootcamp",
      description: "5-day intensive hands-on training in robotics and automation. Perfect for beginners and intermediate learners.",
      features: [
        "Hardware assembly and programming",
        "Sensor integration",
        "Robot navigation and control",
        "Project-based learning"
      ],
      duration: "5 days",
      groupSize: "10-15 students"
    },
    {
      icon: Brain,
      title: "AI & Computer Vision",
      description: "Learn to implement AI and computer vision solutions using Raspberry Pi and Python.",
      features: [
        "Object detection and tracking",
        "Machine learning basics",
        "Computer vision applications",
        "Real-world projects"
      ],
      duration: "4 weeks",
      groupSize: "12-15 students"
    },
    {
      icon: Code,
      title: "Coding Classes",
      description: "Master programming fundamentals through practical projects and real-world applications.",
      features: [
        "Python programming",
        "Algorithm development",
        "Data structures",
        "Software engineering practices"
      ],
      duration: "8 weeks",
      groupSize: "15-20 students"
    }
  ];

  const workshops = [
    {
      title: "Saturday Tinkering",
      description: "Weekly hands-on sessions for practical experimentation",
      schedule: "Every Saturday, 9 AM - 1 PM"
    },
    {
      title: "Holiday Camps",
      description: "Intensive programs during school holidays",
      schedule: "During school breaks, 2-week duration"
    },
    {
      title: "School Programs",
      description: "Customized training for educational institutions",
      schedule: "Flexible scheduling"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
        <p className="text-xl text-gray-600">
          Comprehensive STEAM and robotics education programs
        </p>
      </div>

      {/* Main Programs */}
      <div className="mb-24">
        <h2 className="text-3xl font-bold mb-12">Featured Programs</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {mainPrograms.map((program, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <program.icon className="h-12 w-12 text-green-600 mb-6" />
                <h3 className="text-2xl font-semibold mb-4">{program.title}</h3>
                <p className="text-gray-600 mb-6">{program.description}</p>
                
                <div className="space-y-4 mb-8">
                  {program.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <ChevronRight className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-6 space-y-3">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">{program.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">{program.groupSize}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-6">
                <button className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Workshops */}
      <div className="bg-gray-50 rounded-2xl p-12">
        <h2 className="text-3xl font-bold mb-12">Additional Workshops</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {workshops.map((workshop, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <Calendar className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{workshop.title}</h3>
              <p className="text-gray-600 mb-4">{workshop.description}</p>
              <p className="text-sm text-green-600 font-medium">{workshop.schedule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Programs?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">NITA Certified</h3>
            <p className="text-gray-600">Government-recognized certification</p>
          </div>
          <div className="text-center">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Small Groups</h3>
            <p className="text-gray-600">Personalized attention</p>
          </div>
          <div className="text-center">
            <Brain className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Expert Instructors</h3>
            <p className="text-gray-600">Industry professionals</p>
          </div>
          <div className="text-center">
            <Cpu className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Modern Equipment</h3>
            <p className="text-gray-600">Latest technology</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;