import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Target, CheckCircle, Trophy, BookOpen, Monitor, Code, ArrowRight, Zap, Cpu, Wrench, Lightbulb } from 'lucide-react';

const Hackathons = () => {
  const navigate = useNavigate();

  const handleContact = () => {
    navigate('/contact');
  };

  const hackathonPrograms = [
    {
      term: "April Holiday",
      title: "Post-KSEF Innovation Hackathon",
      description: "Celebrate KSEF achievements and build innovative technology solutions",
      duration: "3 days",
      features: [
        "Student teams work on robotics, AI, or software projects",
        "Organized and led by recent high school graduates",
        "Transition-to-university mentorship and guidance",
        "Project presentations and demonstrations"
      ],
      icon: Lightbulb,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900"
    },
    {
      term: "August Holiday",
      title: "Mid-Year Innovation Challenge",
      description: "Cross-program collaboration and advanced project development",
      duration: "3 days",
      features: [
        "Students design and prototype technology projects",
        "Cross-program collaboration between KSEF and JSS students",
        "Innovation and creative problem solving",
        "Peer-to-peer learning and mentorship"
      ],
      icon: Code,
      color: "from-blue-500 to-purple-500",
      bgColor: "from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
    },
    {
      term: "December Holiday",
      title: "Year-End Capstone Hackathon",
      description: "Showcase year-long learning and build capstone projects",
      duration: "3 days",
      features: [
        "Students build and present projects developed during the year",
        "Capstone project development and refinement",
        "Awards and recognition ceremony",
        "Community showcase and demonstration"
      ],
      icon: Trophy,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900"
    }
  ];

  const hackathonFeatures = [
    {
      icon: Code,
      title: "Collaborative Building",
      description: "Student teams work together on innovative robotics, AI, or software projects over intensive 3-day periods"
    },
    {
      icon: Users,
      title: "Graduate Leadership",
      description: "Events organized and led by recent high school graduates transitioning into university programs"
    },
    {
      icon: Lightbulb,
      title: "Innovation Focus",
      description: "Emphasis on creative problem-solving, rapid prototyping, and building functional technology solutions"
    },
    {
      icon: Target,
      title: "Skill Integration",
      description: "Apply knowledge from KSEF and JSS programs to create comprehensive, real-world projects"
    },
    {
      icon: Trophy,
      title: "Presentation & Recognition",
      description: "Project showcases, demonstrations, and awards ceremony celebrating student achievements"
    },
    {
      icon: Wrench,
      title: "Hands-On Development",
      description: "Rapid prototyping, iterative design, and collaborative development in team-based environment"
    }
  ];



  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-700 dark:from-purple-700 dark:to-blue-800">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center bg-purple-400/20 backdrop-blur-lg px-4 py-2 rounded-full text-white mb-6">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-semibold dyslexic-text">April • August • December Hackathons</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 dyslexic-text">
              Hackathons
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-purple-300 mb-6 dyslexic-text">
              Collaborative Build Events
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 dyslexic-text">
              Intensive 3-day collaborative build events where student teams create innovative technology projects
            </p>
            <button
              onClick={handleContact}
              className="bg-white text-purple-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold inline-flex items-center shadow-lg dyslexic-text"
            >
              <Monitor className="mr-2 h-5 w-5" />
              Join Hackathons
            </button>
          </div>
        </div>
      </div>

      {/* Hackathon Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Hackathon Series
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Three intensive 3-day build events throughout the year where student teams collaborate on innovative technology projects
          </p>
        </div>

        <div className="space-y-24">
          {hackathonPrograms.map((program, index) => (
            <div key={index} className={`bg-gradient-to-br ${program.bgColor} rounded-2xl p-12`}>
              <div className="text-center mb-12">
                <div className="inline-flex items-center mb-4">
                  <program.icon className="h-10 w-10 text-gray-700 dark:text-gray-300 mr-3" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{program.term}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {program.title}
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
                  {program.description}
                </p>
                <span className="inline-block bg-gray-700 text-white px-4 py-2 rounded-full font-semibold">
                  {program.duration}
                </span>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Hackathon Activities</h4>
                
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {program.features.map((feature, featIndex) => (
                    <li key={featIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ChipuRobo Workshop Location
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              All 2026 hackathons are hosted at our dedicated ChipuRobo workshop space
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Workshop Facilities</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">Dedicated ChipuRobo workshop environment</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">Collaborative workspace for team projects</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">All necessary equipment and materials provided</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">Comfortable learning environment for intensive sessions</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What's Provided</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">Meals and refreshments throughout the event</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">Expert mentorship and technical guidance</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">Project materials and components</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">Certificate of participation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Program Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Why Join Hackathons?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hackathonFeatures.map((feature, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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

      {/* Registration Information */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            How to Participate
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Holiday programs are open to all ChipuRobo participants and their schools. Registration opens before each holiday period.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Who Can Join</h3>
              <p className="text-gray-600 dark:text-gray-300">KSEF and JSS program participants, plus interested schools and individual students</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Registration</h3>
              <p className="text-gray-600 dark:text-gray-300">Opens 2-3 weeks before each holiday period via school coordination or direct registration</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">What's Included</h3>
              <p className="text-gray-600 dark:text-gray-300">All materials, meals, certification, and take-home project components</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContact}
              className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition text-lg font-semibold inline-flex items-center justify-center"
            >
              <Monitor className="mr-2 h-5 w-5" />
              Register for Programs
            </button>
            <button
              onClick={() => navigate('/about')}
              className="bg-white/10 backdrop-blur-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-lg font-semibold inline-flex items-center justify-center"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Learn More About ChipuRobo
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 dark:bg-black py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Wrench className="h-16 w-16 text-purple-500 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Build, Learn, Innovate
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join us for intensive collaborative hackathons at the ChipuRobo workshop. Build innovative projects with peers during school holidays.
          </p>
          <button
            onClick={handleContact}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition text-lg font-semibold inline-flex items-center justify-center shadow-lg"
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            Get Started with Holiday Programs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hackathons;