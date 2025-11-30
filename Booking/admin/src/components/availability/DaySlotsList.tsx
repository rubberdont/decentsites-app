'use client';

import { AvailabilitySlot } from '@/types';
import { TemplateSelector } from './TemplateSelector';

interface DaySlotsListProps {
  /** The date being displayed */
  date: string;
  /** List of time slots for the day */
  slots: AvailabilitySlot[];
  /** Profile ID for applying templates */
  profileId?: string;
  /** Callback when slot toggle is changed */
  onSlotToggle: (slotId: string, isAvailable: boolean) => void;
  /** Callback when add slot button is clicked */
  onSlotAdd: () => void;
  /** Callback when delete button is clicked */
  onSlotDelete?: (slotId: string) => void;
  /** Callback when template is applied */
  onTemplateApply?: () => void;
  /** Callback to open template management */
  onManageTemplates?: () => void;
  /** Whether operations are in progress */
  isLoading?: boolean;
}

/**
 * Format time slot for display (e.g., "09:00-10:00" -> "9:00 AM")
 */
function formatTimeSlot(timeSlot: string): string {
  // Extract start time from time range (e.g., "09:00-10:00" -> "09:00")
  const startTime = timeSlot.split('-')[0].trim();
  const [hours, minutes] = startTime.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Get status badge styles based on slot status
 */
function getStatusStyles(slot: AvailabilitySlot): { bg: string; text: string; label: string } {
  if (!slot.is_available) {
    return { bg: 'bg-admin-text-dark/20', text: 'text-admin-text-dark', label: 'Disabled' };
  }
  
  const remaining = slot.max_capacity - slot.booked_count;
  
  if (remaining === 0) {
    return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Full' };
  } else {
    return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Available' };
  }
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * DaySlotsList component for displaying and managing time slots for a specific day
 */
export function DaySlotsList({
  date,
  slots,
  profileId,
  onSlotToggle,
  onSlotAdd,
  onSlotDelete,
  onTemplateApply,
  onManageTemplates,
  isLoading = false,
}: DaySlotsListProps) {
  // Sort slots by time
  const sortedSlots = [...slots].sort((a, b) => a.time_slot.localeCompare(b.time_slot));
  
  return (
    <div className="space-y-4">
      {/* Template Selector - Only show if profile ID is available and we have the callbacks */}
      {profileId && onTemplateApply && (
        <TemplateSelector
          date={date}
          profileId={profileId}
          onApply={onTemplateApply}
          onManageTemplates={onManageTemplates}
          isLoading={isLoading}
        />
      )}
      
      {/* Main Card */}
      <div className="bg-admin-bg-card rounded-lg border border-admin-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-admin-border">
          <div>
            <h3 className="text-lg font-semibold text-admin-text">
              {formatDate(date)}
            </h3>
            <p className="text-sm text-admin-text-muted mt-1">
              {slots.length} time slot{slots.length !== 1 ? 's' : ''} configured
            </p>
          </div>
          <button
            onClick={onSlotAdd}
            className="flex items-center gap-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Slot
          </button>
        </div>
        
        {/* Slots List */}
        <div className="divide-y divide-admin-border">
          {sortedSlots.length === 0 ? (
            /* Empty State */
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-admin-bg-hover rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-admin-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-admin-text font-medium mb-2">No time slots configured</h4>
              <p className="text-admin-text-muted text-sm mb-4">
                Use a template above or add individual slots to allow bookings.
              </p>
              <button
                onClick={onSlotAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add First Slot
              </button>
            </div>
          ) : (
            sortedSlots.map((slot) => {
              const status = getStatusStyles(slot);
              
              return (
                <div
                  key={slot.id}
                  className={`
                    flex items-center justify-between p-4 
                    ${!slot.is_available ? 'bg-admin-bg-hover/30' : ''}
                  `}
                >
                   {/* Time & Status */}
                   <div className="flex items-center gap-4">
                     {/* Time */}
                     <div className="w-24">
                       <span className={`
                         text-lg font-medium
                         ${slot.is_available ? 'text-admin-text' : 'text-admin-text-dark'}
                       `}>
                         {formatTimeSlot(slot.time_slot)}
                       </span>
                     </div>
                     
                     {/* Status Badge */}
                     <span className={`px-2 py-1 rounded text-xs font-medium ${status.bg} ${status.text}`}>
                       {status.label}
                     </span>
                   </div>
                  
                   {/* Actions */}
                   <div className="flex items-center gap-3">
                     {/* Toggle Switch */}
                     <label className="relative inline-flex items-center cursor-pointer">
                       <input
                         type="checkbox"
                         checked={slot.is_available}
                         onChange={(e) => onSlotToggle(slot.id, e.target.checked)}
                         disabled={isLoading}
                         className="sr-only peer"
                       />
                       <div className="w-11 h-6 bg-admin-bg-hover peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-admin-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary peer-disabled:opacity-50"></div>
                     </label>
                     
                     {/* Delete Button */}
                     {onSlotDelete && slot.booked_count === 0 && (
                       <button
                         onClick={() => onSlotDelete(slot.id)}
                         disabled={isLoading}
                         className="p-2 text-admin-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                         title="Delete slot"
                       >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                       </button>
                     )}
                   </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Summary Footer */}
        {sortedSlots.length > 0 && (
          <div className="p-4 bg-admin-bg-hover/30 border-t border-admin-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-admin-text-muted">
                Total capacity: {slots.reduce((acc, s) => acc + s.max_capacity, 0)} | 
                Booked: {slots.reduce((acc, s) => acc + s.booked_count, 0)} | 
                Available: {slots.reduce((acc, s) => acc + (s.is_available ? s.max_capacity - s.booked_count : 0), 0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DaySlotsList;
