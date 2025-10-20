import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Users, School, Award, Calendar, TrendingUp, GraduationCap, CheckCircle, Code, Brain, Cpu, Zap, Target, Eye, Cog } from 'lucide-react';

const Microsoft = () => {
  const navigate = useNavigate();

  const programImpact = [
    {
      icon: Users,
      metric: "350+",
      label: "Total Learners & Teachers",
      detail: "Across both bootcamps"
    },
    {
      icon: School,
      metric: "15",
      label: "Schools Engaged",
      detail: "National & county institutions"
    },
    {
      icon: GraduationCap,
      metric: "200+",
      label: "April Participants",
      detail: "Learners & teachers"
    },
    {
      icon: Rocket,
      metric: "150+",
      label: "August Participants",
      detail: "Learners & teachers"
    },
    {
      icon: Code,
      metric: "100%",
      label: "Completion Rate",
      detail: "Full attendance & certification"
    },
    {
      icon: Award,
      metric: "6",
      label: "Partner Organizations",
      detail: "Collaborative ecosystem"
    }
  ];

  const aprilCohort = [
    { name: "Starehe Girls Centre", students: 35, teachers: 3 },
    { name: "Starehe Boys Centre", students: 35, teachers: 3 },
    { name: "The Excellence School", students: 30, teachers: 2 },
    { name: "Moi Girls School Nairobi", students: 30, teachers: 3 },
    { name: "Limuru Girls High School", students: 35, teachers: 2 },
    { name: "Nairobi School", students: 30, teachers: 2 }
  ];

  const augustCohort = [
    { name: "Alliance Girls High School", students: 25, teachers: 2 },
    { name: "Alliance Boys High School", students: 25, teachers: 2 },
    { name: "Crawford International School", students: 20, teachers: 2 },
    { name: "Hillcrest School", students: 20, teachers: 2 },
    { name: "Treeside School", students: 20, teachers: 2 },
    { name: "New Horizon Schools", students: 20, teachers: 2 }
  ];

  const learningModules = [
    {
      icon: Brain,
      title: "AI Fundamentals",
      hours: "8 hours",
      topics: ["Machine learning basics", "Computer vision", "Object detection"]
    },
    {
      icon: Code,
      title: "Python Programming",
      hours: "6 hours",
      topics: ["Raspberry Pi", "Sensor integration", "Robot control"]
    },
    {
      icon: Cog,
      title: "Robotics Engineering",
      hours: "10 hours",
      topics: ["Hardware assembly", "Circuit design", "System integration"]
    },
    {
      icon: Eye,
      title: "Computer Vision",
      hours: "6 hours",
      topics: ["Gesture recognition", "Tracking algorithms", "AI cameras"]
    }
  ];

  const outcomes = [
    { metric: "30+", label: "AI-powered robots built", icon: Rocket },
    { metric: "100%", label: "Hands-on learning time", icon: Target },
    { metric: "30 hrs", label: "Average training duration", icon: TrendingUp },
    { metric: "350+", label: "Certificates awarded", icon: Award }
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full text-white mb-6">
              <Zap className="h-5 w-5 mr-2" />
              <span className="font-semibold">Year-Round National Initiative</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Microsoft AI & Robotics
              <br />
              Literacy Program
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Building Kenya's AI-ready workforce through hands-on robotics education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-lg">
                <p className="text-3xl font-bold text-white">350+</p>
                <p className="text-white/80">Lives Impacted</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-lg">
                <p className="text-3xl font-bold text-white">15</p>
                <p className="text-white/80">Schools</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-lg">
                <p className="text-3xl font-bold text-white">2</p>
                <p className="text-white/80">Bootcamps</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Program Impact Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Program Impact at a Glance
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Data from April & August 2025 bootcamps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {programImpact.map((item, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <item.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <p className="text-5xl font-bold text-gray-900 dark:text-white mb-2">{item.metric}</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">{item.label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Learning Outcomes */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Measurable Learning Outcomes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {outcomes.map((outcome, index) => (
              <div key={index} className="text-center">
                <outcome.icon className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{outcome.metric}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{outcome.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curriculum Breakdown */}
      <div className="bg-gray-50 dark:bg-gray-800 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Comprehensive Curriculum
          </h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-16">
            30+ hours of intensive hands-on training per bootcamp
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {learningModules.map((module, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg">
                <module.icon className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{module.title}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-semibold mb-4">{module.hours}</p>
                <ul className="space-y-2">
                  {module.topics.map((topic, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cohort Breakdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-16">
          Participating Schools & Numbers
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* April Cohort */}
          <div>
            <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg inline-block mb-6">
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300">April 2025 Cohort</h3>
            </div>
            <div className="space-y-4">
              {aprilCohort.map((school, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{school.name}</h4>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{school.students}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{school.teachers}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Teachers</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  Total: 195 students + 15 teachers = 210 participants
                </p>
              </div>
            </div>
          </div>

          {/* August Cohort */}
          <div>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-lg inline-block mb-6">
              <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-300">August 2025 Cohort</h3>
            </div>
            <div className="space-y-4">
              {augustCohort.map((school, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{school.name}</h4>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{school.students}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{school.teachers}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Teachers</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  Total: 130 students + 12 teachers = 142 participants
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workshop Logistics */}
      <div className="bg-gray-50 dark:bg-gray-800 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Workshop Format & Logistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg">
              <Calendar className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Duration</h3>
              <p className="text-gray-600 dark:text-gray-300">3-day intensive bootcamp</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">10:00 AM - 3:30 PM daily</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg">
              <School className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Venue</h3>
              <p className="text-gray-600 dark:text-gray-300">Microsoft ADC Garage</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Westlands, Nairobi</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg">
              <Award className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Certification</h3>
              <p className="text-gray-600 dark:text-gray-300">CEMASTEA validated</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">100% completion rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Partnership & Next Steps */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 dark:from-black dark:to-blue-950 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            A Collaborative Success
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            This program is made possible through partnership between Microsoft Kenya, ChipuRobo, eKitabu, and CEMASTEA, with support from the Raspberry Pi Foundation.
          </p>
          <p className="text-lg text-gray-300 mb-8">
            Future cohorts will scale nationwide through <strong>Future Builders Season 1</strong> — our National AI & Robotics Competition targeting 123 schools by 2026.
          </p>
          <button
            onClick={() => navigate('/program')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold inline-flex items-center"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Join Future Builders Season 1
          </button>
        </div>
      </div>

      {/* Contact */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Get Involved</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          For media inquiries, partnership opportunities, or school participation
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a href="mailto:chipurobo@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium">
            chipurobo@gmail.com
          </a>
          <span className="hidden sm:inline text-gray-400">|</span>
          <a href="mailto:support@ekitabu.com" className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium">
            support@ekitabu.com
          </a>
        </div>
        <a
          href="https://drive.google.com/file/d/1W3exC0mLa67oK7PsB1sVRJR_hlg36S_MiRXLha7jXB0/view"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          View FAQ Document
        </a>
      </div>
    </div>
  );
};

export default Microsoft;
