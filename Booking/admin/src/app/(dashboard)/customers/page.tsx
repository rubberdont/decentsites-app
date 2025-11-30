'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Customer, CustomerFilters } from '@/types';
import { customersAPI } from '@/services/api';
import { LoadingSpinner } from '@/components/ui';

/**
 * Customers list page
 * Displays all customers with search, filtering, and pagination
 */
export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    page: 1,
    limit: 10,
  });

  // Block modal state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockTarget, setBlockTarget] = useState<Customer | null>(null);
  const [blockReason, setBlockReason] = useState('');

  /**
   * Fetch customers from API
   */
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, unknown> = {
        page: filters.page,
        limit: filters.limit,
      };

      // Only add search if not empty
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }

      // Only add is_blocked if defined
      if (filters.is_blocked !== undefined) {
        params.is_blocked = filters.is_blocked;
      }

      const response = await customersAPI.getAll(params as CustomerFilters);
      const data = response.data;

      setCustomers(data.items || []);
      setTotalCustomers(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch customers on mount and when filters change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  /**
   * Handle search change with debounce reset
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  /**
   * Handle view customer
   */
  const handleViewCustomer = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };

  /**
   * Handle block/unblock customer
   */
  const handleToggleBlock = async (customer: Customer) => {
    if (customer.is_blocked) {
      // Unblock directly
      await performUnblock(customer.id);
    } else {
      // Show modal to get reason
      setBlockTarget(customer);
      setBlockReason('');
      setShowBlockModal(true);
    }
  };

  /**
   * Perform block action
   */
  const performBlock = async () => {
    if (!blockTarget) return;

    setActionLoading(blockTarget.id);
    try {
      await customersAPI.block(blockTarget.id, blockReason || undefined);
      // Refresh customer list
      await fetchCustomers();
      setShowBlockModal(false);
      setBlockTarget(null);
      setBlockReason('');
    } catch (err) {
      console.error('Error blocking customer:', err);
      setError('Failed to block customer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Perform unblock action
   */
  const performUnblock = async (customerId: string) => {
    setActionLoading(customerId);
    try {
      await customersAPI.unblock(customerId);
      // Refresh customer list
      await fetchCustomers();
    } catch (err) {
      console.error('Error unblocking customer:', err);
      setError('Failed to unblock customer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Handle page change
   */
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

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

  const currentPage = filters.page || 1;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-admin-text">Customers</h1>
        <p className="text-admin-text-muted mt-1">
          View and manage your customer base
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-admin-text-muted"
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
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={filters.search}
            onChange={handleSearchChange}
            className="admin-input pl-10"
          />
        </div>

        <select
          value={filters.is_blocked === undefined ? '' : filters.is_blocked.toString()}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              is_blocked: e.target.value === '' ? undefined : e.target.value === 'true',
              page: 1,
            }))
          }
          className="admin-select w-auto min-w-[150px]"
        >
          <option value="">All Status</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mb-4 text-sm text-admin-text-muted">
        {loading ? (
          'Loading customers...'
        ) : (
          `Showing ${customers.length} of ${totalCustomers} customers`
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-admin-bg-card border border-admin-border rounded-lg p-12">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="text-center text-admin-text-muted mt-4">Loading customers...</p>
        </div>
      ) : (
        <>
          {/* Customers Table */}
          <div className="bg-admin-bg-card border border-admin-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Bookings</th>
                    <th>Total Spent</th>
                    <th>Last Visit</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-admin-primary/20 flex items-center justify-center text-admin-primary font-medium">
                            {customer.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-admin-text">
                              {customer.name}
                            </div>
                            <div className="text-sm text-admin-text-muted">
                              @{customer.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="text-admin-text">{customer.email}</div>
                          <div className="text-admin-text-muted">{customer.phone || '-'}</div>
                        </div>
                      </td>
                      <td>
                        <span className="font-medium text-admin-text">
                          {customer.booking_count || 0}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium text-admin-text">
                          ₱{customer.total_spent?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td>
                        <span className="text-admin-text-muted">
                          {customer.last_visit ? formatDate(customer.last_visit) : '-'}
                        </span>
                      </td>
                      <td>
                        {customer.is_blocked ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            Active
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewCustomer(customer.id)}
                            className="p-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-bg-hover rounded-lg transition-colors"
                            title="View Details"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
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
                          </button>
                          <button
                            onClick={() => handleToggleBlock(customer)}
                            disabled={actionLoading === customer.id}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              customer.is_blocked
                                ? 'text-green-400 hover:bg-green-400/10'
                                : 'text-red-400 hover:bg-red-400/10'
                            }`}
                            title={customer.is_blocked ? 'Unblock' : 'Block'}
                          >
                            {actionLoading === customer.id ? (
                              <LoadingSpinner size="sm" />
                            ) : customer.is_blocked ? (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {customers.length === 0 && (
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-admin-text mb-2">
                  No customers found
                </h3>
                <p className="text-admin-text-muted">
                  {filters.search
                    ? 'Try adjusting your search criteria'
                    : 'Customers will appear here once they make bookings'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-admin-text-muted">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-admin-text bg-admin-bg-card border border-admin-border rounded-lg hover:bg-admin-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
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

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-admin-text bg-admin-bg-card border border-admin-border rounded-lg hover:bg-admin-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Block Customer Modal */}
      {showBlockModal && blockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowBlockModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-admin-bg-card border border-admin-border rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-admin-text mb-2">
              Block Customer
            </h3>
            <p className="text-admin-text-muted mb-4">
              Are you sure you want to block <strong>{blockTarget.name}</strong>?
              They will not be able to make new bookings.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-admin-text mb-2">
                Reason (optional)
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking..."
                className="admin-input w-full h-24 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockTarget(null);
                  setBlockReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-admin-text bg-admin-bg-hover border border-admin-border rounded-lg hover:bg-admin-bg-card transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={performBlock}
                disabled={actionLoading === blockTarget.id}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {actionLoading === blockTarget.id ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Blocking...
                  </>
                ) : (
                  'Block Customer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
