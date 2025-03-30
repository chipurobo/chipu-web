import React from 'react';
import { Brain, Building2, Award, Rocket, Users, Trophy, Camera, Notebook as Robot, Cpu, Lightbulb, Code, GraduationCap, School, Zap, BrainCircuit as Circuit, Ship as Chip } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const Home = () => {
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
    { icon: Robot, value: "100+", label: "Robots Built" }
  ];

  const aiFeatures = [
    {
      icon: Camera,
      title: "Object Detection",
      description: "Learn to implement real-time object detection using computer vision and machine learning."
    },
    {
      icon: Robot,
      title: "Raspberry Pi Robotics",
      description: "Build and program autonomous robots using Raspberry Pi and advanced sensors."
    },
    {
      icon: Code,
      title: "Python Programming",
      description: "Master Python programming for AI and robotics applications."
    },
    {
      icon: Lightbulb,
      title: "Practical Projects",
      description: "Apply your knowledge through hands-on projects and real-world applications."
    }
  ];

  return (
    <div>
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
              Chipurobo Center
            </h1>
            <p className="text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
              Empowering Africa's youth through innovative STEAM education and hands-on robotics training
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="group bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 transition text-lg font-semibold flex items-center justify-center">
                <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                SATURDAY TINKERING SESSION
              </button>
              <button className="group bg-white/10 backdrop-blur-lg text-green-400 px-8 py-4 rounded-lg hover:bg-white/20 transition text-lg font-semibold flex items-center justify-center">
                <Chip className="mr-2 h-5 w-5 group-hover:animate-spin" />
                JOIN COHORT 3
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Program Section */}
      <div className="bg-gradient-to-r from-gray-900 to-green-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Circuit className="h-16 w-16 text-green-400 mx-auto mb-6 animate-spin-slow" />
            <h2 className="text-4xl font-bold mb-6">Experience AI Program</h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Introducing our cutting-edge Object Tracking Robot course using Raspberry Pi. 
              Designed for both learners and educators, this program is your gateway to practical AI literacy.
            </p>
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

          <div className="mt-16 bg-white/10 backdrop-blur-lg rounded-lg p-8 transform hover:scale-105 transition duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Course Highlights</h3>
                <ul className="space-y-4">
                  <li className="flex items-start group">
                    <GraduationCap className="h-6 w-6 text-green-400 mr-3 mt-1 group-hover:animate-bounce" />
                    <span>Comprehensive AI and robotics curriculum designed for all skill levels</span>
                  </li>
                  <li className="flex items-start group">
                    <Cpu className="h-6 w-6 text-green-400 mr-3 mt-1 group-hover:animate-pulse" />
                    <span>Hands-on experience with Raspberry Pi and sensor integration</span>
                  </li>
                  <li className="flex items-start group">
                    <Brain className="h-6 w-6 text-green-400 mr-3 mt-1 group-hover:animate-spin" />
                    <span>Real-world applications of computer vision and machine learning</span>
                  </li>
                </ul>
              </div>
              <div className="text-center">
                <p className="text-2xl font-light mb-6">
                  "Join us in shaping the future of AI education in Africa"
                </p>
                <button className="group bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 transition text-lg font-semibold flex items-center justify-center mx-auto">
                  <Robot className="mr-2 h-5 w-5 group-hover:animate-spin" />
                  Learn More About AI Program
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center transform hover:scale-105 transition duration-300">
                <stat.icon className="h-12 w-12 text-green-600 mx-auto mb-4 animate-float" />
                <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-xl text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose ChipuRobo?</h2>
            <p className="text-xl text-gray-600">Discover the unique advantages of our program</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300">
              <Award className="h-12 w-12 mx-auto text-green-600 mb-4 animate-pulse-slow" />
              <h3 className="text-xl font-semibold mb-4">NITA Certified Excellence</h3>
              <p className="text-gray-600">
                Our robotics courses are designed to meet industry standards and come with NITA certification.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300">
              <Building2 className="h-12 w-12 mx-auto text-green-600 mb-4 animate-float" />
              <h3 className="text-xl font-semibold mb-4">5-Day Intensive Bootcamp</h3>
              <p className="text-gray-600">
                Gain practical skills through our immersive bootcamp experience designed for rapid learning.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300">
              <Brain className="h-12 w-12 mx-auto text-green-600 mb-4 animate-pulse-slow" />
              <h3 className="text-xl font-semibold mb-4">Future-Ready Skills</h3>
              <p className="text-gray-600">
                Master AI and robotics skills that are essential for the jobs of tomorrow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Section */}
      <div className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-3xl font-light italic text-gray-700 leading-relaxed animate-float">
            "As Africa is poised to contribute 25% of the global workforce by 2050, equipping our youth with AI and robotics skills is crucial to enable them to join the global workforce. Chipurobo is committed to transforming one person at a time, empowering the next generation of Robokids to become the drivers of Africa's technological revolution."
          </blockquote>
          <div className="mt-8">
            <p className="text-xl font-medium text-gray-900">Anthony Mwangi</p>
            <p className="text-gray-600">Founder & Lead Instructor</p>
          </div>
        </div>
      </div>

      {/* Partners Slider */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Our Partners</h2>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="py-8"
          >
            {partners.map((partner, index) => (
              <SwiperSlide key={index}>
                <div className="bg-white p-8 rounded-lg shadow-md transform hover:scale-105 transition duration-300">
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="h-24 object-contain mx-auto"
                  />
                  <p className="text-center mt-4 text-gray-600">{partner.name}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Ready to Start Your Journey in Robotics?
          </h2>
          <button className="group bg-white text-green-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold flex items-center justify-center mx-auto">
            <Robot className="mr-2 h-5 w-5 group-hover:animate-spin" />
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;