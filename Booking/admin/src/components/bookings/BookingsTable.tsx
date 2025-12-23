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
      {/* Call */}
      <button
        onClick={() => booking.user_phone ? window.location.href = `tel:${booking.user_phone}` : alert('No phone number')}
        disabled={!booking.user_phone}
        className={`p-1.5 rounded-md transition-colors ${booking.user_phone ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed hidden sm:block'}`}
        title="Call"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => booking.user_phone ? window.open(`https://wa.me/${booking.user_phone.replace(/\D/g, '')}`, '_blank') : alert('No phone number')}
        disabled={!booking.user_phone}
        className={`p-1.5 rounded-md transition-colors ${booking.user_phone ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-gray-300 cursor-not-allowed hidden sm:block'}`}
        title="WhatsApp"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>

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
 * Mobile card view for a single booking
 */
function BookingCard({
  booking,
  onAction
}: {
  booking: Booking;
  onAction: (action: BookingAction) => void;
}) {
  const showApproveReject = booking.status === BookingStatus.PENDING;
  const showCancel = booking.status === BookingStatus.PENDING ||
    booking.status === BookingStatus.CONFIRMED;

  return (
    <div className="bg-admin-bg-card border border-admin-border rounded-lg p-4 space-y-3 hover:bg-admin-bg-hover/50 transition-colors">
      {/* Header: Status + Actions */}
      <div className="flex items-start justify-between gap-4">
        <StatusBadge status={booking.status} />
        <div className="flex items-center gap-1.5">
          {/* Call - Mobile */}
          <button
            onClick={() => booking.user_phone ? window.location.href = `tel:${booking.user_phone}` : alert('No phone number')}
            disabled={!booking.user_phone}
            className={`p-2 rounded-md ${booking.user_phone ? 'text-gray-600 hover:text-gray-900 bg-gray-100' : 'text-gray-300 cursor-not-allowed hidden'}`}
            title="Call"
            aria-label="Call Customer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>

          {/* WhatsApp - Mobile */}
          <button
            onClick={() => booking.user_phone ? window.open(`https://wa.me/${booking.user_phone.replace(/\D/g, '')}`, '_blank') : alert('No phone number')}
            disabled={!booking.user_phone}
            className={`p-2 rounded-md ${booking.user_phone ? 'text-green-600 hover:text-green-700 bg-green-50' : 'text-gray-300 cursor-not-allowed hidden'}`}
            title="WhatsApp"
            aria-label="WhatsApp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>

          {/* View Details */}
          <button
            onClick={() => onAction('view')}
            className="p-2 rounded-md text-admin-text-muted hover:text-admin-text hover:bg-admin-bg-hover transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="View Details"
            aria-label="View Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {/* Approve */}
          {showApproveReject && (
            <button
              onClick={() => onAction('approve')}
              className="p-2 rounded-md text-green-500 hover:text-green-400 hover:bg-green-500/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Approve"
              aria-label="Approve Booking"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}

          {/* Reject */}
          {showApproveReject && (
            <button
              onClick={() => onAction('reject')}
              className="p-2 rounded-md text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Reject"
              aria-label="Reject Booking"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Cancel */}
          {showCancel && (
            <button
              onClick={() => onAction('cancel')}
              className="p-2 rounded-md text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Cancel Booking"
              aria-label="Cancel Booking"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-2.5">
        {/* Reference */}
        <div className="flex items-start gap-2 text-sm">
          <span className="text-admin-text-muted min-w-[80px] font-medium">Ref:</span>
          <span className="font-mono text-admin-primary font-medium">{booking.booking_ref}</span>
        </div>

        {/* Customer */}
        <div className="flex items-start gap-2 text-sm">
          <span className="text-admin-text-muted min-w-[80px] font-medium">Customer:</span>
          <div className="flex-1">
            <div className="font-medium text-admin-text">{booking.user_name || 'Unknown'}</div>
            {booking.user_email && (
              <div className="text-admin-text-muted break-all">{booking.user_email}</div>
            )}
          </div>
        </div>

        {/* Service */}
        <div className="flex items-start gap-2 text-sm">
          <span className="text-admin-text-muted min-w-[80px] font-medium">Service:</span>
          <div className="flex-1">
            <div className="text-admin-text">{booking.service_name || 'N/A'}</div>
            {booking.service_price !== undefined && (
              <div className="text-admin-primary font-semibold">₱{booking.service_price.toFixed(2)}</div>
            )}
          </div>
        </div>

        {/* Date/Time */}
        <div className="flex items-start gap-2 text-sm">
          <span className="text-admin-text-muted min-w-[80px] font-medium">Date/Time:</span>
          <span className="text-admin-text flex-1">
            {formatDateTime(booking.booking_date, booking.time_slot)}
          </span>
        </div>

        {/* Created */}
        <div className="flex items-start gap-2 text-sm">
          <span className="text-admin-text-muted min-w-[80px] font-medium">Created:</span>
          <span className="text-admin-text-muted">{formatDate(booking.created_at)}</span>
        </div>
      </div>
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
      <>
        {/* Desktop Loading Skeleton - Hidden on mobile */}
        <div className="hidden lg:block bg-admin-bg-card border border-admin-border rounded-lg overflow-hidden">
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

        {/* Mobile Loading Skeleton - Hidden on desktop */}
        <div className="lg:hidden space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-admin-bg-card border border-admin-border rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-6 bg-admin-bg-hover rounded-full w-24" />
                <div className="h-8 bg-admin-bg-hover rounded w-20" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-admin-bg-hover rounded w-full" />
                <div className="h-4 bg-admin-bg-hover rounded w-3/4" />
                <div className="h-4 bg-admin-bg-hover rounded w-5/6" />
                <div className="h-4 bg-admin-bg-hover rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </>
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
    <>
      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden lg:block bg-admin-bg-card border border-admin-border rounded-lg overflow-hidden">
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

      {/* Mobile Card View - Hidden on desktop */}
      <div className="lg:hidden space-y-4">
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onAction={(action) => onAction(booking.id, action)}
          />
        ))}
      </div>
    </>
  );
}

export default BookingsTable;
