'use client';

import React from 'react';
import type { FooterConfig } from '@/types';

interface FooterEditorProps {
  config: FooterConfig;
  onChange: (config: FooterConfig) => void;
}

export default function FooterEditor({ config, onChange }: FooterEditorProps) {
  const updateSocialLink = (platform: keyof FooterConfig['social_links'], value: string) => {
    onChange({
      ...config,
      social_links: {
        ...config.social_links,
        [platform]: value
      }
    });
  };

  const updateHours = (index: number, value: string) => {
    const newHours = [...config.hours];
    newHours[index] = value;
    onChange({ ...config, hours: newHours });
  };

  const addHour = () => {
    if (config.hours.length >= 7) {
      alert('Maximum 7 hours entries allowed');
      return;
    }
    onChange({ ...config, hours: [...config.hours, ''] });
  };

  const removeHour = (index: number) => {
    onChange({ ...config, hours: config.hours.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Business Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-admin-text mb-2">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={config.business_name}
            onChange={(e) => onChange({ ...config, business_name: e.target.value })}
            className="admin-input"
            placeholder="Your Business Name"
            maxLength={100}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-text mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={config.phone}
            onChange={(e) => onChange({ ...config, phone: e.target.value })}
            className="admin-input"
            placeholder="(555) 123-4567"
            maxLength={20}
            required
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-admin-text mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          value={config.address}
          onChange={(e) => onChange({ ...config, address: e.target.value })}
          className="admin-input"
          placeholder="123 Main Street&#10;City, State 12345"
          rows={3}
          maxLength={200}
          required
        />
        <p className="text-xs text-admin-text-muted mt-1">{config.address.length}/200 characters</p>
      </div>

      {/* Hours */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-admin-text">Business Hours ({config.hours.length}/7)</h3>
          <button
            type="button"
            onClick={addHour}
            disabled={config.hours.length >= 7}
            className="admin-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Hours
          </button>
        </div>

        <div className="space-y-2">
          {config.hours.map((hour, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={hour}
                onChange={(e) => updateHours(index, e.target.value)}
                className="admin-input flex-1"
                placeholder="Monday - Friday: 9:00 AM - 7:00 PM"
                maxLength={50}
              />
              <button
                type="button"
                onClick={() => removeHour(index)}
                className="text-red-500 hover:text-red-600 transition-colors p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="text-lg font-semibold text-admin-text mb-4">Social Media Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Instagram URL
            </label>
            <input
              type="url"
              value={config.social_links.instagram || ''}
              onChange={(e) => updateSocialLink('instagram', e.target.value)}
              className="admin-input"
              placeholder="https://instagram.com/yourbusiness"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Facebook URL
            </label>
            <input
              type="url"
              value={config.social_links.facebook || ''}
              onChange={(e) => updateSocialLink('facebook', e.target.value)}
              className="admin-input"
              placeholder="https://facebook.com/yourbusiness"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              Twitter URL
            </label>
            <input
              type="url"
              value={config.social_links.twitter || ''}
              onChange={(e) => updateSocialLink('twitter', e.target.value)}
              className="admin-input"
              placeholder="https://twitter.com/yourbusiness"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-text mb-2">
              YouTube URL
            </label>
            <input
              type="url"
              value={config.social_links.youtube || ''}
              onChange={(e) => updateSocialLink('youtube', e.target.value)}
              className="admin-input"
              placeholder="https://youtube.com/@yourbusiness"
            />
          </div>
        </div>
      </div>
    </div>
  );
}