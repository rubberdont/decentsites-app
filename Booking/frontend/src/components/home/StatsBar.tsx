'use client';

export default function StatsBar() {
  const stats = [
    { label: 'Expert Barbers', value: '+15', icon: '👨‍🔧' },
    { label: 'Happy Clients', value: '+5K', icon: '😊' },
    { label: 'Years Experience', value: '+10', icon: '⭐' },
    { label: 'Services', value: '+20', icon: '✂️' },
  ];

  return (
    <section className="relative -mt-8 lg:-mt-12 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1E293B] dark:bg-gray-800 rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-700">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-6 lg:p-8 text-center hover:bg-[#2D3748] dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm lg:text-base text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
