'use client';

import React from 'react';
import type { HeroConfig } from '@/types';
import CTAButtonEditor from './CTAButtonEditor';
import ImageUploader from './ImageUploader';

interface HeroEditorProps {
  config: HeroConfig;
  onChange: (config: HeroConfig) => void;
}

export default function HeroEditor({ config, onChange }: HeroEditorProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-admin-text mb-2">
            Hero Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            className="admin-input"
            placeholder="Crafting Style, One Cut at a Time."
            maxLength={100}
            required
          />
          <p className="text-xs text-admin-text-muted mt-1">{config.title.length}/100 characters</p>
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-admin-text mb-2">
            Hero Subtitle <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={config.subtitle}
            onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
            className="admin-input"
            placeholder="The Premier Grooming Experience"
            maxLength={200}
            required
          />
          <p className="text-xs text-admin-text-muted mt-1">{config.subtitle.length}/200 characters</p>
        </div>
      </div>

      {/* Background Image */}
      <ImageUploader
        value={config.background_image_url}
        onChange={(url) => onChange({ ...config, background_image_url: url })}
        label="Background Image"
        aspectRatio="16:9"
      />

      {/* CTA Button */}
      <CTAButtonEditor
        config={config.cta_button}
        onChange={(cta_button) => onChange({ ...config, cta_button })}
        label="Hero Call-to-Action Button"
      />
    </div>
  );
}