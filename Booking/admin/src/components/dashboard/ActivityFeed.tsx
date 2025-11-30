'use client';

import React from 'react';

/**
 * Activity type for different actions
 */
type ActivityType =
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'customer_registered'
  | 'review_received';

/**
 * Activity interface
 */
export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: string;
  customerName?: string;
}

/**
 * Props for ActivityFeed component
 */
interface ActivityFeedProps {
  activities: Activity[];
}

/**
 * Icon components for different activity types
 */
const ActivityIcons: Record<ActivityType, React.ReactNode> = {
  booking_created: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  ),
  booking_confirmed: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  booking_cancelled: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  booking_completed: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  customer_registered: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
      />
    </svg>
  ),
  review_received: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  ),
};

/**
 * Colors for different activity types
 */
const activityColors: Record<ActivityType, string> = {
  booking_created: 'bg-admin-primary/20 text-admin-primary',
  booking_confirmed: 'bg-status-confirmed/20 text-status-confirmed',
  booking_cancelled: 'bg-status-cancelled/20 text-status-cancelled',
  booking_completed: 'bg-status-completed/20 text-status-completed',
  customer_registered: 'bg-purple-500/20 text-purple-400',
  review_received: 'bg-yellow-500/20 text-yellow-400',
};

/**
 * Empty state icon
 */
const ClockIcon = () => (
  <svg
    className="w-16 h-16 text-admin-text-dark"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/**
 * Format relative timestamp
 */
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  // Return formatted date for older activities
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * ActivityFeed - Timeline of recent activities
 */
export function ActivityFeed({ activities }: ActivityFeedProps) {
  // Empty state
  if (activities.length === 0) {
    return (
      <div className="admin-card">
        <div className="p-6 border-b border-admin-border">
          <h2 className="text-lg font-semibold text-admin-text">Recent Activity</h2>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <ClockIcon />
          <h3 className="mt-4 text-lg font-medium text-admin-text">No recent activity</h3>
          <p className="mt-2 text-admin-text-muted">
            Activity will appear here as things happen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      {/* Header */}
      <div className="p-6 border-b border-admin-border">
        <h2 className="text-lg font-semibold text-admin-text">Recent Activity</h2>
      </div>

      {/* Activity Timeline */}
      <div className="p-6">
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${activityColors[activity.type]}`}
                >
                  {ActivityIcons[activity.type]}
                </div>
                {/* Line connecting to next item */}
                {index < activities.length - 1 && (
                  <div className="w-px h-full bg-admin-border mt-2 min-h-[24px]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <p className="text-admin-text">
                  {activity.message}
                  {activity.customerName && (
                    <span className="font-medium"> {activity.customerName}</span>
                  )}
                </p>
                <p className="text-sm text-admin-text-muted mt-1">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ActivityFeed;
