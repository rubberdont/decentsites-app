'use client';

import React from 'react';
import type { Testimonial, SectionConfig } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface TestimonialsEditorProps {
  sectionConfig: SectionConfig;
  testimonials: Testimonial[];
  onSectionChange: (config: SectionConfig) => void;
  onTestimonialsChange: (testimonials: Testimonial[]) => void;
}

export default function TestimonialsEditor({ sectionConfig, testimonials, onSectionChange, onTestimonialsChange }: TestimonialsEditorProps) {
  const addTestimonial = () => {
    if (testimonials.length >= 6) {
      alert('Maximum 6 testimonials allowed');
      return;
    }
    const newTestimonial: Testimonial = {
      id: uuidv4(),
      quote: '',
      name: '',
      title: ''
    };
    onTestimonialsChange([...testimonials, newTestimonial]);
  };

  const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    onTestimonialsChange(testimonials.map(testimonial => testimonial.id === id ? { ...testimonial, ...updates } : testimonial));
  };

  const removeTestimonial = (id: string) => {
    onTestimonialsChange(testimonials.filter(testimonial => testimonial.id !== id));
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
            placeholder="What Our Customers Say"
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
            placeholder="Real experiences from real customers"
            maxLength={200}
          />
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-admin-text">Testimonials ({testimonials.length}/6)</h3>
          <button
            type="button"
            onClick={addTestimonial}
            disabled={testimonials.length >= 6}
            className="admin-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Testimonial
          </button>
        </div>

        <div className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="admin-card p-4">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium text-admin-text">Testimonial {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeTestimonial(testimonial.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-2">Quote</label>
                  <textarea
                    value={testimonial.quote}
                    onChange={(e) => updateTestimonial(testimonial.id, { quote: e.target.value })}
                    className="admin-input"
                    placeholder="The best grooming experience I've ever had..."
                    rows={3}
                    maxLength={300}
                  />
                  <p className="text-xs text-admin-text-muted mt-1">{testimonial.quote.length}/300 characters</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-admin-text mb-2">Name</label>
                    <input
                      type="text"
                      value={testimonial.name}
                      onChange={(e) => updateTestimonial(testimonial.id, { name: e.target.value })}
                      className="admin-input"
                      placeholder="John Smith"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-admin-text mb-2">Title/Position</label>
                    <input
                      type="text"
                      value={testimonial.title}
                      onChange={(e) => updateTestimonial(testimonial.id, { title: e.target.value })}
                      className="admin-input"
                      placeholder="CEO, Tech Company"
                      maxLength={50}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}