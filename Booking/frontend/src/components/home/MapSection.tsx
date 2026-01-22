'use client';

export default function MapSection() {
    const address = "TheJay Hair Studio, Villa Remedios East, Calle Excelente, Calamba, Laguna";

    const handleMapClick = () => {
        const encodedAddress = encodeURIComponent(address);
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    };

    return (
        <section className="bg-[#1a1a1a] dark:bg-[#1a1a1a] py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-[#f5f5f5] dark:text-[#f5f5f5] sm:text-4xl font-display">
                        Find Us
                    </h2>
                    <p className="mt-4 text-lg text-gray-400 dark:text-gray-400 font-body">
                        Visit our premium location in the heart of the city.
                    </p>
                </div>
                <div className="w-full h-[400px] bg-gray-800 dark:bg-gray-800 rounded-xl overflow-hidden relative">
                    <img
                        src="/map.png"
                        alt="Map"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div
                            onClick={handleMapClick}
                            onKeyDown={(e) => e.key === 'Enter' && handleMapClick()}
                            role="button"
                            tabIndex={0}
                            className="bg-[#1a1a1a]/90 dark:bg-gray-900/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20 cursor-pointer hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] mx-4 max-w-[280px] sm:max-w-md"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#d4af37] rounded-full shrink-0">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#f5f5f5] dark:text-[#f5f5f5] text-sm sm:text-base">My Shop</h3>
                                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-400 leading-tight">{address}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
