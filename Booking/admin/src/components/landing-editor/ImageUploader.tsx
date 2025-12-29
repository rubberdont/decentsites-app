'use client';

import React, { useState } from 'react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  aspectRatio?: string;
}

export default function ImageUploader({ value, onChange, label, aspectRatio = '16:9' }: ImageUploaderProps) {
  const [inputMode, setInputMode] = useState<'url' | 'file'>('url');

  return (
    <div>
      <label className="block text-sm font-medium text-admin-text mb-2">
        {label}
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            inputMode === 'url'
              ? 'bg-admin-primary text-white'
              : 'bg-admin-bg-hover text-admin-text-muted hover:text-admin-text'
          }`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setInputMode('file')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            inputMode === 'file'
              ? 'bg-admin-primary text-white'
              : 'bg-admin-bg-hover text-admin-text-muted hover:text-admin-text'
          }`}
        >
          Upload File
        </button>
      </div>

      {/* URL Input */}
      {inputMode === 'url' && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="admin-input"
          placeholder="https://example.com/image.jpg"
        />
      )}

      {/* File Upload */}
      {inputMode === 'file' && (
        <div className="border-2 border-dashed border-admin-border rounded-lg p-6 text-center hover:border-admin-primary transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // For now, show a message that file upload needs to be configured
                alert('File upload feature requires backend storage configuration. Please use URL input for now.');
              }
            }}
            className="hidden"
            id={`file-upload-${label}`}
          />
          <label htmlFor={`file-upload-${label}`} className="cursor-pointer">
            <svg className="w-12 h-12 text-admin-text-muted mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-admin-text-muted text-sm">Click to upload or drag and drop</p>
            <p className="text-admin-text-muted text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
          </label>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-3">
          <p className="text-xs text-admin-text-muted mb-2">Preview:</p>
          <div className={`relative w-full rounded-lg overflow-hidden bg-admin-bg-hover ${aspectRatio === '3:4' ? 'aspect-[3/4]' : 'aspect-video'}`}>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
        </div>
      )}
    </div>
  );
}