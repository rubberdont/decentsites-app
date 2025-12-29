'use client';

import React from 'react';
import type { CTAButtonConfig } from '@/types';

interface CTAButtonEditorProps {
  config: CTAButtonConfig;
  onChange: (config: CTAButtonConfig) => void;
  label?: string;
}

export default function CTAButtonEditor({ config, onChange, label = 'Call-to-Action Button' }: CTAButtonEditorProps) {
  return (
    <div className="border border-admin-border rounded-lg p-6 bg-admin-bg-hover">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-admin-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="text-lg font-semibold text-admin-text">{label} (Required)</h3>
      </div>

      <div className="space-y-4">
        {/* Button Text */}
        <div>
          <label className="block text-sm font-medium text-admin-text mb-2">
            Button Text <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={config.text}
            onChange={(e) => onChange({ ...config, text: e.target.value })}
            className="admin-input"
            placeholder="Book Now"
            maxLength={30}
            required
          />
          <p className="text-xs text-admin-text-muted mt-1">{config.text.length}/30 characters</p>
        </div>

        {/* Button Style */}
        <div>
          <label className="block text-sm font-medium text-admin-text mb-2">
            Button Style
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...config, style: 'solid' })}
              className={`p-3 rounded-lg border-2 transition-all ${
                config.style === 'solid'
                  ? 'border-admin-primary bg-admin-primary/10'
                  : 'border-admin-border hover:border-admin-primary/50'
              }`}
            >
              <div className="text-center">
                <div className="w-full h-8 bg-[#d4af37] rounded flex items-center justify-center text-black text-sm font-bold mb-1">
                  Solid
                </div>
                <span className="text-xs text-admin-text-muted">Solid</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...config, style: 'outline' })}
              className={`p-3 rounded-lg border-2 transition-all ${
                config.style === 'outline'
                  ? 'border-admin-primary bg-admin-primary/10'
                  : 'border-admin-border hover:border-admin-primary/50'
              }`}
            >
              <div className="text-center">
                <div className="w-full h-8 border-2 border-[#d4af37] rounded flex items-center justify-center text-[#d4af37] text-sm font-bold mb-1">
                  Outline
                </div>
                <span className="text-xs text-admin-text-muted">Outline</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...config, style: 'gradient' })}
              className={`p-3 rounded-lg border-2 transition-all ${
                config.style === 'gradient'
                  ? 'border-admin-primary bg-admin-primary/10'
                  : 'border-admin-border hover:border-admin-primary/50'
              }`}
            >
              <div className="text-center">
                <div className="w-full h-8 bg-gradient-to-r from-[#d4af37] to-[#c9a432] rounded flex items-center justify-center text-black text-sm font-bold mb-1">
                  Gradient
                </div>
                <span className="text-xs text-admin-text-muted">Gradient</span>
              </div>
            </button>
          </div>
        </div>

        {/* Button Size */}
        <div>
          <label className="block text-sm font-medium text-admin-text mb-2">
            Button Size
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...config, size: 'default' })}
              className={`p-3 rounded-lg border-2 transition-all ${
                config.size === 'default'
                  ? 'border-admin-primary bg-admin-primary/10'
                  : 'border-admin-border hover:border-admin-primary/50'
              }`}
            >
              <div className="text-center">
                <div className="w-full h-10 bg-admin-border rounded flex items-center justify-center text-admin-text text-sm font-bold mb-1">
                  Default
                </div>
                <span className="text-xs text-admin-text-muted">Default (48px)</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...config, size: 'large' })}
              className={`p-3 rounded-lg border-2 transition-all ${
                config.size === 'large'
                  ? 'border-admin-primary bg-admin-primary/10'
                  : 'border-admin-border hover:border-admin-primary/50'
              }`}
            >
              <div className="text-center">
                <div className="w-full h-12 bg-admin-border rounded flex items-center justify-center text-admin-text text-sm font-bold mb-1">
                  Large
                </div>
                <span className="text-xs text-admin-text-muted">Large (56px)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-400 font-medium">Links to: /book</p>
            <p className="text-xs text-blue-300/80 mt-1">This button always directs customers to your booking page and cannot be changed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}