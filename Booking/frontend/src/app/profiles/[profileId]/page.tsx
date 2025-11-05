'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { profilesAPI, bookingsAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Calendar from '@/components/Calendar';
import BookingConfirmationModal from '@/components/BookingConfirmationModal';
import type { BusinessProfile, Service, BookingCreate, BookingRefResponse } from '@/types';

export default function ProfileDetailPage() {
  const params = useParams();
  const profileId = params.profileId as string;
  
  const { isAuthenticated } = useAuth();
  
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Booking form state
  const [selectedService, setSelectedService] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState<string>('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingReference, setBookingReference] = useState<BookingRefResponse | null>(null);
  const [confirmedBookingDate, setConfirmedBookingDate] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await profilesAPI.getById(profileId);
        setProfile(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || !bookingDate) return;
    
    try {
      setBookingLoading(true);
      
      const bookingData: BookingCreate = {
        profile_id: profile.id,
        service_id: selectedService || undefined,
        booking_date: bookingDate.toISOString(),
        notes: notes || undefined,
      };
      
      const response = await bookingsAPI.create(bookingData);
      
      // Capture booking reference from response and store the booking date
      setBookingReference(response.data);
      setConfirmedBookingDate(bookingDate.toISOString());
      
      // Reset form
      setSelectedService('');
      setBookingDate(null);
      setNotes('');
      
      // Show modal instead of success message
      setIsModalOpen(true);
      
    } catch (err) {
      console.error('Failed to create booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setBookingReference(null);
    setConfirmedBookingDate('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Profile not found.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              {profile.image_url ? (
                <img
                  className="h-48 w-full md:w-64 object-cover"
                  src={profile.image_url}
                  alt={profile.name}
                />
              ) : (
                <div className="h-48 w-full md:w-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                  <span className="text-6xl text-gray-400 dark:text-gray-500">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-blue-600 dark:text-blue-400 font-semibold">
                Business Profile
              </div>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {profile.name}
              </h1>
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-lg">
                {profile.description}
              </p>
              <div className="mt-4 flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.services?.length || 0} services available
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Available Services
              </h2>
              
              {profile.services && profile.services.length > 0 ? (
                <div className="space-y-4">
                  {profile.services.map((service: Service) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {service.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {service.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            ${service.price}
                          </span>
                        </div>
                      </div>
                      {service.image_url && (
                        <div className="mt-3">
                          <img
                            src={service.image_url}
                            alt={service.title}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No services available at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Book a Service
              </h2>

               {/* Success message removed - now handled by modal */}

              {isAuthenticated ? (
                <ProtectedRoute>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    {/* Service Selection */}
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Service (Optional)
                      </label>
                      <select
                        id="service"
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">No specific service</option>
                        {profile.services?.map((service: Service) => (
                          <option key={service.id} value={service.id}>
                            {service.title} - ${service.price}
                          </option>
                        ))}
                      </select>
                    </div>

                     {/* Date Selection */}
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         Preferred Date
                       </label>
                       <Calendar
                         selectedDate={bookingDate}
                         onDateChange={setBookingDate}
                         minDate={new Date()}
                       />
                     </div>

                    {/* Notes */}
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Any special requirements or questions..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={bookingLoading || !bookingDate}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {bookingLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Creating Booking...
                        </div>
                      ) : (
                        'Book Now'
                      )}
                    </button>
                  </form>
                </ProtectedRoute>
              ) : (
                <div className="text-center">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <p className="text-blue-800 dark:text-blue-200 mb-4">
                      Please log in to book a service with {profile.name}.
                    </p>
                    <a
                      href="/login"
                      className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Log In
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
         </div>
       </div>

        {/* Booking Confirmation Modal */}
        {bookingReference && profile && (
          <BookingConfirmationModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            bookingData={{
              booking_ref: bookingReference.booking_ref,
              booking_id: bookingReference.booking_id,
              booking_date: confirmedBookingDate,
              profile_name: profile.name,
              service_name: selectedService && profile.services?.find(s => s.id === selectedService)?.title
            }}
          />
        )}
     </div>
   );
 }