'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, BookingStatus, BookingFilters as BookingFiltersType, PaginatedResponse } from '@/types';
import { BookingFilters, BookingsTable, BookingAction } from '@/components/bookings';
import { bookingsAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

// Default filter state
const defaultFilters: BookingFiltersType = {
  search: '',
  status: undefined,
  start_date: undefined,
  end_date: undefined,
  page: 1,
  limit: 10,
};

/**
 * Bookings list page
 * Displays all bookings with filtering, sorting, and pagination
 */
export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filters, setFilters] = useState<BookingFiltersType>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Fetch bookings from API
   */
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query params, excluding empty values
      const queryParams: BookingFiltersType = {
        page: filters.page || 1,
        limit: filters.limit || 10,
      };

      if (filters.search) {
        queryParams.search = filters.search;
      }
      if (filters.status) {
        queryParams.status = filters.status;
      }
      if (filters.start_date) {
        queryParams.start_date = filters.start_date;
      }
      if (filters.end_date) {
        queryParams.end_date = filters.end_date;
      }

      const response = await bookingsAPI.getAll(queryParams);
      const data: PaginatedResponse<Booking> = response.data;

      setBookings(data.items);
      setTotalCount(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings. Please try again.');
      toast.error('Failed to load bookings');
      setBookings([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  /**
   * Fetch bookings on mount and when filters change
   */
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters: BookingFiltersType) => {
    // Reset to page 1 when filters change (except page itself)
    setFilters({ ...newFilters, page: newFilters.page || 1 });
  };

  /**
   * Handle filter clear
   */
  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  /**
   * Handle sorting
   */
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    // Note: For full server-side sorting, you would need to add sort params to the API
    // and refetch. For now, this handles client-side sorting of current page.
  };

  /**
   * Handle booking action (approve, reject, cancel, view)
   */
  const handleAction = async (bookingId: string, action: BookingAction) => {
    if (action === 'view') {
      router.push(`/bookings/${bookingId}`);
      return;
    }

    try {
      switch (action) {
        case 'approve':
          await bookingsAPI.approve(bookingId);
          toast.success('Booking approved successfully');
          break;
        case 'reject':
          await bookingsAPI.reject(bookingId);
          toast.success('Booking rejected');
          break;
        case 'cancel':
          await bookingsAPI.cancel(bookingId);
          toast.success('Booking cancelled');
          break;
        default:
          console.warn('Unknown action:', action);
          return;
      }

      // Refresh bookings after successful action
      await fetchBookings();
    } catch (err) {
      console.error(`Failed to ${action} booking:`, err);
      toast.error(`Failed to ${action} booking. Please try again.`);
    }
  };

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Current page from filters
  const currentPage = filters.page || 1;

  // Client-side sorting of the current page data
  const sortedBookings = [...bookings].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    switch (sortField) {
      case 'booking_ref':
        aVal = a.booking_ref;
        bVal = b.booking_ref;
        break;
      case 'user_name':
        aVal = a.user_name || '';
        bVal = b.user_name || '';
        break;
      case 'service_name':
        aVal = a.service_name || '';
        bVal = b.service_name || '';
        break;
      case 'booking_date':
        aVal = a.booking_date;
        bVal = b.booking_date;
        break;
      case 'status':
        aVal = a.status;
        bVal = b.status;
        break;
      case 'created_at':
      default:
        aVal = a.created_at;
        bVal = b.created_at;
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-admin-text">Bookings</h1>
        <p className="text-admin-text-muted mt-1">
          Manage and track all customer bookings
        </p>
      </div>

      {/* Filters */}
      <BookingFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Error State */}
      {error && !isLoading && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && !error && (
        <div className="mb-4 text-sm text-admin-text-muted">
          Showing {sortedBookings.length} of {totalCount} bookings
        </div>
      )}

      {/* Bookings Table */}
      <BookingsTable
        bookings={sortedBookings}
        onAction={handleAction}
        isLoading={isLoading}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-admin-text-muted order-2 sm:order-1">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2.5 sm:py-2 text-sm font-medium text-admin-text bg-admin-bg-card border border-admin-border rounded-lg hover:bg-admin-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[90px]"
            >
              Previous
            </button>
            
            {/* Page numbers - Hidden on small screens */}
            <div className="hidden md:flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Show first, last, current, and adjacent pages
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1;
                const showEllipsis =
                  (page === 2 && currentPage > 3) ||
                  (page === totalPages - 1 && currentPage < totalPages - 2);

                if (!showPage && !showEllipsis) return null;

                if (showEllipsis && !showPage) {
                  return (
                    <span key={page} className="px-2 text-admin-text-muted">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`
                      w-9 h-9 text-sm font-medium rounded-lg transition-colors
                      ${
                        currentPage === page
                          ? 'bg-admin-primary text-white'
                          : 'text-admin-text bg-admin-bg-card border border-admin-border hover:bg-admin-bg-hover'
                      }
                    `}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Mobile: Just show current page / total */}
            <div className="md:hidden px-3 py-2 text-sm font-medium text-admin-text bg-admin-bg-card border border-admin-border rounded-lg">
              {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2.5 sm:py-2 text-sm font-medium text-admin-text bg-admin-bg-card border border-admin-border rounded-lg hover:bg-admin-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[90px]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
