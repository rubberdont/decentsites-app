'use client';

import React from 'react';
import type { Service } from '@/types';

interface BookingSummaryProps {
  service: Service | null;
  date?: Date | null;
  timeSlot?: string | null;
  variant?: 'services' | 'calendar';
  onConfirm?: () => void;
  onNavigateToCalendar?: () => void;
  isConfirming?: boolean;
  profileName?: string;
}

/**
 * Booking summary sidebar component
 * Supports two variants:
 * - 'services': Shows service selection summary with "Choose Date & Time" button
 * - 'calendar': Shows full booking summary with "Confirm & Book" button
 */
export default function BookingSummary({
  service,
  date,
  timeSlot,
  variant = 'calendar',
  onConfirm,
  onNavigateToCalendar,
  isConfirming = false,
  profileName,
}: BookingSummaryProps) {
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Determine button state based on variant
  const isServicesVariant = variant === 'services';
  const canProceed = isServicesVariant ? !!service : (service && date && timeSlot);

  // Handle button click based on variant
  const handleButtonClick = () => {
    if (isServicesVariant) {
      onNavigateToCalendar?.();
    } else {
      onConfirm?.();
    }
  };

  // Get button text based on variant and state
  const getButtonText = () => {
    if (isConfirming) return 'Confirming...';
    return isServicesVariant ? 'Choose Date & Time' : 'Confirm & Book';
  };

  // Get helper text based on variant
  const getHelperText = () => {
    if (!service) return 'Select a service to continue';
    if (isServicesVariant) return null;
    if (!date) return 'Select a date to continue';
    if (!timeSlot) return 'Select a time slot to continue';
    return null;
  };

  return (
    <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] p-6 sticky top-4">
      {/* Header */}
      <h2 className="text-[#eaeaea] font-bold text-xl mb-6">
        Your Appointment
      </h2>

      {/* Details */}
      <div className="space-y-4 mb-6">
        {/* Profile/Business Name */}
        {profileName && (
          <div className="flex justify-between items-start">
            <span className="text-[#a0a0a0] text-sm">Business</span>
            <span className="text-[#eaeaea] text-sm font-medium text-right max-w-[60%]">
              {profileName}
            </span>
          </div>
        )}

        {/* Service */}
        <div className="flex justify-between items-start">
          <span className="text-[#a0a0a0] text-sm">Service</span>
          <span className="text-[#eaeaea] text-sm font-medium text-right max-w-[60%]">
            {service?.title || '—'}
          </span>
        </div>

        {/* Date - only show in calendar variant */}
        {!isServicesVariant && (
          <div className="flex justify-between items-start">
            <span className="text-[#a0a0a0] text-sm">Date</span>
            <span className="text-[#eaeaea] text-sm font-medium text-right">
              {date ? formatDate(date) : '—'}
            </span>
          </div>
        )}

        {/* Time - only show in calendar variant */}
        {!isServicesVariant && (
          <div className="flex justify-between items-start">
            <span className="text-[#a0a0a0] text-sm">Time</span>
            <span className="text-[#eaeaea] text-sm font-medium text-right">
              {timeSlot || '—'}
            </span>
          </div>
        )}

        {/* Duration - only show in calendar variant */}
        {!isServicesVariant && (
          <div className="flex justify-between items-start">
            <span className="text-[#a0a0a0] text-sm">Duration</span>
            <span className="text-[#eaeaea] text-sm font-medium text-right">
              45 min
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[#444444] my-4" />

      {/* Total Price */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-[#eaeaea] font-semibold">
          {isServicesVariant ? 'Subtotal' : 'Total'}
        </span>
        <span className="text-[#d4af37] font-bold text-2xl">
          {service ? `₱${service.price.toFixed(2)}` : '₱0.00'}
        </span>
      </div>

      {/* Action Button */}
      <button
        onClick={handleButtonClick}
        disabled={!canProceed || isConfirming}
        className={`
          w-full py-3.5 px-6 rounded-lg font-semibold text-base
          transition-all duration-200 flex items-center justify-center gap-2
          ${canProceed && !isConfirming
            ? 'bg-[#d4af37] text-[#1a1a1a] hover:bg-[#c4a030] active:scale-[0.98]'
            : 'bg-[#444444] text-[#a0a0a0] cursor-not-allowed'
          }
        `}
      >
        {isConfirming ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Confirming...
          </>
        ) : isServicesVariant ? (
          <>
            {getButtonText()}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </>
        ) : (
          getButtonText()
        )}
      </button>

      {/* Helper text when incomplete */}
      {getHelperText() && (
        <p className="text-[#a0a0a0] text-xs text-center mt-3">
          {getHelperText()}
        </p>
      )}
    </div>
  );
}
