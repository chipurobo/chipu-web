import React from 'react';
import { Link } from 'react-router-dom';
import { Notebook as Robot } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <Robot className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-xl font-semibold">ChipuRobo</span>
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600">Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-green-600">About</Link>
            <Link to="/team" className="text-gray-700 hover:text-green-600">Team</Link>
            <Link to="/services" className="text-gray-700 hover:text-green-600">Services</Link>
            <Link to="/contact" className="text-gray-700 hover:text-green-600">Contact</Link>
          </div>
          <div>
            <a href="tel:+254715067441" className="text-green-600 hover:text-green-700 font-medium">
              +254 715 067 441
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;