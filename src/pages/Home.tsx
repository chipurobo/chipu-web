import { Link } from 'react-router-dom';
import { Brain, Award, Users, Notebook as Robot, Code, School, Globe, Heart, Leaf, ArrowRight, Rocket, Recycle, Target, Calendar } from 'lucide-react';

const Home = () => {

  const featuredPosts = [
    {
      id: '7',
      title: 'Inclusive AI & Robotics Bootcamps – November–December 2025',
      excerpt: 'Trained 130 students and 50 teachers in inclusive AI, robotics, and PET recycling workshops.',
      image: '/img/blog/inclusive.jpg',
      category: 'Bootcamp Impact',
      icon: Brain
    },
    {
      id: 'august-bootcamp',
      title: 'August 2025 Microsoft ADC Bootcamp Success',
      excerpt: '150+ learners and teachers built AI-powered robots and explored computer vision at Microsoft ADC.',
      image: '/img/blog/inclusive2.jpg',
      category: 'Bootcamp',
      icon: Rocket
    },
    {
      id: 'pet-recycling',
      title: 'From Waste to Innovation: PET Recycling Initiative',
      excerpt: 'PET recycling machines turn waste into 3D-printable robot parts while funding community programs.',
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
      title: "Sustainable Innovation & Manufacturing",
      description: "KSEF teams built PET recycling machines that supply filament for ADC bootcamp prototypes.",
      impact: "13 machines deployed plus youth micro-enterprises."
    },
    {
      title: "Inclusive & Accessible AI Education",
      description: "Hackathon projects delivered Braille kits, KSL videos, and neurodiverse-friendly AI lessons.",
      impact: "Every learner can engage with robotics."
    },
    {
      title: "Real-World Automation Applications",
      description: "Students now design robots that sort materials with computer vision and solve campus tasks.",
      impact: "Class concepts move straight into automation."
    }
  ];

  const useCaseIcons = [Recycle, Brain, Robot];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section — Light, editorial style */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-900">
        {/* Decorative rings */}
        <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-[500px] h-[500px] hidden lg:block" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border-[3px] border-emerald-500/20" />
          <div className="absolute inset-6 rounded-full border-[3px] border-primary-500/20" />
          <div className="absolute inset-12 rounded-full border-[3px] border-emerald-600/15" />
          <div className="absolute inset-[4.5rem] rounded-full border-[3px] border-primary-400/10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text */}
            <div>
              <div className="inline-flex items-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 px-4 py-2 rounded-full text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
                <Robot className="h-4 w-4 mr-2" aria-hidden="true" />
                AI &amp; Robotics Education in Africa
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                <span className="text-gray-900 dark:text-white">Empowering </span>
                <span className="text-primary-600 dark:text-primary-400">4 Million Youth</span>
                <span className="text-gray-900 dark:text-white"> Across Africa</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-4 max-w-xl leading-relaxed">
                By 2030 through hands-on AI, robotics, and sustainable innovation — CBC aligned, inclusive, and locally fabricated.
              </p>
              <p className="text-base text-gray-500 dark:text-gray-500 mb-8 max-w-lg">
                2025 delivered 800+ learners, 66 Code Clubs, and 13 PET recycling machines across Kenya.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/ksef"
                  className="group bg-primary-600 text-white px-7 py-3.5 rounded-xl hover:bg-primary-700 transition-all duration-200 text-base font-semibold inline-flex items-center justify-center shadow-lg hover:shadow-soft-xl"
                >
                  KSEF 2026
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/impact"
                  className="group text-gray-700 dark:text-gray-300 px-7 py-3.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-base font-semibold inline-flex items-center justify-center border border-gray-300 dark:border-gray-700"
                >
                  <School className="mr-2 h-5 w-5" />
                  View Impact Report
                </Link>
              </div>
            </div>

            {/* Right — Image collage */}
            <div className="relative hidden sm:block">
              {/* Background decorative card */}
              <div className="absolute inset-4 bg-gray-100 dark:bg-gray-800 rounded-2xl -rotate-3" aria-hidden="true" />

              {/* Main image */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-soft-xl">
                <img
                  src="/img/blog/inclusive.jpg"
                  alt="Students building robots at a ChipuRobo bootcamp"
                  className="w-full h-[340px] sm:h-[400px] object-cover"
                />
              </div>

              {/* Floating top-right image */}
              <div className="absolute -top-6 -right-4 z-20 w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-soft-lg border-4 border-white dark:border-gray-900 rotate-3">
                <img
                  src="/img/blog/inclusive2.jpg"
                  alt="AI robotics workshop in progress"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating bottom-right image */}
              <div className="absolute -bottom-6 -right-2 z-20 w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-soft-lg border-4 border-white dark:border-gray-900 -rotate-2">
                <img
                  src="/img/blog/inclusive3.jpeg"
                  alt="Students with PET recycling machine"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Stats badge */}
              <div className="absolute bottom-8 -left-6 z-30 bg-white dark:bg-gray-800 rounded-xl shadow-soft-lg px-5 py-4 border border-gray-100 dark:border-gray-700/50">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">800+</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Learners in 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-gray-900 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-7 w-7 text-emerald-400 mx-auto mb-3" aria-hidden="true" />
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Blog Posts */}
      <div className="section-alt">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Latest From ChipuRobo</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Fresh wins from across our Pan-African robotics movement.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group"
              >
                <article className="bg-white dark:bg-gray-800 rounded-xl shadow-soft-md border border-gray-100 dark:border-gray-700/50 overflow-hidden h-full transform transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide">
                        {post.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                      <post.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium text-sm group-hover:text-primary-700 dark:group-hover:text-primary-300">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/blog"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-lg font-semibold transition-colors"
            >
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2025 Achievements Highlight */}
      <div className="section bg-white dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">2025: A Year of Transformation</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The Microsoft ADC partnership unlocked national reach and tangible student outcomes.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700/50 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">3</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">National Bootcamps</div>
              <div className="text-xs text-gray-500">April, August, Nov-Dec</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700/50 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">800+</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Students Trained</div>
              <div className="text-xs text-gray-500">50+ teachers included</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700/50 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">66</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Code Clubs Active</div>
              <div className="text-xs text-gray-500">Raspberry Pi partnership</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700/50 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">13</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">PET Machines Deployed</div>
              <div className="text-xs text-gray-500">Sustainable innovation</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-8 sm:p-10 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Microsoft ADC Partnership Impact</h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              ADC provided mentors, labs, and curriculum support for our 2025 surge.
            </p>
            <Link
              to="/impact"
              className="bg-white text-emerald-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold inline-flex items-center hover:shadow-soft-md"
            >
              <Award className="mr-2 h-5 w-5" />
              View Full Impact Report
            </Link>
          </div>
        </div>
      </div>

      {/* African AI Impact Section */}
      <section
        className="section bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/80 dark:from-black dark:to-primary-950 text-white"
        aria-labelledby="ai-ecosystem-title"
      >
        <div className="container">
          <div className="text-center mb-16">
            <Globe className="h-14 w-14 text-green-400 mx-auto mb-6 animate-pulse" aria-hidden="true" />
            <h2 id="ai-ecosystem-title" className="text-3xl sm:text-4xl font-bold mb-6">
              A Pan-African Innovation Ecosystem
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              We teach robotics while building Africa's innovation ecosystem through AI-driven education.
            </p>
          </div>

          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-white mb-10">
              Real-World AI Applications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {africanAIUseCase.map((useCase, index) => {
                const colorClasses = [
                  { bg: 'bg-emerald-500/10', border: 'border-emerald-400/20 hover:border-emerald-400/40', text: 'text-emerald-400', dot: 'bg-emerald-400' },
                  { bg: 'bg-green-500/10', border: 'border-green-400/20 hover:border-green-400/40', text: 'text-green-400', dot: 'bg-green-400' },
                  { bg: 'bg-teal-500/10', border: 'border-teal-400/20 hover:border-teal-400/40', text: 'text-teal-400', dot: 'bg-teal-400' }
                ];
                const colors = colorClasses[index % colorClasses.length];
                const Icon = useCaseIcons[index];
                return (
                  <article
                    key={index}
                    className={`${colors.bg} backdrop-blur-lg p-8 rounded-xl border ${colors.border} transition-all duration-300 hover:-translate-y-1`}
                    aria-labelledby={`ai-usecase-title-${index}`}
                  >
                    <div className="flex items-center mb-6">
                      <div className={`p-2 rounded-lg ${colors.bg} mr-3`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} aria-hidden="true" />
                      </div>
                      <h4 id={`ai-usecase-title-${index}`} className="text-lg font-semibold text-white">
                        {useCase.title}
                      </h4>
                    </div>
                    <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                      {useCase.description}
                    </p>
                    <div className="bg-white/5 px-4 py-3 rounded-lg border border-white/10">
                      <p className={`${colors.text} font-medium text-sm`}>
                        <span className="sr-only">Impact: </span>{useCase.impact}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-center text-white mb-10">
              AI Innovation Pillars
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiFeatures.map((feature, index) => (
                <article
                  key={index}
                  className="group bg-white/5 backdrop-blur-lg rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 border border-white/10 hover:border-white/20"
                  aria-labelledby={`ai-feature-title-${index}`}
                >
                  <div className="bg-green-500/10 p-3 rounded-xl w-fit mb-5">
                    <feature.icon className="h-10 w-10 text-green-400" aria-hidden="true" />
                  </div>
                  <h4 id={`ai-feature-title-${index}`} className="text-lg font-semibold mb-3 text-white">
                    {feature.title}
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <div className="section bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 dark:bg-gray-800 p-10 sm:p-14 rounded-2xl shadow-soft-lg border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-start gap-5 mb-8">
              <div className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-xl flex-shrink-0">
                <Target className="h-10 w-10 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Empowering 4 million youth across Africa by 2030 through inclusive, hands-on AI and robotics education with locally fabricated solutions and sustainable innovation.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 italic leading-relaxed">
                "Our 2025 achievements - 800+ learners, 66 Code Clubs, 13 PET recycling machines - are just the beginning. By 2030, we'll empower 4 million youth across Africa with inclusive AI and robotics education."
              </p>
              <div className="mt-5">
                <p className="font-semibold text-gray-900 dark:text-white">Kevin Irungu</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Co-founder & Technical Lead</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="section-alt">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">Together We Build</h2>
          <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">Our partners in creating Africa's innovation ecosystem</p>
          <div className="relative overflow-hidden">
            <div className="flex gap-6 animate-scroll">
              {[...partners, ...partners].map((partner, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-soft-sm border border-gray-100 dark:border-gray-700/50 hover:-translate-y-1 hover:shadow-soft-md transition-all duration-300 flex-shrink-0 w-80"
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{partner.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{partner.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-emerald-600 to-emerald-700 dark:from-primary-700 dark:to-emerald-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_70%)]" />
        <div className="relative container text-center py-24 sm:py-32">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            2026 Programmes Are Loading
          </h2>
          <p className="text-xl text-white/90 mb-4 max-w-3xl mx-auto">
            KSEF, bootcamps, hackathons, and Code Clubs — all expanding this year.
          </p>
          <p className="text-base text-white/70 mb-10 max-w-2xl mx-auto">
            Join our mission to empower 4 million youth across Africa by 2030 &bull; Building on our transformative 2025 achievements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/ksef"
              className="group bg-white text-primary-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-200 text-lg font-semibold flex items-center justify-center shadow-lg hover:shadow-soft-xl"
            >
              <Calendar className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              KSEF 2026 Countdown
            </Link>
            <Link
              to="/about"
              className="group bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-200 text-lg font-semibold flex items-center justify-center border border-white/20"
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
