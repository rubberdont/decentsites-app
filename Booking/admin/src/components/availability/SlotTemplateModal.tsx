'use client';

import { useState, useEffect } from 'react';
import { SlotTemplate, TemplateSlot, SlotTemplateCreate, SlotTemplateUpdate, GenerateTemplatePreview } from '@/types';
import { availabilityAPI } from '@/services/api';

interface SlotTemplateModalProps {
  /** Template being edited (null for new) */
  template: SlotTemplate | null;
  /** Whether modal is open */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Save callback with new/updated template */
  onSave: (template: SlotTemplate) => void;
  /** Whether this is for creating a new template */
  isNew?: boolean;
}

/**
 * Format time for display (e.g., "09:00" -> "9:00 AM")
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * SlotTemplateModal for creating and editing slot templates
 */
export function SlotTemplateModal({
  template,
  isOpen,
  onClose,
  onSave,
  isNew = false,
}: SlotTemplateModalProps) {
  // Form state
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [breakStart, setBreakStart] = useState('');
  const [breakEnd, setBreakEnd] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [previewSlots, setPreviewSlots] = useState<TemplateSlot[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset form when modal opens or template changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setPreviewSlots(template.slots);
      setIsDefault(template.is_default);
      // Reset generator fields
      setStartTime('09:00');
      setEndTime('17:00');
      setSlotDuration(30);
      setBreakStart('');
      setBreakEnd('');
    } else {
      setName('');
      setPreviewSlots([]);
      setIsDefault(false);
      setStartTime('09:00');
      setEndTime('17:00');
      setSlotDuration(30);
      setBreakStart('');
      setBreakEnd('');
    }
    setError(null);
  }, [template, isOpen]);
  
  /**
   * Generate preview slots from time config
   */
  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const request: GenerateTemplatePreview = {
        start_time: startTime,
        end_time: endTime,
        slot_duration: slotDuration,
      };
      
      if (breakStart && breakEnd) {
        request.break_start = breakStart;
        request.break_end = breakEnd;
      }
      
      const response = await availabilityAPI.generateTemplatePreview(request);
      setPreviewSlots(response.data);
    } catch (err) {
      console.error('Error generating preview:', err);
      setError('Failed to generate preview. Please check your time settings.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  /**
   * Handle save
   */
  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      setError('Please enter a template name');
      return;
    }
    
    if (previewSlots.length === 0) {
      setError('Please generate at least one time slot');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let savedTemplate: SlotTemplate;
      
      if (template) {
        // Update existing
        const updateData: SlotTemplateUpdate = {
          name: name.trim(),
          slots: previewSlots,
          is_default: isDefault,
        };
        const response = await availabilityAPI.updateTemplate(template.id, updateData);
        savedTemplate = response.data;
      } else {
        // Create new
        const createData: SlotTemplateCreate = {
          name: name.trim(),
          slots: previewSlots,
          is_default: isDefault,
        };
        const response = await availabilityAPI.createTemplate(createData);
        savedTemplate = response.data;
      }
      
      onSave(savedTemplate);
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Failed to save template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Remove a slot from preview
   */
  const handleRemoveSlot = (index: number) => {
    setPreviewSlots((prev) => prev.filter((_, i) => i !== index));
  };
  
  if (!isOpen) return null;
  
  // Generate time options
  const timeOptions: string[] = [];
  for (let hour = 0; hour <= 23; hour++) {
    for (const minute of [0, 30]) {
      timeOptions.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }
  
  const durationOptions = [15, 30, 45, 60, 90, 120];
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-admin-bg-card rounded-lg shadow-admin-dropdown border border-admin-border w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-admin-border flex-shrink-0">
          <h3 className="text-lg font-semibold text-admin-text">
            {isNew ? 'Create Slot Template' : 'Edit Slot Template'}
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
        
        {/* Body - Scrollable */}
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Regular Workday, Weekends"
              className="w-full px-4 py-3 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text placeholder-admin-text-muted focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary transition-colors"
            />
          </div>
          
          {/* Time Slot Generator */}
          <div className="p-4 bg-admin-bg-hover/30 rounded-lg border border-admin-border">
            <h4 className="text-sm font-medium text-admin-text mb-4">Generate Time Slots</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Start Time */}
              <div>
                <label className="block text-xs text-admin-text-muted mb-1">Start Time</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text text-sm focus:ring-2 focus:ring-admin-primary/50"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>{formatTime(time)}</option>
                  ))}
                </select>
              </div>
              
              {/* End Time */}
              <div>
                <label className="block text-xs text-admin-text-muted mb-1">End Time</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text text-sm focus:ring-2 focus:ring-admin-primary/50"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>{formatTime(time)}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Slot Duration */}
              <div>
                <label className="block text-xs text-admin-text-muted mb-1">Slot Duration</label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text text-sm focus:ring-2 focus:ring-admin-primary/50"
                >
                  {durationOptions.map((duration) => (
                    <option key={duration} value={duration}>{duration} min</option>
                  ))}
                </select>
              </div>
              
              {/* Break Start */}
              <div>
                <label className="block text-xs text-admin-text-muted mb-1">Break Start (optional)</label>
                <select
                  value={breakStart}
                  onChange={(e) => setBreakStart(e.target.value)}
                  className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text text-sm focus:ring-2 focus:ring-admin-primary/50"
                >
                  <option value="">No break</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>{formatTime(time)}</option>
                  ))}
                </select>
              </div>
              
              {/* Break End */}
              <div>
                <label className="block text-xs text-admin-text-muted mb-1">Break End (optional)</label>
                <select
                  value={breakEnd}
                  onChange={(e) => setBreakEnd(e.target.value)}
                  disabled={!breakStart}
                  className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text text-sm focus:ring-2 focus:ring-admin-primary/50 disabled:opacity-50"
                >
                  <option value="">No break</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>{formatTime(time)}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={handleGeneratePreview}
              disabled={isGenerating}
              className="w-full px-4 py-2 bg-admin-bg-card border border-admin-border text-admin-text rounded-lg hover:bg-admin-bg-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generate Slots
                </>
              )}
            </button>
          </div>
          
          {/* Preview Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-admin-text">
                Time Slots Preview
              </label>
              <span className="text-xs text-admin-text-muted">
                {previewSlots.length} slot{previewSlots.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {previewSlots.length === 0 ? (
              <div className="p-6 bg-admin-bg-hover/30 rounded-lg border border-admin-border border-dashed text-center">
                <p className="text-admin-text-muted text-sm">
                  No slots yet. Use the generator above to create time slots.
                </p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-admin-border rounded-lg divide-y divide-admin-border">
                {previewSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-2 hover:bg-admin-bg-hover/50"
                  >
                    <span className="text-admin-text text-sm">
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </span>
                    <button
                      onClick={() => handleRemoveSlot(index)}
                      className="p-1 text-admin-text-muted hover:text-red-400 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Set as Default */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-admin-bg-hover peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-admin-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
            </label>
            <div>
              <span className="text-admin-text text-sm font-medium">Set as default template</span>
              <p className="text-admin-text-muted text-xs">This template will be pre-selected when adding slots</p>
            </div>
          </div>
          
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-admin-border flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-bg-hover rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || previewSlots.length === 0}
            className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isNew ? 'Create Template' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SlotTemplateModal;
