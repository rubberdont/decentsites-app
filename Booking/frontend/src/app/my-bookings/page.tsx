'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button, Card } from '@/components/ui';
import { bookingsAPI, profilesAPI } from '@/services/api';
import type { Booking, BusinessProfile, BookingStatus } from '@/types';

interface BookingWithProfile extends Booking {
  profile?: BusinessProfile;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user's bookings
      const bookingsResponse = await bookingsAPI.getUserBookings();
      const userBookings = bookingsResponse.data;
      
      // Fetch profile information for each booking
      const bookingsWithProfiles = await Promise.all(
        userBookings.map(async (booking) => {
          try {
            const profileResponse = await profilesAPI.getById(booking.profile_id);
            return {
              ...booking,
              profile: profileResponse.data
            };
          } catch (profileError) {
            console.error(`Failed to load profile for booking ${booking.id}:`, profileError);
            return {
              ...booking,
              profile: undefined
            };
          }
        })
      );
      
      setBookings(bookingsWithProfiles);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await bookingsAPI.cancel(bookingId);
      
      // Refresh bookings list
      await loadBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#F5F3EF] dark:bg-gray-900">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading your bookings...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  My Bookings
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  View and manage your upcoming and past bookings
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Link
                  href="/"
                  className="inline-flex items-center"
                >
                  <Button variant="primary" size="md">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Book New Service
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 dark:text-red-300">{error}</p>
              </div>
              <Button
                onClick={loadBookings}
                variant="primary"
                size="sm"
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Bookings List */}
          {bookings.length > 0 ? (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        {/* Booking Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
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

                        {/* Booking Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Business
                            </h4>
                            <p className="text-gray-900 dark:text-white">
                              {booking.profile?.name || 'Unknown Business'}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Booking Date & Time
                            </h4>
                            <p className="text-gray-900 dark:text-white">
                              {formatBookingDate(booking.booking_date)}
                            </p>
                          </div>

                          {booking.service_id && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Service
                              </h4>
                              <p className="text-gray-900 dark:text-white">
                                {booking.profile?.services?.find(s => s.id === booking.service_id)?.title || 'Service'}
                              </p>
                            </div>
                          )}

                          {booking.notes && (
                            <div className="md:col-span-2">
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Notes
                              </h4>
                              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                {booking.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                        {booking.status === 'PENDING' && (
                          <Button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            variant="primary"
                            size="md"
                            isLoading={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                          </Button>
                        )}
                        
                        {(booking.status === 'CONFIRMED' || booking.status === 'REJECTED') && (
                          <Button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            variant="secondary"
                            size="md"
                            isLoading={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                          </Button>
                        )}

                        <Link
                          href={`/profiles/${booking.profile_id}`}
                          className="inline-block"
                        >
                          <Button variant="secondary" size="md" className="w-full text-center">
                            View Business
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Empty State */
            <Card className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
              <div className="max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Bookings Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven&apos;t made any bookings yet. Start by exploring available services and making your first booking.
                </p>
                <Link href="/" className="inline-block">
                  <Button variant="primary" size="lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Browse Services
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}