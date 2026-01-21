import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

interface RoleGuardProps {
  allowedRoles: string[];
  fallback?: string;
}

/**
 * Protects routes that require specific roles
 */
export function RoleGuard({ allowedRoles, fallback = '/' }: RoleGuardProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = allowedRoles.some((role) => hasRole(role));

  if (!hasRequiredRole) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

