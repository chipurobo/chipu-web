import { Link } from 'react-router-dom';
import { Target, Users, Lightbulb, GraduationCap, Globe, MapPin, Recycle, ArrowRight, Linkedin } from 'lucide-react';
import { teamMembers } from '../data/teamMembers';

const About = () => {
 const achievements = [
 {
 icon: Users,
 title: "800+ Learners Reached",
 description: "Through AI Literacy Bootcamps and Code Clubs in 2025"
 },
 {
 icon: GraduationCap,
 title: "60+ Schools & CBC Aligned",
 description: "Partnered with Raspberry Pi Foundation, integrated with national curriculum frameworks"
 },
 {
 icon: Recycle,
 title: "PET Recycling Innovation",
 description: "Converting plastic waste to 3D printing materials across 13 locations"
 }
 ];

 const values = [
 {
 icon: Lightbulb,
 title: "Innovation & Inclusion",
 description: "Pioneer new paths while ensuring universal access to STEM for learners of all abilities"
 },
 {
 icon: Recycle,
 title: "Sustainability",
 description: "Transforming PET waste into robot parts and empowering communities"
 },
 {
 icon: Globe,
 title: "Pan-African Vision",
 description: "Building a connected innovation ecosystem across the continent"
 }
 ];

 return (
 <div className="bg-warm-50 ">
 {/* Hero Section */}
 <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200 ">
 <div className="code-bg absolute inset-0 opacity-30 " aria-hidden="true" />
 <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
 <div className="text-center">
 <MapPin className="h-12 w-12 text-terracotta-600 mx-auto mb-6" aria-hidden="true" />
 <h1 className="heading-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
 Inclusive AI & Robotics Education
 </h1>
 <p className="text-lg text-gray-700 max-w-3xl mx-auto">
 We deliver practical AI and robotics lessons with locally fabricated kits across Kenya.
 </p>
 </div>
 </div>
 </section>

 {/* Story Section */}
 <section className="mb-24" aria-labelledby="about-story-title">
 <div className="bg-gradient-to-br from-warm-100 to-warm-50 p-12 rounded-2xl border border-gray-200 ">
 <h2 id="about-story-title" className="text-3xl font-bold text-center text-gray-900 mb-8 dyslexic-text">
 Our Story
 </h2>
 <div className="max-w-4xl mx-auto space-y-6">
 <div className="bg-white p-6 rounded-lg border-l-4 border-emerald-500 shadow-sm">
 <p className="text-xl leading-relaxed text-gray-700 dyslexic-text">
 ChipuRobo offers inclusive, hands-on AI and robotics education using locally fabricated kits to bridge classrooms and emerging tech.
 </p>
 </div>
 
 <div className="bg-white p-6 rounded-lg border-l-4 border-green-500 shadow-sm">
 <p className="text-lg leading-relaxed text-gray-700 dyslexic-text">
 Programs such as AI Literacy Bootcamps and Raspberry Pi-powered Code Clubs reach learners of every ability with Braille and KSL-ready tools.
 </p>
 </div>
 
 <div className="bg-white p-6 rounded-lg border-l-4 border-green-500 shadow-sm">
 <p className="text-lg leading-relaxed font-medium text-gray-700 dyslexic-text">
 Partnerships with eKitabu, Microsoft ADC, Raspberry Pi, and CEMASTEA align us to CBC and fuel PET recycling labs that supply filament for classes.
 </p>
 </div>
 </div>
 </div>
 </section>

 {/* Mission & Vision */}
 <section className="mb-24" aria-labelledby="mission-vision-title">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <h2 id="mission-vision-title" className="sr-only">Mission and Vision</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
 <article className="bg-white p-8 rounded-xl shadow-soft-md border border-gray-100 hover:shadow-soft-lg transition-all duration-300">
 <div className="bg-teal-50 p-3 rounded-xl w-fit mb-6">
 <Target className="h-10 w-10 text-teal-600 " aria-hidden="true" />
 </div>
 <h3 className="text-2xl font-semibold text-gray-900 mb-4">
 Our Mission
 </h3>
 <div className="space-y-3">
 <p className="text-gray-600 ">
 Deliver inclusive AI and robotics training with locally built equipment.
 </p>
 <p className="text-gray-600 ">
 We weave digital fabrication into CBC, launch Code Clubs, and design accessible kits for every learner.
 </p>
 </div>
 </article>

 <article className="bg-white p-8 rounded-xl shadow-soft-md border border-gray-100 hover:shadow-soft-lg transition-all duration-300">
 <div className="bg-teal-50 p-3 rounded-xl w-fit mb-6">
 <Globe className="h-10 w-10 text-teal-600 " aria-hidden="true" />
 </div>
 <h3 className="text-2xl font-semibold text-gray-900 mb-4">
 Our Vision
 </h3>
 <div className="space-y-3">
 <p className="text-gray-600 ">
 Build Kenya's leading inclusive tech education network.
 </p>
 <p className="text-gray-600 ">
 Every student should access AI and robotics through locally fabricated, inclusive tools.
 </p>
 </div>
 </article>
 </div>
 </div>
 </section>

 {/* Achievements */}
 <section className="section" aria-labelledby="achievements-title">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-16">
 <h2 id="achievements-title" className="heading-display text-3xl font-bold text-gray-900 mb-4">
 Milestones <span className="text-gray-400 ">That Matter</span>
 </h2>
 <p className="text-lg text-gray-600 ">
 Highlights from August to October 2025
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {achievements.map((achievement, index) => (
 <article
 key={index}
 className="bg-white p-8 rounded-xl shadow-soft-md border border-gray-100 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg"
 aria-labelledby={`achievement-title-${index}`}
 >
 <div className="bg-teal-50 p-3 rounded-xl w-fit mx-auto mb-6">
 <achievement.icon className="h-10 w-10 text-teal-600 " aria-hidden="true" />
 </div>
 <h3 id={`achievement-title-${index}`} className="text-xl font-semibold text-gray-900 mb-3">
 {achievement.title}
 </h3>
 <p className="text-gray-600 text-sm">
 {achievement.description}
 </p>
 </article>
 ))}
 </div>
 </div>
 </section>

 {/* Staff / Team */}
 <section id="team" className="scroll-mt-20 py-16 sm:py-20 bg-warm-100/60 border-y border-warm-200" aria-labelledby="team-title">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <p className="font-pixel text-[0.55rem] sm:text-[0.65rem] tracking-[0.25em] text-terracotta-600 mb-5 uppercase">
 // staff
 </p>
 <h2 id="team-title" className="heading-display text-2xl md:text-3xl text-gray-900 mb-4">
 The People Behind the Programs
 </h2>
 <p className="text-base text-gray-700 max-w-2xl mx-auto">
 ChipuRobo runs because of educators, engineers, and operators who show up to the labs every week.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {teamMembers.map((member) => (
 <div
 key={member.name}
 className="bg-white rounded-xl p-5 border border-gray-100 shadow-soft-sm hover:shadow-soft-md transition-all duration-300 text-center"
 >
 <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center overflow-hidden ring-2 ring-teal-500/20">
 {member.photo ? (
 <picture>
 <source srcSet={member.photo.replace(/\.(jpe?g|png|JPG|JPEG|PNG)$/i, '.webp')} type="image/webp" />
 <img
 src={member.photo}
 alt={member.name}
 width={80}
 height={80}
 loading="lazy"
 decoding="async"
 className="w-20 h-20 object-cover"
 />
 </picture>
 ) : (
 <Users className="h-8 w-8 text-gray-400" />
 )}
 </div>
 <h3 className="text-base font-semibold text-gray-900 mb-1">{member.name}</h3>
 <p className="text-xs text-teal-600 font-medium mb-3">{member.role}</p>
 <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">{member.bio}</p>
 <div className="flex justify-center pt-3 border-t border-gray-100">
 <a
 href={member.social.linkedin}
 target="_blank"
 rel="noopener noreferrer"
 className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-teal-50 hover:text-teal-600 transition-colors"
 aria-label={`${member.name} on LinkedIn`}
 >
 <Linkedin className="h-3.5 w-3.5" />
 </a>
 </div>
 </div>
 ))}
 </div>

 <div className="text-center mt-10">
 <Link
 to="/team"
 className="inline-flex items-center text-terracotta-600 hover:text-terracotta-700 font-medium text-sm transition-colors"
 >
 See full team page
 <ArrowRight className="ml-2 h-4 w-4" />
 </Link>
 </div>
 </div>
 </section>

 {/* Values */}
 <section className="mx-4 sm:mx-6 lg:mx-8 mb-20 sm:mb-28 lg:mb-32 mt-20">
 <div className="max-w-7xl mx-auto bg-gray-900 rounded-2xl p-10 sm:p-14 scanlines" aria-labelledby="values-title">
 <div className="text-center mb-12">
 <h2 id="values-title" className="heading-display text-3xl font-bold text-white mb-4">
 What Drives Us
 </h2>
 <p className="text-lg text-gray-300 max-w-3xl mx-auto">
 Principles powering our Pan-African robotics work
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {values.map((value, index) => (
 <article
 key={index}
 className="bg-white/5 backdrop-blur-lg p-6 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 hover:-translate-y-1"
 aria-labelledby={`value-title-${index}`}
 >
 <div className="bg-green-500/10 p-3 rounded-xl w-fit mb-5">
 <value.icon className="h-8 w-8 text-green-400" aria-hidden="true" />
 </div>
 <h3 id={`value-title-${index}`} className="text-lg font-semibold text-white mb-3">
 {value.title}
 </h3>
 <p className="text-gray-300 text-sm leading-relaxed">
 {value.description}
 </p>
 </article>
 ))}
 </div>
 </div>
 </section>
 </div>
 );
};

export default About;
