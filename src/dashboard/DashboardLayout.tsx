import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { NotificationsProvider, NotificationToaster } from '../lib/notifications';
import { useOrderRealtime, type OrderCounts } from '../lib/useOrderRealtime';
import { LogOut, Home, School, Package, ClipboardList, Users, Boxes, Wrench, Send, Menu, X, CalendarDays, Award } from 'lucide-react';

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

  // Lock body scroll while drawer is open on mobile.
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/dashboard/login', { replace: true });
  };

  return (
    <div className="admin-zone min-h-screen bg-warm-50 md:flex">
      {/* ───── Mobile top bar (md:hidden) ───── */}
      <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-warm-200 bg-white px-3 py-2">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-1 text-gray-700 hover:bg-warm-100 rounded-md"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <picture>
            <source srcSet="/img/logo.webp" type="image/webp" />
            <img src="/img/logo.png" alt="" width={24} height={24} className="h-6 w-6 pixel-crisp" />
          </picture>
          <span className="font-pixel text-[0.6rem] tracking-wider text-gray-900 uppercase">
            ChipuRobo<span className="text-teal-500">_</span>
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
          aria-label="Close menu"
        />
      )}

      {/* ───── Sidebar (drawer on mobile, static on md+) ───── */}
      <aside
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
              ChipuRobo<span className="text-teal-500">_</span>
            </span>
          </Link>
          <span className={`ml-auto text-[0.55rem] font-pixel tracking-widest uppercase hidden md:inline ${roleColor}`}>
            {shortLabel}
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden ml-auto p-1 -mr-1 text-gray-500 hover:text-gray-900"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 text-sm overflow-y-auto">
          <SidebarLink to="/dashboard" end icon={Home}>
            Overview
          </SidebarLink>

          {isAdmin ? (
            <>
              <SidebarLink to="/dashboard/admin/schools" icon={School}>
                Schools
              </SidebarLink>
              <SidebarLink to="/dashboard/admin/products" icon={Package}>
                Products
              </SidebarLink>
              <SidebarLink to="/dashboard/admin/orders" icon={ClipboardList}>
                All orders
              </SidebarLink>
              <SidebarLink to="/dashboard/admin/distribute" icon={Send} badge={counts.adminBacklog}>
                Distribute
              </SidebarLink>
              <SidebarLink to="/dashboard/admin/events" icon={CalendarDays}>
                Activities
              </SidebarLink>
              <SidebarLink to="/dashboard/admin/certifications" icon={Award}>
                Certifications
              </SidebarLink>
            </>
          ) : (
            <>
              <SidebarLink to="/dashboard/school/members" icon={Users}>
                Students
              </SidebarLink>
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
            onClick={handleSignOut}
            className="mt-3 inline-flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ───── Main ───── */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
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
      <Icon className="h-4 w-4 mr-2.5 flex-shrink-0" />
      <span className="flex-1">{children}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[0.65rem] font-semibold bg-terracotta-500 text-white"
          aria-label={`${badge} pending`}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  );
}
