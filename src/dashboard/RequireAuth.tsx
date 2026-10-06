import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import type { UserRole } from '../lib/database.types';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** If 'admin', non-admin users are bounced to /dashboard. */
  role?: 'admin';
  roles?: UserRole[];
}

/**
 * Route guard. Shows nothing until auth state hydrates, then:
 *   • redirects to /dashboard/login if not signed in
 *   • redirects to /dashboard if signed in but lacks required role
 *   • renders children otherwise
 */
export function RequireAuth({ children, role, roles }: Props) {
  const { loading, user, profile, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div role="status" className="admin-zone min-h-screen flex items-center justify-center text-gray-500 text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/dashboard/login" replace state={{ from: location.pathname }} />;
  }

  if (!profile) return <div className="admin-zone p-6 text-sm space-y-4">
    <p role="alert">Your account could not be loaded. Please sign out and try again.</p>
    <button type="button" className="btn-primary" onClick={() => void signOut()}>Sign out</button>
  </div>;

  if (roles && !roles.includes(profile.role)) return <Navigate to="/dashboard" replace />;

  if (role === 'admin' && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
