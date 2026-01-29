'use client';

import { availabilityAPI } from '@/services/api';
import { formatTime12Hour, isToday, isTimeSlotPast, isPastDateTime, getMinDate } from '@/utils/date';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Booking, BookingStatus, AvailabilitySlot } from '@/types';
import { StatusBadge, BookingDetailCard, BookingTimeline, BookingActions } from '@/components/bookings';
import { Modal, LoadingSpinner } from '@/components/ui';
import { BookingActionType } from '@/components/bookings/BookingActions';
import { TimelineEvent } from '@/components/bookings/BookingTimeline';
import { bookingsAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

/**
 * Admin note structure from backend
 */
interface AdminNote {
  note: string;
  created_by: string;
  created_at: string;
}

/**
 * Extended booking type with admin_notes_list
 */
interface BookingWithNotes extends Booking {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  service_title?: string;
  admin_notes_list?: AdminNote[];
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format currency (Philippine Peso)
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

/**
 * Build timeline events from booking data
 */
function buildTimelineEvents(booking: BookingWithNotes): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Add created event
  events.push({
    id: 'event-created',
    type: 'created',
    description: 'Booking created',
    timestamp: booking.created_at,
    actor: booking.customer_name || booking.user_name || 'Customer',
  });

  // Add status change event if updated_at differs from created_at
  if (booking.updated_at && booking.updated_at !== booking.created_at) {
    const statusDescriptions: Record<BookingStatus, string> = {
      [BookingStatus.PENDING]: 'Status changed to pending',
      [BookingStatus.CONFIRMED]: 'Booking confirmed',
      [BookingStatus.CANCELLED]: 'Booking cancelled',
      [BookingStatus.REJECTED]: 'Booking rejected',
      [BookingStatus.COMPLETED]: 'Booking completed',
      [BookingStatus.NO_SHOW]: 'Marked as no-show',
    };

    events.push({
      id: 'event-status',
      type: 'status_changed',
      description: statusDescriptions[booking.status] || `Status: ${booking.status}`,
      timestamp: booking.updated_at,
      actor: 'Admin',
    });
  }

  // Add admin notes as timeline events
  if (booking.admin_notes_list && booking.admin_notes_list.length > 0) {
    booking.admin_notes_list.forEach((note, index) => {
      events.push({
        id: `event-note-${index}`,
        type: 'note_added',
        description: note.note,
        timestamp: note.created_at,
        actor: note.created_by || 'Admin',
      });
    });
  }

  // Sort events by timestamp (newest first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return events;
}

/**
 * Booking detail page component
 * Displays comprehensive booking information with action capabilities
 */
export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params.id as string;

  // State for booking data
  const [booking, setBooking] = useState<BookingWithNotes | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modals
  const [activeModal, setActiveModal] = useState<BookingActionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // State for reschedule
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState('');

  // Filter slots to hide past time slots for today
  const displaySlots = useMemo(() => {
    if (!rescheduleDate || !availableSlots.length) return [];
    
    // If date is today, filter out past time slots
    if (isToday(rescheduleDate)) {
      return availableSlots.filter(slot => !isTimeSlotPast(slot.time_slot));
    }
    
    // For future dates, show all slots
    return availableSlots;
  }, [rescheduleDate, availableSlots]);

  /**
   * Fetch booking data from API
   */
  const fetchBooking = async () => {
    try {
      setIsLoadingData(true);
      setError(null);
      const response = await bookingsAPI.getById(bookingId);
      const bookingData = response.data as BookingWithNotes;

      // Map backend field names to frontend field names if needed
      const normalizedBooking: BookingWithNotes = {
        ...bookingData,
        user_name: bookingData.customer_name || bookingData.user_name,
        user_email: bookingData.customer_email || bookingData.user_email,
        service_name: bookingData.service_title || bookingData.service_name,
      };

      setBooking(normalizedBooking);
      setTimelineEvents(buildTimelineEvents(normalizedBooking));
    } catch (err) {
      console.error('Failed to fetch booking:', err);
      setError('Failed to load booking details. Please try again.');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch booking on mount
  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  /**
   * Handle action button click
   */
  const handleAction = (action: BookingActionType) => {
    setActiveModal(action);
    setActionError(null);
    setNoteText('');
    setRescheduleDate('');
    setRescheduleTime('');
  };

  /**
   * Handle action confirmation
   */
  // Load available slots when reschedule date changes
  useEffect(() => {
    if (rescheduleDate && booking?.profile_id) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlotId('');
    }
  }, [rescheduleDate, booking?.profile_id]);

  const loadAvailableSlots = async () => {
    if (!rescheduleDate || !booking?.profile_id) return;

    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedSlotId('');

    try {
      const date = new Date(rescheduleDate);
      // Format date as ISO string (backend expects full ISO date)
      const isoDate = `${rescheduleDate}T00:00:00.000Z`;

      const slots = await availabilityAPI.getSlotsForDate(
        booking.profile_id,
        isoDate
      );

      console.log(slots.data.slots);

      setAvailableSlots(slots.data.slots || []);
    } catch (error) {
      console.error('Failed to load availability slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  /**
   * Handle action confirmation
   */
  const handleConfirmAction = async () => {
    if (!activeModal || !bookingId) return;

    setIsLoading(true);
    setActionError(null);

    try {
      switch (activeModal) {
        case 'approve':
          await bookingsAPI.approve(bookingId);
          break;
        case 'reject':
          await bookingsAPI.reject(bookingId, noteText || undefined);
          break;
        case 'cancel':
          await bookingsAPI.cancel(bookingId, noteText || undefined);
          break;
        case 'mark_completed':
          await bookingsAPI.markCompleted(bookingId);
          break;
        case 'mark_no_show':
          await bookingsAPI.markNoShow(bookingId);
          break;
        case 'add_note':
          if (!noteText.trim()) {
            setActionError('Note cannot be empty');
            setIsLoading(false);
            return;
          }
          await bookingsAPI.addNote(bookingId, noteText);
          break;
        case 'reschedule':
          if (!rescheduleDate || !selectedSlotId) {
            setActionError('Please select both date and time slot');
            setIsLoading(false);
            return;
          }

// Find the selected slot to get the time_slot value
  const selectedSlot = availableSlots.find(slot => slot.id === selectedSlotId);
  if (!selectedSlot) {
    setActionError('Selected time slot is invalid');
    setIsLoading(false);
    return;
  }

  // Validate not in past
  if (isPastDateTime(rescheduleDate, selectedSlot.time_slot)) {
    toast.error('Cannot reschedule to a past date or time');
    setIsLoading(false);
    return;
  }

  try {
            // Format date as ISO string
            const isoDate = `${rescheduleDate}T00:00:00.000Z`;

            await bookingsAPI.reschedule(bookingId, {
              new_date: isoDate,
              new_time_slot: selectedSlot.time_slot, // Use the 24-hour format from database
            });
          } catch (error: any) {
            setActionError(error.response?.data?.detail || 'Failed to reschedule booking');
            setIsLoading(false);
            return;
          }
          break;
        default:
          console.warn(`Unknown action: ${activeModal}`);
      }

      // Refresh booking data after successful action
      toast.success('Booking rescheduled successfully');
      setActiveModal(null);
      setRescheduleDate('');
      setRescheduleTime('');
      setSelectedSlotId('');
      setAvailableSlots([]);
      fetchBooking(); // Refresh booking data
    } catch (err: unknown) {
      console.error(`Action ${activeModal} failed:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Action failed. Please try again.';
      setActionError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get modal title based on action
   */
  const getModalTitle = (action: BookingActionType): string => {
    switch (action) {
      case 'approve':
        return 'Approve Booking';
      case 'reject':
        return 'Reject Booking';
      case 'cancel':
        return 'Cancel Booking';
      case 'reschedule':
        return 'Reschedule Booking';
      case 'add_note':
        return 'Add Note';
      case 'mark_completed':
        return 'Mark as Completed';
      case 'mark_no_show':
        return 'Mark as No Show';
      default:
        return 'Confirm Action';
    }
  };

  /**
   * Get modal content based on action
   */
  const renderModalContent = () => {
    if (!activeModal) return null;

    switch (activeModal) {
      case 'approve':
        return (
          <div className="space-y-4">
            <p className="text-admin-text-muted">
              Are you sure you want to approve this booking? The customer will be notified.
            </p>
            {actionError && (
              <p className="text-red-500 text-sm">{actionError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-admin-bg-hover text-admin-text hover:bg-admin-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        );

      case 'reject':
        return (
          <div className="space-y-4">
            <p className="text-admin-text-muted">
              Are you sure you want to reject this booking? This action cannot be undone.
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="admin-input min-h-[100px] resize-none"
            />
            {actionError && (
              <p className="text-red-500 text-sm">{actionError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-admin-bg-hover text-admin-text hover:bg-admin-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        );

      case 'cancel':
        return (
          <div className="space-y-4">
            <p className="text-admin-text-muted">
              Are you sure you want to cancel this booking? The customer will be notified.
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              className="admin-input min-h-[100px] resize-none"
            />
            {actionError && (
              <p className="text-red-500 text-sm">{actionError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-admin-bg-hover text-admin-text hover:bg-admin-border transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        );

      case 'reschedule':
        return (
          <div className="space-y-4">
            <p className="text-admin-text-muted">
              Select a new date and time for this booking.
            </p>

            {/* Current Booking Info */}
            {booking && (
              <div className="p-3 bg-admin-bg-secondary rounded-lg border border-admin-border">
                <p className="text-sm font-medium text-admin-text mb-1">Current Booking:</p>
                <p className="text-sm text-admin-text-muted">
                  {new Date(booking.booking_date).toLocaleDateString()} at {booking.time_slot ? formatTime12Hour(booking.time_slot) : 'N/A'}
                </p>
              </div>
            )}

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Select New Date
              </label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => {
                  setRescheduleDate(e.target.value);
                  setSelectedSlotId(''); // Reset slot selection when date changes
                }}
                min={getMinDate()}
                className="admin-input w-full"
              />
            </div>

            {/* Time Slot Selector */}
            {rescheduleDate && (
              <div>
                <label className="block text-sm font-medium text-admin-text mb-2">
                  Select New Time Slot
                </label>

                {loadingSlots ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary"></div>
                    <p className="mt-2 text-sm text-admin-text-muted">Loading available slots...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 bg-admin-bg-secondary rounded-lg border border-admin-border">
                    <p className="text-admin-text-muted">No available slots for this date</p>
                    <p className="text-sm text-admin-text-muted mt-1">Try selecting a different date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                    {displaySlots.map((slot) => {
                      const isAvailable = slot.is_available && slot.booked_count < slot.max_capacity;
                      const isSelected = selectedSlotId === slot.id;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => isAvailable && setSelectedSlotId(slot.id)}
                          disabled={!isAvailable}
                          className={` 
                              px-3 py-3 rounded-lg border-2 text-sm font-medium transition-all text-left
                              ${isSelected
                              ? 'border-admin-primary bg-admin-primary/10 text-admin-primary'
                              : isAvailable
                                ? 'border-admin-border bg-admin-bg hover:border-admin-primary/50 hover:bg-admin-bg-hover text-admin-text'
                                : 'border-admin-border bg-admin-bg-secondary text-admin-text-muted cursor-not-allowed opacity-60'
                            }
                            `}
                        >
                          <div className="font-semibold">
                            {formatTime12Hour(slot.time_slot)}
                          </div>
                          <div className="text-xs mt-1">
                            {isAvailable ? (
                              <span className="text-green-600">
                                {slot.max_capacity - slot.booked_count}/{slot.max_capacity} available
                              </span>
                            ) : (
                              <span className="text-red-600">Fully booked</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Helper text */}
            {rescheduleDate && !loadingSlots && availableSlots.length > 0 && (
              <p className="text-xs text-admin-text-muted">
                Select a time slot to continue with rescheduling
              </p>
            )}

            {actionError && (
              <p className="text-red-500 text-sm">{actionError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-admin-bg-hover text-admin-text hover:bg-admin-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={!rescheduleDate || !selectedSlotId || loadingSlots || isLoading}
                className="px-4 py-2 rounded-lg bg-admin-primary text-white hover:bg-admin-primary-hover transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Reschedule'}
              </button>
            </div>
          </div>
        );

      case 'add_note':
        return (
          <div className="space-y-4">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note about this booking..."
              className="admin-input min-h-[120px] resize-none"
              autoFocus
            />
            {actionError && (
              <p className="text-red-500 text-sm">{actionError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-admin-bg-hover text-admin-text hover:bg-admin-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isLoading || !noteText.trim()}
                className="px-4 py-2 rounded-lg bg-admin-primary text-white hover:bg-admin-primary-hover transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        );

      case 'mark_completed':
        return (
          <div className="space-y-4">
            <p className="text-admin-text-muted">
              Mark this booking as completed? This indicates the service was provided.
            </p>
            {actionError && (
              <p className="text-red-500 text-sm">{actionError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-admin-bg-hover text-admin-text hover:bg-admin-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Mark Completed'}
              </button>
            </div>
          </div>
        );

      case 'mark_no_show':
        return (
          <div className="space-y-4">
            <p className="text-admin-text-muted">
              Mark this booking as a no-show? This indicates the customer did not arrive.
            </p>
            {actionError && (
              <p className="text-red-500 text-sm">{actionError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-admin-bg-hover text-admin-text hover:bg-admin-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Mark No Show'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (isLoadingData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="p-6">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 text-admin-text-muted hover:text-admin-text transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Bookings
        </Link>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error || 'Booking not found'}</p>
          <button
            onClick={fetchBooking}
            className="mt-4 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back button and header */}
      <div className="space-y-4">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 text-admin-text-muted hover:text-admin-text transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Bookings
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-admin-text flex items-center gap-3">
              {booking.booking_ref}
              <StatusBadge status={booking.status} />
            </h1>
            <p className="text-admin-text-muted mt-1">
              Created {formatTimestamp(booking.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="bg-admin-bg-card border border-admin-border rounded-lg p-4">
        <BookingActions
          booking={booking}
          onAction={handleAction}
          disabled={isLoading}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Booking details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Details Card */}
          <BookingDetailCard title="Booking Details">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-admin-text-muted uppercase tracking-wider">Service</label>
                  <p className="text-admin-text mt-1">{booking.service_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-admin-text-muted uppercase tracking-wider">Price</label>
                  <p className="text-admin-text mt-1 font-semibold">
                    {booking.service_price ? formatCurrency(booking.service_price) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-admin-text-muted uppercase tracking-wider">Date</label>
                  <p className="text-admin-text mt-1">{formatDate(booking.booking_date)}</p>
                </div>
                <div>
                  <label className="text-xs text-admin-text-muted uppercase tracking-wider">Time Slot</label>
                  <p className="text-admin-text mt-1">{booking.time_slot || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-admin-text-muted uppercase tracking-wider">Duration</label>
                  <p className="text-admin-text mt-1">45 minutes</p>
                </div>
                <div>
                  <label className="text-xs text-admin-text-muted uppercase tracking-wider">Business</label>
                  <p className="text-admin-text mt-1">{booking.profile_name || 'N/A'}</p>
                </div>
              </div>

              {booking.notes && (
                <div className="pt-4 border-t border-admin-border">
                  <label className="text-xs text-admin-text-muted uppercase tracking-wider">Customer Notes</label>
                  <p className="text-admin-text mt-1 bg-admin-bg/50 p-3 rounded-lg">{booking.notes}</p>
                </div>
              )}

              {booking.admin_notes && (
                <div className="pt-4 border-t border-admin-border">
                  <label className="text-xs text-admin-text-muted uppercase tracking-wider">Admin Notes</label>
                  <p className="text-admin-text mt-1 bg-admin-bg/50 p-3 rounded-lg">{booking.admin_notes}</p>
                </div>
              )}
            </div>
          </BookingDetailCard>

          {/* Customer Details Card */}
          <BookingDetailCard title="Customer Details">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-admin-primary/20 flex items-center justify-center">
                  <span className="text-admin-primary font-semibold text-lg">
                    {booking.user_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-admin-text font-medium">{booking.user_name || 'Unknown'}</p>
                  <p className="text-admin-text-muted text-sm">{booking.user_email || 'No email'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-admin-border">
                <div>
                  <label className="text-xs text-admin-text-muted uppercase tracking-wider">Email</label>
                  <p className="text-admin-text mt-1">{booking.user_email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-admin-text-muted uppercase tracking-wider">Phone</label>
                  <p className="text-admin-text mt-1">{booking.customer_phone || 'N/A'}</p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href={`/customers/${booking.user_id}`}
                  className="inline-flex items-center gap-2 text-admin-primary hover:text-admin-primary-light transition-colors text-sm"
                >
                  View Customer Profile
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </BookingDetailCard>
        </div>

        {/* Right column - Timeline */}
        <div className="lg:col-span-1">
          <BookingDetailCard title="Timeline">
            <BookingTimeline events={timelineEvents} />
          </BookingDetailCard>
        </div>
      </div>

      {/* Action Modal */}
      {activeModal && (
        <Modal
          isOpen={!!activeModal}
          onClose={() => {
            setActiveModal(null);
            setNoteText('');
            setActionError(null);
          }}
          title={getModalTitle(activeModal)}
          size={activeModal === 'reschedule' ? 'lg' : 'md'}
        >
          {renderModalContent()}
        </Modal>
      )}
    </div>
  );
}
