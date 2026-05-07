import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Beaker, Calendar, Target, BookOpen, Award, CheckCircle, Clock } from 'lucide-react';

const highlights = [
 { title: 'CBC aligned', detail: 'January–December workflow mirrors KSEF and CEMASTEA rubrics.' },
 { title: 'Hands-on research', detail: 'Learners prototype with robotics, AI, and sustainability kits.' },
 { title: 'Mentor network', detail: 'Teachers and ChipuRobo coaches guide journals and demos.' }
];

const timeline = [
 { month: 'Jan', note: 'Kickoff, research plans, and hypothesis drafting.' },
 { month: 'Feb', note: 'Run experiments, collect data, and log results.' },
 { month: 'Mar', note: 'Polish prototypes and rehearse presentations.' },
 { month: 'Apr', note: 'School showcases and nationals window.' },
 { month: 'May–Aug', note: 'Extend successful projects and mentor new briefs.' },
 { month: 'Sep–Dec', note: 'Support follow-up research and prep next cohort.' }
];

const extras = [
 'Digital research planner templates.',
 'Loaner sensors and fabrication support.',
 'Pitch coaching for regional qualifiers.'
];

// KSEF event: March 29 – April 5, 2026
const EVENT_START = new Date('2026-03-29T08:00:00+03:00');
const EVENT_END = new Date('2026-04-05T18:00:00+03:00');

interface TimeLeft {
 days: number;
 hours: number;
 minutes: number;
 seconds: number;
}

function getCountdown(): { timeLeft: TimeLeft; status: 'upcoming' | 'live' | 'ended' } {
 const now = new Date();

 if (now >= EVENT_END) {
 return { timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 }, status: 'ended' };
 }

 if (now >= EVENT_START) {
 // Event is live — count down to end
 const diff = EVENT_END.getTime() - now.getTime();
 return {
 timeLeft: {
 days: Math.floor(diff / (1000 * 60 * 60 * 24)),
 hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
 minutes: Math.floor((diff / (1000 * 60)) % 60),
 seconds: Math.floor((diff / 1000) % 60),
 },
 status: 'live',
 };
 }

 // Upcoming — count down to start
 const diff = EVENT_START.getTime() - now.getTime();
 return {
 timeLeft: {
 days: Math.floor(diff / (1000 * 60 * 60 * 24)),
 hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
 minutes: Math.floor((diff / (1000 * 60)) % 60),
 seconds: Math.floor((diff / 1000) % 60),
 },
 status: 'upcoming',
 };
}

const KSEF = () => {
 const navigate = useNavigate();
 const [countdown, setCountdown] = useState(getCountdown);

 useEffect(() => {
 const interval = setInterval(() => {
 setCountdown(getCountdown());
 }, 1000);
 return () => clearInterval(interval);
 }, []);

 const { timeLeft, status } = countdown;

 return (
 <div className="bg-warm-50 ">
 <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200 ">
 <div className="code-bg absolute inset-0 opacity-30 " aria-hidden="true" />
 <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
 <div className="text-center text-white">
 <div className="inline-flex items-center bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-4">
 <Calendar className="h-4 w-4 mr-2" /> March 29 – April 5, 2026
 </div>
 <h1 className="heading-display text-4xl md:text-5xl font-bold tracking-tight mb-3">KSEF Program</h1>
 <p className="text-lg text-gray-700 mb-10 max-w-3xl mx-auto">
 Year-long support that gets Junior and Senior students exhibition-ready and keeps them iterating past April nationals.
 </p>

 {/* Countdown */}
 {status !== 'ended' && (
 <div className="max-w-lg mx-auto">
 <p className="text-sm font-medium text-emerald-400 mb-4 flex items-center justify-center">
 <Clock className="h-4 w-4 mr-1.5" aria-hidden="true" />
 {status === 'live' ? 'Event is live — ends in' : 'Starts in'}
 </p>
 <div className="grid grid-cols-4 gap-3 sm:gap-4">
 {[
 { value: timeLeft.days, label: 'Days' },
 { value: timeLeft.hours, label: 'Hours' },
 { value: timeLeft.minutes, label: 'Min' },
 { value: timeLeft.seconds, label: 'Sec' },
 ].map((unit) => (
 <div
 key={unit.label}
 className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl py-4 px-2"
 >
 <p className="text-3xl sm:text-4xl font-bold tabular-nums">
 {String(unit.value).padStart(2, '0')}
 </p>
 <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
 {unit.label}
 </p>
 </div>
 ))}
 </div>
 </div>
 )}

 {status === 'ended' && (
 <p className="text-lg text-emerald-400 font-medium">
 The 2026 KSEF exhibition has concluded. Thank you to everyone who participated.
 </p>
 )}
 </div>
 </div>
 </section>

 <section className="py-8 sm:py-12 lg:py-16">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-3">
 {highlights.map((item) => (
 <article key={item.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-soft-md transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5">
 <h2 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h2>
 <p className="text-sm text-gray-600 ">{item.detail}</p>
 </article>
 ))}
 </div>
 </section>

 <section className="pb-20 sm:pb-28">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="bg-gradient-to-br from-warm-100 to-warm-50 rounded-xl p-8 border border-gray-200 ">
 <h3 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6 flex items-center">
 <Beaker className="h-6 w-6 text-teal-600 mr-2" />
 Four-Step Timeline
 </h3>
 <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
 {timeline.map((point) => (
 <div key={point.month} className="p-4 bg-white rounded-xl shadow-soft-md border border-gray-100 text-center transition-all duration-300">
 <p className="text-sm font-semibold text-teal-600 ">{point.month}</p>
 <p className="text-xs text-gray-600 mt-2">{point.note}</p>
 </div>
 ))}
 </div>
 <p className="text-sm text-gray-500 mt-6 text-center">
 Nationals typically land in April, but ChipuRobo labs and mentors stay active through December so projects can evolve year-round.
 </p>
 </div>
 </div>
 </section>

 <section className="pb-20 sm:pb-28">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-2">
 <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-soft-md transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
 <Target className="h-5 w-5 text-emerald-500 mr-2" />
 What Learners Gain
 </h3>
 <ul className="space-y-3 text-sm text-gray-600 ">
 <li>Structured research logs that mirror CBC assessment.</li>
 <li>Prototype time with sensors, PET recycling labs, and AI kits.</li>
 <li>Pitch coaching ahead of school and regional juries.</li>
 </ul>
 </div>
 <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-soft-md transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5">
 <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
 <BookOpen className="h-5 w-5 text-green-500 mr-2" />
 Included Extras
 </h3>
 <ul className="space-y-3 text-sm text-gray-600 ">
 {extras.map((extra) => (
 <li key={extra} className="flex items-start">
 <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
 {extra}
 </li>
 ))}
 </ul>
 </div>
 </div>
 </section>

 <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200 py-8 sm:py-12 lg:py-16">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
 <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
 <Award className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
 <h3 className="text-3xl font-semibold tracking-tight mb-3">Launch Your KSEF Exhibit</h3>
 <p className="text-lg text-gray-300 mb-8">
 We distill the sprawling research cycle into a simple sprint so schools can compete without burning extra hours.
 </p>
 <button onClick={() => navigate('/contact')} className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-soft-xl">
 Talk to the Team
 </button>
 </div>
 </section>
 </div>
 );
};

export default KSEF;
