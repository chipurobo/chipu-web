import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, School, Rocket, Trophy, Users, Target } from 'lucide-react';

const FutureBuildersComingSoon = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2025-11-01T00:00:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const highlights = [
    {
      icon: School,
      title: '123 Schools',
      description: 'Nationwide reach across Kenya'
    },
    {
      icon: Users,
      title: 'Year-Long Journey',
      description: '6 terms of comprehensive learning'
    },
    {
      icon: Trophy,
      title: 'National Competition',
      description: 'Judged by CEMASTEA under KSEF'
    },
    {
      icon: Target,
      title: 'AI & Robotics',
      description: 'From basics to competition-ready'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-emerald-900 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center text-white/80 hover:text-white transition"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full text-white mb-8">
            <Calendar className="h-5 w-5 mr-3" />
            <span className="font-semibold">Registration Opens November 2025</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Future Builders
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-green-300 mb-8">
            Season 1: National AI & Robotics Competition
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Kenya's premier inclusive robotics program culminating in a national competition
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 mb-16 border border-white/20">
          <div className="flex items-center justify-center mb-8">
            <Clock className="h-8 w-8 text-green-300 mr-3" />
            <h3 className="text-2xl md:text-3xl font-bold text-white">Registration Opens In</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                {timeLeft.days}
              </div>
              <div className="text-green-300 font-semibold uppercase tracking-wide text-sm">
                Days
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                {timeLeft.hours}
              </div>
              <div className="text-green-300 font-semibold uppercase tracking-wide text-sm">
                Hours
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                {timeLeft.minutes}
              </div>
              <div className="text-green-300 font-semibold uppercase tracking-wide text-sm">
                Minutes
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                {timeLeft.seconds}
              </div>
              <div className="text-green-300 font-semibold uppercase tracking-wide text-sm">
                Seconds
              </div>
            </div>
          </div>
        </div>

        {/* Program Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center transform hover:scale-105 transition-transform duration-300"
            >
              <highlight.icon className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{highlight.title}</h3>
              <p className="text-white/80 text-sm">{highlight.description}</p>
            </div>
          ))}
        </div>

        {/* What to Expect */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 mb-16">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">What to Expect</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-bold text-green-300 mb-4">For Schools</h4>
              <ul className="space-y-3 text-white/90">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Complete robotics kits for your students
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Teacher training and ongoing support
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Structured curriculum aligned with CBC
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Access to national competition platform
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold text-green-300 mb-4">For Students</h4>
              <ul className="space-y-3 text-white/90">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Hands-on AI and robotics experience
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Python programming and computer vision
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Competition preparation and mentorship
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Certificates and recognition
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Notify Me Section */}
        <div className="bg-gradient-to-r from-primary-600 to-emerald-700 rounded-3xl p-8 md:p-12 text-center">
          <Rocket className="h-16 w-16 text-white mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-white mb-4">
            Want to Be Notified?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Contact us to express your interest and receive updates when registration opens
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold inline-flex items-center shadow-xl"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Express Interest
          </button>
        </div>

        {/* Learn More */}
        <div className="text-center mt-16">
          <button
            onClick={() => navigate('/program')}
            className="text-white/80 hover:text-white inline-flex items-center text-lg transition"
          >
            Learn more about the program
            <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FutureBuildersComingSoon;
