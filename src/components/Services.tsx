import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code, 
  Notebook as Robot, 
  Cpu, 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  Brain, 
  ChevronRight,
  Zap,
  Globe,
  GraduationCap,
  Lightbulb,
  Target,
  ArrowRight
} from 'lucide-react';

const Services = () => {
  const navigate = useNavigate();

  const handleEnroll = () => {
    navigate('/bootcamp-enrollment');
  };

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
      groupSize: "10-15 students",
      color: "from-blue-500 to-cyan-500"
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
      groupSize: "12-15 students",
      color: "from-purple-500 to-pink-500"
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
      groupSize: "15-20 students",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const workshops = [
    {
      icon: Zap,
      title: "Saturday Tinkering",
      description: "Weekly hands-on sessions for practical experimentation",
      schedule: "Every Saturday, 9 AM - 1 PM",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Globe,
      title: "Holiday Camps",
      description: "Intensive programs during school holidays",
      schedule: "During school breaks, 2-week duration",
      color: "from-indigo-500 to-violet-500"
    },
    {
      icon: Target,
      title: "School Programs",
      description: "Customized training for educational institutions",
      schedule: "Flexible scheduling",
      color: "from-rose-500 to-red-500"
    }
  ];

  const benefits = [
    {
      icon: Award,
      title: "STEM.org Certified",
      description: "Internationally recognized certification"
    },
    {
      icon: Users,
      title: "Small Groups",
      description: "Personalized attention and guidance"
    },
    {
      icon: Brain,
      title: "Expert Instructors",
      description: "Learn from industry professionals"
    },
    {
      icon: Cpu,
      title: "Modern Equipment",
      description: "Access to cutting-edge technology"
    },
    {
      icon: GraduationCap,
      title: "Career Support",
      description: "Ongoing mentorship and guidance"
    },
    {
      icon: Lightbulb,
      title: "Innovation Focus",
      description: "Emphasis on creative problem-solving"
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-primary-900 dark:from-black dark:to-primary-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Our Programs
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive STEAM and robotics education programs designed to empower Africa's next generation of innovators
            </p>
          </div>
        </div>
      </div>

      {/* Main Programs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Featured Programs</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the program that best fits your learning goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {mainPrograms.map((program, index) => (
            <div 
              key={index} 
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <program.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white ml-3">{program.title}</h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">{program.description}</p>
                
                <div className="space-y-4 mb-8">
                  {program.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                      <ChevronRight className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{program.groupSize}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                <button 
                  onClick={handleEnroll}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition flex items-center justify-center group"
                >
                  <span>Enroll Now</span>
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workshops */}
      <div className="bg-gray-100 dark:bg-gray-800/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Additional Workshops</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Flexible learning options to fit your schedule
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workshops.map((workshop, index) => (
              <div 
                key={index} 
                className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${workshop.color} flex items-center justify-center mb-6`}>
                  <workshop.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{workshop.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{workshop.description}</p>
                <p className="text-primary-600 dark:text-primary-400 font-medium">{workshop.schedule}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Our Programs?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Experience the ChipuRobo advantage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="group flex items-start p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="flex-shrink-0">
                <benefit.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 dark:bg-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-8">
              Ready to Start Your Journey in Technology?
            </h2>
            <button 
              onClick={handleEnroll}
              className="bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold inline-flex items-center group"
            >
              <span>Enroll Now</span>
              <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;