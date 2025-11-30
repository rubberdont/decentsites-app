'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui';

/**
 * Admin Login Page
 * Handles user authentication with username/password
 * Redirects to dashboard on success or if already authenticated
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

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
      await login(username.trim(), password);
      router.push('/dashboard');
    } catch (err) {
      // Handle different error types
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          setError('Invalid username or password');
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
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-admin-bg-card border border-admin-border rounded-xl shadow-admin-card p-8">
          {/* Logo/App Name */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-admin-primary/10 rounded-xl mb-4">
              <svg
                className="w-8 h-8 text-admin-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-admin-text">Booking Admin</h1>
            <p className="text-admin-text-muted mt-2">Sign in to your account</p>
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="admin-btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-admin-primary hover:text-admin-primary-light transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement forgot password functionality
                alert('Please contact your administrator to reset your password.');
              }}
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-admin-text-dark">
          &copy; {new Date().getFullYear()} Booking Admin. All rights reserved.
        </p>
      </div>
    </div>
  );
}
