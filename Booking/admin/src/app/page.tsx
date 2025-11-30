'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui';

/**
 * Root Page
 * Redirects to /login or /dashboard based on authentication state
 */
export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while determining auth state
  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-admin-text-muted">Loading...</p>
      </div>
    </div>
  );
}
