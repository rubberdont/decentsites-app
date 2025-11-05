'use client';

import { useState } from 'react';
import Calendar from '@/components/Calendar';

export default function CalendarDemo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Example disabled dates (next 3 days)
  const disabledDates = Array.from({ length: 3 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Calendar Component Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            A reusable, accessible date picker component
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic Calendar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Calendar
            </h2>
            <Calendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>

          {/* Calendar with Constraints */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Calendar with Disabled Dates
            </h2>
            <Calendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              disabledDates={disabledDates}
              maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
            />
          </div>
        </div>

        {/* Selected Date Display */}
        {selectedDate && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Selected Date
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <button
              onClick={() => setSelectedDate(null)}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Features List */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Features
          </h2>
          <ul className="grid md:grid-cols-2 gap-3 text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Fully accessible with ARIA labels
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Keyboard navigation support
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mobile responsive design
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Dark mode support
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Date constraints (min/max dates)
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Custom disabled dates
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Today indicator
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Month navigation
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}