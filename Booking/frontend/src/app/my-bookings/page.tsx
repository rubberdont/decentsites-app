'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Footer from '@/components/Footer';
import { bookingsAPI, profilesAPI } from '@/services/api';
import { ConfirmationModal, useToast } from '@/components/ui';
import type { Booking, BusinessProfile, BookingStatus } from '@/types';

interface BookingWithProfile extends Booking {
  profile?: BusinessProfile;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);
  const { showToast, ToastComponent } = useToast();

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

  const openCancelModal = (bookingId: string) => {
    setBookingToCancel(bookingId);
  };

  const closeCancelModal = () => {
    setBookingToCancel(null);
  };

  const handleCancelBooking = (bookingId: string) => {
  openCancelModal(bookingId);
};

const handleRescheduleClick = (booking: Booking) => {
  setBookingToReschedule(booking);
  setRescheduleModalOpen(true);
};

const handleRescheduleConfirm = async (newDate: string, newTimeSlot: string) => {
  if (!bookingToReschedule) return;
  
  try {
    await bookingsAPI.reschedule(bookingToReschedule.id, {
      new_date: newDate,
      new_time_slot: newTimeSlot,
    });
    
    showToast('Booking rescheduled successfully!', 'success');
    setRescheduleModalOpen(false);
    setBookingToReschedule(null);
    
    // Refresh bookings
    loadBookings();
  } catch (error: any) {
    showToast(
      error.response?.data?.detail || 'Failed to reschedule booking',
      'error'
    );
  }
};

