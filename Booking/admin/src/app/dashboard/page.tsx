'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StatsCard, RecentBookings, ActivityFeed } from '@/components/dashboard';
import type { RecentBooking, Activity } from '@/components/dashboard';
import { analyticsAPI, bookingsAPI } from '@/services/api';
import type { DashboardStats, Booking } from '@/types';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

/**
 * Activity type from API
 */
interface ApiActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  customer_name?: string;
  details?: Record<string, unknown>;
}

/**
 * API response for activities
 */
interface ActivitiesResponse {
  items: ApiActivity[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Icon components for stats cards
 */
const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CurrencyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

/**
 * Loading skeleton for stats cards
 */
const StatsCardSkeleton = () => (
  <div className="admin-card p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-3 flex-1">
        <div className="h-4 bg-admin-bg-hover rounded w-24"></div>
        <div className="h-8 bg-admin-bg-hover rounded w-16"></div>
        <div className="h-3 bg-admin-bg-hover rounded w-20"></div>
      </div>
      <div className="w-12 h-12 bg-admin-bg-hover rounded-lg"></div>
    </div>
  </div>
);

/**
 * Loading skeleton for bookings table
 */
const BookingsTableSkeleton = () => (
  <div className="admin-card overflow-hidden">
    <div className="p-6 border-b border-admin-border flex items-center justify-between">
      <div className="h-6 bg-admin-bg-hover rounded w-40 animate-pulse"></div>
      <div className="h-4 bg-admin-bg-hover rounded w-20 animate-pulse"></div>
    </div>
    <div className="p-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="h-10 bg-admin-bg-hover rounded w-24"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-admin-bg-hover rounded w-32"></div>
            <div className="h-3 bg-admin-bg-hover rounded w-48"></div>
          </div>
          <div className="h-6 bg-admin-bg-hover rounded w-20"></div>
          <div className="h-8 bg-admin-bg-hover rounded w-16"></div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Loading skeleton for activity feed
 */
const ActivityFeedSkeleton = () => (
  <div className="admin-card">
    <div className="p-6 border-b border-admin-border">
      <div className="h-6 bg-admin-bg-hover rounded w-32 animate-pulse"></div>
    </div>
    <div className="p-6 space-y-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="w-8 h-8 bg-admin-bg-hover rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-admin-bg-hover rounded w-full"></div>
            <div className="h-3 bg-admin-bg-hover rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Format booking date and time for display
 */
function formatBookingTime(bookingDate: string, timeSlot?: string): string {
  const date = new Date(bookingDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  let dateStr = '';
  if (isToday) {
    dateStr = 'Today';
  } else if (isTomorrow) {
    dateStr = 'Tomorrow';
  } else {
    dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (timeSlot) {
    return `${dateStr}, ${timeSlot}`;
  }

  return dateStr;
}

/**
 * Map API booking status to component status
 */
function mapBookingStatus(status: string): RecentBooking['status'] {
  const statusMap: Record<string, RecentBooking['status']> = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    REJECTED: 'rejected',
    NO_SHOW: 'cancelled',
  };
  return statusMap[status] || 'pending';
}

/**
 * Transform API booking to component booking format
 */
function transformBooking(booking: Booking): RecentBooking {
  return {
    id: booking.id,
    time: formatBookingTime(booking.booking_date, booking.time_slot),
    customerName: booking.user_name || 'Unknown Customer',
    customerEmail: booking.user_email || '',
    service: booking.service_name || 'Service',
    status: mapBookingStatus(booking.status),
  };
}

/**
 * Map API activity type to component activity type
 */
function mapActivityType(type: string): Activity['type'] {
  const typeMap: Record<string, Activity['type']> = {
    booking_created: 'booking_created',
    booking_confirmed: 'booking_confirmed',
    booking_cancelled: 'booking_cancelled',
    booking_completed: 'booking_completed',
    booking_approved: 'booking_confirmed',
    booking_rejected: 'booking_cancelled',
    customer_registered: 'customer_registered',
    customer_blocked: 'booking_cancelled',
    customer_unblocked: 'booking_confirmed',
    review_received: 'review_received',
  };
  return typeMap[type] || 'booking_created';
}

/**
 * Transform API activity to component activity format
 */
function transformActivity(activity: ApiActivity): Activity {
  return {
    id: activity.id,
    type: mapActivityType(activity.type),
    message: activity.message,
    timestamp: activity.timestamp,
    customerName: activity.customer_name,
  };
}

/**
 * Dashboard page component
 * Displays overview statistics, upcoming bookings, and recent activity
 */
export default function DashboardPage() {
  // State for dashboard data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // Loading states
  const [statsLoading, setStatsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  
  // Last updated timestamp
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  /**
   * Fetch dashboard statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await analyticsAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /**
   * Fetch upcoming bookings
   */
  const fetchBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      const response = await bookingsAPI.getAll({
        page: 1,
        limit: 5,
        sort_by: 'booking_date',
        sort_order: 'asc',
      } as { page?: number; limit?: number; sort_by?: string; sort_order?: string });
      
      const transformedBookings = response.data.items.map(transformBooking);
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load upcoming bookings');
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  /**
   * Fetch recent activities
   */
  const fetchActivities = useCallback(async () => {
    try {
      setActivitiesLoading(true);
      const response = await api.get<ActivitiesResponse>('/admin/activities', {
        params: { page: 1, page_size: 10 },
      });
      
      const transformedActivities = response.data.items.map(transformActivity);
      setActivities(transformedActivities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      // Don't show toast for activities - it's not critical
      // Set empty array to show empty state
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  /**
   * Fetch all data on mount
   */
  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([fetchStats(), fetchBookings(), fetchActivities()]);
      setLastUpdated(new Date());
    };
    
    fetchAllData();
  }, [fetchStats, fetchBookings, fetchActivities]);

  /**
   * Handle approve booking action
   */
  const handleApproveBooking = async (id: string) => {
    try {
      await bookingsAPI.approve(id);
      toast.success('Booking approved successfully');
      // Refresh bookings and stats after approval
      await Promise.all([fetchBookings(), fetchStats()]);
    } catch (error) {
      console.error('Failed to approve booking:', error);
      toast.error('Failed to approve booking');
    }
  };

  /**
   * Handle view booking action
   */
  const handleViewBooking = (id: string) => {
    window.location.href = `/bookings/${id}`;
  };

  /**
   * Calculate trend direction based on value
   */
  const getTrendDirection = (value?: number): 'up' | 'down' => {
    if (value === undefined || value === 0) return 'up';
    return value >= 0 ? 'up' : 'down';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-admin-text">Dashboard</h1>
        <div className="text-sm text-admin-text-muted">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Today's Bookings"
              value={stats?.today_bookings ?? 0}
              icon={<CalendarIcon />}
              trend={0}
              trendDirection="up"
            />
            <StatsCard
              title="Pending Approvals"
              value={stats?.pending_bookings ?? 0}
              icon={<ClockIcon />}
              trend={0}
              trendDirection={getTrendDirection()}
              linkHref="/bookings?status=pending"
              linkText="Review now"
            />
            <StatsCard
              title="Total Revenue"
              value={`₱${(stats?.total_revenue ?? 0).toLocaleString()}`}
              icon={<CurrencyIcon />}
              trend={0}
              trendDirection="up"
            />
            <StatsCard
              title="Total Customers"
              value={stats?.total_customers ?? 0}
              icon={<UsersIcon />}
              trend={stats?.new_customers_this_month ?? 0}
              trendDirection="up"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          {bookingsLoading ? (
            <BookingsTableSkeleton />
          ) : (
            <RecentBookings
              bookings={bookings}
              onApprove={handleApproveBooking}
              onView={handleViewBooking}
            />
          )}
        </div>

        {/* Recent Activity - Takes 1 column */}
        <div className="lg:col-span-1">
          {activitiesLoading ? (
            <ActivityFeedSkeleton />
          ) : (
            <ActivityFeed activities={activities} />
          )}
        </div>
      </div>
    </div>
  );
}
