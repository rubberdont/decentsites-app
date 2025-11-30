'use client';

import { useState } from 'react';

interface GenerateSlotsConfig {
  startDate: string;
  endDate: string;
  startHour: number;
  endHour: number;
  slotDuration: number;
  capacity: number;
  daysOfWeek: number[];
}

interface GenerateSlotsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when generate is clicked */
  onGenerate: (config: GenerateSlotsConfig) => void;
  /** Whether generation is in progress */
  isSaving?: boolean;
  /** External error message to display */
  error?: string | null;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

/**
 * Get date 7 days from now in YYYY-MM-DD format
 */
function getNextWeekString(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const slotDurations = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

/**
 * GenerateSlotsModal component for bulk slot generation
 */
export function GenerateSlotsModal({
  isOpen,
  onClose,
  onGenerate,
  isSaving = false,
  error: externalError = null,
}: GenerateSlotsModalProps) {
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getNextWeekString());
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);
  const [slotDuration, setSlotDuration] = useState(30);
  const [capacity, setCapacity] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri by default
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Combine local and external errors
  const error = externalError || localError;
  
  /**
   * Toggle a day of week
   */
  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day].sort();
    });
  };
  
  /**
   * Calculate estimated slots to be generated
   */
  const estimateSlots = (): number => {
    if (!startDate || !endDate || daysOfWeek.length === 0) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let dayCount = 0;
    const current = new Date(start);
    
    while (current <= end) {
      if (daysOfWeek.includes(current.getDay())) {
        dayCount++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    const hoursPerDay = endHour - startHour;
    const slotsPerDay = Math.floor((hoursPerDay * 60) / slotDuration);
    
    return dayCount * slotsPerDay;
  };
  
  /**
   * Handle generate button click
   */
  const handleGenerate = () => {
    // Validate dates
    if (startDate > endDate) {
      setLocalError('End date must be after start date');
      return;
    }
    
    if (daysOfWeek.length === 0) {
      setLocalError('Please select at least one day of the week');
      return;
    }
    
    if (startHour >= endHour) {
      setLocalError('End hour must be after start hour');
      return;
    }
    
    if (capacity < 1 || capacity > 100) {
      setLocalError('Capacity must be between 1 and 100');
      return;
    }
    
    onGenerate({
      startDate,
      endDate,
      startHour,
      endHour,
      slotDuration,
      capacity,
      daysOfWeek,
    });
    // Don't close here - let parent handle closing after successful generation
  };
  
  /**
   * Handle keyboard events
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const estimatedSlots = estimateSlots();
  
  // Generate hour options
  const hourOptions = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-admin-bg-card rounded-lg shadow-admin-dropdown border border-admin-border w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-admin-border sticky top-0 bg-admin-bg-card">
          <h3 className="text-lg font-semibold text-admin-text">
            Generate Time Slots
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
        <div className="p-4 space-y-5">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                min={getTodayString()}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setLocalError(null);
                }}
                disabled={isSaving}
                className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setLocalError(null);
                }}
                disabled={isSaving}
                className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary transition-colors disabled:opacity-50"
              />
            </div>
          </div>
          
          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Start Hour
              </label>
              <select
                value={startHour}
                onChange={(e) => {
                  setStartHour(Number(e.target.value));
                  setLocalError(null);
                }}
                disabled={isSaving}
                className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary transition-colors disabled:opacity-50"
              >
                {hourOptions.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                End Hour
              </label>
              <select
                value={endHour}
                onChange={(e) => {
                  setEndHour(Number(e.target.value));
                  setLocalError(null);
                }}
                disabled={isSaving}
                className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary transition-colors disabled:opacity-50"
              >
                {hourOptions.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Slot Duration */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Slot Duration
            </label>
            <select
              value={slotDuration}
              onChange={(e) => {
                setSlotDuration(Number(e.target.value));
                setLocalError(null);
              }}
              disabled={isSaving}
              className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary transition-colors disabled:opacity-50"
            >
              {slotDurations.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Capacity per Slot
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={capacity}
              onChange={(e) => {
                setCapacity(Number(e.target.value));
                setLocalError(null);
              }}
              disabled={isSaving}
              className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary transition-colors disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-admin-text-muted">
              Maximum appointments per time slot
            </p>
          </div>
          
          {/* Days of Week */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Days of Week
            </label>
            <div className="flex flex-wrap gap-2">
              {dayNames.map((name, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    toggleDay(index);
                    setLocalError(null);
                  }}
                  disabled={isSaving}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50
                    ${daysOfWeek.includes(index)
                      ? 'bg-admin-primary text-white'
                      : 'bg-admin-bg-hover text-admin-text-muted hover:text-admin-text'
                    }
                  `}
                >
                  {name.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Estimate */}
          <div className="p-3 bg-admin-bg-hover rounded-lg">
            <div className="flex items-center gap-2 text-admin-text">
              <svg className="w-5 h-5 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                Estimated: {estimatedSlots.toLocaleString()} time slots
              </span>
            </div>
            <p className="mt-1 text-xs text-admin-text-muted ml-7">
              across {daysOfWeek.length} day{daysOfWeek.length !== 1 ? 's' : ''} per week
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-admin-border sticky bottom-0 bg-admin-bg-card">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-bg-hover rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isSaving || estimatedSlots === 0}
            className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isSaving ? 'Generating...' : estimatedSlots > 0 ? `Generate ${estimatedSlots} Slots` : 'Generate Slots'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerateSlotsModal;
