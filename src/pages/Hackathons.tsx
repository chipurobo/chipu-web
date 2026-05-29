import { Hand, BookOpen, Headphones, MapPin, Clock, Users, Calendar, ExternalLink, Mail, CheckCircle, AlertTriangle } from 'lucide-react';

// Updated the registration URL to the live Braille Challenge form.
const REGISTRATION_URL = 'https://live.braillechallenge.com/register';

const tracks = [
 {
 icon: Hand,
 title: 'Tactile Tools',
 description: 'Build affordable Braille displays, embossers, or tactile-graphic devices that classrooms can actually use.',
 color: 'text-teal-600 ',
 bg: 'bg-teal-50 ',
 },
 {
 icon: BookOpen,
 title: 'Inclusive Learning',
 description: 'Apps, games, and lesson tools designed first for blind and low-vision learners — not retrofitted for them.',
 color: 'text-terracotta-600 ',
 bg: 'bg-terracotta-50 ',
 },
 {
 icon: Headphones,
 title: 'Audio-First AI',
 description: 'AI assistants and screen-reader-friendly interfaces that work without ever needing a screen.',
 color: 'text-amber-600 ',
 bg: 'bg-amber-50 ',
 },
];

const schedule = [
 {
 day: 'Day 1 — May 14',
 items: [
 'Opening ceremony & welcome',
 'Track briefings & team formation',
 'Hacking begins',
 'Mentor office hours',
 ],
 },
 {
 day: 'Day 2 — May 15',
 items: [
 'Final hacking sprint',
 'Project submissions',
 'Demo presentations',
 'Judging & closing ceremony',
 ],
 },
];

const faq = [
 { q: 'Who can participate?', a: 'Any student aged 14–19. No prior experience with accessibility tech or coding required — just curiosity and the willingness to build for users you may not have built for before.' },
 { q: 'Do I need a team?', a: 'Teams are 3–5 members. You can come with a team or form one at the event during team formation on Day 1.' },
 { q: 'What should I bring?', a: 'A laptop (charged), charger, student ID, and enthusiasm. Meals, materials, and mentors are provided.' },
 { q: 'Is it really free?', a: 'Yes — 100% free entry. Meals, mentors, and materials are fully covered.' },
 { q: 'What if I have no coding experience?', a: 'The Braille Challenge is beginner-friendly. We provide workshops, starter templates, and dedicated mentors for each track.' },
 { q: 'Will blind and low-vision participants be welcomed?', a: 'Absolutely — they\'re central to the event. Screen readers, accessible workstations, and Braille-ready materials will be on hand. Reach out ahead of time so we can prepare anything specific you need.' },
];

