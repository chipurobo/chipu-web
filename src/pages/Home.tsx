import { useNavigate, Link } from 'react-router-dom';
import { Brain, Award, Users, Notebook as Robot, Code, School, Globe, Heart, Leaf, ArrowRight, Rocket, Recycle, Target } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const handleEnroll = () => {
    navigate('/register-2026');
  };

  const featuredPosts = [
    {
      id: '7',
      title: 'Inclusive AI & Robotics Bootcamps – November–December 2025',
      excerpt: 'Closing the year with impact: Over 130 students and 50 teachers trained in inclusive AI, robotics, and PET recycling across two weeks of national workshops.',
      image: '/img/blog/inclusive.jpg',
      category: 'Bootcamp Impact',
      icon: Brain
    },
    {
      id: 'august-bootcamp',
      title: 'August 2025 Microsoft ADC Bootcamp Success',
      excerpt: 'Over 150 learners and teachers participated in our intensive AI and Robotics bootcamp, building intelligent robots and exploring computer vision.',
      image: '/img/blog/inclusive2.jpg',
      category: 'Bootcamp',
      icon: Rocket
    },
    {
      id: 'pet-recycling',
      title: 'From Waste to Innovation: PET Recycling Initiative',
      excerpt: 'Our PET recycling machines are transforming plastic waste into 3D printing filament, creating robot parts while empowering communities.',
      image: '/img/blog/inclusive3.jpeg',
      category: 'Sustainability',
      icon: Recycle
    }
  ];

  const partners = [
    {
      name: "eKitabu",
      role: "LMS platform integration and inclusive learning content distribution",
    },
    {
      name: "Microsoft ADC",
      role: "Technical enablement, AI learning resources, and mentorship programs",
    },
    {
      name: "Raspberry Pi Foundation",
      role: "Code Clubs program, hardware support, and computing education framework",
    },
    {
      name: "CEMASTEA",
      role: "KSEF alignment, teacher training, and curriculum validation",
    }
  ];

  const stats = [
    { icon: Users, value: "800+", label: "Learners Reached in 2025" },
    { icon: Code, value: "66", label: "Active Code Clubs" },
    { icon: Recycle, value: "13", label: "PET Recycling Machines" },
    { icon: School, value: "3", label: "National Bootcamps" }
  ];

  const aiFeatures = [
    {
      icon: Globe,
      title: "African AI Solutions",
      description: "Develop AI solutions through sustainable digital fabrication, inclusive learning systems, and locally-relevant automation technologies."
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
      title: "♻️ Sustainable Innovation & Manufacturing",
      description: "KSEF science projects developed PET recycling machines converting plastic waste into 3D printing filament for ADC Bootcamp prototyping sessions",
      impact: "13 machines deployed + youth entrepreneurship programs launched"
    },
    {
      title: "🎓 Inclusive & Accessible AI Education",
      description: "Hackathon teams created robotics kits with Braille labels, JSS program videos with KSL integration, and AI programs specifically designed for deaf, blind, and neurodiverse learners",
      impact: "Ensuring no learner is left behind in AI education"
    },
    {
      title: "🤖 Real-World Automation Applications",
      description: "KSEF research projects developed student-built robots that identify and sort classroom materials using computer vision through ADC Bootcamp community initiatives",
      impact: "From classroom learning to practical automation"
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
              Empowering 4 Million Youth Across Africa
            </h1>
            <div className="typing-container mb-8">
              <p className="typing-effect text-2xl md:text-3xl text-green-100 mx-auto">
                By 2030 through AI, Robotics, and Sustainable Innovation
              </p>
            </div>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Building on our transformative 2025 achievements - 800+ learners, 66 Code Clubs, 13 PET recycling machines.
              <br />
              <strong className="text-green-300">Join our 2026 rollout • CBC Aligned • Inclusive Design • Locally Fabricated</strong>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register-2026"
                className="group bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition text-lg font-semibold flex items-center justify-center shadow-lg"
              >
                <Rocket className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                REGISTER FOR 2026 PROGRAMME
              </Link>
              <Link
                to="/impact"
                className="group bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-lg hover:bg-white/20 transition text-lg font-semibold flex items-center justify-center"
              >
                <School className="mr-2 h-5 w-5" />
                VIEW IMPACT REPORT
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

      {/* 2025 Achievements Highlight */}
      <div className="section bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">2025: A Year of Transformation</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Partnership with Microsoft ADC enabled unprecedented growth and impact across Kenya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2 dyslexic-text">3</div>
              <div className="text-gray-600 dark:text-gray-300 mb-1 dyslexic-text">National Bootcamps</div>
              <div className="text-sm text-gray-500 dyslexic-text">April, August, Nov-Dec</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2 dyslexic-text">800+</div>
              <div className="text-gray-600 dark:text-gray-300 mb-1 dyslexic-text">Students Trained</div>
              <div className="text-sm text-gray-500 dyslexic-text">50+ teachers included</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2 dyslexic-text">66</div>
              <div className="text-gray-600 dark:text-gray-300 mb-1 dyslexic-text">Code Clubs Active</div>
              <div className="text-sm text-gray-500 dyslexic-text">Raspberry Pi partnership</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2 dyslexic-text">13</div>
              <div className="text-gray-600 dark:text-gray-300 mb-1 dyslexic-text">PET Machines Deployed</div>
              <div className="text-sm text-gray-500 dyslexic-text">Sustainable innovation</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Microsoft ADC Partnership Impact</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Technical enablement, AI learning resources, and mentorship that made 2025 our most successful year yet
            </p>
            <Link
              to="/impact"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-semibold inline-flex items-center"
            >
              <Award className="mr-2 h-5 w-5" />
              View Full Impact Report
            </Link>
          </div>
        </div>
      </div>

      {/* African AI Impact Section */}
      <section 
        className="section bg-gradient-to-r from-gray-900 to-primary-900 dark:from-black dark:to-primary-950 text-white"
        aria-labelledby="ai-ecosystem-title"
      >
        <div className="container">
          <div className="text-center mb-16">
            <Globe className="h-16 w-16 text-green-400 mx-auto mb-6 animate-pulse" aria-hidden="true" />
            <h2 id="ai-ecosystem-title" className="text-4xl font-bold mb-6 dyslexic-text">
              A Pan-African Innovation Ecosystem
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto dyslexic-text">
              We're not just teaching robotics — we're building Africa's innovation ecosystem, connecting learners, teachers, and innovators across the continent through AI-driven education.
            </p>
          </div>

          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-white mb-8 dyslexic-text">
              Real-World AI Applications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {africanAIUseCase.map((useCase, index) => {
                const colorClasses = [
                  { bg: 'bg-emerald-500/20', border: 'border-emerald-400/30 hover:border-emerald-400/50', text: 'text-emerald-400', dot: 'bg-emerald-400' },
                  { bg: 'bg-blue-500/20', border: 'border-blue-400/30 hover:border-blue-400/50', text: 'text-blue-400', dot: 'bg-blue-400' },
                  { bg: 'bg-purple-500/20', border: 'border-purple-400/30 hover:border-purple-400/50', text: 'text-purple-400', dot: 'bg-purple-400' }
                ];
                const colors = colorClasses[index % colorClasses.length];
                return (
                  <article 
                    key={index} 
                    className={`${colors.bg} backdrop-blur-lg p-8 rounded-xl border ${colors.border} transition-all duration-300 hover:scale-105`}
                    aria-labelledby={`ai-usecase-title-${index}`}
                  >
                    <div className="flex items-center mb-6">
                      <div className={`w-4 h-4 ${colors.dot} rounded-full mr-3`} aria-hidden="true"></div>
                      <h4 id={`ai-usecase-title-${index}`} className="text-xl font-semibold text-white dyslexic-text">
                        {useCase.title}
                      </h4>
                    </div>
                    <p className="text-gray-300 mb-6 dyslexic-text">
                      {useCase.description}
                    </p>
                    <div className="bg-white/10 px-4 py-3 rounded-lg border border-white/20">
                      <p className={`${colors.text} font-medium text-sm dyslexic-text`}>
                        <span className="sr-only">Impact: </span>{useCase.impact}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-center text-white mb-8 dyslexic-text">
              AI Innovation Pillars
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {aiFeatures.map((feature, index) => (
                <article 
                  key={index} 
                  className="group bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition transform hover:-translate-y-2 duration-300 border border-white/20 hover:border-white/30"
                  aria-labelledby={`ai-feature-title-${index}`}
                >
                  <div className="bg-green-500/20 p-4 rounded-lg w-fit mb-6">
                    <feature.icon className="h-12 w-12 text-green-400 group-hover:animate-bounce" aria-hidden="true" />
                  </div>
                  <h4 id={`ai-feature-title-${index}`} className="text-xl font-semibold mb-3 text-white dyslexic-text">
                    {feature.title}
                  </h4>
                  <p className="text-gray-300 dyslexic-text">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                  Empowering 4 million youth across Africa by 2030 through inclusive, hands-on AI and robotics education with locally fabricated solutions and sustainable innovation.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-lg text-gray-600 dark:text-gray-400 italic">
                "Our 2025 achievements - 800+ learners, 66 Code Clubs, 13 PET recycling machines - are just the beginning. By 2030, we'll empower 4 million youth across Africa with inclusive AI and robotics education."
              </p>
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-900 dark:text-white">Kevin Irungu</p>
                <p className="text-gray-600 dark:text-gray-300">Co-founder & Technical Lead</p>
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
          <div className="relative overflow-hidden">
            <div className="flex gap-8 animate-scroll">
              {[...partners, ...partners].map((partner, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 border-l-4 border-primary-600 flex-shrink-0 w-80"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 dyslexic-text">{partner.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 dyslexic-text">{partner.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-emerald-700 dark:from-primary-700 dark:to-emerald-800 py-24">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative container text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready for 2026?
          </h2>
          <p className="text-xl text-white/90 mb-6 max-w-3xl mx-auto">
            AI & Robotics Programme Registration Now Open
          </p>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join our mission to empower 4 million youth across Africa by 2030 • Building on our transformative 2025 achievements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleEnroll}
              className="group bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold flex items-center justify-center shadow-lg"
            >
              <School className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              Register for 2026 Programme
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