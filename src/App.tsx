import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Team from './pages/Team';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Microsoft from './pages/Microsoft';
import KSEF from './pages/KSEF';
import JSS from './pages/JSS';
import ADCBootcamp from './pages/ADCBootcamp';
import Hackathons from './pages/Hackathons';
import Sustainability from './pages/Sustainability';
import Impact from './pages/Impact';
import EmailRegistration2026 from './pages/EmailRegistration2026';
import NotFound from './pages/NotFound';

function App() {
  // Accessibility: Announce route changes to screen readers
  useEffect(() => {
    const handleRouteChange = () => {
      const routeAnnouncement = document.getElementById('route-announcer');
      if (routeAnnouncement) {
        const currentPath = window.location.pathname;
        const pageName = getPageTitle(currentPath);
        routeAnnouncement.textContent = `Navigated to ${pageName} page`;

        // Update document title for SEO
        document.title = pageName === 'Home'
          ? 'ChipuRobo - Robotics & AI Education'
          : `${pageName} | ChipuRobo`;
        
        // Focus main content for screen readers
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus({ preventScroll: true });
        }
      }
    };

    // Set initial page title
    handleRouteChange();
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const getPageTitle = (path: string): string => {
    switch (path) {
      case '/': return 'Home';
      case '/about': return 'About ChipuRobo';
      case '/ksef': return 'KSEF Program';
      case '/jss': return 'JSS Program';
      case '/adc-bootcamp': return 'ADC Bootcamp';
      case '/hackathons': return 'Hackathons';
      case '/sustainability': return 'Sustainability';
      case '/team': return 'Our Team';
      case '/services': return 'Our Services';
      case '/contact': return 'Contact Us';
      case '/blog': return 'Blog';
      case '/microsoft': return 'Microsoft Partnership';
      case '/impact': return 'Impact Report';
      case '/register-2026': return '2026 Registration';
      default: return 'ChipuRobo';
    }
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Skip to main content link for keyboard navigation */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50 transition-all focus:z-50"
          >
            Skip to main content
          </a>
          
          {/* Route announcements for screen readers */}
          <div id="route-announcer" className="sr-only" aria-live="polite" role="status"></div>
          
          {/* Header */}
          <header role="banner">
            <Navbar />
          </header>

          {/* Main content */}
          <main id="main-content" role="main" tabIndex={-1} className="focus:outline-none">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/ksef" element={<KSEF />} />
              <Route path="/jss" element={<JSS />} />
              <Route path="/adc-bootcamp" element={<ADCBootcamp />} />
              <Route path="/hackathons" element={<Hackathons />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/team" element={<Team />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/microsoft" element={<Microsoft />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="/register-2026" element={<EmailRegistration2026 />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer role="contentinfo">
            <Footer />
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
