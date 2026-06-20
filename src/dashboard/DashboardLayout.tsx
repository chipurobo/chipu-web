import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { NotificationsProvider, NotificationToaster } from '../lib/notifications';
import { useOrderRealtime, type OrderCounts } from '../lib/useOrderRealtime';
import {
  LogOut, Home, School, Package, ClipboardList, Users, Boxes, Wrench, Send, Menu, X,
  Award, Layers, FolderKanban, Trophy, BookOpen,
} from 'lucide-react';

// ----- Page titles for the SPA route announcer -----
// Screen readers don't pick up React Router navigations as page changes,
// so we maintain a small map of paths → titles and write that into an
// aria-live region whenever the route changes. JAWS/NVDA users hear
// "Navigated to <page name>" the same way they would on a full page load.
const DASHBOARD_PAGE_TITLES: Record<string, string> = {
  '/dashboard':                     'Overview',
  '/dashboard/admin/schools':       'Schools',
  '/dashboard/admin/products':      'Products',
  '/dashboard/admin/orders':        'All orders',
  '/dashboard/admin/distribute':    'Distribute',
  '/dashboard/admin/certifications':'Certifications',
  '/dashboard/admin/programmes':    'Programmes',
  '/dashboard/admin/projects':      'Projects',
  '/dashboard/school/members':      'Students',
  '/dashboard/school/orders':       'Orders',
  '/dashboard/school/production':   'Production',
  '/dashboard/school/stock':        'Stock and units',
  '/dashboard/school/certificates': 'Certificates',
  '/dashboard/school/lessons':      'Lessons',
  '/dashboard/school/project':      'Project',
  '/dashboard/leaderboard':         'Leaderboard',
};
function getDashboardPageTitle(path: string): string {
  if (DASHBOARD_PAGE_TITLES[path]) return DASHBOARD_PAGE_TITLES[path];
  if (path.startsWith('/dashboard/admin/schools/')) return 'School details';
  if (path.startsWith('/dashboard/certificate/'))   return 'Certificate';
  if (path.startsWith('/dashboard/school/lessons/')) return 'Lesson roster';
  return 'Dashboard';
}

// =============================================================
// Admin/school dashboard shell.
//
// Sidebar nav is role-aware:
//   • admin              → Schools · Products · All orders · Distribute
//   • school_lead        → Students · Orders · Stock + (Production if maker space)
//
// Responsive behaviour:
//   • md+ : permanent sidebar on the left.
//   • <md : sidebar is a slide-in drawer triggered by a hamburger in a
//           top bar; tapping a nav item or the backdrop closes it.
// =============================================================

export function DashboardLayout() {
  return (
    <NotificationsProvider>
      <DashboardShell />
      <NotificationToaster />
    </NotificationsProvider>
  );
}

