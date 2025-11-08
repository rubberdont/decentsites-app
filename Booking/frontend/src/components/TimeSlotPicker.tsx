'use client';

import { useState, useEffect } from 'react';
import { availabilityAPI } from '@/services/api';
import type { AvailabilitySlot } from '@/types';

interface TimeSlotPickerProps {
  profileId: string;
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  onTimeSlotChange: (timeSlot: string | null) => void;
}

export default function TimeSlotPicker({
  profileId,
  selectedDate,
  selectedTimeSlot,
  onTimeSlotChange,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate || !profileId) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await availabilityAPI.getSlotsForDate(
          profileId,
          selectedDate.toISOString()
        );
        setSlots(response.data.slots);
      } catch (err) {
        console.error('Failed to fetch time slots:', err);
        setError('Unable to load time slots');
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, profileId]);

  if (!selectedDate) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-center">
        Please select a date first to see available time slots
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading time slots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
        {error}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          No time slots available for this date
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Please select a different date or contact the business
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
        {slots.filter(s => s.is_available).length} of {slots.length} slots available
      </p>
      {slots.map((slot) => {
        const isFull = !slot.is_available;
        const isSelected = selectedTimeSlot === slot.time_slot;
        const remaining = slot.max_capacity - slot.booked_count;

        return (
          <button
            key={slot.id}
            type="button"
            disabled={isFull}
            onClick={() => onTimeSlotChange(isSelected ? null : slot.time_slot)}
            className={`
              w-full p-4 rounded-xl border text-left transition-all
              ${isFull 
                ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
                : isSelected
                  ? 'border-[#14B8A6] bg-[#14B8A6]/10 ring-2 ring-[#14B8A6]'
                  : 'border-gray-300 dark:border-gray-600 hover:border-[#14B8A6] dark:hover:border-[#14B8A6] hover:bg-[#14B8A6]/5 dark:hover:bg-[#14B8A6]/10'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Checkbox indicator */}
                 <div className={`
                   w-5 h-5 rounded border-2 flex items-center justify-center
                   ${isFull 
                     ? 'border-gray-400 bg-gray-200 dark:bg-gray-700'
                     : isSelected
                       ? 'border-[#14B8A6] bg-[#14B8A6]'
                       : 'border-gray-400 dark:border-gray-500'
                   }
                 `}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                
                <div>
                  <span className={`font-medium ${isFull ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {slot.time_slot}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                {isFull ? (
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Full
                  </span>
                ) : (
                  <div className="text-sm">
                    <span className={`font-medium ${remaining <= 2 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {remaining} {remaining === 1 ? 'spot' : 'spots'}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500"> left</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
