'use client';

import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

export default function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-admin-text mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-10 rounded-lg border-2 border-admin-border hover:border-admin-primary transition-colors"
          style={{ backgroundColor: color }}
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="admin-input flex-1"
          placeholder="#d4af37"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
      {isOpen && (
        <div className="mt-3">
          <HexColorPicker color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
}