'use client';

import React from 'react';

/**
 * Date range preset options
 */
export type DateRangePreset = '7d' | '30d' | '90d' | 'custom';

/**
 * Props for the DateRangeFilter component
 */
interface DateRangeFilterProps {
  selectedRange: DateRangePreset;
  onRangeChange: (range: DateRangePreset) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomDateChange?: (startDate: string, endDate: string) => void;
}

/**
 * Date range preset configuration
 */
const presets: { value: DateRangePreset; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: 'custom', label: 'Custom' },
];

/**
 * DateRangeFilter - Filter component for selecting date ranges
 * Provides preset options (7d, 30d, 90d) and custom date picker
 */
export function DateRangeFilter({
  selectedRange,
  onRangeChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Preset range buttons */}
      <div className="flex items-center gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onRangeChange(preset.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedRange === preset.value
                ? 'bg-admin-primary text-white'
                : 'admin-btn-secondary'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom date pickers - only show when custom is selected */}
      {selectedRange === 'custom' && onCustomDateChange && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-admin-text-muted">From:</label>
            <input
              type="date"
              value={customStartDate || ''}
              onChange={(e) =>
                onCustomDateChange(e.target.value, customEndDate || '')
              }
              className="admin-input w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-admin-text-muted">To:</label>
            <input
              type="date"
              value={customEndDate || ''}
              onChange={(e) =>
                onCustomDateChange(customStartDate || '', e.target.value)
              }
              className="admin-input w-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangeFilter;
