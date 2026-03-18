import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      {/* Accent bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-primary-500 to-emerald-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center mb-5">
              <img src="/img/logo.png" alt="ChipuRobo Logo" className="h-10 w-10" />
              <span className="ml-3 text-2xl font-bold">ChipuRobo</span>
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm">
              Delivering inclusive AI and robotics education across Kenya with locally fabricated solutions and Code Clubs.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="p-2.5 rounded-full bg-gray-800 text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-200" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-gray-800 text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-200" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-gray-800 text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-200" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About' },
                { to: '/team', label: 'Team' },
                { to: '/ksef', label: 'KSEF' },
                { to: '/jss', label: 'JSS' },
                { to: '/adc-bootcamp', label: 'ADC Bootcamp' },
                { to: '/hackathons', label: 'Hackathons' },
                { to: '/impact', label: 'Impact' },
                { to: '/register-2026', label: 'Register 2026' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 hover:text-emerald-400 hover:translate-x-1 inline-block transition-all duration-200 text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-6">Partners</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>eKitabu</li>
              <li>Microsoft ADC</li>
              <li>Raspberry Pi Foundation</li>
              <li>CEMASTEA</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-6">Contact</h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-400">
                Email: <a href="mailto:chipurobo@gmail.com" className="hover:text-emerald-400 transition-colors">chipurobo@gmail.com</a>
              </p>
              <p className="text-gray-400">
                Phone: <a href="tel:+254700000000" className="hover:text-emerald-400 transition-colors">+254 700 000 000</a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} <span className="font-semibold text-emerald-500">ChipuRobo</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
