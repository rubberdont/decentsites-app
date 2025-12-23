'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { DateAvailability, AvailabilitySlot, BusinessProfile, SlotTemplate } from '@/types';
import { availabilityAPI, ownersAPI } from '@/services/api';
import {
  CalendarGrid,
  DaySlotsList,
  SlotEditModal,
  GenerateSlotsModal,
  SlotTemplateModal,
  BulkActionBar,
} from '@/components/availability';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Format date to YYYY-MM-DD string
 */
function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Get the first and last day of a month
 */
function getMonthDateRange(year: number, month: number): { startDate: string; endDate: string } {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    startDate: formatDateString(year, month, 1),
    endDate: formatDateString(year, month, lastDay.getDate()),
  };
}

/**
 * Transform API response to match the expected DateAvailability format
 * The API returns date as ISO string, we need to convert it to YYYY-MM-DD
 */
function transformAvailabilityData(apiData: DateAvailability[]): DateAvailability[] {
  return apiData.map((day) => {
    // Handle date which could be ISO string or Date object from API
    const dateObj = typeof day.date === 'string' ? new Date(day.date) : day.date;
    const dateStr = dateObj instanceof Date
      ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
      : day.date;

    // Calculate available slots correctly
    const availableSlots = day.slots.reduce((acc, slot) => {
      if (slot.is_available) {
        return acc + Math.max(0, slot.max_capacity - slot.booked_count);
      }
      return acc;
    }, 0);

    const bookedSlots = day.slots.reduce((acc, slot) => acc + slot.booked_count, 0);

    return {
      ...day,
      date: dateStr,
      available_slots: availableSlots,
      booked_slots: bookedSlots,
      slots: day.slots.map((slot) => ({
        ...slot,
        // Normalize the slot date as well
        date: dateStr,
      })),
    };
  });
}

/**
 * Availability management page
 * Shows monthly calendar with slot counts and allows editing slots for each day
 */