function DashboardShell() {
  const { profile, school, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = profile?.role === 'admin';
  const isMakerSpace = !!school?.is_maker_space;
  const counts: OrderCounts = useOrderRealtime();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [routeMessage, setRouteMessage] = useState('');
  const drawerRef = useRef<HTMLElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  // Two labels for the role:
  //   • shortLabel — pixel chip in the brand corner; must fit a 60px column
  //   • roleLabel  — full description in the sidebar footer pill
  const shortLabel: string =
    isAdmin       ? 'ADMIN'  :
    isMakerSpace  ? 'MAKER'  :
                    'SCHOOL';
  const roleLabel: string =
    isAdmin       ? 'CHIPUROBO ADMIN' :
    isMakerSpace  ? 'MAKER SPACE'    :
                    'SCHOOL LEAD';
  const roleColor: string =
    isAdmin       ? 'text-terracotta-600' :
    isMakerSpace  ? 'text-indigo-600'     :
                    'text-teal-600';

  // Auto-close the drawer on route change.
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Announce SPA route changes to screen readers + update document title.
  // The aria-live region downstream picks up the change after a tick so
  // assistive tech reliably hears the new title even on fast nav.
  useEffect(() => {
    const title = getDashboardPageTitle(location.pathname);
    document.title = `${title} · ChipuRobo`;
    const t = setTimeout(() => setRouteMessage(`Navigated to ${title}`), 100);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // Lock body scroll while drawer is open on mobile.
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [mobileOpen]);

  // === Mobile drawer dialog behaviour ===
  // • Move focus into the drawer when it opens
  // • Trap focus inside while open (Tab cycles, Shift+Tab cycles back)
  // • Escape closes the drawer and returns focus to the hamburger
  useEffect(() => {
    if (!mobileOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusables = () =>
      Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('inert') && el.offsetParent !== null);

    // Initial focus → first focusable (the close button)
    const list = focusables();
    list[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileOpen(false);
        hamburgerRef.current?.focus();
        return;
      }
      if (e.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last  = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/dashboard/login', { replace: true });
  };

  return (
    <div className="admin-zone min-h-screen bg-warm-50 md:flex">
      {/* Skip link — keyboard/screen-reader users tab here first and
          jump straight past the sidebar nav to the page content */}
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        Skip to main content
      </a>

      {/* Live region for SPA route announcements. Hidden visually,
          read by NVDA/JAWS/VoiceOver on every navigation. */}
      <div
        id="dashboard-route-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {routeMessage}
      </div>

      {/* ───── Mobile top bar (md:hidden) ───── */}
      <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-warm-200 bg-white px-3 py-2">
        <button
          ref={hamburgerRef}
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-1 text-gray-700 hover:bg-warm-100 rounded-md"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="dashboard-sidebar"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <picture>
            <source srcSet="/img/logo.webp" type="image/webp" />
            <img src="/img/logo.png" alt="" width={24} height={24} className="h-6 w-6 pixel-crisp" />
          </picture>
          <span className="font-pixel text-[0.6rem] tracking-wider text-gray-900 uppercase">
            ChipuRobo<span className="text-teal-500" aria-hidden="true">_</span>
          </span>
        </Link>
        <span className={`ml-auto text-[0.55rem] font-pixel tracking-widest uppercase ${roleColor}`}>
          {shortLabel}
        </span>
      </div>

      {/* ───── Mobile backdrop ───── */}
      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          aria-label="Close navigation menu"
          tabIndex={-1}
        />
      )}

      {/* ───── Sidebar (drawer on mobile, static on md+) ─────
          On mobile the drawer is a modal dialog: role="dialog",
          aria-modal, focus trapped inside, Escape closes it. On
          md+ it's just a permanent nav, no dialog semantics. */}
      <aside
        ref={drawerRef}
        id="dashboard-sidebar"
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen ? 'true' : undefined}
        aria-label={mobileOpen ? 'Navigation menu' : undefined}
        className={`
          fixed md:sticky top-0 left-0 z-50 md:z-10 h-screen md:h-screen
          w-64 md:w-60 shrink-0 border-r border-warm-200 bg-white
          flex flex-col transform transition-transform md:transform-none
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex items-center px-5 py-5 border-b border-warm-200">
          <Link to="/dashboard" className="flex items-center min-w-0">
            <picture>
              <source srcSet="/img/logo.webp" type="image/webp" />
              <img src="/img/logo.png" alt="" width={28} height={28} className="h-7 w-7 pixel-crisp" />
            </picture>
            <span className="ml-2 font-pixel text-[0.65rem] tracking-wider text-gray-900 uppercase">
              ChipuRobo<span className="text-teal-500" aria-hidden="true">_</span>
            </span>
          </Link>
          <span className={`ml-auto text-[0.55rem] font-pixel tracking-widest uppercase hidden md:inline ${roleColor}`}>
            {shortLabel}
          </span>
          <button
            type="button"
            onClick={() => { setMobileOpen(false); hamburgerRef.current?.focus(); }}
            className="md:hidden ml-auto p-1 -mr-1 text-gray-500 hover:text-gray-900"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Primary" className="flex-1 py-4 px-3 space-y-0.5 text-sm overflow-y-auto">
          <SidebarLink to="/dashboard" end icon={Home}>
            Overview
          </SidebarLink>

          {isAdmin ? (
            <>
              {/* ─── Programmes group ───
                  The learning pipeline: programmes, the schools enrolled
                  in them, projects, certifications, leaderboard. */}
              <SidebarGroupLabel>Programmes</SidebarGroupLabel>
              <SidebarLink to="/dashboard/admin/programmes" icon={Layers}>
                Programmes
              </SidebarLink>
              <SidebarLink to="/dashboard/admin/schools" icon={School}>
                Schools
              </SidebarLink>
              <SidebarLink to="/dashboard/admin/projects" icon={FolderKanban}>
                Projects
              </SidebarLink>
              <SidebarLink to="/dashboard/admin/certifications" icon={Award}>
                Certifications
              </SidebarLink>
              <SidebarLink to="/dashboard/leaderboard" icon={Trophy}>
                Leaderboard
              </SidebarLink>

              {/* ─── Manufacturing group ───
                  Product fabrication + distribution pipeline. */}
              <SidebarGroupLabel>Manufacturing</SidebarGroupLabel>
              <SidebarLink to="/dashboard/admin/products" icon={Package}>
                Products
              </SidebarLink>
              <SidebarLink to="/dashboard/admin/orders" icon={ClipboardList}>
                All orders
              </SidebarLink>
              <SidebarLink to="/dashboard/admin/distribute" icon={Send} badge={counts.adminBacklog}>
                Distribute
              </SidebarLink>
            </>
          ) : (
            <>
              {/* ─── Programme group ───
                  Day-to-day learning work with the school's students. */}
              <SidebarGroupLabel>Programme</SidebarGroupLabel>
              <SidebarLink to="/dashboard/school/members" icon={Users}>
                Students
              </SidebarLink>
              <SidebarLink to="/dashboard/school/lessons" icon={BookOpen}>
                Lessons
              </SidebarLink>
              <SidebarLink to="/dashboard/school/project" icon={FolderKanban}>
                Project
              </SidebarLink>
              <SidebarLink to="/dashboard/school/certificates" icon={Award}>
                Certificates
              </SidebarLink>
              <SidebarLink to="/dashboard/leaderboard" icon={Trophy}>
                Leaderboard
              </SidebarLink>

              {/* ─── Manufacturing group ───
                  Ordering and stock. Production only for maker spaces. */}
              <SidebarGroupLabel>Manufacturing</SidebarGroupLabel>
              <SidebarLink to="/dashboard/school/orders" icon={ClipboardList} badge={counts.awaitingDelivery}>
                Orders
              </SidebarLink>
              {isMakerSpace && (
                <SidebarLink to="/dashboard/school/production" icon={Wrench} badge={counts.inbox}>
                  Production
                </SidebarLink>
              )}
              <SidebarLink to="/dashboard/school/stock" icon={Boxes}>
                Stock & units
              </SidebarLink>
            </>
          )}
        </nav>

        <div className="px-5 py-4 border-t border-warm-200">
          <p className="text-xs text-gray-500 mb-1">Signed in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name ?? '—'}</p>
          <p className="text-xs text-gray-500 truncate">
            {school?.name ?? (isAdmin ? 'ChipuRobo admin' : '—')}
          </p>
          <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-medium uppercase tracking-wide ${
            isAdmin       ? 'bg-terracotta-100 text-terracotta-700' :
            isMakerSpace  ? 'bg-indigo-100 text-indigo-700' :
                            'bg-teal-100 text-teal-700'
          }`}>
            {roleLabel}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 inline-flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ───── Main ───── */}
      <main
        id="dashboard-main"
        tabIndex={-1}
        className="flex-1 min-w-0 overflow-x-hidden focus:outline-none"
      >
        <Outlet />
      </main>
    </div>
  );
}

