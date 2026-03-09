import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Target, CheckCircle, Trophy, BookOpen, Monitor, Code, ArrowRight, Zap, Cpu, Wrench, Lightbulb } from 'lucide-react';

const ADCBootcamp = () => {
  const navigate = useNavigate();

  const handleContact = () => {
    navigate('/contact');
  };

  const bootcampPrograms = [
    {
      term: "April Holiday",
      title: "Spring Innovation Bootcamp",
      description: "Post-KSEF celebration and advanced technology exploration during April break",
      duration: "4 days",
      features: [
        "AI and computer vision experiments",
        "Advanced robotics building sessions",
        "Technology demonstration and showcase",
        "Hands-on learning with professional equipment"
      ],
      icon: Lightbulb,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900"
    },
    {
      term: "August Holiday",
      title: "Mid-Year Technology Intensive",
      description: "Advanced workshops and continued skill development",
      duration: "4 days",
      features: [
        "Technology exploration and experimentation",
        "Project development and refinement",
        "Collaborative learning experiences",
        "Professional mentorship and guidance"
      ],
      icon: Cpu,
      color: "from-blue-500 to-purple-500",
      bgColor: "from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
    },
    {
      term: "December Holiday",
      title: "Year-End Excellence Bootcamp",
      description: "Final advanced training and celebration of annual achievements",
      duration: "4 days",
      features: [
        "Advanced robotics workshops",
        "Year-end project development",
        "Community demonstrations",
        "Recognition and certification ceremony"
      ],
      icon: Trophy,
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900"
    }
  ];

  const bootcampFeatures = [
    {
      icon: Monitor,
      title: "Microsoft ADC Partnership",
      description: "All bootcamps hosted at Africa Data Centres in Westlands, providing access to professional technology infrastructure"
    },
    {
      icon: Code,
      title: "Hands-On Workshops",
      description: "Interactive learning sessions covering robotics, AI, computer vision, and advanced technology concepts"
    },
    {
      icon: Users,
      title: "Guided Building",
      description: "Expert-led construction and programming sessions with step-by-step guidance for all skill levels"
    },
    {
      icon: Zap,
      title: "Innovation Focus",
      description: "Emphasis on creative problem-solving, technology innovation, and real-world application development"
    },
    {
      icon: Target,
      title: "Skill Development",
      description: "Progressive learning that builds technical skills, collaboration abilities, and presentation confidence"
    },
    {
      icon: Trophy,
      title: "Competition & Collaboration",
      description: "Hackathon events that foster teamwork, innovation, and friendly competition among participants"
    }
  ];

  const adcInformation = [
    {
      category: "Location & Facilities",
      details: [
        "Africa Data Centres (ADC), Westlands, Nairobi",
        "Professional technology infrastructure and equipment",
        "State-of-the-art computing and networking facilities",
        "Dedicated workshop spaces for hands-on learning"
      ]
    },
    {
      category: "Program Structure",
      details: [
        "Morning workshop sessions (9:00 AM - 12:00 PM)",
        "Afternoon project work and building time",
        "Evening presentations and showcase sessions",
        "Lunch and refreshments provided each day"
      ]
    },
    {
      category: "Equipment & Materials",
      details: [
        "All robotics kits and electronic components provided",
        "Access to computers and programming environments",
        "3D printing and prototyping equipment available",
        "Take-home project materials included"
      ]
    },
    {
      category: "Supervision & Safety",
      details: [
        "Expert instructors and mentors throughout",
        "Trained facilitators for all age groups",
        "Safety protocols and supervised activities",
        "Certificate of participation for all attendees"
      ]
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
              <span className="font-semibold dyslexic-text">April • August • December ADC Bootcamps</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 dyslexic-text">
              ADC Bootcamp
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-purple-300 mb-6 dyslexic-text">
              Microsoft Africa Data Centres
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 dyslexic-text">
              Hands-on robotics and technology workshops hosted at Microsoft ADC throughout the year
            </p>
            <button
              onClick={handleContact}
              className="bg-white text-purple-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold inline-flex items-center shadow-lg dyslexic-text"
            >
              <Monitor className="mr-2 h-5 w-5" />
              Join ADC Bootcamp
            </button>
          </div>
        </div>
      </div>

      {/* ADC Bootcamp Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ADC Bootcamp Series
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Three intensive bootcamps throughout the year at Microsoft Africa Data Centres, providing hands-on robotics and technology training
          </p>
        </div>

        <div className="space-y-24">
          {bootcampPrograms.map((program, index) => (
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
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Bootcamp Highlights</h4>
                
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

      {/* ADC Partnership Information */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Microsoft ADC Partnership
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              All holiday programs are hosted at Africa Data Centres, providing world-class technology infrastructure for hands-on learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {adcInformation.map((info, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{info.category}</h3>
                <ul className="space-y-4">
                  {info.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Program Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Why Join Holiday Programs?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bootcampFeatures.map((feature, index) => (
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
            Join us for intensive hands-on learning experiences during school holidays. Each program combines workshops, hackathons, and collaboration at Microsoft ADC.
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

export default ADCBootcamp;