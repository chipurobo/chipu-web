import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
 return (
 <footer className="bg-gray-900 text-white scanlines">
 {/* Accent bar */}
 <div className="h-1 bg-gradient-to-r from-teal-500 via-terracotta-500 to-teal-500" aria-hidden="true" />

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
 {/* Brand */}
 <div>
 <Link to="/" className="flex items-center mb-5">
 <picture>
 <source srcSet="/img/logo.webp" type="image/webp" />
 <img
 src="/img/logo.png"
 alt="ChipuRobo Logo"
 width={40}
 height={40}
 loading="lazy"
 decoding="async"
 className="h-10 w-10 pixel-crisp"
 />
 </picture>
 <span className="ml-3 font-pixel text-sm tracking-wider text-teal-300 uppercase">
 ChipuRobo<span className="text-teal-500">_</span>
 </span>
 </Link>
 <p className="text-sm text-gray-400 leading-relaxed">
 Delivering inclusive AI &amp; robotics education across Kenya with locally fabricated solutions and Code Clubs.
 </p>
 <div className="flex space-x-4 mt-6">
 <a href="#" className="p-2.5 rounded-full bg-gray-800 text-gray-400 hover:bg-teal-500/10 hover:text-teal-400 transition-all duration-200" aria-label="Facebook">
 <Facebook className="h-5 w-5" />
 </a>
 <a href="#" className="p-2.5 rounded-full bg-gray-800 text-gray-400 hover:bg-teal-500/10 hover:text-teal-400 transition-all duration-200" aria-label="Twitter">
 <Twitter className="h-5 w-5" />
 </a>
 <a href="#" className="p-2.5 rounded-full bg-gray-800 text-gray-400 hover:bg-teal-500/10 hover:text-teal-400 transition-all duration-200" aria-label="LinkedIn">
 <Linkedin className="h-5 w-5" />
 </a>
 </div>
 </div>

 {/* Quick Links */}
 <div>
 <h3 className="font-pixel text-[0.65rem] tracking-widest text-teal-400 mb-6 uppercase">// Quick Links</h3>
 <ul className="space-y-2">
 {[
 { to: '/', label: 'Home' },
 { to: '/about', label: 'About' },
 { to: '/team', label: 'Team' },
 { to: '/ksef', label: 'KSEF' },
 { to: '/jss', label: 'JSS' },
 { to: '/bootcamps', label: 'Bootcamps' },
 { to: '/braille-challenge', label: 'Braille Challenge' },
 { to: '/impact', label: 'Impact' },
 { to: '/podcast', label: 'Podcast' },
 ].map((link) => (
 <li key={link.to}>
 <Link to={link.to} className="text-sm text-gray-400 hover:text-teal-300 hover:translate-x-1 inline-block transition-all duration-200">
 {link.label}
 </Link>
 </li>
 ))}
 </ul>
 </div>

 {/* Partners */}
 <div>
 <h3 className="font-pixel text-[0.65rem] tracking-widest text-teal-400 mb-6 uppercase">// Partners</h3>
 <ul className="space-y-2 text-sm text-gray-400">
 <li>eKitabu</li>
 <li>Microsoft ADC</li>
 <li>Raspberry Pi Foundation</li>
 <li>CEMASTEA</li>
 </ul>
 </div>

 {/* Contact */}
 <div>
 <h3 className="font-pixel text-[0.65rem] tracking-widest text-teal-400 mb-6 uppercase">// Contact</h3>
 <div className="space-y-3 text-sm">
 <p className="text-gray-400">
 Email:{' '}
 <a href="mailto:chipurobo@gmail.com" className="hover:text-teal-300 underline decoration-dotted underline-offset-4 transition-colors">chipurobo@gmail.com</a>
 </p>
 <p className="text-gray-400">
 Phone:{' '}
 <a href="tel:+254700000000" className="hover:text-teal-300 underline decoration-dotted underline-offset-4 transition-colors">+254 700 000 000</a>
 </p>
 </div>
 </div>
 </div>

 <div className="mt-16 pt-8 border-t-2 border-teal-500/20 text-center">
 <p className="text-sm text-gray-500">
 &copy; {new Date().getFullYear()}{' '}
 <span className="font-pixel text-xs text-teal-400 uppercase">ChipuRobo</span>
 . All rights reserved.
 </p>
 </div>
 </div>
 </footer>
 );
};

export default Footer;
