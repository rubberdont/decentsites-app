'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { superadminAPI } from '@/services/api';
import type { Owner, OwnerFilters } from '@/types';

export default function OwnersPage() {
  const { isSuperAdmin } = useAuth();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OwnerFilters>({
    page: 1,
    limit: 20,
    search: '',
    include_deleted: false,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOwners = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await superadminAPI.getOwners(filters);
      setOwners(response.data.items);
      setTotalPages(response.data.total_pages);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch owners');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchOwners();
    }
  }, [isSuperAdmin, fetchOwners]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete owner "${name}"? This will soft-delete the owner.`)) {
      return;
    }
    try {
      await superadminAPI.deleteOwner(id);
      fetchOwners();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete owner');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await superadminAPI.restoreOwner(id);
      fetchOwners();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to restore owner');
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    if (!confirm(`Reset password for "${name}" to default? They will need to change it on next login.`)) {
      return;
    }
    try {
      await superadminAPI.resetOwnerPassword(id);
      alert('Password reset successfully');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reset password');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
          Access denied. Superadmin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Owner Management</h1>
          <p className="text-admin-text-muted mt-1">Manage business owners</p>
        </div>
        <Link
          href="/owners/new"
          className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary/90 transition-colors"
        >
          + Add Owner
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-admin-bg-card border border-admin-border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search owners..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="flex-1 min-w-[200px] px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text-muted focus:outline-none focus:border-admin-primary"
          />
          <label className="flex items-center gap-2 text-admin-text-muted">
            <input
              type="checkbox"
              checked={filters.include_deleted}
              onChange={(e) => setFilters({ ...filters, include_deleted: e.target.checked, page: 1 })}
              className="rounded"
            />
            Show deleted
          </label>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6 text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-admin-bg-card border border-admin-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-admin-bg-hover">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-admin-text-muted">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-admin-text-muted">Username</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-admin-text-muted">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-admin-text-muted">Profiles</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-admin-text-muted">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-admin-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-admin-text-muted">
                  Loading...
                </td>
              </tr>
            ) : owners.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-admin-text-muted">
                  No owners found
                </td>
              </tr>
            ) : (
              owners.map((owner) => (
                <tr key={owner.id} className={owner.is_deleted ? 'opacity-50' : ''}>
                  <td className="px-4 py-3">
                    <Link href={`/owners/${owner.id}`} className="text-admin-text hover:text-admin-primary">
                      {owner.name}
                    </Link>
                    {owner.must_change_password && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                        Must change password
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-admin-text-muted">{owner.username}</td>
                  <td className="px-4 py-3 text-admin-text-muted">{owner.email || '-'}</td>
                  <td className="px-4 py-3 text-admin-text-muted">{owner.profile_count}</td>
                  <td className="px-4 py-3">
                    {owner.is_deleted ? (
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">Deleted</span>
                    ) : owner.is_active ? (
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Active</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-400 rounded">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/owners/${owner.id}`}
                        className="px-3 py-1 text-sm bg-admin-bg-hover text-admin-text rounded hover:bg-admin-border transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleResetPassword(owner.id, owner.name)}
                        className="px-3 py-1 text-sm bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition-colors"
                      >
                        Reset PW
                      </button>
                      {owner.is_deleted ? (
                        <button
                          onClick={() => handleRestore(owner.id)}
                          className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(owner.id, owner.name)}
                          className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-admin-border">
            <div className="text-sm text-admin-text-muted">
              Showing {owners.length} of {total} owners
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={filters.page === 1}
                className="px-3 py-1 text-sm bg-admin-bg-hover text-admin-text rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-admin-text-muted">
                Page {filters.page} of {totalPages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={filters.page === totalPages}
                className="px-3 py-1 text-sm bg-admin-bg-hover text-admin-text rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
