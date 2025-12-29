'use client';

import React from 'react';
import type { BrandingConfig } from '@/types';
import ColorPicker from './ColorPicker';
import ImageUploader from './ImageUploader';

interface BrandingEditorProps {
  config: BrandingConfig;
  onChange: (config: BrandingConfig) => void;
}

export default function BrandingEditor({ config, onChange }: BrandingEditorProps) {
  return (
    <div className="space-y-6">
      {/* Logo */}
      <ImageUploader
        value={config.logo_url || ''}
        onChange={(url) => onChange({ ...config, logo_url: url })}
        label="Logo Image"
        aspectRatio="3:4"
      />

      {/* Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorPicker
          color={config.primary_color}
          onChange={(primary_color) => onChange({ ...config, primary_color })}
          label="Primary Color"
        />
        <ColorPicker
          color={config.dark_bg_color}
          onChange={(dark_bg_color) => onChange({ ...config, dark_bg_color })}
          label="Dark Background Color"
        />
        <ColorPicker
          color={config.light_bg_color}
          onChange={(light_bg_color) => onChange({ ...config, light_bg_color })}
          label="Light Background Color"
        />
      </div>

      {/* Color Preview */}
      <div>
        <h3 className="text-lg font-semibold text-admin-text mb-4">Color Preview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg mb-2 border-2 border-admin-border"
              style={{ backgroundColor: config.primary_color }}
            />
            <p className="text-sm text-admin-text-muted">Primary</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg mb-2 border-2 border-admin-border"
              style={{ backgroundColor: config.dark_bg_color }}
            />
            <p className="text-sm text-admin-text-muted">Dark BG</p>
          </div>
          <div className="text-center">
            <div
              className="w-full h-16 rounded-lg mb-2 border-2 border-admin-border"
              style={{ backgroundColor: config.light_bg_color }}
            />
            <p className="text-sm text-admin-text-muted">Light BG</p>
          </div>
        </div>
      </div>
    </div>
  );
}