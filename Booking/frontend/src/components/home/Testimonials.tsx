'use client';

import type { Testimonial, SectionConfig } from '@/types';

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    quote: "Best haircut I've ever had. The attention to detail is unmatched. I walked out feeling like a new man. Highly recommend!",
    name: 'John D.',
    title: 'Regular Client'
  },
  {
    id: '2',
    quote: "The atmosphere is incredible - cool, relaxed, and professional. The barbers are true artists. I wouldn't trust anyone else with my beard.",
    name: 'Michael P.',
    title: 'First-time Visitor'
  },
  {
    id: '3',
    quote: "From the hot towel shave to the final styling, the experience was pure luxury. The perfect way to unwind and look sharp.",
    name: 'David L.',
    title: 'Grooming Enthusiast'
  }
];

const defaultSectionConfig: SectionConfig = {
  title: 'What Our Clients Say',
  subtitle: 'Your satisfaction is our masterpiece.'
};

interface TestimonialsProps {
  sectionConfig?: SectionConfig;
  testimonials?: Testimonial[];
}

export default function Testimonials({ sectionConfig, testimonials }: TestimonialsProps) {
  const section = sectionConfig || defaultSectionConfig;

  // If explicitly disabled, don't render
  if (section.enabled === false) return null;

  const testimonialsData = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <section className="bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-100 sm:text-4xl font-display">
            {section.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-body">
            {section.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonialsData.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex flex-col rounded-lg border border-white/10 bg-white dark:bg-white/5 p-6"
            >
              <p className="flex-grow text-base italic text-gray-700 dark:text-gray-300 font-body">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm font-bold text-slate-900 dark:text-gray-100 font-display">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-500">{testimonial.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
