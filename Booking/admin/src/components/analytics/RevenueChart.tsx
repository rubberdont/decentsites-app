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
} from 'recharts';
import { format, parseISO } from 'date-fns';

/**
 * Revenue data point interface
 */
interface RevenueDataPoint {
  date: string;
  revenue: number;
}

/**
 * Props for the RevenueChart component
 */
interface RevenueChartProps {
  data: RevenueDataPoint[];
}

/**
 * Format PHP currency
 */
const formatPHP = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

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
          Revenue: <span className="text-status-confirmed font-medium">{formatPHP(payload[0]?.value || 0)}</span>
        </p>
      </div>
    );
  }
  return null;
};

/**
 * RevenueChart - Bar chart showing revenue over time
 * Uses Recharts with dark theme styling and PHP currency formatting
 */
export function RevenueChart({ data }: RevenueChartProps) {
  // Format dates for display
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: format(parseISO(item.date), 'MMM d'),
  }));

  if (!data || data.length === 0) {
    return (
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-admin-text mb-4">Revenue</h3>
        <div className="h-64 flex items-center justify-center text-admin-text-muted">
          No revenue data available for this period
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card p-6">
      <h3 className="text-lg font-semibold text-admin-text mb-4">Revenue</h3>
      <div className="h-64">
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
              tickFormatter={(value) => `₱${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: '#334155', opacity: 0.5 }}
            />
            <Bar
              dataKey="revenue"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;
