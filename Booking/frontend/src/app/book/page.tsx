'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { profilesAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { ServiceSelector, BookingSummary } from '@/components/booking';
import type { BusinessProfile, Service } from '@/types';

/**
 * Services selection page for customers
 * Step 1 of the booking flow: Select a service, then navigate to calendar
 */
export default function BookingPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  // Profile data state
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Service selection state
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Fetch default profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      setProfileError(null);

      try {
        const response = await profilesAPI.getById('default-profile');
        setProfile(response.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setProfileError('Profile not found. Please check the URL and try again.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // Get selected service object from ID
  const selectedService = useMemo<Service | null>(() => {
    if (!profile || !selectedServiceId) return null;
    return profile.services.find(s => s.id === selectedServiceId) || null;
  }, [profile, selectedServiceId]);

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  // Handle navigation to calendar page
  const handleNavigateToCalendar = () => {
    if (selectedServiceId) {
      router.push(`/book/calendar?service=${selectedServiceId}`);
    }
  };

  // Get return URL for login redirect
  const returnUrl = '/book';

  // Loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#d4af37] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1a1a1a]">
        {/* Header */}
        <header className="border-b border-[#444444] bg-[#2a2a2a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#1a1a1a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-[#eaeaea] font-semibold text-lg">BookPro</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Login Prompt */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-[#d4af37]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            
            <h1 className="text-[#eaeaea] font-bold text-2xl mb-2">
              Sign in to Book
            </h1>
            <p className="text-[#a0a0a0] mb-6">
              Please log in or create an account to make a booking.
            </p>

            <div className="space-y-3">
              <Link
                href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
                className="block w-full py-3 px-6 rounded-lg font-semibold bg-[#d4af37] text-[#1a1a1a] hover:bg-[#c4a030] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href={`/signup?returnUrl=${encodeURIComponent(returnUrl)}`}
                className="block w-full py-3 px-6 rounded-lg font-semibold border border-[#444444] text-[#eaeaea] hover:bg-white/5 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading profile state
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[#1a1a1a]">
        {/* Header Skeleton */}
        <header className="border-b border-[#444444] bg-[#2a2a2a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-[#444444] rounded-lg animate-pulse" />
                <div className="w-32 h-4 bg-[#444444] rounded animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left column skeleton */}
            <div className="lg:col-span-3 space-y-8">
              <div className="h-8 w-48 bg-[#444444] rounded animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[#2a2a2a] rounded-xl border border-[#444444] p-4">
                    <div className="aspect-video bg-[#444444] rounded-lg animate-pulse mb-4" />
                    <div className="h-5 w-24 bg-[#444444] rounded animate-pulse mb-2" />
                    <div className="h-4 w-full bg-[#444444] rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right column skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] p-6">
                <div className="h-6 w-32 bg-[#444444] rounded animate-pulse mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 w-full bg-[#444444] rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Profile not found error
  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-[#1a1a1a]">
        {/* Header */}
        <header className="border-b border-[#444444] bg-[#2a2a2a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#1a1a1a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-[#eaeaea] font-semibold text-lg">BookPro</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Error State */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-500"
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
            
            <h1 className="text-[#eaeaea] font-bold text-2xl mb-2">
              Profile Not Found
            </h1>
            <p className="text-[#a0a0a0] mb-6">
              {profileError || 'The requested business profile could not be found.'}
            </p>

            <Link
              href="/"
              className="inline-block py-3 px-6 rounded-lg font-semibold bg-[#d4af37] text-[#1a1a1a] hover:bg-[#c4a030] transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main services selection page
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <header className="border-b border-[#444444] bg-[#2a2a2a] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button and logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-white/10 text-[#a0a0a0] hover:text-[#eaeaea] transition-colors"
                aria-label="Go back"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#1a1a1a]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-[#eaeaea] font-semibold text-lg hidden sm:block">
                  {profile.name}
                </span>
              </Link>
            </div>

            {/* Right: User info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-[#eaeaea] text-sm font-medium">{user?.name}</p>
                <p className="text-[#a0a0a0] text-xs">{user?.email}</p>
              </div>
              <div className="w-9 h-9 bg-[#d4af37] rounded-full flex items-center justify-center">
                <span className="text-[#1a1a1a] font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-[#eaeaea] font-bold text-2xl sm:text-3xl mb-2">
            Book an Appointment
          </h1>
          <p className="text-[#a0a0a0]">
            Select a service to get started with your appointment at {profile.name}.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column: Service Selection (60%) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Step 1: Service Selection */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center">
                  <span className="text-[#1a1a1a] font-bold text-sm">1</span>
                </div>
                <h2 className="text-[#eaeaea] font-semibold text-xl">
                  Select a Service
                </h2>
              </div>
              
              <ServiceSelector
                services={profile.services}
                selectedServiceId={selectedServiceId}
                onServiceSelect={handleServiceSelect}
              />
            </section>
          </div>

          {/* Right Column: Booking Summary (40%) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <BookingSummary
                service={selectedService}
                variant="services"
                onNavigateToCalendar={handleNavigateToCalendar}
                profileName={profile.name}
              />
            </div>
          </div>
        </div>

        {/* Mobile: Fixed bottom booking summary bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#2a2a2a] border-t border-[#444444] p-4 z-30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[#a0a0a0] text-xs">
                {selectedService ? selectedService.title : 'No service selected'}
              </p>
              <p className="text-[#d4af37] font-bold text-lg">
                {selectedService ? `$${selectedService.price.toFixed(2)}` : '$0.00'}
              </p>
            </div>
            <button
              onClick={handleNavigateToCalendar}
              disabled={!selectedService}
              className={`
                py-3 px-6 rounded-lg font-semibold text-sm
                transition-all duration-200 flex items-center gap-2
                ${selectedService
                  ? 'bg-[#d4af37] text-[#1a1a1a] hover:bg-[#c4a030] active:scale-[0.98]'
                  : 'bg-[#444444] text-[#a0a0a0] cursor-not-allowed'
                }
              `}
            >
              Choose Date & Time
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Add bottom padding on mobile for fixed bar */}
        <div className="lg:hidden h-24" />
      </main>
    </div>
  );
}
