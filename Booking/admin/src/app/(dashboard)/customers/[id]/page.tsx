'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Customer, Booking, BookingStatus, CustomerNote, PaginatedResponse } from '@/types';
import { customersAPI } from '@/services/api';
import { LoadingSpinner } from '@/components/ui';

/**
 * Interface for booking history item from API
 */
interface BookingHistoryItem {
  id: string;
  booking_ref: string;
  service_title: string;
  service_price: number;
  booking_date: string;
  time_slot: string;
  status: BookingStatus;
  created_at: string;
}

/**
 * Customer detail page
 * Shows customer info, stats, and booking history
 */
export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Customer data
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Booking history with pagination
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Notes
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // Block modal state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  /**
   * Fetch customer data
   */
  const fetchCustomer = useCallback(async () => {
    try {
      const response = await customersAPI.getById(customerId);
      setCustomer(response.data);
    } catch (err: any) {
      console.error('Error fetching customer:', err);
      setError(err.response?.data?.detail || 'Failed to load customer data');
    }
  }, [customerId]);

  /**
   * Fetch booking history with pagination
   */
  const fetchBookings = useCallback(async (page: number = 1) => {
    setIsLoadingBookings(true);
    try {
      const response = await customersAPI.getBookings(customerId, { page, limit: 10 });
      const data = response.data as PaginatedResponse<BookingHistoryItem>;
      setBookings(data.items);
      setBookingsTotalPages(data.total_pages);
      setBookingsPage(page);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoadingBookings(false);
    }
  }, [customerId]);

  /**
   * Fetch customer notes
   */
  const fetchNotes = useCallback(async () => {
    setIsLoadingNotes(true);
    try {
      const response = await customersAPI.getNotes(customerId);
      // API returns { notes: [...] } or array directly
      const notesData = Array.isArray(response.data) ? response.data : (response.data as any).notes || [];
      setNotes(notesData);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
    } finally {
      setIsLoadingNotes(false);
    }
  }, [customerId]);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      await fetchCustomer();
      await Promise.all([fetchBookings(1), fetchNotes()]);
      setIsLoading(false);
    };

    if (customerId) {
      loadData();
    }
  }, [customerId, fetchCustomer, fetchBookings, fetchNotes]);

  /**
   * Format date for display
   */
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Format datetime for display
   */
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Get status badge styles
   */
  const getStatusBadge = (status: BookingStatus) => {
    const styles: Record<BookingStatus, string> = {
      [BookingStatus.PENDING]: 'bg-yellow-500/20 text-yellow-400',
      [BookingStatus.CONFIRMED]: 'bg-green-500/20 text-green-400',
      [BookingStatus.COMPLETED]: 'bg-blue-500/20 text-blue-400',
      [BookingStatus.CANCELLED]: 'bg-red-500/20 text-red-400',
      [BookingStatus.REJECTED]: 'bg-red-500/20 text-red-400',
      [BookingStatus.NO_SHOW]: 'bg-gray-500/20 text-gray-400',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-400';
  };

  /**
   * Handle block/unblock customer
   */
  const handleToggleBlock = async () => {
    if (!customer) return;

    if (customer.is_blocked) {
      // Unblock directly
      setIsBlocking(true);
      try {
        const response = await customersAPI.unblock(customerId);
        setCustomer(response.data);
      } catch (err: any) {
        console.error('Error unblocking customer:', err);
        alert(err.response?.data?.detail || 'Failed to unblock customer');
      } finally {
        setIsBlocking(false);
      }
    } else {
      // Show block confirmation modal
      setShowBlockModal(true);
    }
  };

  /**
   * Confirm block customer
   */
  const handleConfirmBlock = async () => {
    setIsBlocking(true);
    try {
      const response = await customersAPI.block(customerId, blockReason || undefined);
      setCustomer(response.data);
      setShowBlockModal(false);
      setBlockReason('');
    } catch (err: any) {
      console.error('Error blocking customer:', err);
      alert(err.response?.data?.detail || 'Failed to block customer');
    } finally {
      setIsBlocking(false);
    }
  };

  /**
   * Handle save note
   */
  const handleSaveNote = async () => {
    if (!newNote.trim()) return;

    setIsSavingNote(true);
    try {
      const response = await customersAPI.addNote(customerId, newNote.trim());
      // Add new note to the list
      setNotes((prev) => [response.data, ...prev]);
      setNewNote('');
    } catch (err: any) {
      console.error('Error saving note:', err);
      alert(err.response?.data?.detail || 'Failed to save note');
    } finally {
      setIsSavingNote(false);
    }
  };

  /**
   * Handle pagination for bookings
   */
  const handleBookingsPageChange = (page: number) => {
    if (page >= 1 && page <= bookingsTotalPages) {
      fetchBookings(page);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <svg
          className="w-16 h-16 text-red-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-lg font-medium text-admin-text mb-2">Error Loading Customer</h3>
        <p className="text-admin-text-muted mb-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-admin-primary hover:bg-admin-primary-hover text-white font-medium rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // No customer found
  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3 className="text-lg font-medium text-admin-text mb-2">Customer Not Found</h3>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-admin-primary hover:bg-admin-primary-hover text-white font-medium rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-admin-text-muted hover:text-admin-text mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Customers
      </button>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-admin-primary/20 flex items-center justify-center text-admin-primary text-xl font-bold">
            {customer.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-admin-text">{customer.name}</h1>
            <p className="text-admin-text-muted">@{customer.username}</p>
          </div>
        </div>

        <button
          onClick={handleToggleBlock}
          disabled={isBlocking}
          className={`px-4 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            customer.is_blocked
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          }`}
        >
          {isBlocking ? 'Processing...' : customer.is_blocked ? 'Unblock Customer' : 'Block Customer'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Info Card */}
          <div className="bg-admin-bg-card border border-admin-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-admin-text mb-4">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-admin-text-muted">Email</label>
                <p className="text-admin-text">{customer.email || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-admin-text-muted">Phone</label>
                <p className="text-admin-text">{customer.phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-admin-text-muted">Member Since</label>
                <p className="text-admin-text">{formatDate(customer.created_at)}</p>
              </div>
              <div>
                <label className="text-sm text-admin-text-muted">Status</label>
                <p>
                  {customer.is_blocked ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                      Blocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      Active
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-admin-bg-card border border-admin-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-admin-text mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-admin-bg-hover rounded-lg p-4">
                <p className="text-2xl font-bold text-admin-text">
                  {customer.booking_count}
                </p>
                <p className="text-sm text-admin-text-muted">Total Bookings</p>
              </div>
              <div className="bg-admin-bg-hover rounded-lg p-4">
                <p className="text-2xl font-bold text-admin-text">
                  ${customer.total_spent}
                </p>
                <p className="text-sm text-admin-text-muted">Total Spent</p>
              </div>
              <div className="col-span-2 bg-admin-bg-hover rounded-lg p-4">
                <p className="text-lg font-medium text-admin-text">
                  {customer.last_visit ? formatDate(customer.last_visit) : '-'}
                </p>
                <p className="text-sm text-admin-text-muted">Last Visit</p>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-admin-bg-card border border-admin-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-admin-text mb-4">Notes</h2>
            
            {/* Notes List */}
            {isLoadingNotes ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : notes.length > 0 ? (
              <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-admin-bg-hover rounded-lg p-3 text-sm"
                  >
                    <p className="text-admin-text whitespace-pre-wrap">{note.note}</p>
                    <p className="text-xs text-admin-text-muted mt-2">
                      {formatDateTime(note.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-admin-text-muted text-sm mb-4">No notes yet</p>
            )}

            {/* Add Note Form */}
            <div className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this customer..."
                className="admin-input min-h-[80px] resize-y"
              />
              <button
                onClick={handleSaveNote}
                disabled={!newNote.trim() || isSavingNote}
                className="w-full px-4 py-2 bg-admin-primary hover:bg-admin-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingNote ? 'Saving...' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Booking History */}
        <div className="lg:col-span-2">
          <div className="bg-admin-bg-card border border-admin-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-admin-border">
              <h2 className="text-lg font-semibold text-admin-text">Booking History</h2>
            </div>

            {isLoadingBookings ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="md" />
              </div>
            ) : bookings.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Service</th>
                        <th>Date & Time</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>
                            <span className="font-mono text-sm text-admin-text">
                              {booking.booking_ref}
                            </span>
                          </td>
                          <td>
                            <span className="text-admin-text">{booking.service_title}</span>
                          </td>
                          <td>
                            <div className="text-sm">
                              <div className="text-admin-text">
                                {formatDate(booking.booking_date)}
                              </div>
                              <div className="text-admin-text-muted">
                                {booking.time_slot}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="font-medium text-admin-text">
                              ${booking.service_price}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {bookingsTotalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-admin-border">
                    <p className="text-sm text-admin-text-muted">
                      Page {bookingsPage} of {bookingsTotalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBookingsPageChange(bookingsPage - 1)}
                        disabled={bookingsPage <= 1}
                        className="px-3 py-1 text-sm bg-admin-bg-hover hover:bg-admin-border text-admin-text rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handleBookingsPageChange(bookingsPage + 1)}
                        disabled={bookingsPage >= bookingsTotalPages}
                        className="px-3 py-1 text-sm bg-admin-bg-hover hover:bg-admin-border text-admin-text rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto text-admin-text-muted mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-admin-text mb-2">
                  No bookings yet
                </h3>
                <p className="text-admin-text-muted">
                  This customer hasn&apos;t made any bookings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Block Confirmation Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-admin-bg-card border border-admin-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-admin-text mb-4">
              Block Customer
            </h3>
            <p className="text-admin-text-muted mb-4">
              Are you sure you want to block <strong className="text-admin-text">{customer.name}</strong>? 
              This will prevent them from making new bookings.
            </p>
            <div className="mb-4">
              <label className="block text-sm text-admin-text-muted mb-2">
                Reason (optional)
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking..."
                className="admin-input min-h-[80px] resize-y"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                }}
                className="px-4 py-2 text-admin-text-muted hover:text-admin-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBlock}
                disabled={isBlocking}
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBlocking ? 'Blocking...' : 'Block Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
