'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { analyticsAPI } from '@/services/api';
import {
  DateRangeFilter,
  DateRangePreset,
  AnalyticsCard,
  BookingTrendsChart,
  RevenueChart,
  PopularServicesChart,
  PeakHoursChart,
} from '@/components/analytics';
import type { AnalyticsOverview, BookingTrend, PeakHoursData } from '@/types';

/**
 * Format PHP currency
 */
const formatPHP = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/**
 * Format percentage
 */
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

/**
 * Calendar icon
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

/**
 * Currency icon
 */
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

/**
 * Check circle icon (for completion rate)
 */
const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/**
 * X circle icon (for cancellation rate)
 */
const XCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/**
 * Loading skeleton for stats cards
 */
const StatsCardSkeleton = () => (
  <div className="admin-card p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-lg bg-admin-bg-hover" />
      <div className="w-16 h-4 bg-admin-bg-hover rounded" />
    </div>
    <div className="w-24 h-8 bg-admin-bg-hover rounded mb-2" />
    <div className="w-20 h-4 bg-admin-bg-hover rounded" />
  </div>
);

/**
 * Loading skeleton for charts
 */
const ChartSkeleton = () => (
  <div className="admin-card p-6 animate-pulse">
    <div className="w-32 h-6 bg-admin-bg-hover rounded mb-4" />
    <div className="h-64 bg-admin-bg-hover rounded" />
  </div>
);

/**
 * Calculate date range based on preset
 */
const getDateRange = (
  preset: DateRangePreset,
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string } => {
  const today = new Date();
  const endDate = format(today, 'yyyy-MM-dd');

  switch (preset) {
    case '7d':
      return { startDate: format(subDays(today, 7), 'yyyy-MM-dd'), endDate };
    case '30d':
      return { startDate: format(subDays(today, 30), 'yyyy-MM-dd'), endDate };
    case '90d':
      return { startDate: format(subDays(today, 90), 'yyyy-MM-dd'), endDate };
    case 'custom':
      return {
        startDate: customStart || format(subDays(today, 30), 'yyyy-MM-dd'),
        endDate: customEnd || endDate,
      };
    default:
      return { startDate: format(subDays(today, 30), 'yyyy-MM-dd'), endDate };
  }
};

/**
 * Analytics Page
 * Dashboard for viewing booking and revenue analytics
 */
export default function AnalyticsPage() {
  // Date range state
  const [selectedRange, setSelectedRange] = useState<DateRangePreset>('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Data state
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHoursData[]>([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  /**
   * Fetch analytics data
   */
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);

    const { startDate, endDate } = getDateRange(
      selectedRange,
      customStartDate,
      customEndDate
    );

    try {
      // Fetch all analytics data in parallel
      const [overviewRes, trendsRes, peakHoursRes] = await Promise.all([
        analyticsAPI.getOverview(startDate, endDate),
        analyticsAPI.getBookingTrends(startDate, endDate, 'day'),
        analyticsAPI.getPeakHours(startDate, endDate),
      ]);

      setOverview(overviewRes.data);
      setBookingTrends(trendsRes.data);
      setPeakHours(peakHoursRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [selectedRange, customStartDate, customEndDate]);

  // Fetch data on mount and when date range changes
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  /**
   * Handle date range change
   */
  const handleRangeChange = (range: DateRangePreset) => {
    setSelectedRange(range);
    if (range !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  /**
   * Handle custom date change
   */
  const handleCustomDateChange = (startDate: string, endDate: string) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  /**
   * Prepare revenue data from booking trends
   */
  const revenueData = bookingTrends.map((trend) => ({
    date: trend.date,
    revenue: trend.revenue,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Analytics</h1>
          <p className="text-admin-text-muted mt-1">
            Track your booking performance and revenue
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        selectedRange={selectedRange}
        onRangeChange={handleRangeChange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomDateChange={handleCustomDateChange}
      />

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            {/* Total Bookings */}
            <AnalyticsCard
              title="Total Bookings"
              value={overview?.total_bookings || 0}
              icon={<CalendarIcon />}
              subtitle={`Average ${formatPHP(overview?.average_booking_value || 0)} per booking`}
            />

            {/* Total Revenue */}
            <AnalyticsCard
              title="Total Revenue"
              value={formatPHP(overview?.total_revenue || 0)}
              icon={<CurrencyIcon />}
              subtitle={overview?.period || 'Selected period'}
            />

            {/* Completion Rate */}
            <AnalyticsCard
              title="Completion Rate"
              value={formatPercent(overview?.booking_completion_rate || 0)}
              icon={<CheckCircleIcon />}
              trend={overview?.booking_completion_rate ? overview.booking_completion_rate - 80 : 0}
              trendLabel="vs. 80% target"
            />

            {/* Cancellation Rate */}
            <AnalyticsCard
              title="Cancellation Rate"
              value={formatPercent(overview?.cancellation_rate || 0)}
              icon={<XCircleIcon />}
              trend={overview?.cancellation_rate ? -(10 - overview.cancellation_rate) : 0}
              trendLabel="vs. 10% threshold"
            />
          </>
        )}
      </div>

      {/* Charts Section - Booking Trends & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <BookingTrendsChart data={bookingTrends} />
            <RevenueChart data={revenueData} />
          </>
        )}
      </div>

      {/* Bottom Section - Popular Services & Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <PopularServicesChart data={overview?.popular_services || []} />
            <PeakHoursChart data={peakHours} />
          </>
        )}
      </div>
    </div>
  );
}
