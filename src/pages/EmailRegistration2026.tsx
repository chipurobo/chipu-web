import { useState } from 'react';
import { CheckSquare, MessageSquare, Mail, Copy, ChevronDown, ChevronUp, Check } from 'lucide-react';

const EmailRegistration2026 = () => {
 const [isTemplateExpanded, setIsTemplateExpanded] = useState(false);
 const [isCopied, setIsCopied] = useState(false);

 // Email template content
 const emailTemplate = `Subject: Registration – Inclusive Robotics 2026

Dear ChipuRobo Team,

I would like to register our school for Inclusive Robotics, the 2026 cycle of
the Pan-African robotics competition. I understand registration is KES 2,000
per school and covers entry, dashboard access, the full curriculum and judging.

SCHOOL DETAILS:
• School Name: [Enter your school name]
• County: [Enter your county]
• Public or private? [Enter one]
• Student Enrollment: [Number of students]

WHICH TRACK:
☐ Primary track — robotics concepts, problem-solving, introductory coding
☐ Secondary track — coding, AI, and 3D design and print
☐ Not sure yet — happy to be advised

CONTACT INFORMATION:
• Contact Person: [Your full name]
• Position: [Your position at the school]
• Email: [Your email address]
• Phone: [Your phone number]

SUPPORT WE MAY WANT (optional — not required to compete):
☐ Virtual assistance with the lesson plans (KES 1,000 per hour)
☐ An in-person visit (arranged directly with your team)
☐ Help completing our project

ACCESSIBILITY:
[Tell us about learners with hearing or visual impairments, and any
adaptations that would help them take part]

ADDITIONAL INFORMATION:
[Current technology at the school, or any questions]

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

 const participationLevels = [
    {
      id: 'beginner',
      label: 'Beginner — included with registration',
      description:
        'Register, work the curriculum, submit your team project and be judged, through to the end ' +
        'of the year. Everything a school needs to compete.',
    },
    {
      id: 'intermediate',
      label: 'Intermediate — KES 1,000 per hour',
      description:
        'Ask for help and request parts from the dashboard. Virtual assistance walks a teacher ' +
        'through the lesson plans. In-person visits are arranged directly once you ask.',
    },
    {
      id: 'advanced',
      label: 'Advanced — arranged per project',
      description:
        'Where a school needs help completing its project, our team works with them through to a ' +
        'finished build.',
    },
  ];

 return (
 <div className="bg-warm-50 ">
 {/* Hero Section */}
 <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200 ">
 <div className="code-bg absolute inset-0 opacity-30 " aria-hidden="true" />
 <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
 <div className="text-center">
 <div className="mb-8">
 <span className="inline-block bg-green-400 text-green-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
 The 2026 cycle is open for entries
 </span>
 </div>
 <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6 heading-display">
 Register for Inclusive Robotics 2026
 </h1>
 <p className="text-lg text-gray-700 mb-8 max-w-4xl mx-auto">
 Inclusive Robotics is a Pan-African robotics competition, run in one cycle a year. Registration is KES 2,000 per school and covers entry, the dashboard, the full curriculum on both tracks, and judging at the end of the year.
 </p>
 {/* The fee, stated where someone arriving from a "KES 2,000" call to
     action expects to find it. */}
 <div className="bg-white border border-teal-200 rounded-xl p-6 max-w-md mx-auto shadow-soft-sm mb-6 text-center">
   <p className="text-sm font-medium text-gray-600 mb-1">Registration</p>
   <p className="font-pixel text-4xl text-gray-900 mb-1">KES 2,000</p>
   <p className="text-sm text-gray-600">
     One-off, per school. Entry, dashboard, curriculum and judging.
   </p>
 </div>

 <div className="bg-white border border-warm-200 rounded-xl p-6 max-w-3xl mx-auto shadow-soft-sm">
 <div className="flex items-center justify-center mb-4">
 <Mail className="h-7 w-7 text-terracotta-600 mr-3" aria-hidden="true" />
 <h2 className="text-2xl font-bold text-gray-900 heading-display">Ready to Transform Your School?</h2>
 </div>
 <p className="text-gray-700 text-base mb-4">
 Registration is by email. Send us your school's details and we will take it from there:
 </p>
 <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 text-center">
 <p className="font-pixel text-lg text-gray-900">chipurobo@gmail.com</p>
 <p className="text-sm text-gray-600 mt-2">Our team will respond within 48 hours to discuss your school's needs</p>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Program Information */}
 <section className="py-8 sm:py-12 lg:py-16">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-16">
 <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-6 heading-display">
 How schools take part
 </h2>
 <p className="text-lg text-gray-600 max-w-3xl mx-auto">
 Registration covers Beginner in full. The two levels above it are support you can ask for later — neither is required to compete.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
 {participationLevels.map((program) => (
 <div key={program.id} className="bg-white rounded-xl shadow-soft-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5">
 <div className="flex items-center mb-4">
 <CheckSquare className="h-8 w-8 text-primary-600 mr-3" aria-hidden="true" />
 <h3 className="text-xl font-semibold text-gray-900 ">
 {program.label}
 </h3>
 </div>
 <p className="text-gray-600 ">
 {program.description}
 </p>
 </div>
 ))}
 </div>

 {/* Email Template Section */}
 <div className="bg-gray-50 rounded-xl p-8 mb-16 border border-gray-100 ">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center">
 <MessageSquare className="mr-3 h-6 w-6 text-primary-600" aria-hidden="true" />
 <h2 className="text-2xl font-bold tracking-tight text-gray-900 heading-display">
 Email Template for Registration
 </h2>
 </div>
 <button
 onClick={() => setIsTemplateExpanded(!isTemplateExpanded)}
 className="flex items-center px-4 py-2 bg-terracotta-500 text-white rounded-xl hover:bg-terracotta-600 transition-all duration-200 focus-visible hover:shadow-soft-md"
 aria-expanded={isTemplateExpanded}
 aria-controls="email-template-content"
 >
 {isTemplateExpanded ? (
 <>
 <ChevronUp className="mr-2 h-5 w-5" aria-hidden="true" />
 <span>Hide Template</span>
 </>
 ) : (
 <>
 <ChevronDown className="mr-2 h-5 w-5" aria-hidden="true" />
 <span>Show Template</span>
 </>
 )}
 </button>
 </div>

 <div className="mb-6">
 <div className="bg-white rounded-xl p-6 border border-gray-100 ">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center">
 <Mail className="mr-3 h-5 w-5 text-blue-600 " aria-hidden="true" />
 <span className="font-medium text-gray-900 ">
 Send to: <span className="text-primary-600 font-bold">chipurobo@gmail.com</span>
 </span>
 </div>
 <button
 onClick={copyToClipboard}
 className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 focus-visible ${
 isCopied
 ? 'bg-green-600 text-white'
 : 'bg-gray-100 text-gray-900 hover:bg-gray-200 '
 }`}
 disabled={isCopied}
 aria-label="Copy email template to clipboard"
 >
 {isCopied ? (
 <>
 <Check className="mr-2 h-4 w-4" aria-hidden="true" />
 <span>Copied!</span>
 </>
 ) : (
 <>
 <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
 <span>Copy Template</span>
 </>
 )}
 </button>
 </div>

 <p className="text-gray-600 text-sm">
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
 <div className="bg-white rounded-xl shadow-soft-md border border-gray-100 ">
 {/* Email Header */}
 <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 rounded-t-xl">
 <h3 className="font-semibold text-white text-lg">📧 Email Preview</h3>
 <p className="text-primary-100 text-sm">Subject: Registration – Inclusive Robotics 2026</p>
 </div>

 {/* Email Body Preview */}
 <div className="p-6">
 <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-700 whitespace-pre-line border border-gray-100 ">
 {emailTemplate}
 </div>
 </div>

 {/* Instructions */}
 <div className="bg-blue-50 p-4 rounded-b-xl border-t border-gray-100 ">
 <div className="flex items-start">
 <div className="bg-blue-100 p-2 rounded-xl mr-3 mt-0.5">
 <MessageSquare className="h-4 w-4 text-blue-600 " aria-hidden="true" />
 </div>
 <div>
 <h4 className="font-semibold text-blue-900 mb-2">How to Use This Template:</h4>
 <ol className="text-blue-800 text-sm space-y-1" role="list">
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
 <div className="text-center bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/80 rounded-xl p-8 text-white relative overflow-hidden">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
 <div className="relative">
 <h2 className="text-3xl font-bold tracking-tight mb-4 heading-display text-gray-900 ">Ready to Get Started?</h2>
 <p className="text-lg mb-6 text-gray-300">
 Register your school for the 2026 cycle — KES 2,000, covering entry through to judging
 </p>
 <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-md mx-auto">
 <p className="text-lg font-semibold mb-2">Send your registration email to:</p>
 <p className="text-2xl font-bold">chipurobo@gmail.com</p>
 <p className="mt-4 text-gray-300 text-sm">
 The 2026 cycle is open. Register your school, work the curriculum, build your team project, and have it judged at the National Showcase.
 </p>
 </div>
 </div>
 </div>
 </div>
 </section>
 </div>
 );
};

export default EmailRegistration2026;
