import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, Building2, Award, Users, Trophy, Camera, Notebook as Robot, Cpu, Lightbulb, Code, GraduationCap, School, Zap, BrainCircuit as Circuit, Ship as Chip, Globe, Heart, Leaf, ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const Home = () => {
  const navigate = useNavigate();

  const handleEnroll = () => {
    navigate('/enroll');
  };

  const featuredPosts = [
    {
      id: '1',
      title: 'Revolutionizing African Agriculture with AI-Powered Robotics',
      excerpt: 'How our students are developing autonomous farming solutions to address food security challenges in East Africa.',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42',
      category: 'Agriculture'
    },
    {
      id: '2',
      title: 'Building AI Solutions for Local Healthcare Challenges',
      excerpt: 'Exploring how our AI programs are helping develop innovative healthcare solutions for rural communities.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
      category: 'Healthcare'
    },
    {
      id: '3',
      title: 'The Rise of African Tech Innovation',
      excerpt: "How young African innovators are leading the continent's technological revolution through robotics and AI.",
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998',
      category: 'Innovation'
    }
  ];

  const partners = [
    {
      name: "KIRDI",
      logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9",
    },
    {
      name: "KII",
      logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9",
    },
    {
      name: "World Bank",
      logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9",
    },
    {
      name: "Partner 4",
      logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9",
    }
  ];

  const stats = [
    { icon: Users, value: "8,000+", label: "Students Trained" },
    { icon: School, value: "20+", label: "Schools Reached" },
    { icon: Robot, value: "100+", label: "African AI Solutions" }
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
    <div className="bg-gray-100 dark:bg-gray-900">
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
            <h1 className="text-6xl font-bold text-white mb-8">
              African AI Innovation Hub
            </h1>
            <div className="typing-container mb-8">
              <p className="typing-effect text-2xl text-green-100 mx-auto">
                Building Africa's future through AI innovation and local talent
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleEnroll}
                className="group bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 transition text-lg font-semibold flex items-center justify-center"
              >
                <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                START YOUR AI JOURNEY
              </button>
              <button 
                onClick={handleEnroll}
                className="group bg-white/10 backdrop-blur-lg text-green-400 px-8 py-4 rounded-lg hover:bg-white/20 transition text-lg font-semibold flex items-center justify-center"
              >
                <Chip className="mr-2 h-5 w-5 group-hover:animate-spin" />
                JOIN AI COHORT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Blog Posts */}
      <div className="section bg-gray-100 dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Latest AI Insights</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Discover how AI is transforming Africa</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredPosts.map((post) => (
              <Link 
                key={post.id}
                to={`/blog/${post.id}`}
                className="group"
              >
                <article className="card overflow-hidden h-full transform transition duration-300 group-hover:scale-105">
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
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center text-primary-600 dark:text-primary-400">
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
            <Circuit className="h-16 w-16 text-green-400 mx-auto mb-6 animate-spin-slow" />
            <h2 className="text-4xl font-bold mb-6">AI for African Development</h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              We're pioneering AI solutions that address unique African challenges while celebrating our rich cultural heritage and innovative spirit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {africanAIUseCase.map((useCase, index) => (
              <div key={index} className="card bg-white/10 backdrop-blur-lg p-6 rounded-lg hover:bg-white/20 transition">
                <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                <p className="text-gray-300 mb-4">{useCase.description}</p>
                <p className="text-green-400 font-medium">{useCase.impact}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="group bg-white/10 backdrop-blur-lg rounded-lg p-6 hover:bg-white/20 transition transform hover:-translate-y-2 duration-300">
                <feature.icon className="h-12 w-12 text-green-400 mb-4 group-hover:animate-bounce" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="card p-8 text-center transform hover:scale-105 transition duration-300">
                <stat.icon className="h-12 w-12 text-primary-600 dark:text-primary-400 mx-auto mb-4 animate-float" />
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
                <p className="text-xl text-gray-600 dark:text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quote Section */}
      <div className="section bg-gray-200 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-12">
            <blockquote className="text-3xl font-light italic text-gray-700 dark:text-gray-300 leading-relaxed animate-float">
              "Africa's future lies in harnessing AI technology to solve our unique challenges. By training the next generation of AI innovators, we're not just participating in the global AI revolution - we're leading it with solutions that reflect our values, culture, and aspirations."
            </blockquote>
            <div className="mt-8">
              <p className="text-xl font-medium text-gray-900 dark:text-white">Anthony Mwangi</p>
              <p className="text-gray-600 dark:text-gray-400">Founder & Lead AI Instructor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="section">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">Our Partners in Innovation</h2>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            className="py-8"
          >
            {partners.map((partner, index) => (
              <SwiperSlide key={index}>
                <div className="card p-8 transform hover:scale-105 transition duration-300">
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="h-24 object-contain mx-auto"
                  />
                  <p className="text-center mt-4 text-gray-600 dark:text-gray-300">{partner.name}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 dark:bg-green-700 py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Join Africa's AI Revolution
          </h2>
          <button 
            onClick={handleEnroll}
            className="group bg-white text-green-600 dark:text-green-700 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold flex items-center justify-center mx-auto"
          >
            <Robot className="mr-2 h-5 w-5 group-hover:animate-spin" />
            Start Your Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;