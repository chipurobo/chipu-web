import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

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
 alt=""
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
 <a
 href="https://www.linkedin.com/company/chipurobo-center/"
 target="_blank"
 rel="noopener noreferrer"
 className="p-2.5 rounded-full bg-gray-800 text-gray-400 hover:bg-teal-500/10 hover:text-teal-400 transition-all duration-200"
 aria-label="ChipuRobo on LinkedIn (opens in new tab)"
 >
 <Linkedin className="h-5 w-5" aria-hidden="true" />
 </a>
 <a
 href="https://www.facebook.com/profile.php?id=61559555720840"
 target="_blank"
 rel="noopener noreferrer"
 className="p-2.5 rounded-full bg-gray-800 text-gray-400 hover:bg-teal-500/10 hover:text-teal-400 transition-all duration-200"
 aria-label="ChipuRobo on Facebook (opens in new tab)"
 >
 <Facebook className="h-5 w-5" aria-hidden="true" />
 </a>
 <a
 href="https://www.instagram.com/chipurobo/"
 target="_blank"
 rel="noopener noreferrer"
 className="p-2.5 rounded-full bg-gray-800 text-gray-400 hover:bg-teal-500/10 hover:text-teal-400 transition-all duration-200"
 aria-label="ChipuRobo on Instagram (opens in new tab)"
 >
 <Instagram className="h-5 w-5" aria-hidden="true" />
 </a>
 <a
 href="https://www.tiktok.com/@chipurobo"
 target="_blank"
 rel="noopener noreferrer"
 className="p-2.5 rounded-full bg-gray-800 text-gray-400 hover:bg-teal-500/10 hover:text-teal-400 transition-all duration-200"
 aria-label="ChipuRobo on TikTok (opens in new tab)"
 >
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
 <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
 </svg>
 </a>
 </div>
 </div>

 {/* Quick Links */}
 <nav aria-labelledby="footer-quicklinks-heading">
 <h3 id="footer-quicklinks-heading" className="font-pixel text-[0.65rem] tracking-widest text-teal-400 mb-6 uppercase">// Quick Links</h3>
 <ul className="space-y-2">
 {[
 { to: '/', label: 'Home' },
 { to: '/about', label: 'About' },
 { to: '/about#team', label: 'Staff' },
 { to: '/programs', label: 'Programs' },
 { to: '/kesho', label: 'Kesho Hackathon' },
 { to: '/impact', label: 'Impact' },
 { to: '/podcast', label: 'Podcast' },
 { to: '/contact', label: 'Contact' },
 ].map((link) => (
 <li key={link.to}>
 <Link to={link.to} className="text-sm text-gray-400 hover:text-teal-300 hover:translate-x-1 inline-block transition-all duration-200">
 {link.label}
 </Link>
 </li>
 ))}
 </ul>
 </nav>

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
