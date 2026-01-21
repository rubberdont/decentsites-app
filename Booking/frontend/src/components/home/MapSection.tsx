'use client';

export default function MapSection() {
    return (
        <section className="bg-white dark:bg-[#1a1a1a] py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f5f5f5] sm:text-4xl font-display">
                        Find Us
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-body">
                        Visit our premium location in the heart of the city.
                    </p>
                </div>
                <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <div className="text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-500 font-display font-medium">Map Integration Coming Soon</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
