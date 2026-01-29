// ============================================================================
// Admin Portal Date Formatting Utilities
// ============================================================================

import { format, isToday as dateFnsIsToday, isFuture as dateFnsIsFuture, isPast as dateFnsIsPast, parseISO } from 'date-fns';

/**
 * Format a date string to "Nov 30, 2025" format
 * @param date - ISO date string or Date object
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Format a date string to "Nov 30, 2025 at 2:00 PM" format
 * @param date - ISO date string or Date object
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "MMM d, yyyy 'at' h:mm a");
}

/**
 * Convert 24-hour time string to 12-hour format
 * @param time - Time string in "HH:mm" format (e.g., "14:00")
 * @returns Time in "2:00 PM" format
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return time; // Return original if invalid
  }
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Convert a time slot range to 12-hour format
 * @param slot - Time slot in "HH:mm-HH:mm" format (e.g., "14:00-15:00")
 * @returns Time slot in "2:00 PM - 3:00 PM" format
 */
export function formatTimeSlot(slot: string): string {
  const parts = slot.split('-');
  
  if (parts.length !== 2) {
    return slot; // Return original if invalid format
  }
  
  const [startTime, endTime] = parts;
  return `${formatTime(startTime.trim())} - ${formatTime(endTime.trim())}`;
}

/**
 * Convert a time slot range to 12-hour format (alias for formatTimeSlot)
 * @param slot - Time slot in "HH:mm-HH:mm" format (e.g., "14:00-15:00")
 * @returns Time slot in "2:00 PM - 3:00 PM" format
 */
export function formatTime12Hour(slot: string): string {
  return formatTimeSlot(slot);
}

/**
 * Check if a date is today
 * @param date - ISO date string or Date object
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsIsToday(dateObj);
}

/**
 * Check if a date is in the future
 * @param date - ISO date string or Date object
 */
export function isFuture(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsIsFuture(dateObj);
}

/**
 * Check if a date is in the past
 * @param date - ISO date string or Date object
 */
export function isPast(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateFnsIsPast(dateObj);
}

/**
 * Format date for display with relative context
 * @param date - ISO date string or Date object
 * @returns "Today", "Tomorrow", or formatted date
 */
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (dateFnsIsToday(dateObj)) {
    return 'Today';
  }
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(dateObj);
  checkDate.setHours(0, 0, 0, 0);
  
  if (checkDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }
  
  return formatDate(dateObj);
}

/**
 * Format a date for API requests (YYYY-MM-DD)
 * @param date - Date object
 */
export function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get the start of today as ISO string
 */
export function getStartOfToday(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}

/**
 * Get the end of today as ISO string
 */
export function getEndOfToday(): string {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today.toISOString();
}

/**
 * Calculate duration between two times in minutes
 * @param startTime - Start time in "HH:mm" format
 * @param endTime - End time in "HH:mm" format
 */
export function getDurationMinutes(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  return endTotalMinutes - startTotalMinutes;
}

/**
 * Format duration in minutes to human-readable string
 * @param minutes - Duration in minutes
 * @returns "1h 30m" or "45m" format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Check if a time slot has passed (for today only)
 * @param timeSlot Format: "14:00-14:45"
 */
export function isTimeSlotPast(timeSlot: string): boolean {
  const now = new Date();
  const [startTime] = timeSlot.split('-');
  const [hours, minutes] = startTime.split(':').map(Number);
  
  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);
  
  return slotTime < now;
}

/**
 * Check if a date/time combination is in the past
 */
export function isPastDateTime(dateStr: string, timeSlot: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const selectedDate = new Date(dateStr);
  selectedDate.setHours(0, 0, 0, 0);
  
  // Past date
  if (selectedDate < today) {
    return true;
  }
  
  // Today - check time
  if (isToday(dateStr)) {
    return isTimeSlotPast(timeSlot);
  }
  
  // Future date
  return false;
}

/**
 * Get minimum date for date picker (today in YYYY-MM-DD format)
 */
export function getMinDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
