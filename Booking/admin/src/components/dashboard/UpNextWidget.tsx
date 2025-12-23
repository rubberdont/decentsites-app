import React from 'react';
import { Booking } from '@/types';
import { format } from 'date-fns';

interface UpNextWidgetProps {
    booking: Booking | null;
    loading: boolean;
    onCheckIn?: (id: string) => void;
    onCall?: (booking: Booking) => void;
}

const UpNextWidget: React.FC<UpNextWidgetProps> = ({ booking, loading, onCheckIn, onCall }) => {
    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm animate-pulse border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between mb-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium">All Caught Up!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No upcoming bookings for today.</p>
            </div>
        );
    }

    // Calculate relative time or display time
    const startTime = booking.time_slot ? booking.time_slot.split('-')[0] : format(new Date(booking.booking_date), 'HH:mm');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 mb-6 shadow-sm border-l-4 border-indigo-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-bl-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                UP NEXT
            </div>

            <div className="flex flex-col">
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{startTime}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.service_name || 'Service'}
                    </span>
                </div>

                <div className="mt-2 text-lg font-medium text-gray-800 dark:text-gray-200">
                    {booking.user_name || 'Unknown Customer'}
                </div>

                {booking.notes && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750 p-2 rounded border border-gray-100 dark:border-gray-700 italic">
                        "{booking.notes}"
                    </div>
                )}

                <div className="mt-4 flex gap-3">
                    <button
                        onClick={() => onCheckIn && onCheckIn(booking.id)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Check In
                    </button>

                    <button
                        onClick={() => onCall && onCall(booking)}
                        className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpNextWidget;
