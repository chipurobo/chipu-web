import { Mail, MapPin, Linkedin, MessageSquare, User, Building, Wrench, Clock, Globe, Heart } from 'lucide-react';

const Contact = () => {
 const contactStats = [
 { icon: Clock, value: '48h', label: 'Response Time' },
 { icon: Globe, value: '47+', label: 'Counties Reached' },
 { icon: Heart, value: '800+', label: 'Happy Learners' }
 ];

 return (
 <div className="bg-white">
 {/* Hero Section */}
 <section className="relative overflow-hidden bg-gradient-to-br from-[#012414] via-[#035f3f] to-[#0ea463]">
 <div
 className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"
 aria-hidden="true"
 />
 <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
 <div className="text-center mb-16">
 <div className="inline-block mb-6">
 <MessageSquare
 className="h-16 w-16 text-white mx-auto animate-pulse-slow"
 aria-hidden="true"
 />
 </div>
 <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 dyslexic-text">
 Let's Connect
 </h1>
 <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-4xl mx-auto dyslexic-text">
 Ready to bring AI and robotics education to your school? We're here to help you start your journey.
 </p>

 {/* Quick Stats */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
 {contactStats.map((stat, index) => (
 <div
 key={index}
 className="bg-white/10 backdrop-blur-lg rounded-lg p-6 hover:bg-white/20 transition-all duration-300"
 >
 <stat.icon
 className="h-8 w-8 text-white mx-auto mb-3"
 aria-hidden="true"
 />
 <div className="text-2xl font-bold text-white mb-1 dyslexic-text">
 {stat.value}
 </div>
 <div className="text-green-100 text-sm dyslexic-text">
 {stat.label}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>
 </div>
 );
};

export default Contact;
