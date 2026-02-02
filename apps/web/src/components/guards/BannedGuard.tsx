import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

/**
 * Restricts banned users from accessing content routes.
 * Banned users are redirected to /me/appeal (itiraz sayfası).
 * Only appeal, auth, and static pages are allowed.
 */
const ALLOWED_PATHS_FOR_BANNED = [
  '/me/appeal',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/about',
  '/privacy',
  '/terms',
];

function isPathAllowed(pathname: string): boolean {
  return ALLOWED_PATHS_FOR_BANNED.some(
    (allowed) => pathname === allowed || pathname.startsWith(allowed + '/')
  );
}

export function BannedGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  // Not authenticated or not banned -> allow
  if (!isAuthenticated || !user?.isBanned) {
    return <Outlet />;
  }

  // Banned user on restricted path -> redirect to appeal
  if (!isPathAllowed(pathname)) {
    return <Navigate to="/me/appeal" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