export default function AvailabilityPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availabilityData, setAvailabilityData] = useState<DateAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile state
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Modal states
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isNewSlot, setIsNewSlot] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Template modal states
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SlotTemplate | null>(null);

  // Operation states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Multi-select mode states
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // Mobile bottom sheet states
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedDateForMobile, setSelectedDateForMobile] = useState<string | null>(null);

  // Responsive detection
  const [isMobile, setIsMobile] = useState(false);

  /**
   * Handle responsive detection
   */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280); // xl breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /**
   * Fetch owner's profile on mount
   */
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      setError(null);

      try {
        const response = await ownersAPI.getMyProfiles();
        const profiles = response.data;

        if (profiles && profiles.length > 0) {
          // Use the first profile (owners typically have one profile)
          setProfile(profiles[0]);
        } else {
          setError('No business profile found. Please create a profile first.');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load business profile. Please try again.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  /**
   * Load availability data for the current month
   */
  const loadAvailability = useCallback(async () => {
    if (!profile?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getMonthDateRange(currentYear, currentMonth);
      const response = await availabilityAPI.getSlots(profile.id, startDate, endDate);

      // Transform and set data
      const transformedData = transformAvailabilityData(response.data);
      setAvailabilityData(transformedData);
    } catch (err) {
      console.error('Error loading availability:', err);
      setError('Failed to load availability data. Please try again.');
      setAvailabilityData([]);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, currentMonth, currentYear]);

  /**
   * Load availability when profile or month changes
   */
  useEffect(() => {
    if (profile?.id) {
      loadAvailability();
    }
  }, [profile?.id, loadAvailability]);

  /**
   * Get slots for selected date
   */
  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    return availabilityData.find((d) => d.date === selectedDate) || null;
  }, [selectedDate, availabilityData]);

  /**
   * Navigate to previous month
   */
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  /**
   * Navigate to next month
   */
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  /**
   * Handle day click
   */
  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  /**
   * Handle slot toggle (enable/disable availability)
   */
  const handleSlotToggle = async (slotId: string, isAvailable: boolean) => {
    // Update local state immediately for responsiveness
    setAvailabilityData((prev) =>
      prev.map((dayData) => ({
        ...dayData,
        slots: dayData.slots.map((slot) =>
          slot.id === slotId ? { ...slot, is_available: isAvailable } : slot
        ),
        available_slots: dayData.slots.reduce((acc, slot) => {
          const updatedSlot = slot.id === slotId ? { ...slot, is_available: isAvailable } : slot;
          if (updatedSlot.is_available) {
            return acc + Math.max(0, updatedSlot.max_capacity - updatedSlot.booked_count);
          }
          return acc;
        }, 0),
      }))
    );

    // TODO: Call API to persist the toggle when backend supports it
  };

  /**
   * Handle slot edit click
   */
  const handleSlotEdit = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setIsNewSlot(false);
    setIsSlotModalOpen(true);
  };

  /**
   * Handle add slot click
   */
  const handleAddSlot = () => {
    setEditingSlot(null);
    setIsNewSlot(true);
    setIsSlotModalOpen(true);
  };

  /**
   * Handle slot save (update capacity or create new slot)
   */
  const handleSlotSave = async (slotId: string | null, capacity: number, timeSlot?: string) => {
    if (!profile?.id) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      if (slotId) {
        // Update existing slot capacity
        await availabilityAPI.updateSlot(slotId, { max_capacity: capacity });

        // Update local state
        setAvailabilityData((prev) =>
          prev.map((dayData) => ({
            ...dayData,
            slots: dayData.slots.map((slot) =>
              slot.id === slotId ? { ...slot, max_capacity: capacity } : slot
            ),
            available_slots: dayData.slots.reduce((acc, slot) => {
              const updatedSlot = slot.id === slotId ? { ...slot, max_capacity: capacity } : slot;
              if (updatedSlot.is_available) {
                return acc + Math.max(0, updatedSlot.max_capacity - updatedSlot.booked_count);
              }
              return acc;
            }, 0),
          }))
        );
      } else if (selectedDate && timeSlot) {
        // Create new slot using the generate slots API
        const [startTime, endTime] = timeSlot.includes('-')
          ? timeSlot.split('-')
          : [timeSlot, addMinutesToTime(timeSlot, 30)];

        await availabilityAPI.createSlots(profile.id, {
          date: selectedDate,
          config: {
            start_time: startTime,
            end_time: endTime,
            slot_duration: calculateDuration(startTime, endTime),
            max_capacity_per_slot: capacity,
          },
        });

        // Reload availability to get the newly created slot with proper ID
        await loadAvailability();
      }

      // Close modal on success
      setIsSlotModalOpen(false);
      setEditingSlot(null);
    } catch (err) {
      console.error('Error saving slot:', err);
      setSaveError('Failed to save slot. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle generate slots for date range
   */
  const handleGenerateSlots = async (config: {
    startDate: string;
    endDate: string;
    startHour: number;
    endHour: number;
    slotDuration: number;
    capacity: number;
    daysOfWeek: number[];
  }) => {
    if (!profile?.id) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Generate slots for each day in range
      const current = new Date(config.startDate);
      const end = new Date(config.endDate);

      const createPromises: Promise<unknown>[] = [];

      while (current <= end) {
        if (config.daysOfWeek.includes(current.getDay())) {
          const dateStr = formatDateString(
            current.getFullYear(),
            current.getMonth(),
            current.getDate()
          );

          const startTime = `${String(config.startHour).padStart(2, '0')}:00`;
          const endTime = `${String(config.endHour).padStart(2, '0')}:00`;

          createPromises.push(
            availabilityAPI.createSlots(profile.id, {
              date: dateStr,
              config: {
                start_time: startTime,
                end_time: endTime,
                slot_duration: config.slotDuration,
                max_capacity_per_slot: config.capacity,
              },
            })
          );
        }
        current.setDate(current.getDate() + 1);
      }

      // Wait for all slot creations
      await Promise.all(createPromises);

      // Reload availability data
      await loadAvailability();

      // Close modal on success
      setIsGenerateModalOpen(false);
    } catch (err) {
      console.error('Error generating slots:', err);
      setSaveError('Failed to generate slots. Some slots may have been created.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle slot deletion
   */
  const handleSlotDelete = async (slotId: string) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await availabilityAPI.deleteSlot(slotId);

      // Update local state
      setAvailabilityData((prev) =>
        prev.map((dayData) => {
          const filteredSlots = dayData.slots.filter((slot) => slot.id !== slotId);
          return {
            ...dayData,
            slots: filteredSlots,
            total_slots: filteredSlots.length,
            available_slots: filteredSlots.reduce((acc, slot) => {
              if (slot.is_available) {
                return acc + Math.max(0, slot.max_capacity - slot.booked_count);
              }
              return acc;
            }, 0),
          };
        }).filter((dayData) => dayData.slots.length > 0)
      );
    } catch (err) {
      console.error('Error deleting slot:', err);
      setSaveError('Failed to delete slot. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle mobile bottom sheet close
   */
  const handleCloseMobileSheet = () => {
    setSelectedDate(null);
    setSelectedDateForMobile(null);
  };

  /**
   * Handle template apply - reload availability data
   */
  const handleTemplateApply = () => {
    loadAvailability();
  };

  /**
   * Handle manage templates click - open template modal
   */
  const handleManageTemplates = () => {
    setEditingTemplate(null);
    setIsTemplateModalOpen(true);
  };

  /**
   * Handle template save
   */
  const handleTemplateSave = (template: SlotTemplate) => {
    setIsTemplateModalOpen(false);
    setEditingTemplate(null);
    // Template is saved, could show a success toast here
    console.log('Template saved:', template.name);
  };

  /**
   * Toggle a date in multi-select mode
   */
  const handleDateToggle = (date: string) => {
    setSelectedDates((prev) => {
      if (prev.includes(date)) {
        return prev.filter((d) => d !== date);
      } else {
        return [...prev, date];
      }
    });
  };

  /**
   * Clear all selected dates
   */
  const handleClearSelection = () => {
    setSelectedDates([]);
  };

  /**
   * Toggle multi-select mode
   */
  const handleToggleMultiSelect = () => {
    setIsMultiSelectMode((prev) => !prev);
    if (isMultiSelectMode) {
      // Exiting multi-select mode, clear selection
      setSelectedDates([]);
    }
    // Clear single date selection when entering multi-select
    setSelectedDate(null);
  };

  /**
   * Handle bulk operation completion
   */
  const handleBulkOperationComplete = (result: {
    success_count: number;
    failed_count: number;
    failed_dates: string[];
    protected_dates: string[];
  }) => {
    // Show result feedback
    if (result.success_count > 0) {
      // Reload availability data
      loadAvailability();
    }

    // If there were protected dates, show a warning
    if (result.protected_dates.length > 0) {
      setError(
        `${result.success_count} date(s) updated. ${result.protected_dates.length} date(s) were protected due to existing bookings.`
      );
    }

    // Clear selection
    setSelectedDates([]);
  };

  // Show loading state while fetching profile
  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-admin-primary/30 border-t-admin-primary rounded-full animate-spin" />
          <span className="text-admin-text-muted">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Show error state if no profile found
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-admin-bg-card rounded-lg border border-admin-border p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-admin-text font-medium mb-2">No Profile Found</h3>
          <p className="text-admin-text-muted text-sm">
            {error || 'Please create a business profile to manage availability.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Availability</h1>
          <p className="text-admin-text-muted mt-1">
            Manage time slots for <span className="font-medium text-admin-text">{profile.name}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex-row sm:flex-col gap-2 w-full sm:w-auto pt-4 sm:pt-0 flex items-center">
          <button
            onClick={handleManageTemplates}
            disabled={isSaving}
            className="flex items-center gap-2 px-2 py-2 bg-admin-bg-card border border-admin-border text-admin-text rounded-lg hover:bg-admin-bg-hover transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Manage Templates
          </button>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-admin-bg-card border border-admin-border text-admin-text rounded-lg hover:bg-admin-bg-hover transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate Slots
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {(error || saveError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700">{error || saveError}</span>
          </div>
          <button
            onClick={() => {
              setError(null);
              setSaveError(null);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="xl:col-span-2">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6 bg-admin-bg-card p-4 rounded-lg border border-admin-border">
            {/* Previous button - always visible */}
            <button
              onClick={goToPreviousMonth}
              className="flex items-center gap-2 px-3 py-2 text-admin-text hover:bg-admin-bg-hover rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Month/Year display - stacked on mobile */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-admin-text font-medium">
              <span>{monthNames[currentMonth]}</span>
              <span>{currentYear}</span>
            </div>

            {/* Next button - always visible */}
            <button
              onClick={goToNextMonth}
              className="flex items-center gap-2 px-3 py-2 text-admin-text hover:bg-admin-bg-hover rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {isLoading ? (
            <div className="bg-admin-bg-card rounded-lg border border-admin-border p-12 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-3 border-admin-primary/30 border-t-admin-primary rounded-full animate-spin" />
                <span className="text-admin-text-muted">Loading availability...</span>
              </div>
            </div>
          ) : (
            <CalendarGrid
              month={currentMonth}
              year={currentYear}
              availabilityData={availabilityData}
              onDayClick={handleDayClick}
              selectedDate={selectedDate || undefined}
              isMultiSelectMode={isMultiSelectMode}
              selectedDates={selectedDates}
              onDateToggle={handleDateToggle}
            />
          )}
        </div>

        {/* Day Details Panel - Only show on xl+ screens when NOT in multi-select mode */}
        {!isMultiSelectMode && (
          <div className="hidden xl:block xl:col-span-1">
            {selectedDate && selectedDayData ? (
              <DaySlotsList
                date={selectedDate}
                slots={selectedDayData.slots}
                profileId={profile.id}
                onSlotToggle={handleSlotToggle}
                onSlotAdd={handleAddSlot}
                onSlotDelete={handleSlotDelete}
                onTemplateApply={handleTemplateApply}
                onManageTemplates={handleManageTemplates}
                isLoading={isSaving}
              />
            ) : selectedDate ? (
              <DaySlotsList
                date={selectedDate}
                slots={[]}
                profileId={profile.id}
                onSlotToggle={handleSlotToggle}
                onSlotAdd={handleAddSlot}
                onSlotDelete={handleSlotDelete}
                onTemplateApply={handleTemplateApply}
                onManageTemplates={handleManageTemplates}
                isLoading={isSaving}
              />
            ) : (
              <div className="bg-admin-bg-card rounded-lg border border-admin-border p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-admin-bg-hover rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-admin-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-admin-text font-medium mb-2">Select a Day</h3>
                <p className="text-admin-text-muted text-sm">
                  Click on a day in the calendar to view and manage its time slots.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Multi-select info panel when in multi-select mode */}
        {isMultiSelectMode && (
          <div className="xl:col-span-1">
            <div className="bg-admin-bg-card rounded-lg border border-admin-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-admin-primary/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-admin-text font-medium">Multi-Select Mode</h3>
                  <p className="text-admin-text-muted text-sm">
                    {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-admin-text-muted">
                <p>• Click on future dates to select/deselect them</p>
                <p>• Past dates cannot be selected</p>
                <p>• Use the action bar below to apply templates or remove slots</p>
                <p>• Dates with bookings are protected from deletion</p>
              </div>

              {selectedDates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-admin-border">
                  <p className="text-sm text-admin-text-muted mb-2">Selected dates:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.slice(0, 10).map((date) => (
                      <span
                        key={date}
                        className="px-2 py-1 bg-admin-primary/20 text-admin-primary text-xs rounded"
                      >
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    ))}
                    {selectedDates.length > 10 && (
                      <span className="px-2 py-1 bg-admin-bg-hover text-admin-text-muted text-xs rounded">
                        +{selectedDates.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      {isMobile && selectedDate && (
        <DaySlotsList
          date={selectedDate}
          slots={selectedDayData?.slots || []}
          profileId={profile.id}
          onSlotToggle={handleSlotToggle}
          onSlotAdd={handleAddSlot}
          onSlotDelete={handleSlotDelete}
          onTemplateApply={handleTemplateApply}
          onManageTemplates={handleManageTemplates}
          isLoading={isSaving}
          isMobileSheet={true}
          onClose={handleCloseMobileSheet}
        />
      )}

      {/* Modals */}
      <SlotEditModal
        slot={editingSlot}
        isOpen={isSlotModalOpen}
        onClose={() => {
          setIsSlotModalOpen(false);
          setEditingSlot(null);
          setSaveError(null);
        }}
        onSave={handleSlotSave}
        isNewSlot={isNewSlot}
        isSaving={isSaving}
        error={saveError}
      />

      <GenerateSlotsModal
        isOpen={isGenerateModalOpen}
        onClose={() => {
          setIsGenerateModalOpen(false);
          setSaveError(null);
        }}
        onGenerate={handleGenerateSlots}
        isSaving={isSaving}
        error={saveError}
      />

      <SlotTemplateModal
        template={editingTemplate}
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleTemplateSave}
        isNew={editingTemplate === null}
      />

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedDates={selectedDates}
        profileId={profile.id}
        onClearSelection={handleClearSelection}
        onOperationComplete={handleBulkOperationComplete}
        isMultiSelectMode={isMultiSelectMode}
        onToggleMultiSelect={handleToggleMultiSelect}
        selectedDate={selectedDate}
      />
    </div>
  );
}

/**
 * Helper: Add minutes to a time string (HH:MM)
 */
function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMins = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMins / 60) % 24;
  const newMins = totalMins % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

/**
 * Helper: Calculate duration between two times in minutes
 */
function calculateDuration(startTime: string, endTime: string): number {
  const [startHours, startMins] = startTime.split(':').map(Number);
  const [endHours, endMins] = endTime.split(':').map(Number);
  const startTotal = startHours * 60 + startMins;
  const endTotal = endHours * 60 + endMins;
  return endTotal - startTotal;
}
