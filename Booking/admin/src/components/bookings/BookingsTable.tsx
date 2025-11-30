'use client';

import { Booking, BookingStatus } from '@/types';
import { StatusBadge } from './StatusBadge';

/** Available actions for bookings */
export type BookingAction = 'view' | 'approve' | 'reject' | 'cancel';

interface BookingsTableProps {
  /** Array of bookings to display */
  bookings: Booking[];
  /** Callback when an action is performed on a booking */
  onAction: (bookingId: string, action: BookingAction) => void;
  /** Whether data is currently loading */
  isLoading?: boolean;
  /** Current sort field */
  sortField?: string;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Callback when sort changes */
  onSort?: (field: string) => void;
}

/**
 * Format date string to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time string
 */
function formatDateTime(dateString: string, timeSlot?: string): string {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return timeSlot ? `${formattedDate} at ${timeSlot}` : formattedDate;
}

/**
 * Loading skeleton row component
 */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-4 px-4 border-b border-admin-border">
        <div className="h-4 bg-admin-bg-hover rounded w-24" />
      </td>
      <td className="py-4 px-4 border-b border-admin-border">
        <div className="space-y-2">
          <div className="h-4 bg-admin-bg-hover rounded w-32" />
          <div className="h-3 bg-admin-bg-hover rounded w-40" />
        </div>
      </td>
      <td className="py-4 px-4 border-b border-admin-border">
        <div className="h-4 bg-admin-bg-hover rounded w-28" />
      </td>
      <td className="py-4 px-4 border-b border-admin-border">
        <div className="h-4 bg-admin-bg-hover rounded w-36" />
      </td>
      <td className="py-4 px-4 border-b border-admin-border">
        <div className="h-6 bg-admin-bg-hover rounded-full w-20" />
      </td>
      <td className="py-4 px-4 border-b border-admin-border">
        <div className="h-4 bg-admin-bg-hover rounded w-24" />
      </td>
      <td className="py-4 px-4 border-b border-admin-border">
        <div className="h-8 bg-admin-bg-hover rounded w-20" />
      </td>
    </tr>
  );
}

/**
 * Action buttons component for each booking row
 */
function ActionButtons({
  booking,
  onAction,
}: {
  booking: Booking;
  onAction: (action: BookingAction) => void;
}) {
  const showApproveReject = booking.status === BookingStatus.PENDING;
  const showCancel = booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-1">
      {/* View Details */}
      <button
        onClick={() => onAction('view')}
        className="p-1.5 rounded-md text-admin-text-muted hover:text-admin-text hover:bg-admin-bg-hover transition-colors"
        title="View Details"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>

      {/* Approve */}
      {showApproveReject && (
        <button
          onClick={() => onAction('approve')}
          className="p-1.5 rounded-md text-green-500 hover:text-green-400 hover:bg-green-500/10 transition-colors"
          title="Approve"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}

      {/* Reject */}
      {showApproveReject && (
        <button
          onClick={() => onAction('reject')}
          className="p-1.5 rounded-md text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Reject"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Cancel */}
      {showCancel && (
        <button
          onClick={() => onAction('cancel')}
          className="p-1.5 rounded-md text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
          title="Cancel Booking"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Sortable column header component
 */
function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
}: {
  label: string;
  field: string;
  currentField?: string;
  direction?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}) {
  const isActive = currentField === field;

  return (
    <th
      className="text-left text-admin-text-muted font-medium text-sm py-3 px-4 border-b border-admin-border bg-admin-bg cursor-pointer hover:text-admin-text transition-colors"
      onClick={() => onSort?.(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {onSort && (
          <svg
            className={`w-4 h-4 transition-transform ${isActive ? 'text-admin-primary' : 'text-admin-text-dark'} ${isActive && direction === 'desc' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
      </div>
    </th>
  );
}

/**
 * BookingsTable component
 * Displays bookings in a sortable table with action dropdowns
 */
export function BookingsTable({
  bookings,
  onAction,
  isLoading = false,
  sortField,
  sortDirection,
  onSort,
}: BookingsTableProps) {
  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="bg-admin-bg-card border border-admin-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-admin-text-muted font-medium text-sm py-3 px-4 border-b border-admin-border bg-admin-bg">Ref</th>
                <th className="text-left text-admin-text-muted font-medium text-sm py-3 px-4 border-b border-admin-border bg-admin-bg">Customer</th>
                <th className="text-left text-admin-text-muted font-medium text-sm py-3 px-4 border-b border-admin-border bg-admin-bg">Service</th>
                <th className="text-left text-admin-text-muted font-medium text-sm py-3 px-4 border-b border-admin-border bg-admin-bg">Date/Time</th>
                <th className="text-left text-admin-text-muted font-medium text-sm py-3 px-4 border-b border-admin-border bg-admin-bg">Status</th>
                <th className="text-left text-admin-text-muted font-medium text-sm py-3 px-4 border-b border-admin-border bg-admin-bg">Created</th>
                <th className="text-left text-admin-text-muted font-medium text-sm py-3 px-4 border-b border-admin-border bg-admin-bg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Show empty state
  if (bookings.length === 0) {
    return (
      <div className="bg-admin-bg-card border border-admin-border rounded-lg p-12 text-center">
        <svg
          className="w-16 h-16 mx-auto text-admin-text-dark mb-4"
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
        <h3 className="text-lg font-medium text-admin-text mb-2">No bookings found</h3>
        <p className="text-admin-text-muted">
          Try adjusting your filters or check back later for new bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-admin-bg-card border border-admin-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <SortableHeader
                label="Ref"
                field="booking_ref"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                label="Customer"
                field="user_name"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                label="Service"
                field="service_name"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                label="Date/Time"
                field="booking_date"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                label="Status"
                field="status"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
              />
              <SortableHeader
                label="Created"
                field="created_at"
                currentField={sortField}
                direction={sortDirection}
                onSort={onSort}
              />
              <th className="text-left text-admin-text-muted font-medium text-sm py-3 px-4 border-b border-admin-border bg-admin-bg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-admin-bg-hover transition-colors">
                <td className="py-4 px-4 border-b border-admin-border">
                  <span className="font-mono text-sm text-admin-primary">
                    {booking.booking_ref}
                  </span>
                </td>
                <td className="py-4 px-4 border-b border-admin-border">
                  <div>
                    <div className="font-medium text-admin-text">
                      {booking.user_name || 'Unknown'}
                    </div>
                    {booking.user_email && (
                      <div className="text-sm text-admin-text-muted">
                        {booking.user_email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 border-b border-admin-border">
                  <div>
                    <div className="text-admin-text">
                      {booking.service_name || 'N/A'}
                    </div>
                    {booking.service_price !== undefined && (
                      <div className="text-sm text-admin-text-muted">
                        ₱{booking.service_price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 border-b border-admin-border text-admin-text">
                  {formatDateTime(booking.booking_date, booking.time_slot)}
                </td>
                <td className="py-4 px-4 border-b border-admin-border">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="py-4 px-4 border-b border-admin-border text-admin-text-muted text-sm">
                  {formatDate(booking.created_at)}
                </td>
                <td className="py-4 px-4 border-b border-admin-border">
                  <ActionButtons
                    booking={booking}
                    onAction={(action) => onAction(booking.id, action)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BookingsTable;
