import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img src="/img/logo.png" alt="ChipuRobo Logo" className="h-10 w-10" />
              <span className="ml-3 text-2xl font-bold">ChipuRobo</span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Delivering inclusive AI and robotics education across Kenya with locally fabricated solutions and Code Clubs.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-green-500 transition">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-green-500 transition">About</Link></li>
              <li><Link to="/program" className="text-gray-400 hover:text-green-500 transition">Programs</Link></li>
              <li><Link to="/impact-2025" className="text-gray-400 hover:text-green-500 transition">2025 Impact</Link></li>
              <li><Link to="/register-2026" className="text-gray-400 hover:text-green-500 transition">Register 2026</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-6">Partners</h3>
            <ul className="space-y-2 text-gray-400">
              <li>eKitabu</li>
              <li>Microsoft ADC</li>
              <li>Raspberry Pi Foundation</li>
              <li>CEMASTEA</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-6">Contact</h3>
            <p className="text-gray-400 mb-2">
              Email: <a href="mailto:chipurobo@gmail.com" className="hover:text-green-500 transition">chipurobo@gmail.com</a>
            </p>
            <p className="text-gray-400">
              Phone: <a href="tel:+254700000000" className="hover:text-green-500 transition">+254 700 000 000</a>
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-6">Follow Us</h3>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-green-500 transition">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} <span className="font-semibold text-green-500">ChipuRobo</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;