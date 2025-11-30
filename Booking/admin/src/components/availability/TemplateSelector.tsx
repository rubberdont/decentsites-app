'use client';

import { useState, useEffect } from 'react';
import { SlotTemplate } from '@/types';
import { availabilityAPI } from '@/services/api';

interface TemplateSelectorProps {
  /** The date to apply template to */
  date: string;
  /** Profile ID to apply template to */
  profileId: string;
  /** Callback when template is applied */
  onApply: () => void;
  /** Callback to open template management modal */
  onManageTemplates?: () => void;
  /** Whether operations are loading */
  isLoading?: boolean;
}

/**
 * Format time for display
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * TemplateSelector allows users to select and apply a slot template
 */
export function TemplateSelector({
  date,
  profileId,
  onApply,
  onManageTemplates,
  isLoading: externalLoading = false,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<SlotTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [capacity, setCapacity] = useState(1);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await availabilityAPI.getTemplates();
        const loadedTemplates = response.data;
        setTemplates(loadedTemplates);
        
        // Auto-select default template if exists
        const defaultTemplate = loadedTemplates.find((t) => t.is_default);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
        } else if (loadedTemplates.length > 0) {
          setSelectedTemplateId(loadedTemplates[0].id);
        }
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load templates');
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    
    loadTemplates();
  }, []);
  
  /**
   * Handle apply template
   */
  const handleApply = async () => {
    if (!selectedTemplateId) {
      setError('Please select a template');
      return;
    }
    
    setIsApplying(true);
    setError(null);
    
    try {
      await availabilityAPI.applyTemplate(profileId, {
        template_id: selectedTemplateId,
        date: date,
        max_capacity: capacity,
      });
      
      onApply();
      setIsExpanded(false);
    } catch (err: unknown) {
      console.error('Error applying template:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply template. Please try again.';
      setError(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };
  
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const isLoading = externalLoading || isApplying;
  
  if (isLoadingTemplates) {
    return (
      <div className="p-4 bg-admin-bg-hover/30 rounded-lg border border-admin-border">
        <div className="flex items-center gap-2 text-admin-text-muted text-sm">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading templates...
        </div>
      </div>
    );
  }
  
  if (templates.length === 0) {
    return (
      <div className="p-4 bg-admin-bg-hover/30 rounded-lg border border-admin-border border-dashed text-center">
        <div className="w-10 h-10 mx-auto mb-2 bg-admin-bg-hover rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-admin-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-admin-text-muted text-sm mb-3">No templates yet</p>
        {onManageTemplates && (
          <button
            onClick={onManageTemplates}
            className="text-admin-primary hover:text-admin-primary-hover text-sm font-medium"
          >
            Create your first template
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-admin-bg-hover/30 rounded-lg border border-admin-border overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-admin-bg-hover/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-admin-text font-medium text-sm">Apply Template</span>
        </div>
        <svg
          className={`w-5 h-5 text-admin-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-admin-border pt-4">
          {/* Template Select */}
          <div>
            <label className="block text-xs text-admin-text-muted mb-1">Select Template</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text text-sm focus:ring-2 focus:ring-admin-primary/50 disabled:opacity-50"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.slots.length} slots)
                  {template.is_default ? ' ★' : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Preview Selected Template */}
          {selectedTemplate && (
            <div className="text-xs text-admin-text-muted">
              <span className="font-medium">Slots: </span>
              {selectedTemplate.slots.slice(0, 3).map((slot, i) => (
                <span key={i}>
                  {formatTime(slot.start_time)}
                  {i < Math.min(selectedTemplate.slots.length - 1, 2) ? ', ' : ''}
                </span>
              ))}
              {selectedTemplate.slots.length > 3 && (
                <span> +{selectedTemplate.slots.length - 3} more</span>
              )}
            </div>
          )}
          
          {/* Capacity Input */}
          <div>
            <label className="block text-xs text-admin-text-muted mb-1">Capacity per slot</label>
            <input
              type="number"
              min={1}
              max={100}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text text-sm focus:ring-2 focus:ring-admin-primary/50 disabled:opacity-50"
            />
          </div>
          
          {/* Error */}
          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
              {error}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            {onManageTemplates && (
              <button
                onClick={onManageTemplates}
                disabled={isLoading}
                className="text-admin-text-muted hover:text-admin-text text-xs disabled:opacity-50"
              >
                Manage templates
              </button>
            )}
            <button
              onClick={handleApply}
              disabled={isLoading || !selectedTemplateId}
              className="px-4 py-2 bg-admin-primary text-white rounded-lg text-sm hover:bg-admin-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isApplying && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Apply Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateSelector;
