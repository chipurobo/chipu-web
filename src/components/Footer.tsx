import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img src="/img/logo.png" alt="ChipuRobo Logo" className="h-10 w-10" />
              <span className="ml-3 text-2xl font-bold">ChipuRobo</span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Pioneering STEAM and Robotics in Africa. Empowering the next generation of innovators.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-green-500 transition">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-green-500 transition">About</Link></li>
              <li><Link to="/team" className="text-gray-400 hover:text-green-500 transition">Team</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-green-500 transition">Services</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-6">Contact</h3>
            <p className="text-gray-400">
              Email: <a href="mailto:chipurobo@gmail.com" className="hover:text-green-500 transition">chipurobo@gmail.com</a>
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