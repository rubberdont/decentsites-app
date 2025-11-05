'use client';

import React, { useState } from 'react';
import BookingConfirmationModal from './BookingConfirmationModal';

// Example component demonstrating how to use BookingConfirmationModal
export default function BookingConfirmationModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const exampleBookingData = {
    booking_ref: 'BK-2025-001234',
    booking_id: '65f4a8b3c1d2e3f4a5b6c7d8',
    booking_date: '2025-11-15T14:30:00Z',
    profile_name: 'John Doe Photography',
    service_name: 'Portrait Session',
  };

  return (
    <div className="p-8">
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Show Booking Confirmation
      </button>

      <BookingConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookingData={exampleBookingData}
      />
    </div>
  );
}