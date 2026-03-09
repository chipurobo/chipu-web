import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigationLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/ksef', label: 'KSEF' },
    { to: '/jss', label: 'JSS' },
    { to: '/adc-bootcamp', label: 'ADC Bootcamp' },
    { to: '/hackathons', label: 'Hackathons' },
    { to: '/impact', label: 'Impact' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800 transition-colors relative" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="flex items-center focus-visible" 
            aria-label="ChipuRobo home"
          >
            <img src="/img/logo.png" alt="ChipuRobo Logo" className="h-8 w-8" />
            <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white dyslexic-text">ChipuRobo</span>
          </Link>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="ml-2 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible"
              aria-expanded={isMenuOpen.toString()}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 dyslexic-text focus-visible transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link 
              to="/register-2026" 
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-semibold dyslexic-text focus-visible"
              aria-label="Register for 2026 program"
            >
              Register 2026
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        id="mobile-menu"
        className={`md:hidden transition-all duration-300 ${isMenuOpen ? 'block opacity-100' : 'hidden opacity-0'}`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700">
          {navigationLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 dyslexic-text focus-visible transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/register-2026"
            className="block mx-3 mt-4 mb-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold text-center dyslexic-text focus-visible"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Register for 2026 program"
          >
            Register 2026
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;