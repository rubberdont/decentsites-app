'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  gradient?: boolean;
}

export default function Card({
  children,
  className = '',
  hoverable = true,
  gradient = false,
}: CardProps) {
  const baseClasses =
    'bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300';

  const hoverClasses = hoverable ? 'hover:shadow-2xl' : '';

  const gradientClass = gradient
    ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900'
    : '';

  const finalClassName = `${baseClasses} ${hoverClasses} ${gradientClass} ${className}`;

  return <div className={finalClassName}>{children}</div>;
}
