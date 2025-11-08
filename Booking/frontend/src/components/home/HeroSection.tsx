'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Blurred background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&h=900&fit=crop')`,
          filter: 'blur(5px)',
          zIndex: 0
        }}
      ></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="relative z-10 text-center lg:text-left">
            {/* Decorative floating shapes */}
            <div className="absolute -top-4 -left-4 w-16 h-16 lg:w-20 lg:h-20 opacity-60">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="25" r="20" fill="#14B8A6" />
                <circle cx="50" cy="75" r="20" fill="#F59E0B" />
              </svg>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Quality Barbers <br />
              <span className="text-[#14B8A6]">For Your Best</span> <br />
              Look
            </h1>
            
            <p className="text-lg sm:text-xl text-[#78716C] dark:text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0">
              Experience premium grooming services from expert barbers. 
              We deliver precision cuts, classic shaves, and modern styles.
            </p>
            
            <Link
              href="/customer-view"
              className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Book Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            {/* Decorative floating elements */}
            <div className="absolute top-10 right-10 w-20 h-20 lg:w-24 lg:h-24 animate-float opacity-80">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="#14B8A6" transform="rotate(15 50 50)" />
              </svg>
            </div>
            
            <div className="absolute bottom-10 left-0 w-16 h-16 lg:w-20 lg:h-20 animate-float-delayed opacity-70">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="35" stroke="#F59E0B" strokeWidth="8" fill="none" />
              </svg>
            </div>

            {/* Hero Image - Using placeholder */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-teal-100 to-amber-100 dark:from-teal-900 dark:to-amber-900">
              <img
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&h=900&fit=crop"
                alt="Professional Barber"
                className="w-full h-[400px] lg:h-[600px] object-cover"
              />
            </div>

            {/* Floating decorative pills (similar to reference design) */}
            <div className="absolute -top-4 right-20 w-24 h-12 bg-[#6366F1] rounded-full animate-float opacity-80 transform rotate-12"></div>
            <div className="absolute bottom-20 -right-4 w-32 h-12 bg-[#EC4899] rounded-full animate-float-delayed opacity-70 transform -rotate-12"></div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
