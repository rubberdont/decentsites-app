/**
 * Timeline event types for booking history
 */
export type TimelineEventType =
  | 'created'
  | 'confirmed'
  | 'cancelled'
  | 'rejected'
  | 'completed'
  | 'rescheduled'
  | 'note_added'
  | 'status_changed';

export interface TimelineEvent {
  /** Unique event ID */
  id: string;
  /** Type of event */
  type: TimelineEventType;
  /** Event description */
  description: string;
  /** When the event occurred */
  timestamp: string;
  /** Who performed the action (optional) */
  actor?: string;
}

interface BookingTimelineProps {
  /** Array of timeline events */
  events: TimelineEvent[];
}

/**
 * Icon configuration for each event type
 */
const eventIcons: Record<TimelineEventType, { icon: React.ReactNode; color: string }> = {
  created: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  confirmed: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  cancelled: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  rejected: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  completed: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  rescheduled: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  note_added: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  },
  status_changed: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  },
};

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * BookingTimeline component
 * Displays chronological history of booking events
 */
export function BookingTimeline({ events }: BookingTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-admin-text-muted text-sm">No timeline events available.</p>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-admin-border" />

      {/* Timeline events */}
      <div className="space-y-4">
        {events.map((event, index) => {
          const { icon, color } = eventIcons[event.type] || eventIcons.status_changed;

          return (
            <div key={event.id} className="relative flex items-start gap-4 pl-0">
              {/* Event icon */}
              <div
                className={`
                  relative z-10 flex items-center justify-center
                  w-8 h-8 rounded-full border
                  ${color}
                `}
              >
                {icon}
              </div>

              {/* Event content */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-admin-text">{event.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-admin-text-muted">
                    {formatTimestamp(event.timestamp)}
                  </span>
                  {event.actor && (
                    <>
                      <span className="text-admin-text-dark">•</span>
                      <span className="text-xs text-admin-text-muted">by {event.actor}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BookingTimeline;
