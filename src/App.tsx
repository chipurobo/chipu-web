import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Team from './components/Team';
import Services from './components/Services';
import Contact from './components/Contact';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import Footer from './components/Footer';
import Microsoft from './components/Microsoft';
import Program from './components/Program';
import Sustainability from './components/Sustainability';
import Impact2025 from './components/Impact2025';
import EmailRegistration2026 from './components/EmailRegistration2026';
import NotFound from './components/NotFound';

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
          mainContent.focus();
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
      case '/program': return 'AI & Robotics Program';
      case '/sustainability': return 'Sustainability';
      case '/team': return 'Our Team';
      case '/services': return 'Our Services';
      case '/contact': return 'Contact Us';
      case '/blog': return 'Blog';
      case '/microsoft': return 'Microsoft Partnership';
      case '/impact-2025': return '2025 Impact Report';
      case '/register-2026': return '2026 Registration';
      default: return 'ChipuRobo';
    }
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-dyslexic">
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
              <Route path="/program" element={<Program />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/team" element={<Team />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/microsoft" element={<Microsoft />} />
              <Route path="/impact-2025" element={<Impact2025 />} />
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