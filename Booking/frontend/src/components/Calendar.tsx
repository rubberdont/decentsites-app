'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';

interface CalendarProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateChange,
  minDate = new Date(),
  maxDate,
  disabledDates = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Get today's date at start of day for comparison
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Navigation functions
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
    setFocusedDate(new Date());
  }, []);

  // Check if a date is disabled
  const isDateDisabled = useCallback((date: Date): boolean => {
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    
    // Check if before min date
    if (dateCopy < minDate) return true;
    
    // Check if after max date
    if (maxDate && dateCopy > maxDate) return true;
    
    // Check if in disabled dates
    return disabledDates.some(disabledDate => {
      const disabledDateCopy = new Date(disabledDate);
      disabledDateCopy.setHours(0, 0, 0, 0);
      return dateCopy.getTime() === disabledDateCopy.getTime();
    });
  }, [minDate, maxDate, disabledDates]);

  // Generate calendar grid
  const getCalendarDays = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first day of the week that contains the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    // End at the last day of the week that contains the last day of the month
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [currentMonth]);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    if (isDateDisabled(date)) return;
    
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    
    // Toggle selection if same date is clicked
    if (selectedDate && selectedDate.getTime() === dateCopy.getTime()) {
      onDateChange(null);
    } else {
      onDateChange(dateCopy);
    }
    
    setFocusedDate(dateCopy);
  }, [selectedDate, onDateChange, isDateDisabled]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, date: Date) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const newDate = new Date(date);

    switch (event.key) {
      case 'ArrowLeft':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'ArrowRight':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'ArrowUp':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'ArrowDown':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'Enter':
      case ' ':
        handleDateSelect(date);
        return;
    }

    // Ensure the new date is within valid range
    if (!isDateDisabled(newDate)) {
      setFocusedDate(newDate);
      
      // Update current month if needed
      if (newDate.getMonth() !== currentMonth.getMonth() || 
          newDate.getFullYear() !== currentMonth.getFullYear()) {
        setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      }
    }
  }, [currentMonth, handleDateSelect, isDateDisabled]);

  // Focus management
  useEffect(() => {
    if (!focusedDate && selectedDate) {
      setFocusedDate(selectedDate);
    } else if (!focusedDate) {
      setFocusedDate(today);
    }
  }, [focusedDate, selectedDate, today]);

  // Format helpers
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatDay = (date: Date): string => {
    return date.getDate().toString();
  };

  const isToday = (date: Date): boolean => {
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  };

  const days = getCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div 
      ref={calendarRef}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md mx-auto"
      role="application"
      aria-label="Calendar"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:ring-offset-2"
          aria-label="Previous month"
          type="button"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatMonthYear(currentMonth)}
          </h2>
          <button
            onClick={goToToday}
            className="text-sm text-[#14B8A6] dark:text-[#5EEAD4] hover:text-[#0F9488] dark:hover:text-[#14B8A6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#14B8A6] rounded px-2 py-1"
            type="button"
          >
            Today
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:ring-offset-2"
          aria-label="Next month"
          type="button"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div 
            key={day}
            className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date) => {
          const disabled = isDateDisabled(date);
          const selected = isSelected(date);
          const isTodayDate = isToday(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          const isFocused = focusedDate && 
            date.getDate() === focusedDate.getDate() && 
            date.getMonth() === focusedDate.getMonth() && 
            date.getFullYear() === focusedDate.getFullYear();

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              onKeyDown={(e) => handleKeyDown(e, date)}
              className={`
                relative h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:ring-offset-2 focus:z-10
                ${disabled 
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                  : isCurrentMonthDate 
                    ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700' 
                    : 'text-gray-400 dark:text-gray-600'
                }
                ${selected 
                  ? 'bg-[#14B8A6] text-white hover:bg-[#0F9488]' 
                  : ''
                }
                ${isFocused && !selected 
                  ? 'ring-2 ring-[#14B8A6] ring-inset' 
                  : ''
                }
              `}
              disabled={disabled}
              aria-label={`${formatDay(date)} ${formatMonthYear(date)}${selected ? ', selected' : ''}${isTodayDate ? ', today' : ''}${disabled ? ', unavailable' : ''}`}
              data-selected={selected}
              aria-disabled={disabled}
              tabIndex={isFocused ? 0 : -1}
              type="button"
            >
              {formatDay(date)}
              {isTodayDate && !selected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#14B8A6] dark:bg-[#5EEAD4] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date display */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selected: <span className="font-medium text-gray-900 dark:text-white">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Calendar;