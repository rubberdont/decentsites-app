'use client';

import React, { useEffect, useRef } from 'react';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    booking_ref: string;
    booking_id: string;
    booking_date: string;
    profile_name: string;
    service_name?: string;
  };
}

export default function BookingConfirmationModal({
  isOpen,
  onClose,
  bookingData,
}: BookingConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Format booking date for display
  const formatBookingDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-confirmation-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-auto transform transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h2
                id="booking-confirmation-title"
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                Booking Confirmed!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your booking has been successfully created
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Reference - Prominently displayed */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Booking Reference
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <code className="text-2xl font-bold text-gray-900 dark:text-white tracking-wider">
                {bookingData.booking_ref}
              </code>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Please save this reference for future inquiries
            </p>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Booking Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date & Time:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatBookingDate(bookingData.booking_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Service Provider:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {bookingData.profile_name}
                </span>
              </div>
              {bookingData.service_name && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Service:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {bookingData.service_name}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Booking ID:</span>
                <span className="text-gray-900 dark:text-white font-medium text-sm">
                  {bookingData.booking_id}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium">What happens next?</p>
                <p className="mt-1">
                  You will receive a confirmation email shortly. The service provider may contact you to confirm details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Navigate to bookings page - this would be implemented based on routing
              console.log('Navigate to My Bookings');
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}