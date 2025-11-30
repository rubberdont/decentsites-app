'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { BookingTrend } from '@/types';
import { format, parseISO } from 'date-fns';

/**
 * Props for the BookingTrendsChart component
 */
interface BookingTrendsChartProps {
  data: BookingTrend[];
}

/**
 * Custom tooltip component for dark theme
 */
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-admin-bg-card border border-admin-border rounded-lg p-3 shadow-lg">
        <p className="text-admin-text font-medium mb-2">
          {label ? format(parseISO(label), 'MMM d, yyyy') : label}
        </p>
        <p className="text-admin-text-muted text-sm">
          Bookings: <span className="text-admin-primary font-medium">{payload[0]?.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

/**
 * BookingTrendsChart - Area chart showing booking count over time
 * Uses Recharts with dark theme styling
 */
export function BookingTrendsChart({ data }: BookingTrendsChartProps) {
  // Format dates for display
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: format(parseISO(item.date), 'MMM d'),
  }));

  if (!data || data.length === 0) {
    return (
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-admin-text mb-4">Booking Trends</h3>
        <div className="h-64 flex items-center justify-center text-admin-text-muted">
          No booking data available for this period
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card p-6">
      <h3 className="text-lg font-semibold text-admin-text mb-4">Booking Trends</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />
            <XAxis
              dataKey="displayDate"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#bookingGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default BookingTrendsChart;
