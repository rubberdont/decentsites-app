'use client';

import React from 'react';
import type { PortfolioItem, SectionConfig } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface PortfolioEditorProps {
  sectionConfig: SectionConfig;
  items: PortfolioItem[];
  onSectionChange: (config: SectionConfig) => void;
  onItemsChange: (items: PortfolioItem[]) => void;
}

export default function PortfolioEditor({ sectionConfig, items, onSectionChange, onItemsChange }: PortfolioEditorProps) {
  const addItem = () => {
    if (items.length >= 8) {
      alert('Maximum 8 portfolio items allowed');
      return;
    }
    const newItem: PortfolioItem = {
      id: uuidv4(),
      image_url: '',
      title: '',
      alt_text: ''
    };
    onItemsChange([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<PortfolioItem>) => {
    onItemsChange(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

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
            placeholder="Our Work"
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
            placeholder="A gallery of our finest cuts"
            maxLength={200}
          />
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-admin-text">Portfolio Items ({items.length}/8)</h3>
          <button
            type="button"
            onClick={addItem}
            disabled={items.length >= 8}
            className="admin-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="admin-card p-4">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium text-admin-text">Item {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Image URL</label>
                  <input
                    type="url"
                    value={item.image_url}
                    onChange={(e) => updateItem(item.id, { image_url: e.target.value })}
                    className="admin-input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    className="admin-input"
                    placeholder="Classic Fade"
                    maxLength={50}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-admin-text mb-2">Alt Text</label>
                  <input
                    type="text"
                    value={item.alt_text}
                    onChange={(e) => updateItem(item.id, { alt_text: e.target.value })}
                    className="admin-input"
                    placeholder="Description for accessibility"
                    maxLength={100}
                  />
                </div>
              </div>
              {item.image_url && (
                <div className="mt-3">
                  <img src={item.image_url} alt={item.alt_text} className="w-32 h-40 object-cover rounded-lg" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}