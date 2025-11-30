'use client';

import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="container mx-auto px-4 py-16 sm:py-24">
      <div className="rounded-lg bg-[#d4af37]/10 p-8 text-center md:p-16">
        <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f5f5f5] sm:text-4xl font-display">
          Ready for a Transformation?
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-body">
          Book your appointment today and experience the difference.
        </p>
        <Link
          href="/book"
          className="mt-8 inline-flex mx-auto min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#d4af37] text-black text-base font-bold tracking-wide transition-transform hover:scale-105 font-display"
        >
          Book Now
        </Link>
      </div>
    </section>
  );
}
