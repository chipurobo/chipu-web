import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, Award, Users, Notebook as Robot, Cpu, Code, GraduationCap, School, Zap, BrainCircuit as Circuit, Globe, Heart, Leaf, ArrowRight, Rocket, Recycle, MapPin, Target } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const Home = () => {
  const navigate = useNavigate();

  const handleEnroll = () => {
    navigate('/future-builders-registration');
  };

  const featuredPosts = [
    {
      id: 'august-bootcamp',
      title: 'August 2025 Microsoft ADC Bootcamp Success',
      excerpt: 'Over 150 learners and teachers participated in our intensive AI and Robotics bootcamp, building intelligent robots and exploring computer vision.',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
      category: 'Bootcamp',
      icon: Rocket
    },
    {
      id: 'pet-recycling',
      title: 'From Waste to Innovation: PET Recycling Initiative',
      excerpt: 'Our PET recycling machines are transforming plastic waste into 3D printing filament, creating robot parts while empowering communities.',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b',
      category: 'Sustainability',
      icon: Recycle
    },
    {
      id: 'code-clubs',
      title: '10 Code Clubs Launched Across Kenya',
      excerpt: 'In partnership with Raspberry Pi Foundation, we\'re bringing coding education to 123 schools by 2026, starting with 10 active clubs.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
      category: 'Education',
      icon: Code
    }
  ];

  const partners = [
    {
      name: "Microsoft ADC",
      role: "Technical enablement, mentorship, and AI learning integration",
    },
    {
      name: "eKitabu",
      role: "LMS platform, curriculum access, and inclusive learning distribution",
    },
    {
      name: "CEMASTEA",
      role: "Academic validation, KSEF coordination, and teacher training",
    },
    {
      name: "Raspberry Pi Foundation",
      role: "Code Clubs, hardware, and computing education",
    },
    {
      name: "Funkie Science",
      role: "Outreach, content production, and youth engagement",
    },
    {
      name: "Creptie School",
      role: "Early-stage pilot school and mentorship collaborator",
    }
  ];

  const stats = [
    { icon: Users, value: "350+", label: "Learners & Teachers Trained" },
    { icon: School, value: "15", label: "Schools Onboarded" },
    { icon: Code, value: "10", label: "Code Clubs Launched" },
    { icon: Recycle, value: "2", label: "PET Recycling Machines" }
  ];

  const aiFeatures = [
    {
      icon: Globe,
      title: "African AI Solutions",
      description: "Develop AI solutions tailored to African challenges and opportunities in agriculture, healthcare, and education."
    },
    {
      icon: Robot,
      title: "Local Innovation",
      description: "Create AI-powered robotics solutions using locally available resources and addressing regional needs."
    },
    {
      icon: Heart,
      title: "Community Impact",
      description: "Apply AI to solve real community challenges while preserving and enhancing African cultural values."
    },
    {
      icon: Leaf,
      title: "Sustainable Development",
      description: "Leverage AI for sustainable development goals while promoting environmental consciousness."
    }
  ];

  const africanAIUseCase = [
    {
      title: "Agriculture",
      description: "AI-powered crop disease detection using local farmer knowledge",
      impact: "Supporting small-scale farmers across East Africa"
    },
    {
      title: "Healthcare",
      description: "Remote medical diagnostics for rural communities",
      impact: "Bringing healthcare to underserved areas"
    },
    {
      title: "Education",
      description: "Multilingual AI tutoring in local languages",
      impact: "Making education accessible to all"
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0">
          <div className="relative h-full circuit-background">
            <div className="tech-ring"></div>
            <div className="tech-ring"></div>
            <div className="tech-ring"></div>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-block animate-float mb-8">
              <Robot className="h-24 w-24 text-green-400 mx-auto animate-pulse-slow" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              The Future is Built Here
            </h1>
            <div className="typing-container mb-8">
              <p className="typing-effect text-2xl md:text-3xl text-green-100 mx-auto">
                Equipping 4 Million Youth Through AI and Robotics
              </p>
            </div>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              From recycled plastic to intelligent machines. From classrooms to communities.
              <br />
              <strong className="text-green-300">Future Builders Season 1 — National AI & Robotics Competition begins soon.</strong>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleEnroll}
                className="group bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition text-lg font-semibold flex items-center justify-center shadow-lg"
              >
                <Rocket className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                REGISTER FOR SEASON 1
              </button>
              <Link
                to="/microsoft"
                className="group bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-lg hover:bg-white/20 transition text-lg font-semibold flex items-center justify-center"
              >
                <School className="mr-2 h-5 w-5" />
                VIEW BOOTCAMP HIGHLIGHTS
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Blog Posts */}
      <div className="section bg-white dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Latest From ChipuRobo</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Milestones from our Pan-African robotics movement</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredPosts.map((post) => (
              <Link 
                key={post.id}
                to={`/blog/${post.id}`}
                className="group"
              >
                <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full transform transition duration-300 group-hover:scale-105">
                  <div className="relative h-48">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm">
                        {post.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <post.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/blog"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-lg font-semibold"
            >
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* African AI Impact Section */}
      <div className="section bg-gradient-to-r from-gray-900 to-primary-900 dark:from-black dark:to-primary-950 text-white">
        <div className="container">
          <div className="text-center mb-16">
            <Globe className="h-16 w-16 text-green-400 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-bold mb-6">A Pan-African Innovation Ecosystem</h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              We're not just teaching robotics — we're building Africa's innovation ecosystem, connecting learners, teachers, and innovators across the continent through AI-driven education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {africanAIUseCase.map((useCase, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg p-6 rounded-lg hover:bg-white/20 transition">
                <h3 className="text-xl font-semibold mb-3 text-white">{useCase.title}</h3>
                <p className="text-gray-300 mb-4">{useCase.description}</p>
                <p className="text-green-400 font-medium">{useCase.impact}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="group bg-white/10 backdrop-blur-lg rounded-lg p-6 hover:bg-white/20 transition transform hover:-translate-y-2 duration-300">
                <feature.icon className="h-12 w-12 text-green-400 mb-4 group-hover:animate-bounce" />
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="section bg-white dark:bg-gray-900">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center transform hover:scale-105 transition duration-300">
                <stat.icon className="h-12 w-12 text-primary-600 dark:text-primary-400 mx-auto mb-4 animate-float" />
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
                <p className="text-xl text-gray-600 dark:text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="section bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 p-12 rounded-lg shadow-lg border-l-4 border-primary-600">
            <div className="flex items-start gap-4 mb-6">
              <Target className="h-12 w-12 text-primary-600 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
                <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                  Making technology accessible, inclusive, and locally built. From Nairobi to the continent, we're shaping the next generation of African engineers, innovators, and creators.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-lg text-gray-600 dark:text-gray-400 italic">
                "We're establishing ChipuRobo as a Pan-African Robotics Movement — connecting communities through hands-on learning, sustainable innovation, and inclusive STEM education."
              </p>
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-900 dark:text-white">Anthony Mwangi</p>
                <p className="text-gray-600 dark:text-gray-300">Founder & Lead Instructor</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="section bg-white dark:bg-gray-900">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">Together We Build</h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-16">Our partners in creating Africa's innovation ecosystem</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 border-l-4 border-primary-600"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{partner.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{partner.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-emerald-700 dark:from-primary-700 dark:to-emerald-800 py-24">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative container text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Future Builders Season 1
          </h2>
          <p className="text-xl text-white/90 mb-6 max-w-3xl mx-auto">
            National AI & Robotics Competition
          </p>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Registration Opens November 2025 • Let's build the future together — one school, one robot, one idea at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleEnroll}
              className="group bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold flex items-center justify-center shadow-lg"
            >
              <School className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              Register Your School
            </button>
            <Link
              to="/about"
              className="group bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-lg hover:bg-white/20 transition text-lg font-semibold flex items-center justify-center"
            >
              <Heart className="mr-2 h-5 w-5" />
              Learn More About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;