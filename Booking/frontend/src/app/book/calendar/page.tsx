'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { profilesAPI, bookingsAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  BookingCalendar,
  BookingTimeSlots,
  BookingSummary,
  BookingSuccessModal,
} from '@/components/booking';
import type { BusinessProfile, Service, BookingCreate } from '@/types';

/**
 * Inner component that uses useSearchParams
 * Must be wrapped in Suspense boundary
 */
function CalendarPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  // Get service ID from URL params
  const serviceIdFromUrl = searchParams.get('service');

  // Profile data state
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Booking selection state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Booking submission state
  const [isConfirming, setIsConfirming] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingRef, setBookingRef] = useState<string>('');
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Get profile ID from fetched profile
  const profileId = profile?.id;

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

  // Redirect to /book if no service ID provided
  useEffect(() => {
    if (!authLoading && !isLoadingProfile && !serviceIdFromUrl) {
      router.replace('/book');
    }
  }, [authLoading, isLoadingProfile, serviceIdFromUrl, router]);

  // Get selected service object from URL param
  const selectedService = useMemo<Service | null>(() => {
    if (!profile || !serviceIdFromUrl) return null;
    return profile.services.find(s => s.id === serviceIdFromUrl) || null;
  }, [profile, serviceIdFromUrl]);

  // Redirect if service not found in profile
  useEffect(() => {
    if (!isLoadingProfile && profile && serviceIdFromUrl && !selectedService) {
      router.replace('/book');
    }
  }, [isLoadingProfile, profile, serviceIdFromUrl, selectedService, router]);

  // Format date and time for API (ISO 8601 format: YYYY-MM-DDTHH:MM:SS)
  // timeSlot is now in format "09:00-10:00", we extract the start time
  const formatDateTimeForAPI = (date: Date, timeSlot: string): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // Extract start time from "09:00-10:00" format
    const startTime = timeSlot.split('-')[0];
    return `${year}-${month}-${day}T${startTime}:00`;
  };

  // Handle date selection - reset time slot when date changes
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: string | null) => {
    setSelectedTimeSlot(slot);
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!serviceIdFromUrl || !selectedDate || !selectedTimeSlot || !profileId) {
      return;
    }

    setIsConfirming(true);
    setBookingError(null);

    try {
      const bookingData: BookingCreate = {
        profile_id: profileId,
        service_id: serviceIdFromUrl,
        booking_date: formatDateTimeForAPI(selectedDate, selectedTimeSlot),
        time_slot: selectedTimeSlot,
      };

      const response = await bookingsAPI.create(bookingData);
      setBookingRef(response.data.booking_ref);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to create booking:', err);
      setBookingError('Failed to create booking. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push('/my-bookings');
  };

  // Get return URL for login redirect
  const returnUrl = serviceIdFromUrl 
    ? `/book/calendar?service=${serviceIdFromUrl}` 
    : '/book';

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
              <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] p-6">
                <div className="h-64 bg-[#444444] rounded animate-pulse" />
              </div>
              <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] p-6">
                <div className="h-32 bg-[#444444] rounded animate-pulse" />
              </div>
            </div>

            {/* Right column skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] p-6">
                <div className="h-6 w-32 bg-[#444444] rounded animate-pulse mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
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

  // Service not found - redirect handled in useEffect, show loading
  if (!selectedService) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#d4af37] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Main calendar page
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <header className="border-b border-[#444444] bg-[#2a2a2a] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button and logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/book')}
                className="p-2 rounded-lg hover:bg-white/10 text-[#a0a0a0] hover:text-[#eaeaea] transition-colors"
                aria-label="Go back to services"
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
        {/* Page Title with Selected Service */}
        <div className="mb-8">
          <h1 className="text-[#eaeaea] font-bold text-2xl sm:text-3xl mb-2">
            Choose Date & Time
          </h1>
          <p className="text-[#a0a0a0]">
            Select your preferred date and time for{' '}
            <span className="text-[#d4af37] font-medium">{selectedService.title}</span>{' '}
            at {profile.name}.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column: Calendar and Time Slots (60%) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Step 2: Date Selection */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center">
                  <span className="text-[#1a1a1a] font-bold text-sm">2</span>
                </div>
                <h2 className="text-[#eaeaea] font-semibold text-xl">
                  Choose a Date
                </h2>
              </div>

              <BookingCalendar
                selectedDate={selectedDate}
                onDateChange={handleDateSelect}
                minDate={new Date()}
              />
            </section>

            {/* Step 3: Time Selection (shown after date selected) */}
            {selectedDate && profileId && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center">
                    <span className="text-[#1a1a1a] font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-[#eaeaea] font-semibold text-xl">
                    Select a Time
                  </h2>
                </div>

                <BookingTimeSlots
                  profileId={profileId}
                  selectedDate={selectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  onTimeSlotChange={handleTimeSlotSelect}
                />
              </section>
            )}

            {/* Booking Error Message */}
            {bookingError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-red-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-400 text-sm">{bookingError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Booking Summary (40%) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <BookingSummary
                service={selectedService}
                date={selectedDate}
                timeSlot={selectedTimeSlot}
                variant="calendar"
                onConfirm={handleConfirmBooking}
                isConfirming={isConfirming}
                profileName={profile.name}
              />

              {/* Change Service Link */}
              <div className="mt-4 text-center">
                <Link
                  href="/book"
                  className="text-[#a0a0a0] text-sm hover:text-[#d4af37] transition-colors inline-flex items-center gap-1"
                >
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Change service
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Fixed bottom booking summary bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#2a2a2a] border-t border-[#444444] p-4 z-30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[#a0a0a0] text-xs">
                {selectedService.title}
              </p>
              <p className="text-[#d4af37] font-bold text-lg">
                ₱{selectedService.price.toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleConfirmBooking}
              disabled={!selectedDate || !selectedTimeSlot || isConfirming}
              className={`
                py-3 px-6 rounded-lg font-semibold text-sm
                transition-all duration-200
                ${selectedDate && selectedTimeSlot && !isConfirming
                  ? 'bg-[#d4af37] text-[#1a1a1a] hover:bg-[#c4a030] active:scale-[0.98]'
                  : 'bg-[#444444] text-[#a0a0a0] cursor-not-allowed'
                }
              `}
            >
              {isConfirming ? 'Booking...' : 'Confirm & Book'}
            </button>
          </div>
        </div>

        {/* Add bottom padding on mobile for fixed bar */}
        <div className="lg:hidden h-24" />
      </main>

      {/* Success Modal */}
      <BookingSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        bookingRef={bookingRef}
      />
    </div>
  );
}

/**
 * Calendar page for date and time selection
 * Step 2-3 of the booking flow: Select date -> Select time -> Confirm
 * Wrapped in Suspense for useSearchParams
 */
export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#d4af37] border-t-transparent rounded-full" />
        </div>
      }
    >
      <CalendarPageContent />
    </Suspense>
  );
}
