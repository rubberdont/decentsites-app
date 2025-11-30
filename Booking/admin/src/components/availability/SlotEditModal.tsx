'use client';

import { useState, useEffect } from 'react';
import { AvailabilitySlot } from '@/types';

interface SlotEditModalProps {
  /** The slot being edited (null for creating new slot) */
  slot: AvailabilitySlot | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when save is clicked */
  onSave: (slotId: string | null, capacity: number, timeSlot?: string) => void;
  /** Whether this is for adding a new slot */
  isNewSlot?: boolean;
  /** Whether save operation is in progress */
  isSaving?: boolean;
  /** External error message to display */
  error?: string | null;
}

/**
 * Format time slot for display
 */
function formatTimeSlot(timeSlot: string): string {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * SlotEditModal component for editing slot capacity
 */
export function SlotEditModal({
  slot,
  isOpen,
  onClose,
  onSave,
  isNewSlot = false,
  isSaving = false,
  error: externalError = null,
}: SlotEditModalProps) {
  const [capacity, setCapacity] = useState(1);
  const [timeSlot, setTimeSlot] = useState('09:00');
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Combine local and external errors
  const error = externalError || localError;
  
  // Reset form when modal opens/closes or slot changes
  useEffect(() => {
    if (slot) {
      setCapacity(slot.max_capacity);
      setTimeSlot(slot.time_slot);
    } else {
      setCapacity(1);
      setTimeSlot('09:00');
    }
    setLocalError(null);
  }, [slot, isOpen]);
  
  /**
   * Handle save button click
   */
  const handleSave = () => {
    // Validate capacity
    if (capacity < 1) {
      setLocalError('Capacity must be at least 1');
      return;
    }
    
    if (capacity > 100) {
      setLocalError('Capacity cannot exceed 100');
      return;
    }
    
    // For existing slots, check if new capacity is less than booked count
    if (slot && capacity < slot.booked_count) {
      setLocalError(`Capacity cannot be less than ${slot.booked_count} (current bookings)`);
      return;
    }
    
    onSave(slot?.id || null, capacity, isNewSlot ? timeSlot : undefined);
    // Don't close here - let parent handle closing after successful save
  };
  
  /**
   * Handle keyboard events
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  // Generate time slot options (every 30 minutes from 6 AM to 10 PM)
  const timeOptions: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 22 && minute === 30) break;
      timeOptions.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-admin-bg-card rounded-lg shadow-admin-dropdown border border-admin-border w-full max-w-md mx-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-admin-border">
          <h3 className="text-lg font-semibold text-admin-text">
            {isNewSlot ? 'Add Time Slot' : 'Edit Time Slot'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-admin-text-muted hover:text-admin-text hover:bg-admin-bg-hover rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Time Slot Display/Select */}
          {isNewSlot ? (
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Time Slot
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-4 py-3 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary transition-colors"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {formatTimeSlot(time)}
                  </option>
                ))}
              </select>
            </div>
          ) : slot && (
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Time Slot
              </label>
              <div className="px-4 py-3 bg-admin-bg-hover rounded-lg text-admin-text-muted">
                {formatTimeSlot(slot.time_slot)}
              </div>
            </div>
          )}
          
          {/* Capacity Input */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Maximum Capacity
            </label>
            <input
              type="number"
              min={slot ? slot.booked_count : 1}
              max={100}
              value={capacity}
              onChange={(e) => {
                setCapacity(Number(e.target.value));
                setLocalError(null);
              }}
              disabled={isSaving}
              className="w-full px-4 py-3 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary transition-colors disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-admin-text-muted">
              Maximum number of appointments that can be booked for this time slot.
            </p>
          </div>
          
          {/* Current Bookings Info */}
          {slot && slot.booked_count > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-amber-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium">
                  {slot.booked_count} booking{slot.booked_count !== 1 ? 's' : ''} already made
                </span>
              </div>
              <p className="mt-1 text-xs text-amber-400/80">
                Capacity cannot be reduced below the current number of bookings.
              </p>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-admin-border">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-bg-hover rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isNewSlot ? 'Add Slot' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SlotEditModal;
