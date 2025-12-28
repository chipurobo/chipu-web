import { School, User, CheckSquare, MessageSquare, Mail, MapPin } from 'lucide-react';

const EmailRegistration2026 = () => {
  const programOptions = [
    { id: 'codeclub', label: 'Code Club (Raspberry Pi Computing)', description: 'Weekly coding sessions with Raspberry Pi' },
    { id: 'bootcamp', label: 'AI & Robotics Bootcamp', description: '5-day intensive hands-on training' },
    { id: 'makerspace', label: 'Maker Space Setup', description: 'Digital fabrication and 3D printing lab' },
    { id: 'teacher-training', label: 'Teacher Professional Development', description: 'Educator training in AI and robotics' },
    { id: 'inclusive', label: 'Inclusive Technology Program', description: 'Accessibility-focused STEM education' }
  ];

  const handleEmailClick = () => {
    const subject = 'ChipuRobo 2026 Program Registration Interest';
    const body = `Dear ChipuRobo Team,

I am interested in registering our school for the ChipuRobo 2026 AI & Robotics Programme.

SCHOOL DETAILS:
School Name: [Enter your school name]
School Category: [Primary/Secondary/Technical/etc]
County: [Enter your county]

CONTACT INFORMATION:
Contact Person: [Your full name]
Position: [Your position at the school]
Email: [Your email address]
Phone: [Your phone number]

PROGRAMS OF INTEREST:
[ ] Code Club (Raspberry Pi Computing)
[ ] AI & Robotics Bootcamp
[ ] Maker Space Setup
[ ] Teacher Professional Development
[ ] Inclusive Technology Program

ADDITIONAL INFORMATION:
[Please share any specific needs, infrastructure details, or questions]

Thank you for considering our school for this program.

Best regards,
[Your name]
[School name]`;

    const mailtoLink = `mailto:chipurobo@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-emerald-600">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Join ChipuRobo 2026 AI & Robotics Programme
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-4xl mx-auto">
              Empowering 4 million youth across Africa by 2030 through innovative AI and robotics education
            </p>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Transform Your School?</h2>
              <p className="text-green-100 mb-6">
                Email us directly with your school information and program interests. Our team will respond within 48 hours to discuss next steps.
              </p>
              <button
                onClick={handleEmailClick}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center mx-auto"
              >
                <Mail className="mr-3 h-6 w-6" />
                Email Us at chipurobo@gmail.com
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Program Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Available Programs for 2026
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Choose from our comprehensive suite of AI and robotics programs designed to transform education in your school.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {programOptions.map((program) => (
            <div key={program.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <CheckSquare className="h-8 w-8 text-primary-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {program.label}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {program.description}
              </p>
            </div>
          ))}
        </div>

        {/* Information to Include */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <MessageSquare className="mr-3 h-6 w-6 text-primary-600" />
            Information to Include in Your Email
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <School className="mr-2 h-5 w-5 text-primary-600" />
                School Details
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• School name and type (Primary/Secondary/Technical)</li>
                <li>• County location</li>
                <li>• Current student enrollment</li>
                <li>• Existing technology infrastructure</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="mr-2 h-5 w-5 text-primary-600" />
                Contact Information
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Your full name and position</li>
                <li>• Direct email and phone number</li>
                <li>• Best time to reach you</li>
                <li>• Programs you're interested in</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-primary-600 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 text-primary-100">
            Join the 800+ learners and 66 Code Clubs already part of our mission
          </p>
          <button
            onClick={handleEmailClick}
            className="bg-white text-primary-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center mx-auto"
          >
            <Mail className="mr-3 h-6 w-6" />
            Send Registration Email
          </button>
          <p className="text-primary-200 text-sm mt-4">
            Or email us directly at: <span className="font-semibold">chipurobo@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailRegistration2026;