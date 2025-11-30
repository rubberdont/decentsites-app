'use client';

import { useState, useEffect } from 'react';
import { SlotTemplate } from '@/types';
import { availabilityAPI } from '@/services/api';

interface BulkActionBarProps {
  /** Array of selected date strings (YYYY-MM-DD) */
  selectedDates: string[];
  /** Profile ID for bulk operations */
  profileId: string;
  /** Callback when selection should be cleared */
  onClearSelection: () => void;
  /** Callback when bulk operation completes */
  onOperationComplete: (result: {
    success_count: number;
    failed_count: number;
    failed_dates: string[];
    protected_dates: string[];
  }) => void;
  /** Whether multi-select mode is active */
  isMultiSelectMode: boolean;
  /** Toggle multi-select mode */
  onToggleMultiSelect: () => void;
}

/**
 * BulkActionBar - Floating action bar for bulk operations on selected dates
 * Appears at the bottom of the screen when dates are selected
 */
export function BulkActionBar({
  selectedDates,
  profileId,
  onClearSelection,
  onOperationComplete,
  isMultiSelectMode,
  onToggleMultiSelect,
}: BulkActionBarProps) {
  const [templates, setTemplates] = useState<SlotTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [maxCapacity, setMaxCapacity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load templates when component mounts
   */
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await availabilityAPI.getTemplates();
        setTemplates(response.data);
        // Set default template if one exists
        const defaultTemplate = response.data.find(t => t.is_default);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
        } else if (response.data.length > 0) {
          setSelectedTemplateId(response.data[0].id);
        }
      } catch (err) {
        console.error('Error loading templates:', err);
      }
    };

    loadTemplates();
  }, []);

  /**
   * Handle apply template to selected dates
   */
  const handleApplyTemplate = async () => {
    if (!selectedTemplateId || selectedDates.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await availabilityAPI.bulkApplyTemplate(profileId, {
        template_id: selectedTemplateId,
        dates: selectedDates,
        max_capacity: maxCapacity,
      });

      onOperationComplete(response.data);
      setShowTemplateDropdown(false);
    } catch (err) {
      console.error('Error applying template:', err);
      setError('Failed to apply template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle remove slots from selected dates
   */
  const handleRemoveSlots = async () => {
    if (selectedDates.length === 0) return;

    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to remove all slots from ${selectedDates.length} selected date(s)?\n\nNote: Dates with existing bookings will be protected and won't be modified.`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await availabilityAPI.bulkDeleteSlots(profileId, {
        dates: selectedDates,
      });

      onOperationComplete(response.data);
    } catch (err) {
      console.error('Error removing slots:', err);
      setError('Failed to remove slots. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if not in multi-select mode
  if (!isMultiSelectMode) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={onToggleMultiSelect}
          className="flex items-center gap-2 px-4 py-2.5 bg-admin-primary text-white rounded-full shadow-lg hover:bg-admin-primary/90 transition-all hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Multi-Select Mode
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-admin-bg-card border-t border-admin-border shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Error message */}
        {error && (
          <div className="mb-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          {/* Left: Selection info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-admin-primary/20 flex items-center justify-center">
                <span className="text-admin-primary font-bold">{selectedDates.length}</span>
              </div>
              <div>
                <div className="text-admin-text font-medium">
                  {selectedDates.length === 0 ? 'No dates selected' : `${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''} selected`}
                </div>
                <div className="text-admin-text-muted text-sm">
                  Click dates on the calendar to select
                </div>
              </div>
            </div>

            {selectedDates.length > 0 && (
              <button
                onClick={onClearSelection}
                className="text-admin-text-muted hover:text-admin-text text-sm underline"
              >
                Clear selection
              </button>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Template Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                disabled={selectedDates.length === 0 || isLoading || templates.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Apply Template
                <svg className={`w-4 h-4 transition-transform ${showTemplateDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showTemplateDropdown && (
                <div className="absolute bottom-full mb-2 right-0 w-72 bg-admin-bg-card border border-admin-border rounded-lg shadow-xl p-4">
                  <div className="space-y-4">
                    {/* Template selector */}
                    <div>
                      <label className="block text-sm text-admin-text-muted mb-1">Select Template</label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary"
                      >
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name} ({template.slots.length} slots)
                            {template.is_default && ' ★'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Capacity input */}
                    <div>
                      <label className="block text-sm text-admin-text-muted mb-1">Max Capacity per Slot</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={maxCapacity}
                        onChange={(e) => setMaxCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary"
                      />
                    </div>

                    {/* Apply button */}
                    <button
                      onClick={handleApplyTemplate}
                      disabled={!selectedTemplateId || isLoading}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          Apply to {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Remove Slots Button */}
            <button
              onClick={handleRemoveSlots}
              disabled={selectedDates.length === 0 || isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              Remove Slots
            </button>

            {/* Exit Multi-Select */}
            <button
              onClick={() => {
                onClearSelection();
                onToggleMultiSelect();
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-admin-bg-hover text-admin-text rounded-lg hover:bg-admin-border transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkActionBar;
