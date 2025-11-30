'use client';

import React, { useState, useEffect } from 'react';
import { availabilityAPI } from '@/services/api';
import type { AvailabilitySlot } from '@/types';

interface BookingTimeSlotsProps {
  profileId: string;
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  onTimeSlotChange: (slot: string | null) => void;
}

/**
 * Convert "09:00-10:00" to "9:00 AM - 10:00 AM" for display
 */
const formatTimeSlotForDisplay = (timeSlot: string): string => {
  const [start, end] = timeSlot.split('-');
  const format12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${period}`;
  };
  return `${format12Hour(start)} - ${format12Hour(end)}`;
};

/**
 * Time slot picker component
 * Fetches available time slots from the availability API
 */
export default function BookingTimeSlots({
  profileId,
  selectedDate,
  selectedTimeSlot,
  onTimeSlotChange,
}: BookingTimeSlotsProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format date for display
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch slots when selectedDate changes
  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      setError(null);
      return;
    }

    const fetchSlots = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const dateString = formatDateForAPI(selectedDate);
        const response = await availabilityAPI.getSlotsForDate(profileId, dateString);
        setSlots(response.data.slots || []);
      } catch (err) {
        console.error('Failed to fetch availability slots:', err);
        setError('Failed to load available time slots. Please try again.');
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, profileId]);

  // Clear selected time slot when date changes and slot is no longer available
  useEffect(() => {
    if (selectedTimeSlot) {
      const isSlotAvailable = slots.some(
        (slot) => slot.time_slot === selectedTimeSlot && slot.is_available
      );
      if (!isSlotAvailable && slots.length > 0) {
        onTimeSlotChange(null);
      }
    }
  }, [slots, selectedTimeSlot, onTimeSlotChange]);

  // Show placeholder if no date selected
  if (!selectedDate) {
    return (
      <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] p-6">
        <p className="text-[#a0a0a0] text-center">
          Please select a date to view available times
        </p>
      </div>
    );
  }

  // Filter to only show available slots
  const availableSlots = slots.filter((slot) => slot.is_available);

  return (
    <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] p-4">
      {/* Header */}
      <h3 className="text-[#eaeaea] font-semibold text-lg mb-4">
        Available Times for {formatDateForDisplay(selectedDate)}
      </h3>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="py-3 px-4 rounded-lg border border-[#444444] bg-[#1a1a1a] animate-pulse"
            >
              <div className="h-5 bg-[#333333] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="text-center py-6">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => {
              // Trigger refetch by resetting state
              setError(null);
              setIsLoading(true);
              const dateString = formatDateForAPI(selectedDate);
              availabilityAPI
                .getSlotsForDate(profileId, dateString)
                .then((response) => {
                  setSlots(response.data.slots || []);
                })
                .catch((err) => {
                  console.error('Failed to fetch availability slots:', err);
                  setError('Failed to load available time slots. Please try again.');
                  setSlots([]);
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }}
            className="px-4 py-2 bg-[#d4af37] text-[#1a1a1a] rounded-lg font-medium hover:bg-[#c9a030] transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && availableSlots.length === 0 && (
        <div className="text-center py-6">
          <p className="text-[#a0a0a0]">No available time slots for this date</p>
        </div>
      )}

      {/* Time Slots Grid */}
      {!isLoading && !error && availableSlots.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableSlots.map((slot) => {
            const isSelected = selectedTimeSlot === slot.time_slot;

            return (
              <button
                key={slot.id}
                onClick={() => onTimeSlotChange(isSelected ? null : slot.time_slot)}
                className={`
                  py-3 px-4 rounded-lg border text-sm font-medium
                  transition-all duration-200
                  ${isSelected
                    ? 'bg-[#d4af37] border-[#d4af37] text-[#1a1a1a] font-semibold'
                    : 'border-[#444444] text-[#eaeaea] hover:border-[#d4af37] hover:text-[#d4af37] bg-[#1a1a1a]'
                  }
                `}
              >
                {formatTimeSlotForDisplay(slot.time_slot)}
              </button>
            );
          })}
        </div>
      )}

      {/* Timezone footer */}
      <p className="text-[#a0a0a0] text-xs text-center mt-4">
        All times are in your local timezone
      </p>
    </div>
  );
}
