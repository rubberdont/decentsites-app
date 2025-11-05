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