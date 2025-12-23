'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div
          className="flex min-h-[520px] flex-col items-center justify-center gap-6 rounded-xl bg-cover bg-center bg-no-repeat p-4 text-center"
          style={{
            backgroundImage: `linear-gradient(rgba(26, 26, 26, 0.5) 0%, rgba(26, 26, 26, 0.8) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBB-1Y0s_lXFpiS9ml5idUXFUVfIBMGuVoEN3qLipabNdvj2DdwWbZxPnecBGrRRbT94R6Yx-WjqHFk4NN0szH6tuQP5wg44gdMPxtV9xYsLa6F2ULt3J8W2amTBNJHYFv3is8deauXZENKHlUDUXvDQfk7215oHCJKzxqxu6kPcT7ELvWJsKfBhsIFlfRIjdgs0e0DXGMwaozYPQg1YiL9LwlLQaCgig_NlljEmxfWO4DfCA55RKKbM3PQ-QQy1YQX0kfnpfLecm8")`
          }}
        >
          <div className="flex flex-col gap-4 max-w-2xl">
            <h1 className="text-4xl font-black tracking-tighter text-white sm:text-5xl md:text-6xl font-display">
              Crafting Style, One Cut at a Time.
            </h1>
            <p className="text-base text-gray-200 md:text-lg font-body">
              The Premier Grooming Experience for the Modern Gentleman.
            </p>
          </div>
          <Link
            href="/book"
            className="mt-4 flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#d4af37] text-black text-base font-bold tracking-wide transition-transform hover:scale-105 font-display"
          >
            Book Now
          </Link>
        </div>
      </div>
    </section>
  );
}
