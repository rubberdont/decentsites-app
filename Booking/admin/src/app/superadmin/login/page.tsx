'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui';

/**
 * Superadmin Login Page
 * Handles superadmin authentication with environment-based credentials
 * Redirects to dashboard on success or if already authenticated
 */
export default function SuperadminLoginPage() {
  const router = useRouter();
  const { loginAsSuperAdmin, isAuthenticated, isLoading: authLoading, isSuperAdmin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated as superadmin
  useEffect(() => {
    if (!authLoading && isAuthenticated && isSuperAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isSuperAdmin, authLoading, router]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsSubmitting(true);

    try {
      await loginAsSuperAdmin(username.trim(), password);
      router.push('/dashboard');
    } catch (err) {
      // Handle different error types
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('Unauthorized') || err.message.includes('Invalid')) {
          setError('Invalid superadmin credentials');
        } else if (err.message.includes('503') || err.message.includes('not configured')) {
          setError('Superadmin is not configured on this server');
        } else if (err.message.includes('Network') || err.message.includes('fetch')) {
          setError('Unable to connect to server. Please try again.');
        } else {
          setError(err.message || 'Login failed. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated && isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-admin-bg-card border border-admin-border rounded-xl shadow-admin-card p-8">
          {/* Logo/App Name */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-xl mb-4">
              <svg
                className="w-8 h-8 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-admin-text">Super Admin Portal</h1>
            <p className="text-admin-text-muted mt-2">Superadmin access only</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-status-cancelled/10 border border-status-cancelled/30 rounded-lg">
              <p className="text-status-cancelled text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-admin-text-muted mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="admin-input"
                placeholder="Enter superadmin username"
                disabled={isSubmitting}
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-admin-text-muted mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
                placeholder="Enter superadmin password"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In as Superadmin'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-admin-text-dark">
          &copy; {new Date().getFullYear()} Booking Admin. All rights reserved.
        </p>
      </div>
    </div>
  );
}
