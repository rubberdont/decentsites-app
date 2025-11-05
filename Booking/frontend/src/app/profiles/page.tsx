'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { profilesAPI } from '@/services/api';
import type { BusinessProfile } from '@/types';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await profilesAPI.getAll();
        setProfiles(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch profiles:', err);
        setError('Failed to load profiles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profiles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Business Profiles
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover and book services from our trusted business partners
          </p>
        </div>

        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No profiles available at the moment.
              </p>
              <p className="text-gray-400 dark:text-gray-500 mt-2">
                Check back later for new business listings.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/profiles/${profile.id}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group-hover:scale-105">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                    {profile.image_url ? (
                      <img
                        src={profile.image_url}
                        alt={profile.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                        <span className="text-4xl text-gray-400 dark:text-gray-500">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {profile.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                      {profile.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {profile.services?.length || 0} services
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}