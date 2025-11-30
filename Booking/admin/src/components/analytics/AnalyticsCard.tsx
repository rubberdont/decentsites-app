'use client';

import React from 'react';

/**
 * Props for the AnalyticsCard component
 */
interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}

/**
 * Trend arrow up icon
 */
const TrendUpIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

/**
 * Trend arrow down icon
 */
const TrendDownIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
    />
  </svg>
);

/**
 * AnalyticsCard - Card component for displaying analytics metrics
 * Shows metric value with icon, optional trend indicator, and subtitle
 */
export function AnalyticsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
}: AnalyticsCardProps) {
  // Determine trend direction and color
  const trendDirection = trend !== undefined ? (trend >= 0 ? 'up' : 'down') : null;
  const trendColorClass =
    trendDirection === 'up'
      ? 'text-status-confirmed'
      : trendDirection === 'down'
      ? 'text-status-cancelled'
      : 'text-admin-text-muted';

  return (
    <div className="admin-card p-6">
      {/* Header with icon and trend */}
      <div className="flex items-center justify-between mb-4">
        {/* Icon container */}
        <div className="w-12 h-12 rounded-lg bg-admin-primary/10 flex items-center justify-center text-admin-primary">
          {icon}
        </div>

        {/* Trend indicator */}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 ${trendColorClass}`}>
            {trendDirection === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
            <span className="text-sm font-medium">
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-admin-text mb-1">{value}</div>

      {/* Title */}
      <div className="text-sm text-admin-text-muted">{title}</div>

      {/* Optional subtitle/trend label */}
      {(subtitle || trendLabel) && (
        <div className="mt-2 text-xs text-admin-text-dark">
          {trendLabel || subtitle}
        </div>
      )}
    </div>
  );
}

export default AnalyticsCard;