const Hackathons = () => {
 return (
 <div className="bg-warm-50 ">
 {/* Hero */}
 <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200 ">
 <div className="code-bg absolute inset-0 opacity-30 " aria-hidden="true" />
 <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
 <div className="max-w-3xl">
 <div className="inline-flex items-center bg-white border border-warm-200 px-4 py-1.5 rounded-full text-sm text-gray-700 mb-6">
 <span className="font-pixel text-[0.55rem] tracking-widest text-terracotta-600 mr-3">HACK</span>
 Inclusive Youth Hackathon &middot; Ages 14–19
 </div>

 <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-4 heading-display">
 <span className="text-teal-600 ">BRAILLE</span>{' '}
 <span className="text-gray-900 ">CHALLENGE</span>
 </h1>

 <p className="text-xl md:text-2xl font-bold text-gray-700 tracking-wide mb-6">
 BUILD. <span className="text-teal-600 ">INCLUDE.</span> EMPOWER.
 </p>

 <p className="text-gray-600 text-lg mb-8 max-w-xl">
 A 2-day youth hackathon focused on Braille and accessibility — building real tools that help blind and low-vision learners read, learn, and create alongside their peers.
 </p>

 <div className="flex flex-wrap gap-3 mb-10">
 <span className="inline-flex items-center bg-white border border-warm-200 px-4 py-2 rounded-lg text-sm text-gray-800 ">
 <Calendar className="h-4 w-4 mr-2 text-teal-600 " /> May 14–15, 2026
 </span>
 <span className="inline-flex items-center bg-white border border-warm-200 px-4 py-2 rounded-lg text-sm text-gray-800 ">
 <Clock className="h-4 w-4 mr-2 text-teal-600 " /> 8:00 AM – 4:00 PM daily
 </span>
 <span className="inline-flex items-center bg-white border border-warm-200 px-4 py-2 rounded-lg text-sm text-gray-800 ">
 <MapPin className="h-4 w-4 mr-2 text-terracotta-600 " /> Railways Museum, Nairobi
 </span>
 <span className="inline-flex items-center bg-white border border-warm-200 px-4 py-2 rounded-lg text-sm text-gray-800 ">
 <Users className="h-4 w-4 mr-2 text-teal-600 " /> Teams of 3–5
 </span>
 </div>

 <div className="flex flex-wrap gap-4">
 <a
 href={REGISTRATION_URL}
 target="_blank"
 rel="noopener noreferrer"
 className="btn-cta"
 >
 Register Now <ExternalLink className="h-4 w-4 ml-2" />
 </a>
 <div className="flex items-center bg-terracotta-50 border border-terracotta-200 px-5 py-3 rounded-lg">
 <AlertTriangle className="h-4 w-4 text-terracotta-600 mr-2 flex-shrink-0" />
 <span className="text-sm text-terracotta-700 font-medium">Deadline: May 12, 2026</span>
 </div>
 </div>
 </div>

 {/* Free badge */}
 <div className="absolute top-8 right-8 lg:top-12 lg:right-16">
 <div className="bg-terracotta-500 text-white rounded-full h-20 w-20 flex flex-col items-center justify-center font-bold shadow-soft-lg">
 <span className="text-xs">100%</span>
 <span className="text-sm font-black">FREE</span>
 </div>
 </div>
 </div>
 </section>

 {/* Tracks */}
 <section className="py-8 sm:py-12">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center heading-display">Hackathon Tracks</h2>
 <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
 Choose one of three challenge tracks. Each focuses on a real gap in how blind and low-vision learners access education in Kenya.
 </p>
 <div className="grid gap-6 md:grid-cols-3">
 {tracks.map((track) => (
 <div
 key={track.title}
 className="bg-white rounded-xl p-8 border border-gray-100 shadow-soft-md hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
 >
 <div className={`${track.bg} inline-flex p-3 rounded-xl mb-4`}>
 <track.icon className={`h-6 w-6 ${track.color}`} />
 </div>
 <h3 className="text-xl font-semibold text-gray-900 mb-2">{track.title}</h3>
 <p className="text-gray-600 ">{track.description}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Schedule */}
 <section className="py-8 sm:py-12 bg-gray-50 ">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center heading-display">2-Day Schedule</h2>
 <p className="text-gray-600 text-center mb-12">8:00 AM – 4:00 PM each day at Railways Museum, Nairobi</p>
 <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
 {schedule.map((day) => (
 <div key={day.day} className="bg-white rounded-xl p-6 border border-gray-100 ">
 <h3 className="text-lg font-semibold text-teal-600 mb-4">{day.day}</h3>
 <ul className="space-y-3">
 {day.items.map((item) => (
 <li key={item} className="flex items-start text-sm text-gray-600 ">
 <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
 {item}
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* FAQ */}
 <section className="py-8 sm:py-12">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center heading-display">Frequently Asked Questions</h2>
 <div className="space-y-6">
 {faq.map((item) => (
 <div key={item.q} className="border-b border-gray-200 pb-6">
 <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.q}</h3>
 <p className="text-gray-600 ">{item.a}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Code of Conduct */}
 <section className="py-16 sm:py-20 bg-gray-50 ">
 <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
 <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center heading-display">Code of Conduct</h2>
 <div className="bg-white rounded-xl p-6 border border-gray-100 ">
 <p className="text-gray-600 mb-4">
 The Braille Challenge is dedicated to providing a friendly, safe, and welcoming environment for all participants, regardless of age, disability, gender, nationality, race, religion, sexuality, or similar personal characteristic.
 </p>
 <p className="text-gray-600 mb-4">
 All attendees, sponsors, partners, volunteers, and staff are required to agree with this code of conduct. Organizers will enforce it throughout the event. We expect cooperation from all participants to ensure a safe environment for everybody.
 </p>
 <ul className="space-y-2 text-sm text-gray-600 ">
 <li className="flex items-start">
 <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
 Be respectful and inclusive in all interactions.
 </li>
 <li className="flex items-start">
 <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
 Build with — not just for — blind and low-vision users; centre their feedback.
 </li>
 <li className="flex items-start">
 <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
 Harassment of any kind will not be tolerated.
 </li>
 <li className="flex items-start">
 <CheckCircle className="h-4 w-4 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
 Report any concerns to event organizers immediately.
 </li>
 </ul>
 <p className="text-xs text-gray-500 mt-4">
 Adapted from the{' '}
 <a
 href="https://hackclub.com/conduct/"
 target="_blank"
 rel="noopener noreferrer"
 className="text-teal-600 underline hover:no-underline"
 >
 Hack Club Code of Conduct
 </a>.
 </p>
 </div>
 </div>
 </section>

 {/* CTA / Register */}
 <section className="relative overflow-hidden bg-gray-900 py-8 sm:py-12 scanlines circuit-grid">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.12),transparent_70%)]" />
 <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
 <h2 className="text-3xl font-bold tracking-tight mb-3 heading-display">Ready to Build, Include & Empower?</h2>
 <p className="text-lg text-gray-300 mb-8">
 Join the next generation of inclusive builders at the Braille Challenge. Free entry, meals provided, and mentors on-hand for all skill levels.
 </p>
 <div className="flex flex-wrap gap-4 justify-center mb-8">
 <a
 href={REGISTRATION_URL}
 target="_blank"
 rel="noopener noreferrer"
 className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-8 py-3.5 rounded-xl font-semibold inline-flex items-center transition-all duration-200 shadow-lg hover:shadow-terracotta-500/25"
 >
 Register Your Team <ExternalLink className="h-4 w-4 ml-2" />
 </a>
 </div>
 <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
 <Mail className="h-4 w-4" />
 <span>Questions? Email </span>
 <a href="mailto:sydiantech@gmail.com" className="text-teal-400 hover:underline">
 sydiantech@gmail.com
 </a>
 </div>
 <p className="text-gray-500 text-sm mt-6">ChipuRobo &times; eKitabu</p>
 </div>
 </section>
 </div>
 );
};

export default Hackathons;
