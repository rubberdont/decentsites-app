export const formatBookingDate = (date: Date): string => {
  return date.toISOString();
};

export const formatDisplayDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isDateInFuture = (date: Date): boolean => {
  return date > new Date();
};

export const formatTime12Hour = (timeSlot: string): string => {
  if (!timeSlot || typeof timeSlot !== 'string') return timeSlot;
  
  const [start, end] = timeSlot.split('-');
  if (!start || !end) return timeSlot;
  
  const formatPart = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  return `${formatPart(start)} - ${formatPart(end)}`;
};

/**
 * Check if a date string represents today
 */
export const isToday = (dateStr: string): boolean => {
  const today = new Date();
  const checkDate = new Date(dateStr);
  return (
    checkDate.getFullYear() === today.getFullYear() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getDate() === today.getDate()
  );
};

/**
 * Check if a time slot (HH:MM-HH:MM) has passed for today
 */
export const isTimeSlotPast = (timeSlot: string): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const [startTime] = timeSlot.split('-');
  const [startHour, startMinute] = startTime.split(':').map(Number);
  
  return (
    currentHour > startHour ||
    (currentHour === startHour && currentMinute >= startMinute)
  );
};

/**
 * Check if a date/time combination is in the past
 */
export const isPastDateTime = (dateStr: string, timeSlot: string): boolean => {
  const selectedDate = new Date(dateStr);
  const today = new Date();
  
  // Reset time to compare dates only
  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // If date is in the past
  if (selectedDate < today) {
    return true;
  }
  
  // If date is today, check if time slot has passed
  if (selectedDate.getTime() === today.getTime()) {
    return isTimeSlotPast(timeSlot);
  }
  
  // Future date
  return false;
};

/**
 * Get today's date in YYYY-MM-DD format for date picker min attribute
 */
export const getMinDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};