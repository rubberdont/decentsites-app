'use client';

import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="relative py-16 lg:py-24 bg-gradient-to-br from-[#1E293B] via-[#14B8A6] to-[#1E293B] dark:from-gray-900 dark:via-teal-900 dark:to-gray-900 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#F59E0B] rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
          Ready For Your <span className="text-[#F59E0B]">Best Look?</span>
        </h2>
        <p className="text-lg lg:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Book your appointment now and experience premium barber services. 
          Transform your look today with our expert team.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/customer-view"
            className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            Book Appointment Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          <Link
            href="/booking-lookup"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 border-2 border-white/30"
          >
            Lookup My Booking
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-12 border-t border-white/20">
          <div className="grid md:grid-cols-3 gap-6 text-white">
            <div>
              <div className="flex justify-center mb-2">
                <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Open Hours</h3>
              <p className="text-sm text-gray-300">Mon - Sat: 9AM - 8PM</p>
            </div>
            
            <div>
              <div className="flex justify-center mb-2">
                <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Contact</h3>
              <p className="text-sm text-gray-300">(555) 123-4567</p>
            </div>
            
            <div>
              <div className="flex justify-center mb-2">
                <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Location</h3>
              <p className="text-sm text-gray-300">123 Main St, City</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
