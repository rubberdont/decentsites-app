'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ownerAPI } from '@/services/api';
import type { ProfileAnalytics } from '@/types';
import { showError } from '@/utils/toast';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ProfileAnalyticsPage() {
  const { isOwner, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const profileId = params.profileId as string;

  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isOwner) {
      router.push('/');
      return;
    }

    if (isOwner && profileId) {
      loadAnalytics();
    }
  }, [isOwner, authLoading, profileId, router]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getProfileAnalytics(profileId);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      showError('Failed to load profile analytics');
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
              <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!analytics) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
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
            href="/owner/profiles"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Profiles
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {analytics.profile_name} - Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track booking performance and popular services
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{analytics.total_bookings}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{analytics.confirmed_bookings}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{analytics.cancelled_bookings}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Booking Trend</h2>
          {analytics.booking_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.booking_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} name="Bookings" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No booking trend data available</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Services Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Popular Services</h2>
            {analytics.popular_services.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.popular_services}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="service_title" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total_bookings" fill="#3B82F6" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No service data available</p>
            )}
          </div>

          {/* Revenue by Service */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Revenue by Service</h2>
            {analytics.popular_services.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.popular_services}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.service_title}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {analytics.popular_services.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No revenue data available</p>
            )}
          </div>
        </div>

        {/* Service Details Table */}
        {analytics.popular_services.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Service Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Service</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Bookings</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.popular_services.map((service, index) => (
                    <tr key={service.service_id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{service.service_title}</td>
                      <td className="text-right py-3 px-4 text-gray-900 dark:text-white">{service.total_bookings}</td>
                      <td className="text-right py-3 px-4 text-gray-900 dark:text-white">${service.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
