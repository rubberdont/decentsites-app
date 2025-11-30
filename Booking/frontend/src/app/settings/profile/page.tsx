'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { authAPI } from '@/services/api';
import { showError, showSuccess } from '@/utils/toast';
import { Button, Input } from '@/components/ui';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await authAPI.updateProfile(formData);
      showSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1a1a1a]">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#a0a0a0]">Loading...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1a1a1a]">
        {/* Header */}
        <header className="border-b border-[#444444] bg-[#2a2a2a] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Back button and logo */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg hover:bg-white/10 text-[#a0a0a0] hover:text-[#eaeaea] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-[#eaeaea] font-semibold text-lg">BookPro</span>
                </Link>
              </div>
              {/* Right: User info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center">
                  <span className="text-[#1a1a1a] font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-[#eaeaea] text-sm font-medium hidden sm:block">
                  {user?.name || user?.username}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#eaeaea]">
              Profile Settings
            </h1>
            <p className="text-[#a0a0a0] mt-2">
              Manage your account information
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] mb-6">
            <div className="flex">
              <Link
                href="/settings/profile"
                className="flex-1 px-6 py-4 text-center font-medium text-[#d4af37] border-b-2 border-[#d4af37]"
              >
                Profile
              </Link>
              <Link
                href="/settings/password"
                className="flex-1 px-6 py-4 text-center font-medium text-[#a0a0a0] hover:text-[#d4af37] transition-colors border-b-2 border-transparent"
              >
                Password
              </Link>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full px-4 py-3 border border-[#444444] rounded-xl bg-[#1a1a1a] text-[#a0a0a0] cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-[#a0a0a0]">
                  Username cannot be changed
                </p>
              </div>

              {/* Name */}
              <div>
                <Input
                  type="text"
                  id="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Input
                  type="email"
                  id="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {/* Role Display */}
              <div>
                <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                  Account Role
                </label>
                <div className="px-4 py-3 bg-[#1a1a1a] border border-[#444444] rounded-xl">
                  <span className="text-[#eaeaea] font-medium">{user?.role || 'USER'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#444444]">
                <Link
                  href="/"
                  className="text-[#d4af37] hover:text-[#c4a030] transition-colors font-medium"
                >
                  Cancel
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  isLoading={loading}
                  variant="primary"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