const handleConfirmCancel = async () => {
  if (!bookingToCancel) return;

  try {
    setCancellingId(bookingToCancel);
    await bookingsAPI.cancel(bookingToCancel);
    closeCancelModal();
    showToast('Booking cancelled successfully', 'success');
    // Refresh bookings list
    await loadBookings();
  } catch (err) {
    console.error('Failed to cancel booking:', err);
    showToast('Failed to cancel booking. Please try again.', 'error');
  } finally {
    setCancellingId(null);
  }
};

  // Check if a booking date is upcoming
  const isUpcoming = (dateString: string): boolean => {
    return new Date(dateString) >= new Date();
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => 
    activeTab === 'upcoming' ? isUpcoming(booking.booking_date) : !isUpcoming(booking.booking_date)
  );

  // Convert "09:00-10:00" to "9:00 AM - 10:00 AM"
  const formatTimeSlotForDisplay = (timeSlot: string | undefined): string => {
    if (!timeSlot) return '';
    const [start, end] = timeSlot.split('-');
    const format12Hour = (time24: string): string => {
      const [hours, minutes] = time24.split(':');
      const h = parseInt(hours, 10);
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${period}`;
    };
    return `${format12Hour(start)} - ${format12Hour(end)}`;
  };

  // Format date only (without time)
  const formatDateOnly = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format full booking date with time
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

  // Get status badge JSX
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <div className="py-1 px-3 rounded-full bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold uppercase tracking-wider">
            Confirmed
          </div>
        );
      case 'PENDING':
        return (
          <div className="py-1 px-3 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider">
            Pending
          </div>
        );
      case 'CANCELLED':
        return (
          <div className="py-1 px-3 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            Cancelled
          </div>
        );
      case 'REJECTED':
        return (
          <div className="py-1 px-3 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            Rejected
          </div>
        );
      default:
        return (
          <div className="py-1 px-3 rounded-full bg-[#444444] text-[#a0a0a0] text-xs font-bold uppercase tracking-wider">
            {status}
          </div>
        );
    }
  };

  return (
    <ProtectedRoute>
      <div className="relative flex min-h-screen w-full flex-col bg-[#1a1a1a] overflow-x-hidden">
        <main className="px-4 py-5 sm:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center">
          <div className="flex flex-col w-full max-w-[960px] flex-1">
            
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <h1 className="text-[#eaeaea] text-4xl font-black leading-tight tracking-tight min-w-72">
                My Bookings
              </h1>
            </div>

            {/* Tabs */}
            <div className="pb-3 mt-4">
              <div className="flex border-b border-[#444444] px-4 gap-8">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
                    activeTab === 'upcoming'
                      ? 'border-b-[#d4af37] text-[#eaeaea]'
                      : 'border-b-transparent text-[#a0a0a0] hover:text-[#c0c0c0]'
                  }`}
                >
                  <span className="text-sm font-bold leading-normal tracking-wide">Upcoming</span>
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
                    activeTab === 'past'
                      ? 'border-b-[#d4af37] text-[#eaeaea]'
                      : 'border-b-transparent text-[#a0a0a0] hover:text-[#c0c0c0]'
                  }`}
                >
                  <span className="text-sm font-bold leading-normal tracking-wide">Past</span>
                </button>
              </div>
            </div>

            {/* Section Header */}
            <h2 className="text-[#eaeaea] text-[22px] font-bold leading-tight tracking-tight px-4 pb-3 pt-8">
              {activeTab === 'upcoming' ? 'Upcoming Bookings' : 'Past Bookings'}
            </h2>

            {/* Error State */}
            {error && (
              <div className="mx-4 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
                <button
                  onClick={loadBookings}
                  className="mt-3 px-4 py-2 bg-[#d4af37] text-[#1a1a1a] rounded-lg text-sm font-bold hover:bg-[#c9a030] transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col gap-4 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col md:flex-row items-stretch justify-between gap-6 rounded-lg bg-[#2a2a2a] p-6 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#444444] rounded-full" />
                      <div className="flex flex-col gap-2">
                        <div className="h-5 w-48 bg-[#444444] rounded" />
                        <div className="h-4 w-32 bg-[#444444] rounded" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="h-5 w-36 bg-[#444444] rounded" />
                      <div className="h-4 w-28 bg-[#444444] rounded" />
                    </div>
                    <div className="flex flex-col items-end gap-4">
                      <div className="h-6 w-24 bg-[#444444] rounded-full" />
                      <div className="flex gap-2">
                        <div className="h-9 w-24 bg-[#444444] rounded-lg" />
                        <div className="h-9 w-20 bg-[#444444] rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bookings List */}
            {!loading && !error && filteredBookings.length > 0 && (
              <div className="flex flex-col gap-4 p-4">
                {filteredBookings.map((booking) => {
                  const service = booking.profile?.services?.find(s => s.id === booking.service_id);
                  
                  return (
                    <div
                      key={booking.id}
                      className="flex flex-col md:flex-row items-stretch justify-between gap-6 rounded-lg bg-[#2a2a2a] p-6 shadow-lg border border-[#444444]"
                    >
                      {/* Left: Service Info */}
                      <div className="flex-shrink-0 flex items-start gap-4">
                        {/* Service Icon */}
                        <div className="w-12 h-12 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-[#eaeaea] text-lg font-bold leading-tight">
                            {service?.title || 'Service'}
                          </p>
                          <p className="text-[#a0a0a0] text-sm font-normal leading-normal">
                            at {booking.profile?.name || 'Business'}
                          </p>
                          <p className="text-[#666666] text-xs mt-1">
                            Ref: {booking.booking_ref}
                          </p>
                        </div>
                      </div>

                      {/* Center: Date & Time */}
                      <div className="flex-grow flex items-center justify-start md:justify-center">
                        <div className="flex flex-col gap-1 text-left">
                          <p className="text-[#eaeaea] text-base font-bold leading-tight">
                            {formatDateOnly(booking.booking_date)}
                          </p>
                          <p className="text-[#a0a0a0] text-sm font-normal leading-normal">
                            {booking.time_slot ? formatTimeSlotForDisplay(booking.time_slot) : formatBookingDate(booking.booking_date).split(',').pop()?.trim()}
                          </p>
                        </div>
                      </div>

                      {/* Right: Status & Actions */}
                      <div className="flex flex-col items-start md:items-end justify-between gap-4">
                        {getStatusBadge(booking.status)}
                        <div className="flex items-center gap-2">
                          <Link href="/book">
                            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-[#333333] hover:bg-[#444444] text-[#eaeaea] text-sm font-medium leading-normal transition-colors border border-[#444444]">
                              <span className="truncate">Book Again</span>
                            </button>
                          </Link>
                          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                            {booking.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRescheduleClick(booking)}
                                >
                                  Reschedule
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking.id)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <div className="flex flex-col gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking.id)}
                                >
                                  Cancel Booking
                                </Button>
                                <p className="text-xs text-gray-500">
                                  To reschedule, please contact the service provider
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredBookings.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center p-16 mt-8 mx-4 rounded-lg border-2 border-dashed border-[#444444]">
                <svg className="w-16 h-16 text-[#444444] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-[#eaeaea] text-xl font-bold">
                  {activeTab === 'upcoming' ? 'No Upcoming Bookings' : 'No Past Bookings'}
                </h3>
                <p className="text-[#a0a0a0] mt-2 max-w-sm">
                  {activeTab === 'upcoming'
                    ? "You don't have any appointments scheduled. Time for a fresh look?"
                    : "You don't have any past appointments yet."}
                </p>
                {activeTab === 'upcoming' && (
                  <Link href="/book">
                    <button className="flex mt-6 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-[#d4af37] text-[#1a1a1a] text-sm font-bold leading-normal tracking-wide hover:bg-[#c9a030] transition-colors">
                      <span className="truncate">Book Now</span>
                    </button>
                  </Link>
                )}
              </div>
            )}

          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={bookingToCancel !== null}
        onClose={closeCancelModal}
        onConfirm={handleConfirmCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        confirmVariant="danger"
        isLoading={cancellingId !== null}
      />

      {rescheduleModalOpen && bookingToReschedule && (
        <RescheduleModal
          booking={bookingToReschedule}
          isOpen={rescheduleModalOpen}
          onClose={() => {
            setRescheduleModalOpen(false);
            setBookingToReschedule(null);
          }}
          onConfirm={handleRescheduleConfirm}
          showToast={showToast}
        />
      )}

      {/* Toast Notifications */}
      {ToastComponent}
    </ProtectedRoute>
  );
}

import RescheduleModal from '@/components/bookings/RescheduleModal';
