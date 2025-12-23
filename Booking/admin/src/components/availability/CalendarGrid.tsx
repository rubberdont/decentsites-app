'use client';

import { useMemo } from 'react';
import { DateAvailability } from '@/types';

interface CalendarGridProps {
  /** Current month (0-11) */
  month: number;
  /** Current year */
  year: number;
  /** Availability data for the month */
  availabilityData: DateAvailability[];
  /** Callback when a day is clicked */
  onDayClick: (date: string) => void;
  /** Currently selected date (for single-select mode) */
  selectedDate?: string;
  /** Whether multi-select mode is active */
  isMultiSelectMode?: boolean;
  /** Array of selected dates in multi-select mode */
  selectedDates?: string[];
  /** Callback when a date is toggled in multi-select mode */
  onDateToggle?: (date: string) => void;
}

/**
 * Get the status color for a day based on availability
 */
function getAvailabilityColor(availability: DateAvailability | undefined, isPast: boolean, isToday: boolean): string {
  if (isPast && !isToday) {
    return 'bg-admin-bg-hover/50 text-admin-text-dark';
  }
  
  if (!availability || availability.total_slots === 0) {
    return 'bg-admin-bg-card text-admin-text-muted';
  }
  
  const availableRatio = availability.available_slots / availability.total_slots;
  
  if (availableRatio === 0) {
    // Fully booked - red
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  } else if (availableRatio < 0.3) {
    // Few slots - yellow/amber
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  } else {
    // Available - green
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  }
}

/**
 * Get the dot color for mobile view based on availability
 */
function getDotColor(availability: DateAvailability | undefined, isPast: boolean, isToday: boolean): string {
  if (isPast && !isToday) {
    return 'bg-gray-400';
  }
  
  if (!availability || availability.total_slots === 0) {
    return 'bg-gray-400';
  }
  
  const availableRatio = availability.available_slots / availability.total_slots;
  
  if (availableRatio === 0) {
    // Fully booked - red
    return 'bg-red-500';
  } else if (availableRatio < 0.3) {
    // Few slots - yellow/amber
    return 'bg-amber-500';
  } else {
    // Available - green
    return 'bg-green-500';
  }
}

/**
 * CalendarGrid component for displaying monthly availability
 * Shows each day with slot counts and color-coded availability status
 * Supports both single-select and multi-select modes
 */
export function CalendarGrid({
  month,
  year,
  availabilityData,
  onDayClick,
  selectedDate,
  isMultiSelectMode = false,
  selectedDates = [],
  onDateToggle,
}: CalendarGridProps) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  /**
   * Generate calendar days for the month
   */
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];
    
    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ date: dateStr, day, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ date: dateStr, day, isCurrentMonth: true });
    }
    
    // Add days from next month to complete the last week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let day = 1; day <= remainingDays; day++) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        days.push({ date: dateStr, day, isCurrentMonth: false });
      }
    }
    
    return days;
  }, [month, year]);
  
  /**
   * Create a map of date to availability for quick lookup
   */
  const availabilityMap = useMemo(() => {
    const map: Record<string, DateAvailability> = {};
    availabilityData.forEach((data) => {
      map[data.date] = data;
    });
    return map;
  }, [availabilityData]);
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  return (
    <div className="bg-admin-bg-card rounded-lg border border-admin-border overflow-hidden">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 bg-admin-bg-hover/50">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-sm font-medium text-admin-text-muted border-b border-admin-border"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Days */}
      <div className="grid grid-cols-7">
        {calendarDays.map((dayInfo, index) => {
          const availability = availabilityMap[dayInfo.date];
          const isToday = dayInfo.date === todayStr;
          const isPast = dayInfo.date < todayStr;
          const isSelected = isMultiSelectMode 
            ? selectedDates.includes(dayInfo.date)
            : dayInfo.date === selectedDate;
          const colorClass = getAvailabilityColor(availability, isPast, isToday);
          const isPastInMultiSelect = isMultiSelectMode && isPast;
          
          return (
            <button
              key={`${dayInfo.date}-${index}`}
              onClick={() => {
                if (!dayInfo.isCurrentMonth) return;
                if (isMultiSelectMode && onDateToggle) {
                  // Don't allow selecting past dates in multi-select mode
                  if (dayInfo.date < todayStr) return;
                  onDateToggle(dayInfo.date);
                } else {
                  onDayClick(dayInfo.date);
                }
              }}
              disabled={!dayInfo.isCurrentMonth || (isMultiSelectMode && dayInfo.date < todayStr)}
              className={`
                relative h-16 md:h-32 p-1 md:p-2 border-b border-r border-admin-border
                transition-all duration-150 text-left
                ${dayInfo.isCurrentMonth 
                  ? isPastInMultiSelect
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-admin-bg-hover cursor-pointer' 
                  : 'opacity-40 cursor-default'
                }
                ${isSelected 
                  ? isMultiSelectMode 
                    ? 'ring-2 ring-admin-primary ring-inset bg-admin-primary/10' 
                    : 'ring-2 ring-admin-primary ring-inset'
                  : ''
                }
              `}
            >
              {/* Multi-select checkbox */}
              {isMultiSelectMode && dayInfo.isCurrentMonth && dayInfo.date >= todayStr && (
                <div className="absolute top-1 right-1">
                  <div className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                    ${selectedDates.includes(dayInfo.date)
                      ? 'bg-admin-primary border-admin-primary'
                      : 'border-admin-border bg-admin-bg-card hover:border-admin-primary/50'
                    }
                  `}>
                    {selectedDates.includes(dayInfo.date) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              )}

              {/* Day Number */}
              <div className={`
                flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1
                ${isToday 
                  ? 'bg-admin-primary text-white' 
                  : dayInfo.isCurrentMonth 
                    ? 'text-admin-text' 
                    : 'text-admin-text-dark'
                }
              `}>
                {dayInfo.day}
              </div>
              
              {/* Availability Info */}
              {dayInfo.isCurrentMonth && availability && (
                <>
                  {/* Mobile: Color dots */}
                  <div className="mt-1 block md:hidden">
                    <div className={`w-1.5 h-1.5 rounded-full mx-auto ${getDotColor(availability, isPast, isToday)}`}></div>
                  </div>
                  {/* Desktop: Text badges */}
                  <div className={`
                    hidden md:block mt-1 px-2 py-1 rounded text-xs font-medium border
                    ${colorClass}
                  `}>
                    <div className="flex items-center gap-1">
                      <span>{availability.available_slots}/{availability.total_slots}</span>
                      <span className="hidden sm:inline">slots</span>
                    </div>
                  </div>
                </>
              )}
              
              {/* No slots indicator */}
              {dayInfo.isCurrentMonth && !availability && !isPast && (
                <>
                  <div className="mt-1 block md:hidden">
                    <div className="w-1.5 h-1.5 rounded-full mx-auto bg-gray-400"></div>
                  </div>
                  <div className="hidden md:block mt-1 px-2 py-1 rounded text-xs text-admin-text-dark">
                    No slots
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 py-3 bg-admin-bg-hover/30 border-t border-admin-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-admin-text-muted">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-xs text-admin-text-muted">Few Slots</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-admin-text-muted">Fully Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span className="text-xs text-admin-text-muted">Past</span>
        </div>
      </div>
    </div>
  );
}

export default CalendarGrid;
