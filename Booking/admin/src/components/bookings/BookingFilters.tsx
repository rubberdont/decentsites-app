'use client';

import { BookingStatus, BookingFilters as BookingFiltersType } from '@/types';

interface BookingFiltersProps {
  /** Current filter values */
  filters: BookingFiltersType;
  /** Callback when filters change */
  onFilterChange: (filters: BookingFiltersType) => void;
  /** Callback to clear all filters */
  onClear: () => void;
}

/**
 * BookingFilters component
 * Provides search, status filter, and date range filtering for bookings
 */
export function BookingFilters({ filters, onFilterChange, onClear }: BookingFiltersProps) {
  /**
   * Handle search input change
   */
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value, page: 1 });
  };

  /**
   * Handle status filter change
   */
  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value ? (value as BookingStatus) : undefined,
      page: 1,
    });
  };

  /**
   * Handle start date change
   */
  const handleStartDateChange = (value: string) => {
    onFilterChange({ ...filters, start_date: value || undefined, page: 1 });
  };

  /**
   * Handle end date change
   */
  const handleEndDateChange = (value: string) => {
    onFilterChange({ ...filters, end_date: value || undefined, page: 1 });
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters =
    filters.search || filters.status || filters.start_date || filters.end_date;

  return (
    <div className="bg-admin-bg-card border border-admin-border rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="block text-sm text-admin-text-muted mb-1.5">
            Search
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              placeholder="Customer name or booking ref..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="admin-input pl-10"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-admin-text-dark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Status Dropdown */}
        <div>
          <label htmlFor="status" className="block text-sm text-admin-text-muted mb-1.5">
            Status
          </label>
          <select
            id="status"
            value={filters.status || ''}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="admin-select"
          >
            <option value="">All Statuses</option>
            <option value={BookingStatus.PENDING}>Pending</option>
            <option value={BookingStatus.CONFIRMED}>Confirmed</option>
            <option value={BookingStatus.COMPLETED}>Completed</option>
            <option value={BookingStatus.CANCELLED}>Cancelled</option>
            <option value={BookingStatus.REJECTED}>Rejected</option>
            <option value={BookingStatus.NO_SHOW}>No Show</option>
          </select>
        </div>

        {/* From Date */}
        <div>
          <label htmlFor="start_date" className="block text-sm text-admin-text-muted mb-1.5">
            From Date
          </label>
          <input
            id="start_date"
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="admin-input"
          />
        </div>

        {/* To Date */}
        <div>
          <label htmlFor="end_date" className="block text-sm text-admin-text-muted mb-1.5">
            To Date
          </label>
          <input
            id="end_date"
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClear}
            className="flex items-center gap-2 text-sm text-admin-text-muted hover:text-admin-text transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default BookingFilters;
