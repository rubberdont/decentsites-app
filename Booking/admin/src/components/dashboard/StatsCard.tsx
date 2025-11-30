'use client';

import React from 'react';

/**
 * Props for the StatsCard component
 */
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendDirection?: 'up' | 'down';
  linkHref?: string;
  linkText?: string;
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
 * StatsCard - Reusable statistics card for dashboard
 * Displays a metric with icon, value, and optional trend indicator
 */
export function StatsCard({
  title,
  value,
  icon,
  trend,
  trendDirection,
  linkHref,
  linkText,
}: StatsCardProps) {
  const trendColorClass =
    trendDirection === 'up'
      ? 'text-status-confirmed'
      : trendDirection === 'down'
      ? 'text-status-cancelled'
      : 'text-admin-text-muted';

  const CardContent = () => (
    <>
      {/* Header with icon and trend */}
      <div className="flex items-center justify-between mb-4">
        {/* Icon container */}
        <div className="w-12 h-12 rounded-lg bg-admin-primary/10 flex items-center justify-center text-admin-primary">
          {icon}
        </div>

        {/* Trend indicator */}
        {trend !== undefined && trendDirection && (
          <div className={`flex items-center gap-1 ${trendColorClass}`}>
            {trendDirection === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-admin-text mb-1">{value}</div>

      {/* Title */}
      <div className="text-sm text-admin-text-muted">{title}</div>

      {/* Optional link */}
      {linkHref && linkText && (
        <div className="mt-3 pt-3 border-t border-admin-border">
          <span className="text-sm text-admin-primary hover:text-admin-primary-light transition-colors">
            {linkText} &rarr;
          </span>
        </div>
      )}
    </>
  );

  // If link is provided, wrap in anchor
  if (linkHref) {
    return (
      <a
        href={linkHref}
        className="block admin-card p-6 hover:border-admin-border-light transition-colors"
      >
        <CardContent />
      </a>
    );
  }

  return (
    <div className="admin-card p-6">
      <CardContent />
    </div>
  );
}

export default StatsCard;
