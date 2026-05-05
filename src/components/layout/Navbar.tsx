import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigationLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/ksef', label: 'KSEF' },
    { to: '/jss', label: 'JSS' },
    { to: '/bootcamps', label: 'Bootcamps' },
    { to: '/braille-challenge', label: 'Braille' },
    { to: '/impact', label: 'Impact' },
    { to: '/podcast', label: 'Podcast' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-warm-50/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-soft-sm'
          : 'bg-warm-50 dark:bg-gray-900'
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center focus-visible"
            aria-label="ChipuRobo home"
          >
            <picture>
              <source srcSet="/img/logo.webp" type="image/webp" />
              <img
                src="/img/logo.png"
                alt="ChipuRobo Logo"
                width={32}
                height={32}
                className="h-8 w-8 pixel-crisp"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
            <span className="ml-3 font-pixel text-xs sm:text-sm tracking-wider text-gray-900 dark:text-teal-300 uppercase">
              ChipuRobo<span className="text-teal-500">_</span>
            </span>
          </Link>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="ml-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-warm-200 dark:hover:bg-gray-800 focus-visible transition-colors"
              aria-expanded={isMenuOpen}
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
          <div className="hidden md:flex items-center space-x-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus-visible transition-colors lowercase tracking-wide after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-px after:w-0 hover:after:w-3/4 after:bg-gray-900 dark:after:bg-white after:transition-all after:duration-200"
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="px-4 pt-2 pb-4 space-y-1 bg-warm-50/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-warm-200 dark:border-gray-700/50">
          {navigationLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-4 py-2.5 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-warm-100 dark:hover:bg-gray-800 focus-visible transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
