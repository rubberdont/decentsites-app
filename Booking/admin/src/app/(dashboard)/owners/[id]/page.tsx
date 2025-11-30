'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { superadminAPI } from '@/services/api';
import type { Owner, OwnerUpdate } from '@/types';

export default function OwnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ownerId = params.id as string;
  const { isSuperAdmin } = useAuth();
  
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OwnerUpdate>({
    name: '',
    email: '',
    is_active: true,
  });

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        setIsLoading(true);
        const response = await superadminAPI.getOwner(ownerId);
        setOwner(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email || '',
          is_active: response.data.is_active,
        });
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch owner');
      } finally {
        setIsLoading(false);
      }
    };

    if (isSuperAdmin && ownerId) {
      fetchOwner();
    }
  }, [isSuperAdmin, ownerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const dataToSend = {
        ...formData,
        email: formData.email || undefined,
      };
      await superadminAPI.updateOwner(ownerId, dataToSend);
      router.push('/owners');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update owner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!owner) return;
    if (!confirm(`Reset password for "${owner.name}" to default?`)) return;
    
    try {
      await superadminAPI.resetOwnerPassword(ownerId);
      alert('Password reset successfully');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reset password');
    }
  };

  const handleDelete = async () => {
    if (!owner) return;
    if (!confirm(`Are you sure you want to delete owner "${owner.name}"?`)) return;
    
    try {
      await superadminAPI.deleteOwner(ownerId);
      router.push('/owners');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete owner');
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-admin-text-muted">Loading...</div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
          Owner not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/owners" className="text-admin-text-muted hover:text-admin-text mb-2 inline-block">
          ← Back to Owners
        </Link>
        <h1 className="text-2xl font-bold text-admin-text">Edit Owner</h1>
        <p className="text-admin-text-muted mt-1">
          Username: <span className="text-admin-text">{owner.username}</span>
          {owner.is_deleted && (
            <span className="ml-2 text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">Deleted</span>
          )}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6 text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-admin-bg-card border border-admin-border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text-muted focus:outline-none focus:border-admin-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-admin-text mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text-muted focus:outline-none focus:border-admin-primary"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <span className="text-admin-text">Active</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/owners"
            className="px-4 py-2 bg-admin-bg-hover text-admin-text rounded-lg hover:bg-admin-border transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Info & Actions */}
      <div className="bg-admin-bg-card border border-admin-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-admin-text mb-4">Owner Information</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <dt className="text-admin-text-muted">Profile Count</dt>
            <dd className="text-admin-text">{owner.profile_count}</dd>
          </div>
          <div>
            <dt className="text-admin-text-muted">Created</dt>
            <dd className="text-admin-text">{new Date(owner.created_at).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-admin-text-muted">Must Change Password</dt>
            <dd className="text-admin-text">{owner.must_change_password ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-admin-text-muted">Status</dt>
            <dd>
              {owner.is_deleted ? (
                <span className="text-red-400">Deleted</span>
              ) : owner.is_active ? (
                <span className="text-green-400">Active</span>
              ) : (
                <span className="text-gray-400">Inactive</span>
              )}
            </dd>
          </div>
        </dl>

        <h3 className="text-md font-medium text-admin-text mb-3">Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleResetPassword}
            className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
          >
            Reset Password
          </button>
          {!owner.is_deleted && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Delete Owner
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
