import { Link, useNavigate } from 'react-router-dom';
import { Users, Recycle, Code, GraduationCap, Eye, Brain, MapPin, Calendar, Download, ExternalLink } from 'lucide-react';

const Impact = () => {
  const navigate = useNavigate();

  const downloadImpactData = () => {
    const rows: string[][] = [
      ['ChipuRobo Impact Report'],
      ['Microsoft ADC Partnership — National AI & Robotics Program'],
      [],
      ['=== KEY ACHIEVEMENTS ==='],
      ['Metric', 'Description', 'Details'],
      ['3 National Bootcamps', 'April, August, and November-December AI & Robotics bootcamps across Kenya', '800+ students, 50+ teachers trained'],
      ['13 PET Recycling Machines', 'Deployed across Kenya converting plastic waste to 3D printing filament', 'Sustainable innovation in action'],
      ['66 Code Clubs Launched', 'In partnership with Raspberry Pi Foundation across secondary schools', 'Growing computing education network'],
      ['Inclusive Education Pioneer', 'Braille challenges, KSL integration, and low-vision LMS development', 'No learner left behind'],
      [],
      ['=== BOOTCAMP SERIES ==='],
      ['Month', 'Title', 'Location', 'Participants', 'Focus'],
      ['April 2025', 'Foundation Bootcamp', 'Nairobi', '250+ learners', 'AI fundamentals and robotics introduction'],
      ['August 2025', 'Advanced AI & Robotics', 'Multi-county reach', '350+ learners', 'Computer vision and automation'],
      ['Nov-Dec 2025', 'Inclusive Technology Summit', 'National program', '200+ learners, 50+ teachers', 'Accessibility and inclusive design'],
      [],
      ['=== INCLUSIVE EDUCATION INITIATIVES ==='],
      ['Initiative', 'Description'],
      ['Braille Robotics', 'Tactile robotics challenges and Braille programming interfaces for visually impaired students'],
      ['KSL Integration', 'Kenyan Sign Language integrated into curriculum materials for deaf and hard-of-hearing learners'],
      ['Low-Vision LMS', 'Specialized Learning Management System with high contrast, screen reader compatibility, and adaptive interfaces'],
      [],
      ['=== TESTIMONIALS ==='],
      ['Quote', 'Author', 'Role'],
    ];

    testimonials.forEach(t => {
      rows.push([t.quote, t.author, t.role]);
    });

    rows.push([], ['Report generated on', new Date().toLocaleDateString()]);

    const csvContent = rows
      .map(row => row.map(cell => `"${(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ChipuRobo_Impact_Report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const achievements = [
    {
      icon: GraduationCap,
      title: "3 National Bootcamps",
      description: "April, August, and November-December AI & Robotics bootcamps across Kenya",
      stats: "800+ students, 50+ teachers trained"
    },
    {
      icon: Recycle,
      title: "♻️ Sustainable Innovation & Manufacturing",
      description: "KSEF science projects developed PET recycling machines converting plastic waste into 3D printing filament for ADC Bootcamp prototyping sessions",
      stats: "13 machines deployed + youth entrepreneurship programs launched"
    },
    {
      icon: Eye,
      title: "🎓 Inclusive & Accessible AI Education",
      description: "Hackathon teams created robotics kits with Braille labels, JSS program videos with KSL integration, and AI programs specifically designed for deaf, blind, and neurodiverse learners",
      stats: "Ensuring no learner is left behind in AI education"
    },
    {
      icon: Brain,
      title: "🤖 Real-World Automation Applications",
      description: "KSEF research projects developed student-built robots that identify and sort classroom materials using computer vision through ADC Bootcamp community initiatives",
      stats: "From classroom learning to practical automation"
    }
  ];

  const bootcampHighlights = [
    {
      month: "April 2025",
      title: "Foundation Bootcamp",
      location: "Nairobi",
      participants: "250+ learners",
      focus: "AI fundamentals and robotics introduction"
    },
    {
      month: "August 2025", 
      title: "Advanced AI & Robotics",
      location: "Multi-county reach",
      participants: "350+ learners",
      focus: "Computer vision and automation"
    },
    {
      month: "Nov-Dec 2025",
      title: "Inclusive Technology Summit",
      location: "National program",
      participants: "200+ learners, 50+ teachers",
      focus: "Accessibility and inclusive design"
    }
  ];

  const testimonials = [
    {
      quote: "ChipuRobo's inclusive approach opened my eyes to how technology can truly serve everyone. The Braille robotics challenge was groundbreaking.",
      author: "Sarah Wanjiku",
      role: "Special Education Teacher, Thika"
    },
    {
      quote: "From plastic waste to functional robot parts - this program shows our students that innovation starts with what we have around us.",
      author: "David Kimani",
      role: "Physics Teacher, Nakuru County"
    },
    {
      quote: "The Code Clubs have transformed our school's approach to technology. Our students are now confident programmers and problem-solvers.",
      author: "Grace Achieng",
      role: "Head Teacher, Kisumu"
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-blue-900 to-emerald-900">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Impact Report
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
              Microsoft ADC Partnership • National AI & Robotics Program
            </p>
            <p className="text-lg text-white/90 mb-8 max-w-3xl mx-auto">
              A year of transformation: From 3 national bootcamps to 66 Code Clubs, 
              13 PET recycling machines, and pioneering inclusive education across Kenya.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={downloadImpactData}
                className="bg-white text-primary-900 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold flex items-center justify-center shadow-lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Impact Data (CSV)
              </button>
              <Link
                to="/microsoft"
                className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-lg hover:bg-white/20 transition text-lg font-semibold flex items-center justify-center"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                View Full Report
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Program by the Numbers</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">Measurable impact across Kenya</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {achievements.map((achievement, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center transform hover:scale-105 transition duration-300">
              <achievement.icon className="h-12 w-12 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{achievement.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3">{achievement.description}</p>
              <p className="text-primary-600 dark:text-primary-400 font-semibold">{achievement.stats}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bootcamp Timeline */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">National Bootcamp Series</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Transformative programs delivering impact nationwide</p>
          </div>

          <div className="space-y-8">
            {bootcampHighlights.map((bootcamp, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transform hover:scale-[1.02] transition duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                      <span className="text-primary-600 dark:text-primary-400 font-semibold">{bootcamp.month}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{bootcamp.title}</h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      {bootcamp.location}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3">
                      <Users className="h-4 w-4 mr-2" />
                      {bootcamp.participants}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{bootcamp.focus}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="bg-gradient-to-r from-primary-500 to-blue-500 text-white px-6 py-2 rounded-full font-semibold">
                      Completed ✓
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inclusive Education Focus */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Pioneering Inclusive Education</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">Breaking barriers, building accessibility</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-xl">
            <Eye className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Braille Robotics</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Developed tactile robotics challenges and Braille programming interfaces, 
              ensuring students with visual impairments can fully participate in AI education.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-xl">
            <Users className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">KSL Integration</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Integrated Kenyan Sign Language (KSL) into our curriculum materials and training, 
              making robotics education accessible to deaf and hard-of-hearing learners.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-xl">
            <Brain className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Low-Vision LMS</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Developed specialized Learning Management System features with high contrast, 
              screen reader compatibility, and adaptive interfaces for low-vision learners.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-r from-gray-900 to-primary-900 dark:from-black dark:to-primary-950 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Voices from the Field</h2>
            <p className="text-xl text-gray-200">Impact stories from educators and communities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition">
                <p className="text-gray-200 text-lg italic mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.author}</p>
                  <p className="text-gray-300">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Microsoft Partnership Highlight */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Microsoft ADC Partnership</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Our strategic partnership with Microsoft ADC provided technical enablement, 
            AI learning resources, and mentorship that made this transformative year possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.microsoft.com/en-us/madc"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center justify-center"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Learn About Microsoft ADC
            </a>
            <Link
              to="/microsoft"
              className="bg-white/20 backdrop-blur-lg text-white px-8 py-3 rounded-lg hover:bg-white/30 transition font-semibold flex items-center justify-center"
            >
              <Download className="mr-2 h-5 w-5" />
              Partnership Impact Report
            </Link>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready for 2026?</h2>
          <p className="text-xl text-green-100 mb-8">
            Join us as we expand to reach 4 million youth across Africa by 2030
          </p>
          <button
            onClick={() => navigate('/register-2026')}
            className="bg-white text-emerald-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-semibold"
          >
            Register for 2026 Programme
          </button>
        </div>
      </div>
    </div>
  );
};

export default Impact;