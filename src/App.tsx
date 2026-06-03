import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Programs from './pages/Programs';
import InclusiveRobotics from './pages/InclusiveRobotics';
import MicrosoftBootcamps from './pages/MicrosoftBootcamps';
import Hackathons from './pages/Hackathons';
import { getCurrentHackathonNavLabel, allHackathonSlugs } from './data/hackathons';
import Sustainability from './pages/Sustainability';
import Impact from './pages/Impact';
import EmailRegistration2026 from './pages/EmailRegistration2026';
import NotFound from './pages/NotFound';
import Podcast from './pages/Podcast';

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

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const getPageTitle = (path: string): string => {
    switch (path) {
      case '/': return 'Home';
      case '/about': return 'About ChipuRobo';
      case '/programs': return 'Programs';
      case '/inclusive-robotics': return 'Inclusive Robotics';
      case '/microsoft-bootcamps': return 'Microsoft Bootcamps';
      case '/hackathons':
      case '/hackathon':
        return `${getCurrentHackathonNavLabel()} Hackathon`;
      // Legacy paths — same redirect destinations as the route table below
      case '/ksef': return 'Inclusive Robotics';
      case '/jss': return 'Inclusive Robotics';
      case '/bootcamps': return 'Microsoft Bootcamps';
      case '/adc-bootcamp': return 'Microsoft Bootcamps';
      case '/finsec': return 'Hackathons';
      // Standalone pages
      case '/sustainability': return 'Sustainability';
      case '/team': return 'Our Team';
      case '/services': return 'Our Services';
      case '/contact': return 'Contact Us';
      case '/blog': return 'Blog';
      case '/microsoft': return 'Microsoft Partnership';
      case '/impact': return 'Impact Report';
      case '/register-2026': return '2026 Registration';
      case '/podcast': return 'Africa Builds Podcast';
      default: return 'ChipuRobo';
    }
  };

  return (
    <Router
      future={{
        // Opt-in to React Router v7 behaviours so the v6 deprecation
        // warnings in the console go away. Both are no-ops for v6 today.
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="min-h-screen flex flex-col bg-warm-50">
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
        <main id="main-content" role="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />

            {/* Programs umbrella + Inclusive Robotics */}
            <Route path="/programs" element={<Programs />} />
            <Route path="/inclusive-robotics" element={<InclusiveRobotics />} />
            <Route path="/microsoft-bootcamps" element={<MicrosoftBootcamps />} />

            {/* Hackathons — one page renders whichever event is current
                (driven by src/data/hackathons.ts). Past/known slugs all
                redirect to /hackathons so any old QR code or referrer
                still lands correctly. */}
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/hackathon" element={<Navigate to="/hackathons" replace />} />
            {allHackathonSlugs().map((slug) => (
              <Route
                key={slug}
                path={`/${slug}`}
                element={<Navigate to="/hackathons" replace />}
              />
            ))}
            {/* Legacy hackathon slugs that pre-date the data file */}
            <Route path="/kesho-hackathon" element={<Navigate to="/hackathons" replace />} />
            <Route path="/finsec" element={<Navigate to="/hackathons" replace />} />

            {/* Legacy program routes — KSEF, JSS, Bootcamps now live inside Inclusive Robotics
                stages, so redirect to the relevant anchor. */}
            <Route path="/ksef" element={<Navigate to="/inclusive-robotics#year-round" replace />} />
            <Route path="/jss" element={<Navigate to="/inclusive-robotics#year-round" replace />} />
            <Route path="/bootcamps" element={<Navigate to="/microsoft-bootcamps" replace />} />
            <Route path="/adc-bootcamp" element={<Navigate to="/microsoft-bootcamps" replace />} />

            {/* Legacy hackathon route */}
            <Route path="/finsec" element={<Navigate to="/hackathons" replace />} />

            {/* Standalone pages */}
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/team" element={<Team />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/microsoft" element={<Microsoft />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/register-2026" element={<EmailRegistration2026 />} />
            <Route path="/podcast" element={<Podcast />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer role="contentinfo">
          <Footer />
        </footer>
      </div>
    </Router>
  );
}

export default App;
