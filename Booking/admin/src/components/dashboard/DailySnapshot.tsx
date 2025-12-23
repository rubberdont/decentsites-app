import React from 'react';
import { DashboardStats } from '@/types';

interface DailySnapshotProps {
    stats: DashboardStats | null;
    loading: boolean;
}

const DailySnapshot: React.FC<DailySnapshotProps> = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm animate-pulse border border-gray-100 dark:border-gray-700">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 mb-6 shadow-md text-white">
            <h2 className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-3">
                Today's Snapshot
            </h2>
            <div className="grid grid-cols-3 gap-2 divide-x divide-white/20">
                <div className="text-center px-1">
                    <div className="text-xl font-bold">
                        {stats?.today_bookings || 0}
                    </div>
                    <div className="text-[10px] opacity-80 leading-tight mt-1">
                        Bookings
                    </div>
                </div>
                <div className="text-center px-1">
                    <div className="text-xl font-bold">
                        ₱{(stats?.total_revenue || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] opacity-80 leading-tight mt-1">
                        Est. Revenue
                    </div>
                </div>
                <div className="text-center px-1">
                    <div className="text-xl font-bold text-yellow-100">
                        {stats?.pending_bookings || 0}
                    </div>
                    <div className="text-[10px] opacity-80 leading-tight mt-1">
                        Pending
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailySnapshot;
