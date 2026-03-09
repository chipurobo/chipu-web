import { useNavigate } from 'react-router-dom';
import { Rocket, Calendar, Users, Award, Code, Brain, Eye, Target, CheckCircle, BookOpen, Beaker, Lightbulb, Search, Presentation } from 'lucide-react';

const KSEF = () => {
  const navigate = useNavigate();

  const handleEnroll = () => {
    navigate('/register-2026');
  };

  const researchPathway = [
    {
      phase: "January - Project Planning",
      title: "Research Question & Project Design",
      description: "Develop scientific questions and design research methodology for KSEF projects",
      topics: [
        "Identify science or engineering problems to investigate",
        "Formulate testable research questions and hypotheses",
        "Design experimental methodology and data collection plans",
        "Literature review and background research techniques"
      ],
      icon: Search,
      color: "from-blue-500 to-cyan-500"
    },
    {
      phase: "February-March - Research & Development",
      title: "Investigation & Experimentation",
      description: "Conduct research experiments and develop technological solutions",
      topics: [
        "Execute experimental protocols and collect data",
        "Build prototypes using robotics and technology",
        "Apply engineering design process for innovation",
        "Document findings and analyze results"
      ],
      icon: Beaker,
      color: "from-purple-500 to-pink-500"
    },
    {
      phase: "April - KSEF Exhibition",
      title: "Project Presentation & Competition",
      description: "Present research findings at school KSEF exhibitions before April holiday",
      topics: [
        "Prepare scientific posters and presentation materials",
        "Demonstrate working prototypes and technologies",
        "Present to CEMASTEA judges and science fair panels",
        "Compete for advancement to regional and national KSEF"
      ],
      icon: Presentation,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const ksefFeatures = [
    {
      icon: Beaker,
      title: "Scientific Method Focus",
      description: "Students learn proper research methodology, hypothesis testing, and scientific documentation aligned with KSEF standards"
    },
    {
      icon: Rocket,
      title: "Technology Innovation",
      description: "Apply robotics, AI, and engineering to solve real-world problems through technology-based research projects"
    },
    {
      icon: Award,
      title: "KSEF Competition Ready",
      description: "Projects designed to meet CEMASTEA judging criteria for school, regional, and national science fair competitions"
    },
    {
      icon: BookOpen,
      title: "Research Documentation",
      description: "Learn proper scientific writing, data analysis, and presentation skills for academic and competitive excellence"
    },
    {
      icon: Eye,
      title: "Mentor Guidance",
      description: "Expert mentorship from trained teachers and industry professionals throughout the research process"
    },
    {
      icon: Target,
      title: "Real Impact Projects",
      description: "Focus on projects addressing local challenges in agriculture, accessibility, sustainability, and community needs"
    }
  ];

  const projectCategories = [
    {
      title: "Science Research",
      description: "Investigate scientific phenomena using technology and data analysis",
      examples: [
        "Environmental monitoring using sensors",
        "Agricultural optimization with IoT devices",
        "Water quality analysis and purification systems",
        "Climate change impact studies"
      ],
      icon: Beaker,
      color: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30"
    },
    {
      title: "Engineering Design",
      description: "Solve problems through innovative engineering solutions",
      examples: [
        "Assistive technology for disabilities",
        "Renewable energy systems and devices",
        "Waste management and recycling innovations",
        "Transportation and infrastructure solutions"
      ],
      icon: Code,
      color: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30"
    },
    {
      title: "Robotics Experimentation",
      description: "Build and program robots to explore scientific concepts",
      examples: [
        "Agricultural robots for farming efficiency",
        "Medical robots for healthcare applications",
        "Environmental cleanup and monitoring robots",
        "Educational robots for learning enhancement"
      ],
      icon: Brain,
      color: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30"
    },
    {
      title: "Technology Innovation",
      description: "Develop new technologies to address community challenges",
      examples: [
        "Mobile apps for education and healthcare",
        "AI systems for pattern recognition and analysis",
        "Communication tools for underserved communities",
        "Digital solutions for local business challenges"
      ],
      icon: Lightbulb,
      color: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30"
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-700 dark:to-purple-800">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center bg-blue-400/20 backdrop-blur-lg px-4 py-2 rounded-full text-white mb-6">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-semibold dyslexic-text">Term 1: Science & Research Projects</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 dyslexic-text">
              KSEF Program
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-300 mb-6 dyslexic-text">
              Term 1 Science & Engineering Projects
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 dyslexic-text">
              Term 1 focused program supporting Junior and Senior students in preparing science and engineering research projects for KSEF exhibitions
            </p>
            <button
              onClick={handleEnroll}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold inline-flex items-center shadow-lg dyslexic-text"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Join KSEF Program 2026
            </button>
          </div>
        </div>
      </div>

      {/* Research Pathway */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Term 1 Research Journey
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Complete your research project during Term 1 — from initial question to KSEF exhibition before April holiday
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {researchPathway.map((phase, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${phase.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    {phase.phase}
                  </span>
                  <phase.icon className="h-8 w-8 text-gray-400 group-hover:text-blue-600 transition-colors" />
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

        {/* Project Categories */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Research Project Categories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose your area of investigation and innovation for KSEF competition
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projectCategories.map((category, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${category.color} rounded-xl p-8 border border-gray-200 dark:border-gray-700`}
              >
                <div className="flex items-center mb-6">
                  <category.icon className="h-8 w-8 text-gray-700 dark:text-gray-300 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{category.title}</h3>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-6">{category.description}</p>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Example Projects:</h4>
                  <ul className="space-y-2">
                    {category.examples.map((example, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="w-2 h-2 bg-gray-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Program Features */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 mb-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose KSEF Program?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ksefFeatures.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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

        {/* Competition Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              KSEF Competition Timeline
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Follow the path from local school exhibitions to national KSEF recognition
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">January - February</h4>
                  <p className="text-gray-600 dark:text-gray-300">Project planning and research question development</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">March</h4>
                  <p className="text-gray-600 dark:text-gray-300">Research execution and prototype development</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">April</h4>
                  <p className="text-gray-600 dark:text-gray-300">School-level KSEF exhibitions and presentations</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Post-April</h4>
                  <p className="text-gray-600 dark:text-gray-300">Regional and national KSEF competitions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What You'll Receive</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Research methodology training and guidance</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Access to technology tools and equipment</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Expert mentorship from trained educators</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Presentation skills and exhibition training</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">CEMASTEA-aligned judging preparation</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Certificate and recognition for participation</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-medium text-sm">
                Term 1 program open to both Junior and Senior secondary students. Complete your KSEF project before April holiday, with opportunity to advance to regional and national competitions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-900 dark:bg-black py-24 rounded-2xl">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <Beaker className="h-16 w-16 text-blue-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Innovate for KSEF?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the KSEF program and turn your scientific curiosity into competition-ready research projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleEnroll}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-semibold inline-flex items-center justify-center"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Register for KSEF Program
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-lg hover:bg-white/20 transition text-lg font-semibold inline-flex items-center justify-center"
              >
                <Users className="mr-2 h-5 w-5" />
                Get Program Information
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KSEF;