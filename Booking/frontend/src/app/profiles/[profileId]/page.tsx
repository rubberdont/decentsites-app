'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { profilesAPI, bookingsAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Calendar from '@/components/Calendar';
import BookingConfirmationModal from '@/components/BookingConfirmationModal';
import TimeSlotPicker from '@/components/TimeSlotPicker';
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
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  
   // Modal state
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [bookingReference, setBookingReference] = useState<BookingRefResponse | null>(null);
   const [confirmedBookingDate, setConfirmedBookingDate] = useState<string>('');
   const [confirmedServiceName, setConfirmedServiceName] = useState<string>('');

   // Booking modal state
   const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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

  // Reset time slot when date changes
  useEffect(() => {
    setSelectedTimeSlot(null);
  }, [bookingDate]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || !bookingDate || !selectedTimeSlot) return;
    
    try {
      setBookingLoading(true);
      
      const bookingData: BookingCreate = {
        profile_id: profile.id,
        service_id: selectedServiceForBooking || undefined,
        booking_date: bookingDate.toISOString(),
        time_slot: selectedTimeSlot,  // NEW
        notes: notes || undefined,
      };
      
      const response = await bookingsAPI.create(bookingData);
      
      // Capture booking reference from response and store the booking date
      setBookingReference(response.data);
      setConfirmedBookingDate(bookingDate.toISOString());
      setConfirmedServiceName(selectedServiceForBooking ? profile.services?.find(s => s.id === selectedServiceForBooking)?.title || '' : '');
      
      // Reset form
      setSelectedServiceForBooking('');
      setBookingDate(null);
      setSelectedTimeSlot(null);
      setNotes('');
      
       // Show modal instead of success message
       setIsModalOpen(true);
       setIsBookingModalOpen(false);
      
    } catch (err: unknown) {
      console.error('Failed to create booking:', err);
      const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to create booking. Please try again.';
      setError(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setBookingReference(null);
    setConfirmedBookingDate('');
    setConfirmedServiceName('');
  };

   if (loading) {
     return (
       <div className="min-h-screen bg-[#F5F3EF] dark:bg-gray-900 py-8">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14B8A6] mx-auto"></div>
             <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
           </div>
         </div>
       </div>
     );
   }

   if (error && !profile) {
     return (
       <div className="min-h-screen bg-[#F5F3EF] dark:bg-gray-900 py-8">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center">
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md mx-auto">
               <p className="text-red-800 dark:text-red-200">{error}</p>
               <button
                 onClick={() => window.location.reload()}
                 className="mt-3 px-4 py-2 bg-[#F59E0B] text-white rounded-md hover:bg-[#D97706] transition-colors"
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
       <div className="min-h-screen bg-[#F5F3EF] dark:bg-gray-900 py-8">
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
      <div className="min-h-screen bg-[#F5F3EF] dark:bg-gray-900 pt-24 pb-8">
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
               <div className="uppercase tracking-wide text-sm text-[#14B8A6] dark:text-[#14B8A6] font-semibold">
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

        <div className="space-y-8">
          {/* Services Section */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Available Services
              </h2>
              
              {profile.services && profile.services.length > 0 ? (
                <div className="space-y-4">
                  {profile.services.map((service: Service) => (
                    <div
                      key={service.id}
                       className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-[#14B8A6] dark:hover:border-[#14B8A6] transition-colors"
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
                           <span className="text-lg font-bold text-[#F59E0B] dark:text-[#FCD34D]">
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
               
               {/* Single Book Now Button */}
               {profile.services && profile.services.length > 0 && (
                 <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="bg-[#F59E0B] text-white px-6 py-3 rounded-md hover:bg-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 transition-colors text-lg font-semibold"
                    >
                     Book Now
                   </button>
                 </div>
               )}
             </div>
          </div>

           {/* Booking Modal */}
           {isBookingModalOpen && (
             <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                 <div className="p-8">
                   <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                       Book a Service
                     </h2>
                     <button
                       onClick={() => setIsBookingModalOpen(false)}
                       className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                     >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                   {/* Error message */}
                   {error && profile && (
                     <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                       <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                     </div>
                   )}

                  {isAuthenticated ? (
                    <ProtectedRoute>
                      {selectedServiceForBooking ? (
                        // Show booking form when service is selected
                        <>
                           {/* Selected Service Display */}
                           <div className="mb-6 p-4 bg-[#14B8A6]/10 border border-[#14B8A6] rounded-lg">
                             <div className="flex justify-between items-center">
                               <div>
                                 <h3 className="text-lg font-semibold text-[#14B8A6] dark:text-[#5EEAD4]">
                                   Selected Service: {profile.services?.find(s => s.id === selectedServiceForBooking)?.title}
                                 </h3>
                                 <p className="text-[#14B8A6] dark:text-[#5EEAD4]">
                                   ${profile.services?.find(s => s.id === selectedServiceForBooking)?.price}
                                 </p>
                               </div>
                               <button
                                 onClick={() => setSelectedServiceForBooking('')}
                                 className="text-[#14B8A6] hover:text-[#0F9488] dark:text-[#5EEAD4] dark:hover:text-[#14B8A6] text-sm font-medium underline hover:no-underline transition-colors"
                               >
                                 Change Service
                               </button>
                             </div>
                           </div>

                          <form onSubmit={handleBookingSubmit} className="space-y-4">
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

                            {/* Time Slot Selection */}
                            {bookingDate && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Select Time Slot *
                                </label>
                                <TimeSlotPicker
                                  profileId={profileId}
                                  selectedDate={bookingDate}
                                  selectedTimeSlot={selectedTimeSlot}
                                  onTimeSlotChange={setSelectedTimeSlot}
                                />
                              </div>
                            )}

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
                                 className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
                                 placeholder="Any special requirements or questions..."
                               />
                            </div>

                            {/* Submit Button */}
                             <button
                               type="submit"
                               disabled={bookingLoading || !bookingDate || !selectedTimeSlot}
                               className="w-full bg-[#F59E0B] text-white py-3 px-4 rounded-xl hover:bg-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
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

                            {!selectedTimeSlot && bookingDate && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                Please select a time slot to continue
                              </p>
                            )}
                          </form>
                        </>
                      ) : (
                        // Show service selection when no service is selected
                        <div className="space-y-4">
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Select a service to book:
                          </p>
                          {profile.services?.map((service: Service) => (
                             <div
                               key={service.id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-[#14B8A6] dark:hover:border-[#14B8A6] transition-colors cursor-pointer hover:bg-[#14B8A6]/5 dark:hover:bg-[#14B8A6]/10"
                               onClick={() => setSelectedServiceForBooking(service.id)}
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
                      )}
                    </ProtectedRoute>
                  ) : (
                     <div className="text-center">
                       <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                         <p className="text-blue-800 dark:text-blue-200 mb-4">
                           Please log in to book a service with {profile.name}.
                         </p>
                         <a
                           href="/login"
                           className="inline-block bg-[#14B8A6] text-white py-3 px-6 rounded-xl hover:bg-[#0F9488] transition-colors font-semibold"
                         >
                          Log In
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
              time_slot: selectedTimeSlot,
              profile_name: profile.name,
              service_name: confirmedServiceName
            }}
          />
        )}
     </div>
   );
}
