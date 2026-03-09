import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Target, CheckCircle, Clock, Trophy, BookOpen, Gamepad2, Zap, Cpu, Hammer, Building } from 'lucide-react';

const JSS = () => {
  const navigate = useNavigate();

  const cyberbrickProgram = [
    {
      phase: "Kit Introduction",
      title: "Cyberbrick Kit Components",
      description: "Learn about the modular building system and technical specifications",
      topics: [
        "Cyberbrick structural components and connectors",
        "Motor units and movement mechanisms", 
        "Basic sensor modules and control electronics",
        "Assembly tools and building techniques"
      ],
      icon: Building,
      color: "from-orange-500 to-red-500"
    },
    {
      phase: "Robot Construction",
      title: "Building Soccer Robots",
      description: "Construct simple robots optimized for soccer gameplay",
      topics: [
        "Chassis design for stability and maneuverability",
        "Wheel and motor configuration for movement",
        "Ball handling mechanisms and kicking systems",
        "Sensor placement for autonomous behaviors"
      ],
      icon: Hammer,
      color: "from-green-500 to-emerald-500"
    },
    {
      phase: "Programming & Competition",
      title: "Soccer Robotics League",
      description: "Program robot behaviors and compete in team-based soccer matches",
      topics: [
        "Basic programming for movement and navigation",
        "Sensor-based decision making algorithms",
        "Team strategy and collaborative play",
        "Tournament structure and competitive gameplay"
      ],
      icon: Gamepad2,
      color: "from-blue-500 to-purple-500"
    }
  ];

  const kitSpecifications = [
    {
      category: "Structural Components",
      items: [
        "Modular frame pieces (various lengths)",
        "Corner connectors and joint assemblies",
        "Mounting brackets for electronics",
        "Protective chassis panels"
      ],
      icon: Building,
      color: "bg-orange-100 dark:bg-orange-900/30"
    },
    {
      category: "Motors & Movement",
      items: [
        "DC geared motors with encoders",
        "Wheel assemblies and tire sets",
        "Motor mounting hardware",
        "Power distribution system"
      ],
      icon: Zap,
      color: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      category: "Electronics & Control",
      items: [
        "Microcontroller unit (programmable)",
        "Ultrasonic distance sensors",
        "Light sensors for line following",
        "Bluetooth module for remote control"
      ],
      icon: Cpu,
      color: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
      category: "Soccer-Specific Parts",
      items: [
        "Ball capture and kicking mechanisms",
        "Goal detection sensors",
        "Team identification markers", 
        "Competition-compliant components"
      ],
      icon: Gamepad2,
      color: "bg-green-100 dark:bg-green-900/30"
    }
  ];

  const programFeatures = [
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Students work in teams to design, build, and program their soccer robots, fostering teamwork and communication skills"
    },
    {
      icon: Target,
      title: "Engineering Thinking",
      description: "Hands-on experience with mechanical design, electronics integration, and problem-solving through iterative building"
    },
    {
      icon: Trophy,
      title: "Competitive League",
      description: "Soccer-style tournaments that encourage strategic thinking, sportsmanship, and continuous improvement"
    },
    {
      icon: BookOpen,
      title: "Educational Focus",
      description: "Structured learning that introduces fundamental robotics concepts through engaging and age-appropriate activities"
    },
    {
      icon: Zap,
      title: "Creativity & Innovation",
      description: "Open-ended challenges that allow students to express creativity while learning core STEM principles"
    },
    {
      icon: Clock,
      title: "Progressive Learning",
      description: "Step-by-step curriculum that builds from basic assembly to complex programming and strategic gameplay"
    }
  ];

  const leagueStructure = [
    {
      stage: "Team Formation",
      description: "Students form teams and receive Cyberbrick kits",
      duration: "Week 1",
      activities: ["Team assignments and introductions", "Kit inventory and component familiarization", "Basic assembly training", "Safety guidelines and workshop orientation"]
    },
    {
      stage: "Robot Design Phase",
      description: "Teams design and build their soccer robots",
      duration: "Weeks 2-4",
      activities: ["Chassis design and construction", "Motor integration and testing", "Sensor installation and calibration", "Initial programming and movement tests"]
    },
    {
      stage: "Programming & Testing",
      description: "Program robot behaviors and refine designs",
      duration: "Weeks 5-6",
      activities: ["Basic movement programming", "Sensor-based behaviors", "Team coordination strategies", "Practice matches and debugging"]
    },
    {
      stage: "Soccer League Tournament",
      description: "Competitive matches and final presentations",
      duration: "Weeks 7-8",
      activities: ["Round-robin tournament matches", "Elimination rounds", "Technical presentations", "Awards and recognition ceremony"]
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-700 dark:from-orange-700 dark:to-red-800">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center bg-orange-400/20 backdrop-blur-lg px-4 py-2 rounded-full text-white mb-6">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-semibold dyslexic-text">Term 2: Junior Secondary School Program</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 dyslexic-text">
              JSS Program
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-orange-300 mb-6 dyslexic-text">
              Cyberbrick Soccer Robotics League
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 dyslexic-text">
              Edutainment-focused robotics program introducing Junior Secondary students to technology through competitive soccer robotics
            </p>
            <div className="bg-white/10 backdrop-blur-lg px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center shadow-lg text-white">
              <Clock className="mr-2 h-5 w-5" />
              Coming Soon - JSS Program
            </div>
          </div>
        </div>
      </div>

      {/* Program Structure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Cyberbrick Learning Journey
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From kit components to competitive soccer — learn robotics through hands-on building and programming
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {cyberbrickProgram.map((phase, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${phase.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                    {phase.phase}
                  </span>
                  <phase.icon className="h-8 w-8 text-gray-400 group-hover:text-orange-600 transition-colors" />
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

        {/* Kit Specifications */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Cyberbrick Kit Specifications
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive robotics kit designed specifically for soccer robotics and educational engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {kitSpecifications.map((spec, index) => (
              <div
                key={index}
                className={`${spec.color} rounded-xl p-8 border border-gray-200 dark:border-gray-700`}
              >
                <div className="flex items-center mb-6">
                  <spec.icon className="h-8 w-8 text-gray-700 dark:text-gray-300 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{spec.category}</h3>
                </div>
                
                <ul className="space-y-3">
                  {spec.items.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-2 h-2 bg-gray-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Soccer League Structure */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Soccer Robotics League
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              8-week structured program culminating in competitive soccer tournaments
            </p>
          </div>

          <div className="space-y-8">
            {leagueStructure.map((stage, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stage.stage}</h3>
                        <span className="text-green-600 dark:text-green-400 font-semibold">{stage.duration}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">{stage.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stage.activities.map((activity, idx) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Program Features */}
        <div className="bg-gradient-to-br from-purple-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 mb-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose JSS Cyberbrick?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programFeatures.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
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

        {/* What Students Learn */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Learning Outcomes
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Through the Cyberbrick program, Junior Secondary students develop key STEM skills
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Basic engineering and mechanical design principles</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Introduction to programming and computational thinking</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Problem-solving through iterative design and testing</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Teamwork and collaborative project management</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Creative thinking and innovative solution development</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Early exposure to robotics and automation concepts</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Program Details</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Target Audience</h4>
                  <p className="text-gray-600 dark:text-gray-300">Junior Secondary School students (ages 12-15)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Duration</h4>
                  <p className="text-gray-600 dark:text-gray-300">8-week program during Term 2</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Culmination</h4>
                  <p className="text-gray-600 dark:text-gray-300">Soccer Robotics League tournament and celebration</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <p className="text-orange-800 dark:text-orange-200 font-medium text-sm">
                Term 2 program specifically designed for Junior Secondary School students. Focuses on edutainment approach to introduce robotics concepts through engaging soccer competition.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-900 dark:bg-black py-24 rounded-2xl">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <Gamepad2 className="h-16 w-16 text-orange-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Exciting Program Coming Soon!
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              The JSS Cyberbrick Soccer Robotics League will be launching soon. Stay tuned for program details and registration information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center">
                <Clock className="mr-2 h-5 w-5" />
                Program Coming Soon
              </div>
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

export default JSS;