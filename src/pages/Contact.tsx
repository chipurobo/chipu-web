import { Mail, MapPin, Linkedin, MessageSquare, User, Building, Wrench, Clock, Globe, Heart } from 'lucide-react';

const Contact = () => {
  const contactStats = [
    { icon: Clock, value: '48h', label: 'Response Time' },
    { icon: Globe, value: '47+', label: 'Counties Reached' },
    { icon: Heart, value: '800+', label: 'Happy Learners' }
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-blue-600 to-emerald-600">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <MessageSquare className="h-16 w-16 text-white mx-auto animate-pulse-slow" aria-hidden="true" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 dyslexic-text">
              Let's Connect
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto dyslexic-text">
              Ready to bring AI and robotics education to your school? We're here to help you start your journey.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {contactStats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg rounded-lg p-6 hover:bg-white/20 transition-all duration-300">
                  <stat.icon className="h-8 w-8 text-white mx-auto mb-3" aria-hidden="true" />
                  <div className="text-2xl font-bold text-white mb-1 dyslexic-text">{stat.value}</div>
                  <div className="text-blue-200 text-sm dyslexic-text">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Information Column */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 h-fit sticky top-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 dyslexic-text">Get In Touch</h2>
              <p className="text-gray-600 dark:text-gray-300 dyslexic-text">We're here to help you bring innovation to your classroom</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start">
                  <div className="bg-blue-600 p-3 rounded-lg mr-4 flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-blue-900 dark:text-blue-200 mb-2 dyslexic-text">Primary Email</p>
                    <a 
                      href="mailto:chipurobo@gmail.com" 
                      className="text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors dyslexic-text break-all"
                    >
                      chipurobo@gmail.com
                    </a>
                    <p className="text-blue-600 dark:text-blue-400 text-sm mt-2 dyslexic-text">Response within 48 hours</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                <div className="flex items-start">
                  <div className="bg-purple-600 p-3 rounded-lg mr-4 flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-purple-900 dark:text-purple-200 mb-2 dyslexic-text">Location</p>
                    <p className="text-purple-700 dark:text-purple-300 dyslexic-text">Nairobi Railway Museum</p>
                    <p className="text-purple-600 dark:text-purple-400 text-sm mt-2 dyslexic-text">Serving all 47 counties</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social Media Section */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center dyslexic-text">Connect With Us</h3>
              <div className="flex justify-center space-x-6">
                <a 
                  href="#" 
                  className="bg-linkedin p-3 rounded-full text-white hover:bg-linkedin/80 transition-colors"
                  aria-label="Follow us on LinkedIn"
                >
                  <Linkedin className="h-5 w-5" aria-hidden="true" />
                </a>
                <a 
                  href="#" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full text-white hover:from-purple-600 hover:to-pink-600 transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.017 0C8.396 0 8.002.01 6.78.048 2.979.146.146 2.979.048 6.78.01 8.002 0 8.396 0 12.017s.01 4.015.048 5.237c.098 3.801 2.931 6.634 6.732 6.732 1.222.038 1.616.048 5.237.048s4.015-.01 5.237-.048c3.801-.098 6.634-2.931 6.732-6.732.038-1.222.048-1.616.048-5.237s-.01-4.015-.048-5.237C23.884 2.979 21.051.146 17.25.048 16.028.01 15.634 0 12.017 0zm0 5.838a6.179 6.179 0 100 12.358 6.179 6.179 0 000-12.358zM12.017 16a3.823 3.823 0 110-7.646 3.823 3.823 0 010 7.646zm6.716-10.845a1.441 1.441 0 11-2.883 0 1.441 1.441 0 012.883 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="bg-black p-3 rounded-full text-white hover:bg-gray-800 transition-colors"
                  aria-label="Follow us on TikTok"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                  </svg>
                </a>
              </div>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4 dyslexic-text">
                Follow our journey across Africa
              </p>
            </div>
          </div>
        </div>

        {/* Messaging Section - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 dyslexic-text">
              How Can We Help You?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 dyslexic-text">
              Choose the type of inquiry that best matches your needs, and we'll connect you with the right team member.
            </p>
          </div>
          
          {/* Email Instructions */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-8 mb-8 border border-primary-200 dark:border-primary-700">
            <div className="text-center">
              <div className="bg-primary-600 p-4 rounded-full w-fit mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 dyslexic-text">
                Ready to Get Started?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 dyslexic-text">
                Send us an email with your information and we'll respond within 48 hours
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <p className="text-primary-600 dark:text-primary-400 font-semibold text-lg dyslexic-text">
                  chipurobo@gmail.com
                </p>
              </div>
            </div>
          </div>
          
          {/* Inquiry Type Cards */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 dyslexic-text">
              What type of inquiry do you have?
            </h3>
            
            <div className="grid gap-6">
              {/* General Inquiries Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl mr-6 flex-shrink-0">
                    <User className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 dyslexic-text">General Inquiries</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 dyslexic-text">
                      Questions about our mission, programs, or how to get involved with ChipuRobo.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-3 dyslexic-text">Include in your email:</p>
                      <ul className="space-y-2">
                        <li className="flex items-center text-blue-800 dark:text-blue-300 text-sm dyslexic-text">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                          Your name and organization
                        </li>
                        <li className="flex items-center text-blue-800 dark:text-blue-300 text-sm dyslexic-text">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                          Contact information
                        </li>
                        <li className="flex items-center text-blue-800 dark:text-blue-300 text-sm dyslexic-text">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                          Brief description of your inquiry
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* School Partnerships Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl mr-6 flex-shrink-0">
                    <Building className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 dyslexic-text">School Partnerships</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 dyslexic-text">
                      Ready to bring AI and robotics education to your school? Let's discuss partnership opportunities.
                    </p>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-3 dyslexic-text">Include in your email:</p>
                      <ul className="space-y-2">
                        <li className="flex items-center text-green-800 dark:text-green-300 text-sm dyslexic-text">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                          School name and type (Primary/Secondary/Technical)
                        </li>
                        <li className="flex items-center text-green-800 dark:text-green-300 text-sm dyslexic-text">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                          Location (County) and student enrollment
                        </li>
                        <li className="flex items-center text-green-800 dark:text-green-300 text-sm dyslexic-text">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                          Programs of interest (Code Club, Bootcamp, etc.)
                        </li>
                        <li className="flex items-center text-green-800 dark:text-green-300 text-sm dyslexic-text">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                          Contact person and their role
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Technical Support Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl mr-6 flex-shrink-0">
                    <Wrench className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 dyslexic-text">Technical Support</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 dyslexic-text">
                      Need help with robotics kits, software, or technical issues? Our support team is here to help.
                    </p>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-200 mb-3 dyslexic-text">Include in your email:</p>
                      <ul className="space-y-2">
                        <li className="flex items-center text-purple-800 dark:text-purple-300 text-sm dyslexic-text">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                          Detailed description of the issue
                        </li>
                        <li className="flex items-center text-purple-800 dark:text-purple-300 text-sm dyslexic-text">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                          Any error messages or screenshots
                        </li>
                        <li className="flex items-center text-purple-800 dark:text-purple-300 text-sm dyslexic-text">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                          Your school and contact information
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            
          {/* Quick Response Promise */}
          <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center justify-center">
              <div className="bg-emerald-600 p-3 rounded-full mr-4">
                <Clock className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-1 dyslexic-text">
                  Quick Response Promise
                </h4>
                <p className="text-emerald-700 dark:text-emerald-300 dyslexic-text">
                  We respond to all emails within 48 hours, usually much faster!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>
    </div>
  );
};

export default Contact;