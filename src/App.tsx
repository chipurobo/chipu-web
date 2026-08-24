import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// === Home stays eager ===
// Home is the LCP page for every first visit and is the most likely
// landing route, so we want it bundled with the initial JS. Everything
// else is lazy so a public visitor doesn't download dashboard code and
// a logged-in admin doesn't download marketing pages.
import Home from './pages/Home';

// === Public marketing pages — lazy ===
const About                 = lazy(() => import('./pages/About'));
const Team                  = lazy(() => import('./pages/Team'));
const Services              = lazy(() => import('./pages/Services'));
const Contact               = lazy(() => import('./pages/Contact'));
const Blog                  = lazy(() => import('./pages/Blog'));
const BlogPost              = lazy(() => import('./pages/BlogPost'));
const Microsoft             = lazy(() => import('./pages/Microsoft'));
const InclusiveRobotics     = lazy(() => import('./pages/InclusiveRobotics'));
const MicrosoftBootcamps    = lazy(() => import('./pages/MicrosoftBootcamps'));
const Sustainability        = lazy(() => import('./pages/Sustainability'));
const Impact                = lazy(() => import('./pages/Impact'));
const MakerSpaces           = lazy(() => import('./pages/MakerSpaces'));
const NotFound              = lazy(() => import('./pages/NotFound'));
const Podcast               = lazy(() => import('./pages/Podcast'));

// === Dashboard (Supabase-backed) — auth + layout eager so the gate is fast,
// every screen inside the gate lazy. ===
import { AuthProvider } from './lib/auth';
import { trackPageView } from './lib/analytics';
import { RequireAuth } from './dashboard/RequireAuth';
import { DashboardLayout } from './dashboard/DashboardLayout';

const DashLogin             = lazy(() => import('./dashboard/Login').then((m) => ({ default: m.Login })));
const DashWelcome           = lazy(() => import('./dashboard/Welcome').then((m) => ({ default: m.Welcome })));
const DashboardHome         = lazy(() => import('./dashboard/DashboardHome').then((m) => ({ default: m.DashboardHome })));
const AdminSchools          = lazy(() => import('./dashboard/admin/Schools').then((m) => ({ default: m.AdminSchools })));
const AdminSchoolDetails    = lazy(() => import('./dashboard/admin/SchoolDetails').then((m) => ({ default: m.AdminSchoolDetails })));
const AdminProducts         = lazy(() => import('./dashboard/admin/Products').then((m) => ({ default: m.AdminProducts })));
const AdminOrders           = lazy(() => import('./dashboard/admin/Orders').then((m) => ({ default: m.AdminOrders })));
const AdminDistribute       = lazy(() => import('./dashboard/admin/Distribute').then((m) => ({ default: m.AdminDistribute })));
const AdminCertifications   = lazy(() => import('./dashboard/admin/Certifications').then((m) => ({ default: m.AdminCertifications })));
const AdminOutreach         = lazy(() => import('./dashboard/admin/Events').then((m) => ({ default: m.AdminEvents })));
const AdminLessons          = lazy(() => import('./dashboard/admin/Lessons').then((m) => ({ default: m.AdminLessons })));
const AdminCompetitions     = lazy(() => import('./dashboard/admin/Competitions').then((m) => ({ default: m.AdminCompetitions })));
const AdminWorkshops        = lazy(() => import('./dashboard/admin/Workshops').then((m) => ({ default: m.AdminWorkshops })));
const AdminProjects         = lazy(() => import('./dashboard/admin/Projects').then((m) => ({ default: m.AdminProjects })));
const SchoolCertificates    = lazy(() => import('./dashboard/school/Certificates').then((m) => ({ default: m.SchoolCertificates })));
const Certificate           = lazy(() => import('./dashboard/Certificate').then((m) => ({ default: m.Certificate })));
const SchoolMembers         = lazy(() => import('./dashboard/school/Members').then((m) => ({ default: m.SchoolMembers })));
const SchoolOrders          = lazy(() => import('./dashboard/school/Orders').then((m) => ({ default: m.SchoolOrders })));
const SchoolStock           = lazy(() => import('./dashboard/school/Stock').then((m) => ({ default: m.SchoolStock })));
const SchoolProduction      = lazy(() => import('./dashboard/school/Production').then((m) => ({ default: m.SchoolProduction })));
const SchoolLessons         = lazy(() => import('./dashboard/school/Lessons').then((m) => ({ default: m.SchoolLessons })));
const SchoolLessonStage     = lazy(() => import('./dashboard/school/LessonStage').then((m) => ({ default: m.SchoolLessonStage })));
const SchoolProject         = lazy(() => import('./dashboard/school/Project').then((m) => ({ default: m.SchoolProject })));
const SchoolSessions        = lazy(() => import('./dashboard/school/Sessions').then((m) => ({ default: m.SchoolSessions })));
const SessionRegister       = lazy(() => import('./dashboard/school/SessionRegister').then((m) => ({ default: m.SessionRegister })));
const SchoolAssessments     = lazy(() => import('./dashboard/school/Assessments').then((m) => ({ default: m.SchoolAssessments })));
const InstrumentForm        = lazy(() => import('./dashboard/school/InstrumentForm').then((m) => ({ default: m.InstrumentForm })));
const SchoolActions         = lazy(() => import('./dashboard/school/Actions').then((m) => ({ default: m.SchoolActions })));
const SchoolWorkshops       = lazy(() => import('./dashboard/school/Workshops').then((m) => ({ default: m.SchoolWorkshops })));
const Leaderboard           = lazy(() => import('./dashboard/Leaderboard').then((m) => ({ default: m.Leaderboard })));

