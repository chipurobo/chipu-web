import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** If 'admin', non-admin users are bounced to /dashboard. */
  role?: 'admin';
}

/**
 * Route guard. Shows nothing until auth state hydrates, then:
 *   • redirects to /dashboard/login if not signed in
 *   • redirects to /dashboard if signed in but lacks required role
 *   • renders children otherwise
 */
export function RequireAuth({ children, role }: Props) {
  const { loading, user, profile } = useAuth();
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

  if (role === 'admin' && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
