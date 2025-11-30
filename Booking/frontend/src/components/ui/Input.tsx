'use client';

import React from 'react';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType;
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  type = 'text',
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random()}`;

  const baseClasses =
    'w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent bg-[#2a2a2a] text-[#eaeaea] border-[#444444] placeholder:text-[#a0a0a0]';

  const borderClasses = error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-[#444444]';

  const finalClassName = `${baseClasses} ${borderClasses} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[#a0a0a0] mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={finalClassName}
        {...props}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-[#a0a0a0] mt-1">{helperText}</p>
      )}
    </div>
  );
}
