'use client';

import React from 'react';

/**
 * Booking status type
 */
type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'rejected';

/**
 * Booking interface for the table
 */
export interface RecentBooking {
  id: string;
  time: string;
  customerName: string;
  customerEmail: string;
  service: string;
  status: BookingStatus;
}

/**
 * Props for RecentBookings component
 */
interface RecentBookingsProps {
  bookings: RecentBooking[];
  onApprove?: (id: string) => void;
  onView?: (id: string) => void;
}

/**
 * Status badge colors mapping
 */
const statusStyles: Record<BookingStatus, string> = {
  confirmed: 'bg-status-confirmed-bg text-status-confirmed',
  pending: 'bg-status-pending-bg text-status-pending',
  cancelled: 'bg-status-cancelled-bg text-status-cancelled',
  completed: 'bg-status-completed-bg text-status-completed',
  rejected: 'bg-status-rejected-bg text-status-rejected',
};

/**
 * Status badge labels
 */
const statusLabels: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  completed: 'Completed',
  rejected: 'Rejected',
};

/**
 * Check icon for approve button
 */
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

/**
 * Eye icon for view button
 */
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

/**
 * Calendar icon for empty state
 */
const CalendarEmptyIcon = () => (
  <svg
    className="w-16 h-16 text-admin-text-dark"
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
);

/**
 * RecentBookings - Table displaying recent bookings with actions
 */
export function RecentBookings({ bookings, onApprove, onView }: RecentBookingsProps) {
  // Empty state
  if (bookings.length === 0) {
    return (
      <div className="admin-card">
        <div className="p-6 border-b border-admin-border">
          <h2 className="text-lg font-semibold text-admin-text">Upcoming Bookings</h2>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <CalendarEmptyIcon />
          <h3 className="mt-4 text-lg font-medium text-admin-text">No upcoming bookings</h3>
          <p className="mt-2 text-admin-text-muted">
            When customers make bookings, they&apos;ll appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-admin-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-admin-text">Upcoming Bookings</h2>
        <a
          href="/bookings"
          className="text-sm text-admin-primary hover:text-admin-primary-light transition-colors"
        >
          View all &rarr;
        </a>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                {/* Time */}
                <td>
                  <span className="font-medium text-admin-text">{booking.time}</span>
                </td>

                {/* Customer */}
                <td>
                  <div>
                    <div className="font-medium text-admin-text">{booking.customerName}</div>
                    <div className="text-sm text-admin-text-muted">{booking.customerEmail}</div>
                  </div>
                </td>

                {/* Service */}
                <td>
                  <span className="text-admin-text">{booking.service}</span>
                </td>

                {/* Status */}
                <td>
                  <span
                    className={`status-badge ${statusStyles[booking.status]}`}
                  >
                    {statusLabels[booking.status]}
                  </span>
                </td>

                {/* Actions */}
                <td>
                  <div className="flex items-center justify-end gap-2">
                    {booking.status === 'pending' && onApprove && (
                      <button
                        onClick={() => onApprove(booking.id)}
                        className="p-2 rounded-lg bg-status-confirmed/10 text-status-confirmed hover:bg-status-confirmed/20 transition-colors"
                        title="Approve"
                      >
                        <CheckIcon />
                      </button>
                    )}
                    {onView && (
                      <button
                        onClick={() => onView(booking.id)}
                        className="p-2 rounded-lg bg-admin-bg-hover text-admin-text-muted hover:text-admin-text transition-colors"
                        title="View details"
                      >
                        <EyeIcon />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentBookings;
