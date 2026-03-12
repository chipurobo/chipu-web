import { useNavigate } from 'react-router-dom';
import { 
  Code, 
  Notebook as Robot, 
  Cpu, 
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
    navigate('/register-2026');
  };

  const mainPrograms = [
    {
      icon: Brain,
      title: "AI Literacy Bootcamps",
      description: "Hands-on AI and robotics education aligned with CBC framework. Delivered through locally fabricated kits.",
      features: [
        "CBC-aligned curriculum",
        "Locally fabricated robotics kits",
        "Digital fabrication skills",
        "Inclusive learning design"
      ],
      duration: "5-day intensive",
      groupSize: "15-20 students",
      color: "from-emerald-500 to-green-500"
    },
    {
      icon: Code,
      title: "Code Clubs (Raspberry Pi)",
      description: "60+ schools engaged across Kenya in partnership with Raspberry Pi Foundation for secondary schools.",
      features: [
        "Raspberry Pi computing education",
        "Python programming",
        "Hardware projects",
        "Teacher training included"
      ],
      duration: "Weekly sessions",
      groupSize: "12-18 students",
      color: "from-green-600 to-emerald-700"
    },
    {
      icon: Robot,
      title: "Inclusive Robotics",
      description: "Accessible technology solutions including Braille challenges and adaptive tools for all learners.",
      features: [
        "Braille robotics challenges",
        "Adaptive technology tools",
        "Universal design principles",
        "Multi-sensory learning"
      ],
      duration: "Flexible",
      groupSize: "8-12 students",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const workshops = [
    {
      icon: Target,
      title: "PET Recycling Program",
      description: "Converting plastic waste into 3D printing materials for robotics education",
      schedule: "Ongoing community initiative",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: Globe,
      title: "Teacher Training",
      description: "Professional development for educators in AI and robotics integration",
      schedule: "Quarterly workshops with CEMASTEA",
      color: "from-teal-500 to-green-600"
    },
    {
      icon: Zap,
      title: "Digital Fabrication",
      description: "3D printing and maker skills using locally sourced materials",
      schedule: "Integrated into all programs",
      color: "from-green-700 to-green-900"
    }
  ];

  const benefits = [
    {
      icon: Award,
      title: "CBC Aligned",
      description: "Integrated with national curriculum frameworks"
    },
    {
      icon: Users,
      title: "Inclusive Design",
      description: "Accessible to learners of all abilities"
    },
    {
      icon: Brain,
      title: "Partnership Network",
      description: "Supported by eKitabu, Microsoft, Raspberry Pi"
    },
    {
      icon: Cpu,
      title: "Local Fabrication",
      description: "Locally made robotics kits and tools"
    },
    {
      icon: GraduationCap,
      title: "Teacher Training",
      description: "Professional development for educators"
    },
    {
      icon: Lightbulb,
      title: "Digital Fabrication",
      description: "3D printing and maker skills development"
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-primary-900 dark:from-black dark:to-primary-950"
        aria-labelledby="services-hero-title"
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" aria-hidden="true" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 
              id="services-hero-title"
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 dyslexic-text"
            >
              Our Programs
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto dyslexic-text">
              Inclusive AI and robotics education with locally fabricated kits, Code Clubs, and CBC alignment across Kenya
            </p>
          </div>
        </div>
      </section>

      {/* Main Programs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24" aria-labelledby="main-programs-title">
        <div className="text-center mb-16">
          <h2 id="main-programs-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-4 dyslexic-text">
            Featured Programs
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 dyslexic-text">
            Choose the program that best fits your learning goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {mainPrograms.map((program, index) => (
            <article 
              key={index} 
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-200 dark:border-gray-700"
              aria-labelledby={`program-title-${index}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} aria-hidden="true" />
              
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg mr-4">
                    <program.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  </div>
                  <h3 id={`program-title-${index}`} className="text-2xl font-semibold text-gray-900 dark:text-white dyslexic-text">
                    {program.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6 dyslexic-text">{program.description}</p>
                
                <div className="space-y-4 mb-8">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 dyslexic-text">Program Features:</h4>
                  <ul className="space-y-3" role="list">
                    {program.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start" role="listitem">
                        <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-3 mt-1 flex-shrink-0">
                          <ChevronRight className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 dyslexic-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Clock className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                      <span className="dyslexic-text">
                        <span className="sr-only">Duration: </span>
                        {program.duration}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                      <span className="dyslexic-text">
                        <span className="sr-only">Group size: </span>
                        {program.groupSize}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                <button 
                  onClick={handleEnroll}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition flex items-center justify-center group dyslexic-text focus-visible"
                  aria-label={`Enroll in ${program.title} program`}
                >
                  <span>Enroll Now</span>
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

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
