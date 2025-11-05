'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { availabilityAPI, profilesAPI } from '@/services/api';
import type { DateAvailability, AvailabilitySlot, BusinessProfile } from '@/types';
import { showError, showSuccess } from '@/utils/toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

export default function AvailabilityPage() {
  const { isOwner, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const profileId = params.profileId as string;

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<DateAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateSlots, setSelectedDateSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSlotModal, setShowSlotModal] = useState(false);

  // Slot creation form
  const [slotForm, setSlotForm] = useState({
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 60,
    maxCapacity: 1,
  });

  useEffect(() => {
    if (!authLoading && !isOwner) {
      router.push('/');
      return;
    }

    if (isOwner && profileId) {
      loadProfile();
      loadAvailability();
    }
  }, [isOwner, authLoading, profileId, router, currentMonth]);

  const loadProfile = async () => {
    try {
      const response = await profilesAPI.getById(profileId);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      showError('Failed to load profile');
    }
  };

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      const response = await availabilityAPI.getAvailability(
        profileId,
        start.toISOString(),
        end.toISOString()
      );
      setAvailability(response.data);
    } catch (error) {
      console.error('Failed to load availability:', error);
      showError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = async (date: Date) => {
    setSelectedDate(date);
    try {
      const response = await availabilityAPI.getSlotsForDate(
        profileId,
        date.toISOString()
      );
      setSelectedDateSlots(response.data.slots);
      setShowSlotModal(true);
    } catch (error) {
      console.error('Failed to load slots:', error);
      setSelectedDateSlots([]);
      setShowSlotModal(true);
    }
  };

  const handleCreateSlots = async () => {
    if (!selectedDate) return;

    try {
      await availabilityAPI.createSlots(profileId, {
        date: selectedDate.toISOString(),
        config: {
          start_time: slotForm.startTime,
          end_time: slotForm.endTime,
          slot_duration: slotForm.slotDuration,
          max_capacity_per_slot: slotForm.maxCapacity,
        },
      });
      showSuccess('Availability slots created');
      setShowSlotModal(false);
      loadAvailability();
    } catch (error) {
      console.error('Failed to create slots:', error);
      showError('Failed to create slots');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      await availabilityAPI.deleteSlot(slotId);
      showSuccess('Slot deleted');
      if (selectedDate) {
        handleDateClick(selectedDate);
      }
      loadAvailability();
    } catch (error) {
      console.error('Failed to delete slot:', error);
      showError('Failed to delete slot');
    }
  };

  const getDateAvailability = (date: Date) => {
    return availability.find(a => isSameDay(new Date(a.date), date));
  };

  const getDateColor = (date: Date) => {
    const dateAvail = getDateAvailability(date);
    if (!dateAvail || dateAvail.total_slots === 0) return 'bg-gray-100 dark:bg-gray-800';
    
    const availabilityPercent = (dateAvail.available_slots / dateAvail.total_slots) * 100;
    if (availabilityPercent === 0) return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
    if (availabilityPercent < 50) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  if (authLoading || loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading availability...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/owner/profiles"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Profiles
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {profile?.name} - Availability Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Set up available time slots for bookings
          </p>
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Partially Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Fully Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">No Slots</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-700 dark:text-gray-300 py-2">
                {day}
              </div>
            ))}
            {days.map(day => {
              const dateAvail = getDateAvailability(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  className={`p-4 rounded-lg border transition-colors hover:shadow-md ${getDateColor(day)} border-gray-300 dark:border-gray-600`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{format(day, 'd')}</div>
                    {dateAvail && dateAvail.total_slots > 0 && (
                      <div className="text-xs mt-1">
                        {dateAvail.available_slots}/{dateAvail.total_slots}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot Management Modal */}
        {showSlotModal && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  <button
                    onClick={() => setShowSlotModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Existing Slots */}
                {selectedDateSlots.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Existing Slots</h4>
                    <div className="space-y-2">
                      {selectedDateSlots.map(slot => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{slot.time_slot}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                              {slot.booked_count}/{slot.max_capacity} booked
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Create New Slots */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Slots</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={slotForm.startTime}
                          onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={slotForm.endTime}
                          onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Slot Duration (minutes)
                        </label>
                        <select
                          value={slotForm.slotDuration}
                          onChange={(e) => setSlotForm({ ...slotForm, slotDuration: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Capacity
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={slotForm.maxCapacity}
                          onChange={(e) => setSlotForm({ ...slotForm, maxCapacity: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleCreateSlots}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Create Slots
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
