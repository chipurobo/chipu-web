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
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/80 dark:from-black dark:to-primary-950"
        aria-labelledby="services-hero-title"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
          <div className="text-center">
            <h1
              id="services-hero-title"
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
            >
              Our Programs
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Inclusive AI and robotics education with locally fabricated kits, Code Clubs, and CBC alignment across Kenya
            </p>
          </div>
        </div>
      </section>

      {/* Main Programs */}
      <section className="section" aria-labelledby="main-programs-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="main-programs-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Programs
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Choose the program that best fits your learning goals
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {mainPrograms.map((program, index) => (
              <article
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-soft-md border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg"
                aria-labelledby={`program-title-${index}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} aria-hidden="true" />

                <div className="relative p-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-xl mr-4">
                      <program.icon className="h-7 w-7 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                    </div>
                    <h3 id={`program-title-${index}`} className="text-xl font-semibold text-gray-900 dark:text-white">
                      {program.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">{program.description}</p>

                  <div className="space-y-3 mb-8">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Features</h4>
                    <ul className="space-y-2.5" role="list">
                      {program.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start" role="listitem">
                          <div className="bg-green-100 dark:bg-green-900/30 p-0.5 rounded-full mr-3 mt-1.5 flex-shrink-0">
                            <ChevronRight className="h-3 w-3 text-green-600 dark:text-green-400" aria-hidden="true" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700/50 pt-5">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                        <span className="text-xs">{program.duration}</span>
                      </div>
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                        <span className="text-xs">{program.groupSize}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                  <button
                    onClick={handleEnroll}
                    className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all duration-200 flex items-center justify-center group/btn font-semibold text-sm focus-visible"
                    aria-label={`Enroll in ${program.title} program`}
                  >
                    <span>Enroll Now</span>
                    <ArrowRight className="ml-2 h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Workshops */}
      <div className="section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Additional Workshops</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Flexible learning options to fit your schedule
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workshops.map((workshop, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft-md border border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${workshop.color} flex items-center justify-center mb-5`}>
                  <workshop.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{workshop.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{workshop.description}</p>
                <p className="text-primary-600 dark:text-primary-400 font-medium text-sm">{workshop.schedule}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Our Programs?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Experience the ChipuRobo advantage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start p-6 bg-white dark:bg-gray-800 rounded-xl shadow-soft-sm border border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-md"
              >
                <div className="flex-shrink-0 bg-primary-50 dark:bg-primary-900/30 p-2.5 rounded-xl">
                  <benefit.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-emerald-600 to-emerald-700 dark:from-primary-700 dark:to-emerald-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">
              Ready to Start Your Journey in Technology?
            </h2>
            <button
              onClick={handleEnroll}
              className="bg-white text-primary-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 text-lg font-semibold inline-flex items-center group hover:shadow-soft-xl"
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
