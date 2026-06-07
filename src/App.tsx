import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
// Programs page IS the (formerly Inclusive Robotics) three-stage page.
import InclusiveRobotics from './pages/InclusiveRobotics';
import MicrosoftBootcamps from './pages/MicrosoftBootcamps';
import Hackathons from './pages/Hackathons';
import Sustainability from './pages/Sustainability';

// === Dashboard (Supabase-backed) ===
import { AuthProvider } from './lib/auth';
import { RequireAuth } from './dashboard/RequireAuth';
import { DashboardLayout } from './dashboard/DashboardLayout';
import { DashboardHome } from './dashboard/DashboardHome';
import { Login as DashLogin } from './dashboard/Login';
import { Welcome as DashWelcome } from './dashboard/Welcome';
// Self-signup removed — schools are created by ChipuRobo admin.
import { AdminSchools } from './dashboard/admin/Schools';
import { AdminProducts } from './dashboard/admin/Products';
import { AdminOrders } from './dashboard/admin/Orders';
import { AdminDistribute } from './dashboard/admin/Distribute';
import { SchoolMembers } from './dashboard/school/Members';
import { SchoolOrders } from './dashboard/school/Orders';
import { SchoolStock } from './dashboard/school/Stock';
import { SchoolProduction } from './dashboard/school/Production';
import { ComingSoon } from './dashboard/ComingSoon';
import Impact from './pages/Impact';
import MakerSpaces from './pages/MakerSpaces';
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
      case '/inclusive-robotics': return 'Programs';
      case '/microsoft-bootcamps': return 'Microsoft Bootcamps';
      // === CURRENT HACKATHON: Kesho ===
      // When a new hackathon comes around, change these case labels and the
      // routes below to match the new event slug.
      case '/kesho': return 'Kesho Hackathon';
      case '/hackathons':
      case '/hackathon':
      case '/braille-challenge':
      case '/finsec':
      case '/kesho-hackathon':
        return 'Kesho Hackathon';
      // Legacy paths — same redirect destinations as the route table below
      case '/ksef': return 'Programs';
      case '/jss': return 'Programs';
      case '/bootcamps': return 'Microsoft Bootcamps';
      case '/adc-bootcamp': return 'Microsoft Bootcamps';
      // Standalone pages
      case '/sustainability': return 'Sustainability';
      case '/team': return 'Our Team';
      case '/services': return 'Our Services';
      case '/contact': return 'Contact Us';
      case '/blog': return 'Blog';
      case '/microsoft': return 'Microsoft Partnership';
      case '/impact': return 'Impact Report';
      case '/maker-spaces': return 'Maker Spaces';
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
      <AuthProvider>
        <Routes>
          {/* === Dashboard tree ===
              Has its own layout (no public navbar/footer). The login + signup
              pages render bare; everything else is gated by <RequireAuth>. */}
          <Route path="/dashboard/login" element={<DashLogin />} />
          <Route path="/dashboard/welcome" element={<DashWelcome />} />
          {/* Legacy self-signup URL — redirect to login. */}
          <Route path="/dashboard/register-club" element={<Navigate to="/dashboard/login" replace />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route
              path="admin/schools"
              element={<RequireAuth role="admin"><AdminSchools /></RequireAuth>}
            />
            <Route
              path="admin/products"
              element={<RequireAuth role="admin"><AdminProducts /></RequireAuth>}
            />
            <Route
              path="admin/orders"
              element={<RequireAuth role="admin"><AdminOrders /></RequireAuth>}
            />
            <Route
              path="admin/distribute"
              element={<RequireAuth role="admin"><AdminDistribute /></RequireAuth>}
            />
            <Route path="school/members" element={<SchoolMembers />} />
            <Route path="school/orders" element={<SchoolOrders />} />
            <Route path="school/stock" element={<SchoolStock />} />
            <Route path="school/production" element={<SchoolProduction />} />
          </Route>

          {/* === Public marketing site ===
              Everything that isn't /dashboard/* gets the navbar + footer
              chrome via <PublicLayout>. */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />

            {/* Programs IS the three-stage page (Outreach / Microsoft Bootcamps /
                Training Across the Year). What used to be /inclusive-robotics
                now lives at /programs; the old slug redirects. */}
            <Route path="/programs" element={<InclusiveRobotics />} />
            <Route path="/inclusive-robotics" element={<Navigate to="/programs" replace />} />
            <Route path="/microsoft-bootcamps" element={<MicrosoftBootcamps />} />

            {/* === CURRENT HACKATHON: Kesho === */}
            <Route path="/kesho" element={<Hackathons />} />
            {/* Legacy and alternate URLs all redirect to the current event. */}
            <Route path="/hackathons" element={<Navigate to="/kesho" replace />} />
            <Route path="/hackathon" element={<Navigate to="/kesho" replace />} />
            <Route path="/kesho-hackathon" element={<Navigate to="/kesho" replace />} />
            <Route path="/braille-challenge" element={<Navigate to="/kesho" replace />} />
            <Route path="/finsec" element={<Navigate to="/kesho" replace />} />

            {/* Legacy program routes — KSEF, JSS, Bootcamps now live inside Inclusive Robotics
                stages, so redirect to the relevant anchor. */}
            <Route path="/ksef" element={<Navigate to="/programs#year-round" replace />} />
            <Route path="/jss" element={<Navigate to="/programs#year-round" replace />} />
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
            <Route path="/maker-spaces" element={<MakerSpaces />} />
            <Route path="/register-2026" element={<EmailRegistration2026 />} />
            <Route path="/podcast" element={<Podcast />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

/** Layout for the public marketing site — navbar + main + footer chrome. */
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50 transition-all focus:z-50"
      >
        Skip to main content
      </a>

      <div id="route-announcer" className="sr-only" aria-live="polite" role="status"></div>

      <header role="banner">
        <Navbar />
      </header>

      <main id="main-content" role="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      <footer role="contentinfo">
        <Footer />
      </footer>
    </div>
  );
}

export default App;
