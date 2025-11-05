'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ownerAPI } from '@/services/api';
import type { DashboardStats, ProfileWithBookingCount } from '@/types';
import { showError } from '@/utils/toast';

export default function OwnerDashboardPage() {
  const { isOwner, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profiles, setProfiles] = useState<ProfileWithBookingCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isOwner) {
      router.push('/');
      return;
    }

    if (isOwner) {
      loadDashboardData();
    }
  }, [isOwner, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, profilesResponse] = await Promise.all([
        ownerAPI.getDashboard(),
        ownerAPI.getMyProfiles(0, 5),
      ]);
      setStats(statsResponse.data);
      setProfiles(profilesResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      showError('Failed to load dashboard data');
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
              <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Owner Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your profiles and track bookings
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total_bookings}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.pending_bookings}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.confirmed_bookings}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.today_bookings}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.this_week_bookings}</p>
                </div>
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">${stats.total_revenue.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/owner/profiles"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">My Profiles</h3>
            <p className="text-blue-100">View and manage your business profiles</p>
          </Link>

          <Link
            href="/profile"
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">Create Profile</h3>
            <p className="text-green-100">Add a new business profile</p>
          </Link>

          <Link
            href="/my-bookings"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm p-6 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">View Bookings</h3>
            <p className="text-purple-100">Manage all your bookings</p>
          </Link>
        </div>

        {/* My Profiles Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Profiles</h2>
            <Link
              href="/owner/profiles"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          {profiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{profile.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{profile.description}</p>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-600 dark:text-gray-400">Total: {profile.total_bookings}</span>
                    <span className="text-yellow-600 dark:text-yellow-400">Pending: {profile.pending_bookings}</span>
                    <span className="text-green-600 dark:text-green-400">Confirmed: {profile.confirmed_bookings}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/owner/profiles/${profile.id}/analytics`}
                      className="flex-1 text-center bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      Analytics
                    </Link>
                    <Link
                      href={`/owner/profiles/${profile.id}/availability`}
                      className="flex-1 text-center bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 py-2 px-3 rounded-md text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      Availability
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No profiles yet</p>
              <Link
                href="/profile"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
