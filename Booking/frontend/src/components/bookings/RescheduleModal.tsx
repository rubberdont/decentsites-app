'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Booking } from '@/types';
import type { ToastType } from '@/components/ui';
import { availabilityAPI } from '@/services/api';
import { formatTime12Hour, isToday, isTimeSlotPast, isPastDateTime, getMinDate } from '@/utils/date';

interface RescheduleModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDate: string, newTimeSlot: string) => void;
  showToast?: (message: string, type: ToastType) => void;
}

interface AvailabilitySlot {
  id: string;
  time_slot: string;
  is_available: boolean;
  max_capacity: number;
  booked_count: number;
}

export default function RescheduleModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
  showToast,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Filter out past time slots when today is selected
  const displaySlots = useMemo(() => {
    if (!selectedDate || !availableSlots.length) return [];
    
    if (isToday(selectedDate)) {
      return availableSlots.filter(slot => !isTimeSlotPast(slot.time_slot));
    }
    
    return availableSlots;
  }, [selectedDate, availableSlots]);
  // Initialize with current booking date
  useEffect(() => {
    if (booking.booking_date) {
      const date = new Date(booking.booking_date);
      setSelectedDate(format(date, 'yyyy-MM-dd'));
    }
  }, [booking]);

  // Load available slots when date changes
  useEffect(() => {
    if (selectedDate && booking.profile_id) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const date = new Date(selectedDate);
      const slots = await availabilityAPI.getAvailability(
        booking.profile_id,
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      );
      setAvailableSlots(slots || []);
    } catch (error) {
      console.error('Failed to load slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) {
      return;
    }

    // Validate not selecting past date/time
    if (isPastDateTime(selectedDate, selectedSlot)) {
      if (showToast) {
        showToast('Cannot reschedule to a past date or time', 'error');
      } else {
        alert('Cannot reschedule to a past date or time');
      }
      return;
    }

    setLoading(true);
    try {
      // Format date as ISO string
      const isoDate = `${selectedDate}T00:00:00.000Z`;
      
      await onConfirm(isoDate, selectedSlot);
    } finally {
      setLoading(false);
    }
  };

  const isSlotAvailable = (slot: AvailabilitySlot) => {
    return slot.is_available && slot.booked_count < slot.max_capacity;
  };

  if (!isOpen) return null;

  // Get current date/time for display
  const currentDate = booking.booking_date ? format(new Date(booking.booking_date), 'MMM dd, yyyy') : 'N/A';
  const currentTime = booking.time_slot ? formatTime12Hour(booking.time_slot) : 'N/A';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reschedule Booking</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Current booking info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Current Booking</h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span> {currentDate}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Time:</span> {currentTime}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Reference:</span> {booking.booking_ref}
            </p>
          </div>

          {/* Date selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot(''); // Reset slot when date changes
              }}
              min={getMinDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Time slot selector */}
          {selectedDate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Time Slot
              </label>
              
              {loadingSlots ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading available slots...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No available slots for this date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {displaySlots.map((slot) => {
                    const available = isSlotAvailable(slot);
                    const isSelected = selectedSlot === slot.time_slot;
                    
                    return (
                      <button
                        key={slot.id}
                        onClick={() => available && setSelectedSlot(slot.time_slot)}
                        disabled={!available}
                        className={`
                          px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all
                          ${isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : available
                            ? 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        {formatTime12Hour(slot.time_slot)}
                        {!available && (
                          <span className="block text-xs mt-1">Full</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedDate || !selectedSlot}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}