import { BookingStatus } from '@/types';

interface StatusBadgeProps {
  /** Booking status to display */
  status: BookingStatus;
}

/**
 * Status badge styling configuration
 * Maps each status to appropriate background and text colors
 */
const statusConfig: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  [BookingStatus.PENDING]: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    label: 'Pending',
  },
  [BookingStatus.CONFIRMED]: {
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    label: 'Confirmed',
  },
  [BookingStatus.CANCELLED]: {
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    label: 'Cancelled',
  },
  [BookingStatus.REJECTED]: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
    label: 'Rejected',
  },
  [BookingStatus.COMPLETED]: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    label: 'Completed',
  },
  [BookingStatus.NO_SHOW]: {
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    label: 'No Show',
  },
};

/**
 * StatusBadge component
 * Displays booking status with appropriate color coding
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[BookingStatus.PENDING];

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
        ${config.bg} ${config.text}
      `}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;
