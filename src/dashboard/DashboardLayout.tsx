import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { NotificationsProvider, NotificationToaster } from '../lib/notifications';
import { useOrderRealtime, type OrderCounts } from '../lib/useOrderRealtime';
import { LogOut, Home, School, Package, ClipboardList, Users, Boxes, Wrench, Send } from 'lucide-react';

// =============================================================
// Admin/school dashboard shell.
//
// Sidebar nav is role-aware:
//   • admin              → Schools · Products · All orders · Distribute
//   • school_lead        → Students · Orders · Stock + (Production if maker space)
//
// Real-time order awareness lives in <DashboardShell>, one level inside
// the NotificationsProvider so useOrderRealtime can emit toasts.
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
  const isAdmin = profile?.role === 'admin';
  const isMakerSpace = !!school?.is_maker_space;
  const counts: OrderCounts = useOrderRealtime();

  const handleSignOut = async () => {
    await signOut();
    navigate('/dashboard/login', { replace: true });
  };

  return (
    <div className="admin-zone min-h-screen bg-warm-50 flex">
      {/* ───── Sidebar ───── */}
      <aside className="w-60 shrink-0 border-r border-warm-200 bg-white flex flex-col">
        <Link to="/dashboard" className="flex items-center px-5 py-5 border-b border-warm-200">
          <picture>
            <source srcSet="/img/logo.webp" type="image/webp" />
            <img src="/img/logo.png" alt="" width={28} height={28} className="h-7 w-7 pixel-crisp" />
          </picture>
          <span className="ml-2 font-pixel text-[0.65rem] tracking-wider text-gray-900 uppercase">
            ChipuRobo<span className="text-teal-500">_</span>
          </span>
          <span className="ml-auto text-[0.55rem] font-pixel tracking-widest text-terracotta-600 uppercase">
            ADMIN
          </span>
        </Link>

        <nav className="flex-1 py-4 px-3 space-y-0.5 text-sm">
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