// Sidebar section header. Sits above a group of <SidebarLink>s so the
// admin can tell at a glance which links belong to the Programmes pipeline
// vs the Manufacturing pipeline. Renders as a small uppercase label with
// a hairline separator above (except for the first group, where the rule
// would crowd the Overview link).
function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="presentation"
      className="mt-4 mb-1 pt-3 px-3 text-[0.6rem] font-pixel uppercase tracking-[0.18em] text-gray-500 border-t border-warm-200/70 first:mt-2 first:pt-0 first:border-t-0"
    >
      {children}
    </div>
  );
}

function SidebarLink({
  to,
  icon: Icon,
  children,
  end,
  badge,
}: {
  to: string;
  icon: typeof Home;
  children: React.ReactNode;
  end?: boolean;
  badge?: number;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
          isActive
            ? 'bg-warm-100 text-gray-900 font-medium'
            : 'text-gray-600 hover:bg-warm-100/60 hover:text-gray-900'
        }`
      }
    >
      <Icon className="h-4 w-4 mr-2.5 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1">{children}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[0.65rem] font-semibold bg-terracotta-500 text-white"
          aria-label={`${badge} pending`}
          role="status"
        >
          <span aria-hidden="true">{badge > 99 ? '99+' : badge}</span>
        </span>
      )}
    </NavLink>
  );
}
