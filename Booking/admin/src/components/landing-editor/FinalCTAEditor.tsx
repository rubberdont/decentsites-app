'use client';

import React from 'react';
import type { FinalCTAConfig } from '@/types';
import CTAButtonEditor from './CTAButtonEditor';

interface FinalCTAEditorProps {
  config: FinalCTAConfig;
  onChange: (config: FinalCTAConfig) => void;
}

export default function FinalCTAEditor({ config, onChange }: FinalCTAEditorProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-admin-text mb-2">
            Call-to-Action Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            className="admin-input"
            placeholder="Ready to Book Your Appointment?"
            maxLength={100}
            required
          />
          <p className="text-xs text-admin-text-muted mt-1">{config.title.length}/100 characters</p>
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-admin-text mb-2">
            Call-to-Action Subtitle <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={config.subtitle}
            onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
            className="admin-input"
            placeholder="Join thousands of satisfied customers"
            maxLength={200}
            required
          />
          <p className="text-xs text-admin-text-muted mt-1">{config.subtitle.length}/200 characters</p>
        </div>
      </div>

      {/* Background Style */}
      <div>
        <label className="block text-sm font-medium text-admin-text mb-2">
          Background Style
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...config, background_style: 'default' })}
            className={`p-3 rounded-lg border-2 transition-all ${
              config.background_style === 'default'
                ? 'border-admin-primary bg-admin-primary/10'
                : 'border-admin-border hover:border-admin-primary/50'
            }`}
          >
            <div className="text-center">
              <div className="w-full h-12 bg-admin-bg rounded flex items-center justify-center text-admin-text text-sm font-bold mb-1">
                Default
              </div>
              <span className="text-xs text-admin-text-muted">Default</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...config, background_style: 'accent' })}
            className={`p-3 rounded-lg border-2 transition-all ${
              config.background_style === 'accent'
                ? 'border-admin-primary bg-admin-primary/10'
                : 'border-admin-border hover:border-admin-primary/50'
            }`}
          >
            <div className="text-center">
              <div className="w-full h-12 bg-[#d4af37] rounded flex items-center justify-center text-black text-sm font-bold mb-1">
                Accent
              </div>
              <span className="text-xs text-admin-text-muted">Accent</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...config, background_style: 'gradient' })}
            className={`p-3 rounded-lg border-2 transition-all ${
              config.background_style === 'gradient'
                ? 'border-admin-primary bg-admin-primary/10'
                : 'border-admin-border hover:border-admin-primary/50'
            }`}
          >
            <div className="text-center">
              <div className="w-full h-12 bg-gradient-to-r from-[#d4af37] to-[#c9a432] rounded flex items-center justify-center text-black text-sm font-bold mb-1">
                Gradient
              </div>
              <span className="text-xs text-admin-text-muted">Gradient</span>
            </div>
          </button>
        </div>
      </div>

      {/* CTA Button */}
      <CTAButtonEditor
        config={config.cta_button}
        onChange={(cta_button) => onChange({ ...config, cta_button })}
        label="Final Call-to-Action Button"
      />
    </div>
  );
}