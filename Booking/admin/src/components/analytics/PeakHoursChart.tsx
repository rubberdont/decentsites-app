'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { PeakHoursData } from '@/types';

/**
 * Props for the PeakHoursChart component
 */
interface PeakHoursChartProps {
  data: PeakHoursData[];
}

/**
 * Get bar color based on booking intensity
 */
const getBarColor = (percentage: number): string => {
  if (percentage >= 75) return '#ef4444'; // High - red
  if (percentage >= 50) return '#f59e0b'; // Medium-high - amber
  if (percentage >= 25) return '#6366f1'; // Medium - primary
  return '#334155'; // Low - muted
};

/**
 * Custom tooltip component for dark theme
 */
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: PeakHoursData }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-admin-bg-card border border-admin-border rounded-lg p-3 shadow-lg">
        <p className="text-admin-text font-medium mb-2">{label}</p>
        <p className="text-admin-text-muted text-sm">
          Bookings: <span className="text-admin-primary font-medium">{data.booking_count}</span>
        </p>
        <p className="text-admin-text-muted text-sm">
          Percentage: <span className="text-admin-primary font-medium">{data.percentage.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

/**
 * PeakHoursChart - Bar chart showing booking distribution by hour
 * Color-coded by intensity to highlight peak hours
 */
export function PeakHoursChart({ data }: PeakHoursChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-admin-text mb-4">Peak Hours</h3>
        <div className="h-64 flex items-center justify-center text-admin-text-muted">
          No peak hours data available for this period
        </div>
      </div>
    );
  }

  // Format hour display (e.g., "9:00" -> "9AM")
  const formattedData = data.map((item) => ({
    ...item,
    displayHour: item.hour,
  }));

  return (
    <div className="admin-card p-6">
      <h3 className="text-lg font-semibold text-admin-text mb-4">Peak Hours</h3>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#334155]" />
          <span className="text-admin-text-muted">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-admin-primary" />
          <span className="text-admin-text-muted">Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#f59e0b]" />
          <span className="text-admin-text-muted">High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#ef4444]" />
          <span className="text-admin-text-muted">Peak</span>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />
            <XAxis
              dataKey="displayHour"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
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
              cursor={{ fill: '#334155', opacity: 0.3 }}
            />
            <Bar dataKey="booking_count" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PeakHoursChart;
