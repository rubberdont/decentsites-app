'use client';

import React, { useState, useMemo } from 'react';

interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  minDate?: Date;
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Calendar component for date selection
 * Dark themed with gold accent for selected date
 */
export default function BookingCalendar({
  selectedDate,
  onDateChange,
  minDate = new Date(),
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Get calendar days for current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for first day (0 = Sunday)
    const startDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentMonth]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Check if a date is before min date (disabled)
  const isDateDisabled = (date: Date): boolean => {
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const compareMinDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    return compareDate < compareMinDate;
  };

  // Check if date is selected
  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  // Check if we can go to previous month
  const canGoPrevious = useMemo(() => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    return prevMonth >= minMonth;
  }, [currentMonth, minDate]);

  return (
    <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] p-4">
      {/* Header with month/year and navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          disabled={!canGoPrevious}
          className={`
            p-2 rounded-lg transition-colors
            ${canGoPrevious 
              ? 'hover:bg-white/10 text-[#eaeaea]' 
              : 'text-[#444444] cursor-not-allowed'
            }
          `}
          aria-label="Previous month"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 className="text-[#eaeaea] font-semibold text-lg">
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>

        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-white/10 text-[#eaeaea] transition-colors"
          aria-label="Next month"
        >
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
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map((day, index) => (
          <div
            key={index}
            className="text-center text-[#a0a0a0] text-sm font-medium py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const disabled = isDateDisabled(date);
          const selected = isDateSelected(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => !disabled && onDateChange(date)}
              disabled={disabled}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                transition-all duration-200
                ${disabled
                  ? 'text-[#a0a0a0] cursor-not-allowed opacity-40'
                  : selected
                    ? 'bg-[#d4af37] text-[#1a1a1a] font-bold'
                    : 'text-[#eaeaea] hover:bg-white/10'
                }
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
