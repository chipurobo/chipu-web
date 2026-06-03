import { Linkedin, Users } from 'lucide-react';
import { teamMembers } from '../data/teamMembers';

const Team = () => {
 return (
 <div className="bg-warm-50 ">
 {/* Hero Section */}
 <section className="relative overflow-hidden bg-warm-50 border-b border-warm-200 ">
 <div className="code-bg absolute inset-0 opacity-30 " aria-hidden="true" />
 <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
 <div className="text-center">
 <Users className="h-12 w-12 text-terracotta-600 mx-auto mb-6" aria-hidden="true" />
 <h1 className="heading-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Our Team</h1>
 <p className="text-lg text-gray-700 max-w-3xl mx-auto">
 The ChipuRobo team brings together expertise in technology, education, finance, and community engagement to advance practical AI and STEM learning across Africa.
 </p>
 </div>
 </div>
 </section>

 {/* Team Grid */}
 <div className="section">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {teamMembers.map((member, index) => (
 <div
 key={index}
 className="group bg-white rounded-xl shadow-soft-md border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg text-center"
 >
 {/* Circular Photo */}
 <div className="pt-8 pb-4">
 {member.photo ? (
 <picture>
 <source srcSet={member.photo.replace(/\.(jpe?g|png|JPG|JPEG|PNG)$/i, '.webp')} type="image/webp" />
 <img
 src={member.photo}
 alt={member.name}
 width={112}
 height={112}
 loading="lazy"
 decoding="async"
 className="w-28 h-28 rounded-full object-cover object-center mx-auto ring-4 ring-teal-500/20 group-hover:ring-teal-500/40 transition-all duration-300"
 />
 </picture>
 ) : (
 <div className="w-28 h-28 rounded-full bg-gray-100 mx-auto flex items-center justify-center">
 <Users className="h-10 w-10 text-gray-400" />
 </div>
 )}
 </div>

 {/* Content */}
 <div className="px-6 pb-2">
 <h2 className="text-xl font-bold text-gray-900 ">{member.name}</h2>
 <p className="text-teal-600 font-medium text-sm mt-1">{member.role}</p>
 </div>

 <div className="px-6 pb-4">
 <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
 {member.bio}
 </p>
 </div>

 {/* Social Links */}
 <div className="px-6 pb-6 pt-2 border-t border-gray-100 mt-2">
 <div className="flex justify-center pt-4">
 <a
 href={member.social.linkedin}
 target="_blank"
 rel="noopener noreferrer"
 className="p-2.5 rounded-full bg-gray-100 text-gray-500 hover:bg-teal-50 hover:text-teal-600 transition-all duration-200"
 aria-label={`${member.name} on LinkedIn`}
 >
 <Linkedin className="h-4 w-4" />
 </a>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
};

export default Team;
