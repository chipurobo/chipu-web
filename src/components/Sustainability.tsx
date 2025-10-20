import React from 'react';
import { Recycle, Factory, Zap, Leaf, Users, Heart, Globe, ArrowRight, Package, Cpu, Sparkles } from 'lucide-react';

const Sustainability = () => {
  const processSteps = [
    {
      icon: Package,
      title: "PET Waste Collection",
      description: "We collect plastic bottles from communities, keeping waste out of landfills and waterways"
    },
    {
      icon: Factory,
      title: "Recycling & Processing",
      description: "Our PET recycling machines transform waste plastic into high-quality 3D printing filament"
    },
    {
      icon: Sparkles,
      title: "3D Printing & Fabrication",
      description: "The recycled filament is used to create robot parts, enclosures, and mechanical components"
    },
    {
      icon: Cpu,
      title: "Innovation & Learning",
      description: "Students learn with robots built from recycled materials, completing the sustainability cycle"
    }
  ];

  const impact = [
    {
      icon: Recycle,
      metric: "2 Machines",
      label: "PET recycling machines operating in Kenya & Nigeria"
    },
    {
      icon: Leaf,
      metric: "Tons",
      label: "Of plastic waste diverted from environment"
    },
    {
      icon: Users,
      metric: "Communities",
      label: "Empowered through sustainable manufacturing"
    },
    {
      icon: Globe,
      metric: "Pan-African",
      label: "Expansion to more countries underway"
    }
  ];

  const benefits = [
    {
      icon: Leaf,
      title: "Environmental Protection",
      description: "Reducing plastic pollution while creating valuable resources for education and innovation"
    },
    {
      icon: Users,
      title: "Community Empowerment",
      description: "Creating opportunities for youth and women in STEM manufacturing and entrepreneurship"
    },
    {
      icon: Zap,
      title: "Local Innovation",
      description: "Building Africa's capacity for sustainable, locally-fabricated technology solutions"
    },
    {
      icon: Heart,
      title: "Accessible Education",
      description: "Making robotics education more affordable through locally-sourced, recycled materials"
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 dark:from-green-700 dark:to-emerald-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:30px_30px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Recycle className="h-20 w-20 text-white mx-auto mb-6 animate-spin-slow" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              From Waste to Innovation
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Transforming plastic waste into educational tools while empowering communities and protecting our environment
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Sustainability Meets Education
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            At ChipuRobo, we believe innovation and sustainability go hand in hand. Our PET recycling initiative transforms plastic waste into 3D printing filament, creating the very robot parts our students use to learn. This closes the loop between environmental responsibility and technological education, while creating economic opportunities for communities.
          </p>
        </div>

        {/* The Process */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            The Recycling Cycle
          </h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-16">
            From plastic bottles to intelligent robots
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl font-bold text-green-200 dark:text-green-900/30">
                      0{index + 1}
                    </span>
                    <step.icon className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-green-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 mb-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Our Environmental Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impact.map((item, index) => (
              <div key={index} className="text-center">
                <item.icon className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{item.metric}</p>
                <p className="text-gray-600 dark:text-gray-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Triple Bottom Line Impact
          </h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-16">
            Environmental, social, and economic benefits for communities
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <benefit.icon className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fabrication Lab */}
        <div className="bg-gradient-to-r from-gray-900 to-green-900 dark:from-black dark:to-green-950 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-12">
            <div>
              <Factory className="h-12 w-12 text-green-400 mb-6" />
              <h2 className="text-3xl font-bold text-white mb-6">
                Nairobi Railway Museum Fabrication Lab
              </h2>
              <p className="text-lg text-gray-200 mb-6">
                Our local fabrication lab at the historic Nairobi Railway Museum serves as the hub for our sustainable manufacturing operations. Here, we:
              </p>
              <ul className="space-y-4 text-gray-200">
                <li className="flex items-start">
                  <Recycle className="h-6 w-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Process recycled PET plastic into high-quality filament</span>
                </li>
                <li className="flex items-start">
                  <Sparkles className="h-6 w-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span>3D print custom robot parts and educational tools</span>
                </li>
                <li className="flex items-start">
                  <Users className="h-6 w-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Train youth and women in sustainable manufacturing</span>
                </li>
                <li className="flex items-start">
                  <Globe className="h-6 w-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span>Support schools and communities with locally-made kits</span>
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-green-500/20 rounded-full animate-pulse"></div>
                <Factory className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pan-African Expansion */}
      <div className="bg-gray-50 dark:bg-gray-800 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Globe className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Expanding Across Africa
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our PET recycling initiative is going continental. We've shipped machines and kits to Nigeria through ZeeTech Foundation, with partnerships developing across universities and makerspaces throughout Africa.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg text-center">
              <div className="text-4xl mb-4">🇰🇪</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Kenya</h3>
              <p className="text-gray-600 dark:text-gray-300">Operating fabrication lab and training programs</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg text-center">
              <div className="text-4xl mb-4">🇳🇬</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nigeria</h3>
              <p className="text-gray-600 dark:text-gray-300">Pilot program with ZeeTech Foundation</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-300">Expanding to universities and makerspaces continent-wide</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 dark:bg-green-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join Our Sustainability Mission
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Whether you're a school, community organization, or partner, you can be part of our waste-to-innovation movement
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-green-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold inline-flex items-center justify-center"
            >
              <Heart className="mr-2 h-5 w-5" />
              Partner With Us
            </a>
            <a
              href="/enroll"
              className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-lg hover:bg-white/20 transition text-lg font-semibold inline-flex items-center justify-center"
            >
              <Leaf className="mr-2 h-5 w-5" />
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sustainability;
