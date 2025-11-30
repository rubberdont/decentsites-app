'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  /** Child components to render when authorized */
  children: React.ReactNode;
  /** Optional: Required role(s) to access this route */
  requiredRole?: UserRole | UserRole[];
  /** Optional: Custom redirect path (defaults to /login) */
  redirectTo?: string;
}

/**
 * Protected route component that checks authentication and authorization
 * Redirects to login if not authenticated
 * Shows access denied if role doesn't match
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Skip redirect during loading
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-admin-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - will redirect in useEffect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-admin-text-muted">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check role authorization if requiredRole is specified
  if (requiredRole && !hasRole(requiredRole)) {
    return <AccessDenied userRole={user?.role} requiredRole={requiredRole} />;
  }

  // Authorized - render children
  return <>{children}</>;
}

interface AccessDeniedProps {
  userRole?: UserRole;
  requiredRole: UserRole | UserRole[];
}

/**
 * Access denied component shown when user lacks required role
 */
function AccessDenied({ userRole, requiredRole }: AccessDeniedProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const requiredRolesText = Array.isArray(requiredRole)
    ? requiredRole.join(' or ')
    : requiredRole;

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center p-4">
      <div className="bg-admin-bg-card border border-admin-border rounded-lg p-8 max-w-md w-full text-center shadow-admin-card">
        {/* Icon */}
        <div className="w-16 h-16 bg-status-cancelled-bg rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-status-cancelled"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-admin-text mb-2">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-admin-text-muted mb-6">
          You don&apos;t have permission to access this page.
          {userRole && (
            <>
              <br />
              <span className="text-sm">
                Your role: <span className="text-admin-text">{userRole}</span>
              </span>
            </>
          )}
          <br />
          <span className="text-sm">
            Required role:{' '}
            <span className="text-admin-text">{requiredRolesText}</span>
          </span>
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-admin-bg-hover text-admin-text rounded-lg hover:bg-admin-border transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 border border-admin-border text-admin-text-muted rounded-lg hover:bg-admin-bg-hover transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoute;
