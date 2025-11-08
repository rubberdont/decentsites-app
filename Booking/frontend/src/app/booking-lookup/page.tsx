'use client';

import { useState } from 'react';
import Link from 'next/link';
import { bookingsAPI, profilesAPI } from '@/services/api';
import { Button, Input, Card } from '@/components/ui';
import type { Booking, BusinessProfile, BookingStatus } from '@/types';

interface BookingWithProfile extends Booking {
  profile?: BusinessProfile;
  serviceName?: string;
}

export default function BookingLookupPage() {
  const [bookingRef, setBookingRef] = useState('');
  const [booking, setBooking] = useState<BookingWithProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingRef.trim()) {
      setError('Please enter a booking reference number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setBooking(null);
      
      // Search for booking by reference
      const bookingResponse = await bookingsAPI.getByRef(bookingRef.trim());
      const foundBooking = bookingResponse.data;
      
      // Fetch profile information
      let profile: BusinessProfile | undefined;
      let serviceName: string | undefined;
      
      try {
        const profileResponse = await profilesAPI.getById(foundBooking.profile_id);
        profile = profileResponse.data;
        
        // Get service name if service_id exists
        if (foundBooking.service_id && profile.services) {
          const service = profile.services.find(s => s.id === foundBooking.service_id);
          serviceName = service?.title;
        }
      } catch (profileError) {
        console.error('Failed to load profile:', profileError);
        // Continue without profile data
      }
      
      setBooking({
        ...foundBooking,
        profile,
        serviceName
      });
      setSearched(true);
    } catch (err) {
      console.error('Failed to search booking:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          setError('Booking not found. Please check your reference number and try again.');
        } else {
          setError('Failed to search for booking. Please try again.');
        }
      } else {
        setError('Failed to search for booking. Please try again.');
      }
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
    
    switch (status) {
      case 'CONFIRMED':
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case 'REJECTED':
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const formatBookingDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resetSearch = () => {
    setBookingRef('');
    setBooking(null);
    setError(null);
    setSearched(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-[#14B8A6] hover:text-[#0F9488] dark:text-[#14B8A6] dark:hover:text-[#0F9488] mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Booking Lookup
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Enter your booking reference number to view your booking details
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="max-w-md mx-auto mb-12">
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              type="text"
              id="bookingRef"
              label="Booking Reference Number"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value)}
              placeholder="Enter your booking reference (e.g., BK-123456)"
              disabled={loading}
            />
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              isLoading={loading}
              className="w-full"
            >
              {loading ? 'Searching...' : 'Search Booking'}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t know your booking reference? Check your confirmation email or contact the business directly.
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
                  Booking Not Found
                </h3>
              </div>
              <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
              <Button
                onClick={resetSearch}
                variant="primary"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Booking Details */}
        {booking && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="bg-[#14B8A6] dark:bg-teal-900/20 px-6 py-4 border-b border-[#0F9488] dark:border-teal-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white dark:text-[#14B8A6]">
                    Booking Found
                  </h2>
                  <button
                    onClick={resetSearch}
                    className="text-white dark:text-[#14B8A6] hover:text-gray-100 dark:hover:text-white text-sm font-medium transition-colors"
                  >
                    Search Another
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Booking Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Booking #{booking.booking_ref}
                    </h3>
                    <div className={getStatusBadge(booking.status)}>
                      {booking.status}
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created: {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Booking Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Business
                    </h4>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {booking.profile?.name || 'Unknown Business'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Booking Date & Time
                    </h4>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {formatBookingDate(booking.booking_date)}
                    </p>
                  </div>

                  {booking.serviceName && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Service
                      </h4>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {booking.serviceName}
                      </p>
                    </div>
                  )}

                  {booking.profile?.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Business Description
                      </h4>
                      <p className="text-gray-900 dark:text-white">
                        {booking.profile.description}
                      </p>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Notes
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-900 dark:text-white">
                          {booking.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
                  {booking.profile_id && (
                    <Link
                      href={`/profiles/${booking.profile_id}`}
                      className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-6 py-3 rounded-lg transition-colors text-center font-medium"
                    >
                      View Business Profile
                    </Link>
                  )}
                  
                  <Link
                    href="/"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors text-center font-medium"
                  >
                    Browse More Services
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Empty State (after search with no results) */}
        {searched && !booking && !error && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
              <div className="max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Booking Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We couldn&apos;t find a booking with that reference number. Please check the number and try again.
                </p>
                <Button
                  onClick={resetSearch}
                  variant="primary"
                  size="lg"
                  className="inline-flex items-center"
                >
                  Try Another Search
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}