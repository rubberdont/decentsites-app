'use client';

import { Booking, BookingStatus } from '@/types';

export type BookingActionType =
  | 'approve'
  | 'reject'
  | 'cancel'
  | 'reschedule'
  | 'add_note'
  | 'mark_completed'
  | 'mark_no_show';

interface BookingActionsProps {
  /** The booking to show actions for */
  booking: Booking;
  /** Callback when an action is triggered */
  onAction: (action: BookingActionType) => void;
  /** Whether actions are disabled (e.g., during loading) */
  disabled?: boolean;
}

/**
 * Action button configuration based on booking status
 */
interface ActionConfig {
  type: BookingActionType;
  label: string;
  variant: 'primary' | 'secondary' | 'danger' | 'success';
  icon: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-admin-primary hover:bg-admin-primary-hover text-white',
  secondary: 'bg-admin-bg-hover hover:bg-admin-border text-admin-text border border-admin-border',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
};

/**
 * Get available actions based on booking status
 */
function getActionsForStatus(status: BookingStatus): ActionConfig[] {
  const actions: ActionConfig[] = [];

  switch (status) {
    case BookingStatus.PENDING:
      actions.push(
        {
          type: 'approve',
          label: 'Approve',
          variant: 'success',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
        },
        {
          type: 'reject',
          label: 'Reject',
          variant: 'danger',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        }
      );
      break;

    case BookingStatus.CONFIRMED:
      actions.push(
        {
          type: 'mark_completed',
          label: 'Mark Completed',
          variant: 'success',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          type: 'reschedule',
          label: 'Reschedule',
          variant: 'primary',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          type: 'cancel',
          label: 'Cancel',
          variant: 'danger',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        },
        {
          type: 'mark_no_show',
          label: 'No Show',
          variant: 'secondary',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ),
        }
      );
      break;

    // For terminal statuses, no primary actions available
    case BookingStatus.CANCELLED:
    case BookingStatus.REJECTED:
    case BookingStatus.COMPLETED:
    case BookingStatus.NO_SHOW:
      break;
  }

  // Add note is always available
  actions.push({
    type: 'add_note',
    label: 'Add Note',
    variant: 'secondary',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
  });

  return actions;
}

/**
 * BookingActions component
 * Displays appropriate action buttons based on booking status
 */
export function BookingActions({ booking, onAction, disabled = false }: BookingActionsProps) {
  const actions = getActionsForStatus(booking.status);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <button
          key={action.type}
          onClick={() => onAction(action.type)}
          disabled={disabled}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg
            font-medium text-sm transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${variantClasses[action.variant]}
          `}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}

export default BookingActions;
