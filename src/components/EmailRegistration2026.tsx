import React, { useState } from 'react';
import { School, User, CheckSquare, MessageSquare, Mail, MapPin, Copy, ChevronDown, ChevronUp, Check } from 'lucide-react';

const EmailRegistration2026 = () => {
  const [isTemplateExpanded, setIsTemplateExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Email template content
  const emailTemplate = `Subject: Expression of Interest – ChipuRobo 2026 Season 2 Registration

Dear ChipuRobo Team,

I am interested in registering our school for the ChipuRobo 2026 AI & Robotics Programme.

SCHOOL DETAILS:
• School Name: [Enter your school name]
• School Category: [Primary/Secondary/Technical/etc]
• County: [Enter your county]
• Student Enrollment: [Number of students]
• Is your school public or private? [Enter one]
• Has your school been nominated by CEMASTEA or are you expressing interest independently?

CONTACT INFORMATION:
• Contact Person: [Your full name]
• Position: [Your position at the school]
• Email: [Your email address]
• Phone: [Your phone number]

PROGRAMS OF INTEREST: (Check all that apply)
☐ Code Club (Raspberry Pi Computing)
☐ AI & Robotics Bootcamp
☐ Maker Space Setup
☐ Teacher Professional Development
☐ Inclusive Technology Program

ADDITIONAL INFORMATION:
[Please share any specific needs, current technology infrastructure, or questions]

Thank you for considering our school for this program.

Best regards,
[Your name]
[School name]`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(emailTemplate);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = emailTemplate;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const programOptions = [
    { id: 'codeclub', label: 'Code Club (Raspberry Pi Computing)', description: 'Weekly coding sessions with Raspberry Pi' },
    { id: 'bootcamp', label: 'AI & Robotics Bootcamp', description: '3-day intensive training aligned with national AI curriculum' },
    { id: 'makerspace', label: 'Maker Space Setup', description: 'Digital fabrication and 3D printing lab' },
    { id: 'teacher-training', label: 'Teacher Professional Development', description: 'Training aligned with CEMASTEA and KSEF frameworks' },
    { id: 'inclusive', label: 'Inclusive Technology Program', description: 'Accessibility-focused STEM education' }
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-emerald-600">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-block bg-green-400 text-green-900 px-4 py-2 rounded-full text-sm font-semibold mb-4 dyslexic-text">
                🚀 Building on 2025 Success - Registration Now Open
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 dyslexic-text">
              Register for ChipuRobo 2026 – Season 2
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-4xl mx-auto dyslexic-text">
              We're launching Season 2 of the ChipuRobo Programme — empowering 100 new schools across 47 counties through inclusive, hands-on AI and robotics learning.
            </p>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-white mr-3" aria-hidden="true" />
                <h2 className="text-2xl font-bold text-white dyslexic-text">Ready to Transform Your School?</h2>
              </div>
              <p className="text-green-100 text-lg mb-4 dyslexic-text">
                Registration for the 2026 programme is simple - just send us an email with your school information:
              </p>
              <div className="bg-white/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white dyslexic-text">chipurobo@gmail.com</p>
                <p className="text-green-100 mt-2 dyslexic-text">Our team will respond within 48 hours to discuss your school's needs</p>
              </div>
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

        {/* Email Template Section */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mb-16 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <MessageSquare className="mr-3 h-6 w-6 text-primary-600" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white dyslexic-text">
                Email Template for Registration
              </h2>
            </div>
            <button
              onClick={() => setIsTemplateExpanded(!isTemplateExpanded)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus-visible"
              aria-expanded={isTemplateExpanded}
              aria-controls="email-template-content"
            >
              {isTemplateExpanded ? (
                <>
                  <ChevronUp className="mr-2 h-5 w-5" aria-hidden="true" />
                  <span className="dyslexic-text">Hide Template</span>
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-5 w-5" aria-hidden="true" />
                  <span className="dyslexic-text">Show Template</span>
                </>
              )}
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Mail className="mr-3 h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span className="font-medium text-gray-900 dark:text-white dyslexic-text">
                    Send to: <span className="text-primary-600 dark:text-primary-400 font-bold">chipurobo@gmail.com</span>
                  </span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all focus-visible ${
                    isCopied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                  disabled={isCopied}
                  aria-label="Copy email template to clipboard"
                >
                  {isCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span className="dyslexic-text">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span className="dyslexic-text">Copy Template</span>
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm dyslexic-text">
                Click "Copy Template" to copy the complete email template, then paste it into your email client.
              </p>
            </div>
          </div>

          {/* Collapsible Email Template Content */}
          <div 
            id="email-template-content"
            className={`transition-all duration-300 overflow-hidden ${
              isTemplateExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
              {/* Email Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 rounded-t-xl">
                <h3 className="font-semibold text-white text-lg dyslexic-text">📧 Email Preview</h3>
                <p className="text-primary-100 text-sm dyslexic-text">Subject: Expression of Interest – ChipuRobo 2026 Season 2 Registration</p>
              </div>
              
              {/* Email Body Preview */}
              <div className="p-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line border border-gray-200 dark:border-gray-600">
                  {emailTemplate}
                </div>
              </div>
              
              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-b-xl border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3 mt-0.5">
                    <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 dyslexic-text">How to Use This Template:</h4>
                    <ol className="text-blue-800 dark:text-blue-300 text-sm space-y-1 dyslexic-text" role="list">
                      <li role="listitem">1. Click the "Copy Template" button above</li>
                      <li role="listitem">2. Open your email client (Gmail, Outlook, etc.)</li>
                      <li role="listitem">3. Create a new email to chipurobo@gmail.com</li>
                      <li role="listitem">4. Paste the template and fill in your school's information</li>
                      <li role="listitem">5. Check the programs you're interested in</li>
                      <li role="listitem">6. Send the email and await our response within 48 hours</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-primary-600 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 text-primary-100">
            Be part of 100+ schools joining Season 2 of the ChipuRobo Programme in 2026
          </p>
          <div className="bg-white/20 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-lg font-semibold mb-2">Send your registration email to:</p>
            <p className="text-2xl font-bold">chipurobo@gmail.com</p>
            <p className="mt-4 text-primary-100 text-sm">
              Season 2 is open — Register your school and get ready to participate in the 2026 rollout, culminating in the National Robotics Competition under KSEF.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailRegistration2026;