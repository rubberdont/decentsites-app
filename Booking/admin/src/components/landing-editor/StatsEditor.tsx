'use client';

import React from 'react';
import type { SocialStat, SectionConfig } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface StatsEditorProps {
  sectionConfig: SectionConfig;
  stats: SocialStat[];
  onSectionChange: (config: SectionConfig) => void;
  onStatsChange: (stats: SocialStat[]) => void;
}

export default function StatsEditor({ sectionConfig, stats, onSectionChange, onStatsChange }: StatsEditorProps) {
  const addStat = () => {
    if (stats.length >= 6) {
      alert('Maximum 6 stats allowed');
      return;
    }
    const newStat: SocialStat = {
      id: uuidv4(),
      value: '',
      label: '',
      platform: 'custom'
    };
    onStatsChange([...stats, newStat]);
  };

  const updateStat = (id: string, updates: Partial<SocialStat>) => {
    onStatsChange(stats.map(stat => stat.id === id ? { ...stat, ...updates } : stat));
  };

  const removeStat = (id: string) => {
    onStatsChange(stats.filter(stat => stat.id !== id));
  };

  const platforms = [
    { value: 'instagram', label: 'Instagram', icon: '📷' },
    { value: 'facebook', label: 'Facebook', icon: '👥' },
    { value: 'google', label: 'Google', icon: '⭐' },
    { value: 'twitter', label: 'Twitter', icon: '🐦' },
    { value: 'youtube', label: 'YouTube', icon: '📺' },
    { value: 'custom', label: 'Custom', icon: '📊' }
  ];

  return (
    <div className="space-y-6">
      {/* Section Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-admin-text mb-2">
            Section Title
          </label>
          <input
            type="text"
            value={sectionConfig.title}
            onChange={(e) => onSectionChange({ ...sectionConfig, title: e.target.value })}
            className="admin-input"
            placeholder="Trusted by Thousands"
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-text mb-2">
            Section Subtitle
          </label>
          <input
            type="text"
            value={sectionConfig.subtitle}
            onChange={(e) => onSectionChange({ ...sectionConfig, subtitle: e.target.value })}
            className="admin-input"
            placeholder="See what our customers are saying"
            maxLength={200}
          />
        </div>
      </div>

      {/* Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-admin-text">Social Stats ({stats.length}/6)</h3>
          <button
            type="button"
            onClick={addStat}
            disabled={stats.length >= 6}
            className="admin-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Stat
          </button>
        </div>

        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={stat.id} className="admin-card p-4">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium text-admin-text">Stat {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeStat(stat.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Value</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(stat.id, { value: e.target.value })}
                    className="admin-input"
                    placeholder="5,000+"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(stat.id, { label: e.target.value })}
                    className="admin-input"
                    placeholder="Happy Customers"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Platform</label>
                  <select
                    value={stat.platform}
                    onChange={(e) => updateStat(stat.id, { platform: e.target.value as SocialStat['platform'] })}
                    className="admin-input"
                  >
                    {platforms.map(platform => (
                      <option key={platform.value} value={platform.value}>
                        {platform.icon} {platform.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}