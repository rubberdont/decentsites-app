'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ownerAPI } from '@/services/api';
import type { ProfileWithBookingCount } from '@/types';
import { showError } from '@/utils/toast';

export default function OwnerProfilesPage() {
  const { isOwner, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileWithBookingCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isOwner) {
      router.push('/');
      return;
    }

    if (isOwner) {
      loadProfiles();
    }
  }, [isOwner, authLoading, router]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getMyProfiles(0, 50);
      setProfiles(response.data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
      showError('Failed to load your profiles');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading profiles...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/owner/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Business Profiles
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage all your business profiles and track their performance
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/profile"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Profiles Grid */}
        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Profile Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {profile.image_url ? (
                      <img
                        src={profile.image_url}
                        alt={profile.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                        <span className="text-2xl text-gray-600 dark:text-gray-400">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {profile.description}
                  </p>

                  {/* Services Count */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    {profile.services.length} {profile.services.length === 1 ? 'Service' : 'Services'}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.total_bookings}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{profile.pending_bookings}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{profile.confirmed_bookings}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Confirmed</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Link
                      href={`/profiles/${profile.id}`}
                      className="block w-full text-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      View Public Page
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/owner/profiles/${profile.id}/analytics`}
                        className="text-center bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        Analytics
                      </Link>
                      <Link
                        href={`/owner/profiles/${profile.id}/availability`}
                        className="text-center bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                      >
                        Availability
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Business Profiles Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Get started by creating your first business profile. You'll be able to add services, manage bookings, and track analytics.
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
