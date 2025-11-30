'use client';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "Best haircut I've ever had. The attention to detail is unmatched. I walked out feeling like a new man. Highly recommend!",
      name: 'John D.',
      title: 'Regular Client'
    },
    {
      quote: "The atmosphere is incredible - cool, relaxed, and professional. The barbers are true artists. I wouldn't trust anyone else with my beard.",
      name: 'Michael P.',
      title: 'First-time Visitor'
    },
    {
      quote: "From the hot towel shave to the final styling, the experience was pure luxury. The perfect way to unwind and look sharp.",
      name: 'David L.',
      title: 'Grooming Enthusiast'
    }
  ];

  return (
    <section className="bg-[#f5f5f5] dark:bg-[#2a2a2a] py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f5f5f5] sm:text-4xl font-display">
            What Our Clients Say
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-body">
            Your satisfaction is our masterpiece.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="flex flex-col rounded-lg border border-white/10 bg-[#f5f5f5] dark:bg-[#1a1a1a] p-6"
            >
              <p className="flex-grow text-base italic text-gray-700 dark:text-gray-300 font-body">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm font-bold text-[#1a1a1a] dark:text-[#f5f5f5] font-display">
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
