import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Calendar, Users, Award, Code, Brain, Eye, Target, CheckCircle, Clock, Trophy, BookOpen, Cpu, ArrowRight } from 'lucide-react';

const Program = () => {
  const navigate = useNavigate();

  const handleEnroll = () => {
    navigate('/future-builders-registration');
  };

  const learningPathway = [
    {
      phase: "Terms 1-2",
      title: "Intro to Robotics",
      description: "Build your foundation in robotics, circuits, and programming",
      topics: [
        "Circuit basics and electronics fundamentals",
        "Robot assembly and mechanical design",
        "Python programming with Raspberry Pi",
        "Sensor integration and control systems"
      ],
      icon: Code,
      color: "from-blue-500 to-cyan-500"
    },
    {
      phase: "Terms 3-4",
      title: "AI & Computer Vision",
      description: "Explore artificial intelligence and machine learning applications",
      topics: [
        "Computer vision fundamentals",
        "Object detection and tracking",
        "Gesture recognition and control",
        "Machine learning model implementation"
      ],
      icon: Brain,
      color: "from-purple-500 to-pink-500"
    },
    {
      phase: "Terms 5-6",
      title: "Project & Competition Phase",
      description: "Apply your skills to solve real-world challenges",
      topics: [
        "Real-world robotics solutions design",
        "Project mentorship and guidance",
        "Team collaboration and presentations",
        "National competition under KSEF framework"
      ],
      icon: Trophy,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const programFeatures = [
    {
      icon: Users,
      title: "Inclusive Learning",
      description: "Universal access for all abilities including learners who are deaf and blind"
    },
    {
      icon: Rocket,
      title: "Hands-On Experience",
      description: "Build, code, and program real robots with AI capabilities"
    },
    {
      icon: Award,
      title: "CEMASTEA Certified",
      description: "Academic validation through KSEF national competition framework"
    },
    {
      icon: BookOpen,
      title: "Digital Resources",
      description: "Access to eKitabu LMS platform and comprehensive curriculum"
    },
    {
      icon: Eye,
      title: "Expert Mentorship",
      description: "Guidance from experienced instructors and industry professionals"
    },
    {
      icon: Target,
      title: "Real Impact",
      description: "Solve community challenges with technology and innovation"
    }
  ];

  const whatYouGet = [
    "Complete robotics kit for hands-on learning",
    "Raspberry Pi computing platform",
    "AI camera for computer vision projects",
    "3D-printed parts from recycled PET plastic",
    "Access to Microsoft ADC facilities and tools",
    "Digital curriculum and learning resources",
    "Certificate upon program completion",
    "Entry to national KSEF robotics competition"
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-emerald-700 dark:from-primary-700 dark:to-emerald-800">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full text-white mb-6">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-semibold">Registration Opens November 2025</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
              Future Builders
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-green-300 mb-6">
              Season 1: National AI & Robotics Competition
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              A year-long inclusive robotics journey culminating in Kenya's premier student-led AI innovation showcase
            </p>
            <button
              onClick={handleEnroll}
              className="bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold inline-flex items-center shadow-lg"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Register Your School Now
            </button>
          </div>
        </div>
      </div>

      {/* Program Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Learning Journey
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From robotics fundamentals to AI mastery — compete at the National Competition judged by CEMASTEA under KSEF
          </p>
        </div>

        {/* Learning Pathway */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {learningPathway.map((phase, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${phase.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                    {phase.phase}
                  </span>
                  <phase.icon className="h-8 w-8 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{phase.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{phase.description}</p>

                <ul className="space-y-3">
                  {phase.topics.map((topic, idx) => (
                    <li key={idx} className="flex items-start text-gray-700 dark:text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bootcamps Section */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Robotics Bootcamps
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Intensive hands-on training at Microsoft ADC for schools and students
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Rocket className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Microsoft ADC Bootcamps</h3>
                </div>
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Duration</h4>
                  <p className="text-gray-600 dark:text-gray-300">3-4 day intensive program</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Location</h4>
                  <p className="text-gray-600 dark:text-gray-300">Microsoft ADC, Westlands, Nairobi</p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                We arrange bootcamps at Microsoft ADC where schools can bring their students for hands-on experience building robots. 
                Students are taken through an intuitive 3-4 day program where they learn the basics of electronic engineering and programming 
                in order to create a simple 4-wheeled robot.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Electronic engineering fundamentals</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Programming basics</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">4-wheeled robot assembly</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Interactive learning and teamwork</span>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-purple-800 dark:text-purple-200 font-medium">
                  Perfect for schools looking to give their students practical robotics experience in a professional environment.
                </p>
              </div>
            </div>

            {/* Bootcamp Inquiry */}
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 p-8 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="text-center">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Arrange a Bootcamp
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Contact us to arrange a custom bootcamp for your school at Microsoft ADC.
                </p>
                <button
                  onClick={() => navigate('/contact')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition text-lg font-semibold inline-flex items-center justify-center"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Contact Us for Bootcamp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Maker Space Section */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Maker Space
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Hands-on creative building sessions for unrestricted innovation
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Workshop Location</h3>
                </div>
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Venue</h4>
                  <p className="text-gray-600 dark:text-gray-300">Nairobi Railways Museum, Haile Selasie Ave</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Session Details</h4>
                  <p className="text-gray-600 dark:text-gray-300">6 hours long, starts at 10 AM</p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                The Maker Space is held at our workshop where students can come and participate in creating their own unrestricted builds. 
                Join us for creative sessions that encourage innovation and hands-on learning.
              </p>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <p className="text-orange-800 dark:text-orange-200 font-medium">
                  Perfect for students who want to explore creative building and innovation outside the structured curriculum.
                </p>
              </div>
            </div>

            {/* Maker Space Registration */}
            <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 p-8 rounded-xl border border-orange-200 dark:border-orange-800">
              <div className="text-center">
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Register for Maker Space
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Join individual sessions at our workshop. Open to all students interested in creative building.
                </p>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfWh0Tmxc1l8O_HCD2jPqcVNBr1-5XfFvb5bU75EmWTVVOyOg/viewform?usp=publish-editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition text-lg font-semibold inline-flex items-center justify-center"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Register for Maker Space
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Program Features */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-12 mb-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Join Season 1?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programFeatures.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What You Get */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              What's Included
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Every participating school and learner receives a comprehensive robotics education package
            </p>
            <ul className="space-y-4">
              {whatYouGet.map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Program Timeline</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">November 2025</h4>
                  <p className="text-gray-600 dark:text-gray-300">Future Builders Season 1 registration opens</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">January 2026</h4>
                  <p className="text-gray-600 dark:text-gray-300">Program begins - Intro to Robotics phase</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Term 3-4, 2026</h4>
                  <p className="text-gray-600 dark:text-gray-300">AI & Computer Vision training</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Term 5-6, 2026</h4>
                  <p className="text-gray-600 dark:text-gray-300">Project phase & National AI Competition (KSEF)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* CTA Section */}
      <div className="bg-gray-900 dark:bg-black py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Cpu className="h-16 w-16 text-primary-500 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Build the Future?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Have questions about the program? Our team is here to help you get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/contact')}
              className="bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition text-lg font-semibold inline-flex items-center justify-center"
            >
              <Users className="mr-2 h-5 w-5" />
              Contact Us for More Info
            </button>
            <button
              onClick={() => navigate('/about')}
              className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-lg hover:bg-white/20 transition text-lg font-semibold inline-flex items-center justify-center"
            >
              <Eye className="mr-2 h-5 w-5" />
              Learn About ChipuRobo
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Program;
