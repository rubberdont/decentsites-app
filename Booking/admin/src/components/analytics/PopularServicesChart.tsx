'use client';

import React from 'react';
import type { ServiceStats } from '@/types';

/**
 * Props for the PopularServicesChart component
 */
interface PopularServicesChartProps {
  data: ServiceStats[];
}

/**
 * Format PHP currency
 */
const formatPHP = (amount: number) =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/**
 * Star icon for ratings
 */
const StarIcon = () => (
  <svg
    className="w-4 h-4 text-yellow-500"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

/**
 * PopularServicesChart - Table/list showing top services
 * Displays service name, booking count, revenue in PHP, and optional rating
 */
export function PopularServicesChart({ data }: PopularServicesChartProps) {
  // Calculate max bookings for percentage bar
  const maxBookings = Math.max(...data.map((s) => s.total_bookings), 1);

  if (!data || data.length === 0) {
    return (
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-admin-text mb-4">Popular Services</h3>
        <div className="h-64 flex items-center justify-center text-admin-text-muted">
          No service data available for this period
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card p-6">
      <h3 className="text-lg font-semibold text-admin-text mb-4">Popular Services</h3>
      <div className="space-y-4">
        {data.slice(0, 5).map((service, index) => {
          const percentage = (service.total_bookings / maxBookings) * 100;

          return (
            <div key={service.service_id} className="relative">
              {/* Service info row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : index === 1
                      ? 'bg-gray-400/20 text-gray-400'
                      : index === 2
                      ? 'bg-orange-500/20 text-orange-500'
                      : 'bg-admin-bg-hover text-admin-text-muted'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Service name */}
                  <span className="text-admin-text font-medium">{service.service_name}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  {/* Rating if available */}
                  {service.average_rating !== undefined && service.average_rating > 0 && (
                    <div className="flex items-center gap-1">
                      <StarIcon />
                      <span className="text-admin-text-muted">{service.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                  
                  {/* Booking count */}
                  <div className="text-admin-text-muted">
                    <span className="text-admin-text font-medium">{service.total_bookings}</span> bookings
                  </div>
                  
                  {/* Revenue */}
                  <div className="text-status-confirmed font-medium min-w-[80px] text-right">
                    {formatPHP(service.revenue)}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-admin-bg-hover rounded-full overflow-hidden">
                <div
                  className="h-full bg-admin-primary rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PopularServicesChart;