// === Accessible Suspense fallback ===
// Renders an aria-live "Loading" message so screen-reader users hear
// that the page is loading rather than encountering silent dead air.
function RouteLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center py-16 text-sm text-gray-500"
    >
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-3 w-3 rounded-full bg-teal-500 animate-pulse"
        />
        Loading page…
      </span>
    </div>
  );
}

/**
 * Sends a GA4 page_view on every navigation, covering both the marketing site
 * and the dashboard. Rendered after <AuthProvider> so its effect runs after
 * PublicLayout's document.title effect and reports the settled title rather
 * than the previous route's. See lib/analytics.ts for why gtag's own
 * page_view is switched off.
 */
function RouteAnalytics() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname, location.search);
  }, [location.pathname, location.search]);
  return null;
}

function App() {
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
        <Suspense fallback={<RouteLoading />}>
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
              {/* Both roles: standings are cross-school by design. */}
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route
                path="admin/schools"
                element={<RequireAuth role="admin"><AdminSchools /></RequireAuth>}
              />
              <Route
                path="admin/schools/:schoolId"
                element={<RequireAuth role="admin"><AdminSchoolDetails /></RequireAuth>}
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
              <Route
                path="admin/certifications"
                element={<RequireAuth role="admin"><AdminCertifications /></RequireAuth>}
              />
              <Route
                path="admin/lessons"
                element={<RequireAuth role="admin"><AdminLessons /></RequireAuth>}
              />
              <Route
                path="admin/competitions"
                element={<RequireAuth role="admin"><AdminCompetitions /></RequireAuth>}
              />
              <Route
                path="admin/workshops"
                element={<RequireAuth role="admin"><AdminWorkshops /></RequireAuth>}
              />
              {/* Outreach kept its own screen; bootcamps moved to workshops. */}
              <Route
                path="admin/outreach"
                element={<RequireAuth role="admin"><AdminOutreach /></RequireAuth>}
              />
              <Route
                path="admin/projects"
                element={<RequireAuth role="admin"><AdminProjects /></RequireAuth>}
              />
              <Route path="school/members" element={<SchoolMembers />} />
              <Route path="school/certificates" element={<SchoolCertificates />} />
              <Route path="certificate/:issuanceId" element={<Certificate />} />
              <Route path="school/orders" element={<SchoolOrders />} />
              <Route path="school/stock" element={<SchoolStock />} />
              <Route path="school/production" element={<SchoolProduction />} />
              <Route path="school/lessons" element={<SchoolLessons />} />
              <Route path="school/workshops" element={<SchoolWorkshops />} />
              <Route path="school/lessons/:lessonId" element={<SchoolLessonStage />} />
              <Route path="school/project" element={<SchoolProject />} />
              {/* MERL — sessions, registers, assessments and actions */}
              <Route path="school/sessions" element={<SchoolSessions />} />
              <Route path="school/sessions/:sessionId" element={<SessionRegister />} />
              <Route path="school/assessments" element={<SchoolAssessments />} />
              <Route path="school/assessments/:responseId" element={<InstrumentForm />} />
              <Route path="school/actions" element={<SchoolActions />} />
            </Route>

            {/* === Public marketing site ===
                Everything that isn't /dashboard/* gets the navbar + footer
                chrome via <PublicLayout>. */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />

              {/* One competition, one page. /competition is the canonical URL;
                  /programs, /inclusive-robotics and /register-2026 are older
                  slugs kept as redirects so existing links keep working. */}
              <Route path="/competition" element={<InclusiveRobotics />} />
              {/* Old slugs. /register-2026 folded into the competition page, so
                  it lands on the register section rather than a page of its own. */}
              <Route path="/programs" element={<Navigate to="/competition" replace />} />
              <Route path="/inclusive-robotics" element={<Navigate to="/competition" replace />} />
              <Route path="/register-2026" element={<Navigate to="/competition#register" replace />} />
              <Route path="/microsoft-bootcamps" element={<MicrosoftBootcamps />} />

              {/* Legacy program routes — KSEF, JSS, Bootcamps now live inside Inclusive Robotics
                  stages, so redirect to the relevant anchor. */}
              <Route path="/ksef" element={<Navigate to="/competition" replace />} />
              <Route path="/jss" element={<Navigate to="/competition" replace />} />
              <Route path="/bootcamps" element={<Navigate to="/microsoft-bootcamps" replace />} />
              <Route path="/adc-bootcamp" element={<Navigate to="/microsoft-bootcamps" replace />} />

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
              <Route path="/podcast" element={<Podcast />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
      <RouteAnalytics />
    </Router>
  );
}

/** Layout for the public marketing site — navbar + main + footer chrome. */
function PublicLayout() {
  // Announce route changes + update document title. Reads on every
  // location change (not just popstate) so React-Router pushState
  // navigation is heard by screen readers too.
  const location = useLocation();
  useEffect(() => {
    const pageName = getPageTitle(location.pathname);
    // Keep the Home string identical to <title> in index.html — otherwise the
    // title flips the moment React mounts, and the two disagree about what the
    // site leads with.
    document.title = pageName === 'Home'
      ? 'Inclusive Robotics — A Pan-African Robotics Competition | ChipuRobo'
      : `${pageName} | ChipuRobo`;
    const node = document.getElementById('route-announcer');
    if (node) node.textContent = `Navigated to ${pageName} page`;
  }, [location.pathname]);

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
        <Suspense fallback={<RouteLoading />}>
          <Outlet />
        </Suspense>
      </main>

      <footer role="contentinfo">
        <Footer />
      </footer>
    </div>
  );
}

function getPageTitle(path: string): string {
  switch (path) {
    case '/': return 'Home';
    case '/about': return 'About ChipuRobo';
    case '/competition': return 'Competition';
    case '/inclusive-robotics': return 'Programs';
    case '/microsoft-bootcamps': return 'Microsoft Bootcamps';
    case '/ksef': return 'Programs';
    case '/jss': return 'Programs';
    case '/bootcamps': return 'Microsoft Bootcamps';
    case '/adc-bootcamp': return 'Microsoft Bootcamps';
    case '/sustainability': return 'Sustainability';
    case '/team': return 'Our Team';
    case '/services': return 'Our Services';
    case '/contact': return 'Contact Us';
    case '/blog': return 'Blog';
    case '/microsoft': return 'Microsoft Partnership';
    case '/impact': return 'Impact Report';
    case '/maker-spaces': return 'Maker Spaces';
    case '/podcast': return 'Africa Builds Podcast';
    default: return 'ChipuRobo';
  }
}

export default App;
