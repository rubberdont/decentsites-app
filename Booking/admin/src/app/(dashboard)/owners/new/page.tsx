'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { superadminAPI } from '@/services/api';
import type { OwnerCreate } from '@/types';

export default function NewOwnerPage() {
  const router = useRouter();
  const { isSuperAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OwnerCreate>({
    username: '',
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const dataToSend = {
        ...formData,
        email: formData.email || undefined,
        password: formData.password || undefined,
      };
      await superadminAPI.createOwner(dataToSend);
      router.push('/owners');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create owner');
    } finally {
      setIsSubmitting(false);
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
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/owners" className="text-admin-text-muted hover:text-admin-text mb-2 inline-block">
          ← Back to Owners
        </Link>
        <h1 className="text-2xl font-bold text-admin-text">Create New Owner</h1>
        <p className="text-admin-text-muted mt-1">
          Add a new business owner. A default profile will be created automatically.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6 text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-admin-bg-card border border-admin-border rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1">
              Username <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text-muted focus:outline-none focus:border-admin-primary"
              placeholder="owner_username"
            />
          </div>

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
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-admin-text mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text-muted focus:outline-none focus:border-admin-primary"
              placeholder="owner@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-admin-text mb-1">Password</label>
            <input
              type="password"
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-admin-text placeholder-admin-text-muted focus:outline-none focus:border-admin-primary"
              placeholder="Leave empty for default password"
            />
            <p className="text-xs text-admin-text-muted mt-1">
              If left empty, default password "changeme123" will be used and owner must change it on first login.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Owner'}
          </button>
          <Link
            href="/owners"
            className="px-4 py-2 bg-admin-bg-hover text-admin-text rounded-lg hover:bg-admin-border transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
