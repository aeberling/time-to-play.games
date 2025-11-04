'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, requires registered user (not guest)
  redirectTo?: string; // Where to redirect if not authenticated
}

/**
 * Component that protects routes based on authentication status
 */
export function ProtectedRoute({
  children,
  requireAuth = false,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated at all
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Requires registered user but user is guest
      if (requireAuth && user.isGuest) {
        router.push('/register');
        return;
      }
    }
  }, [user, isLoading, requireAuth, redirectTo, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Guest trying to access registered-only content
  if (requireAuth && user.isGuest) {
    return null;
  }

  // Authenticated and authorized
  return <>{children}</>;
}
