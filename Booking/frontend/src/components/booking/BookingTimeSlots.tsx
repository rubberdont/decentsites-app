'use client';

import React, { useState, useEffect } from 'react';
import { availabilityAPI, utilityAPI } from '@/services/api';
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
  const [serverTime, setServerTime] = useState<Date | null>(null);

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

  // Fetch server time on mount and refresh periodically
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const response = await utilityAPI.getServerTime();
        setServerTime(new Date(response.data.server_time));
      } catch (err) {
        console.error('Failed to fetch server time:', err);
        // Fallback to client time if server time unavailable
        setServerTime(new Date());
      }
    };

    fetchServerTime();
    // Refresh every minute
    const interval = setInterval(fetchServerTime, 60000);
    return () => clearInterval(interval);
  }, []);

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

  /**
   * Check if a time slot is in the past based on server time
   */
  const isSlotInPast = (timeSlot: string): boolean => {
    if (!serverTime || !selectedDate) return false;
    
    // Get today's date in local timezone from server time
    const serverYear = serverTime.getFullYear();
    const serverMonth = serverTime.getMonth();
    const serverDay = serverTime.getDate();
    
    // Get selected date components
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    const selectedDay = selectedDate.getDate();
    
    // Check if selected date is today (using local time)
    const isToday = serverYear === selectedYear && 
                    serverMonth === selectedMonth && 
                    serverDay === selectedDay;
    
    if (!isToday) {
      // Not today, so no slots are in the past (future dates)
      // For past dates, they shouldn't even be selectable in calendar
      return false;
    }
    
    // Parse start time from slot (e.g., "09:00-10:00" -> "09:00")
    const startTimeStr = timeSlot.split('-')[0].trim();
    const [slotHour, slotMinute] = startTimeStr.split(':').map(Number);
    
    // Compare with server time (using LOCAL hours, not UTC)
    const serverHour = serverTime.getHours();
    const serverMinute = serverTime.getMinutes();
    
    // Slot is in the past if current time is past the slot start time
    return (serverHour > slotHour) || (serverHour === slotHour && serverMinute >= slotMinute);
  };

  // Clear selected time slot when date changes and slot is no longer available OR slot is in the past
  useEffect(() => {
    if (selectedTimeSlot) {
      const isSlotAvailable = slots.some(
        (slot) => slot.time_slot === selectedTimeSlot && slot.is_available
      );
      const isPast = isSlotInPast(selectedTimeSlot);
      if ((!isSlotAvailable && slots.length > 0) || isPast) {
        onTimeSlotChange(null);
      }
    }
  }, [slots, selectedTimeSlot, onTimeSlotChange, serverTime, isSlotInPast]);

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

  // Filter to available slots (past slots will be shown but disabled)
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
            const isPast = isSlotInPast(slot.time_slot);

            return (
              <button
                key={slot.id}
                onClick={() => !isPast && onTimeSlotChange(isSelected ? null : slot.time_slot)}
                disabled={isPast}
                className={`
                  py-3 px-4 rounded-lg border text-sm font-medium
                  transition-all duration-200
                  ${isPast
                    ? 'bg-[#1a1a1a] border-[#333333] text-[#555555] cursor-not-allowed opacity-50'
                    : isSelected
                      ? 'bg-[#d4af37] border-[#d4af37] text-[#1a1a1a] font-semibold'
                      : 'border-[#444444] text-[#eaeaea] hover:border-[#d4af37] hover:text-[#d4af37] bg-[#1a1a1a]'
                  }
                `}
              >
                {formatTimeSlotForDisplay(slot.time_slot)}
                {isPast && <span className="block text-xs mt-1">Passed</span>}
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
