'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { profilesAPI } from '@/services/api';
import type { Service } from '@/types';

// Fallback services when API fails or returns empty
const fallbackServices = [
  {
    icon: 'content_cut',
    title: 'Classic Haircut',
    description: 'A timeless cut tailored to your style, complete with a shampoo, condition, and straight razor finish.',
    price: '₱45'
  },
  {
    icon: 'swords',
    title: 'Hot Towel Shave',
    description: 'A luxurious straight-razor shave experience with hot towels, rich lather, and soothing after-shave balm.',
    price: '₱50'
  },
  {
    icon: 'brush',
    title: 'Beard Trim & Shape',
    description: 'Expert shaping, trimming, and detailing of your beard and mustache, finished with premium beard oil.',
    price: '₱30'
  }
];

// Helper to determine icon based on service title
function getServiceIcon(title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('shave')) return 'swords';
  if (lowerTitle.includes('beard') || lowerTitle.includes('trim')) return 'brush';
  // Default to scissors/haircut icon
  return 'content_cut';
}

// Helper to format price as currency
function formatPrice(price: number): string {
  return `₱${price.toLocaleString()}`;
}

export default function ServicesShowcase() {
  const [services, setServices] = useState<Array<{
    icon: string;
    title: string;
    description: string;
    price: string;
  }>>(fallbackServices);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        // Try to get all profiles and use the first one's services
        const response = await profilesAPI.getAll();
        const profiles = response.data;
        
        if (profiles && profiles.length > 0 && profiles[0].services && profiles[0].services.length > 0) {
          const apiServices = profiles[0].services.map((service: Service) => ({
            icon: getServiceIcon(service.title),
            title: service.title,
            description: service.description || 'Professional grooming service tailored to your needs.',
            price: formatPrice(service.price)
          }));
          setServices(apiServices);
        }
        // If no services from API, keep fallback (already set as default)
      } catch (error) {
        console.error('Failed to fetch services:', error);
        // Keep fallback services on error
      } finally {
        setIsLoading(false);
      }
    }

    fetchServices();
  }, []);

  // SVG icons as components
  const icons: Record<string, JSX.Element> = {
    content_cut: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.838c.052.394.05.742.05 1.025v.075M7.848 15.75l1.536-.887m-1.536.887a3 3 0 11-5.196 3 3 3 0 015.196-3zm1.536-.887a2.165 2.165 0 001.083-1.838c.052-.394.05-.742.05-1.025v-.075m0 0l1.5.863m0 0l4.5 2.598m-4.5-2.598l4.5-2.598" />
      </svg>
    ),
    swords: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
    brush: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    )
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div 
          key={i}
          className="flex flex-col rounded-lg border border-white/10 bg-[#f5f5f5] dark:bg-[#2a2a2a] p-8 text-center animate-pulse"
        >
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="mt-6 h-6 w-3/4 mx-auto rounded bg-gray-300 dark:bg-gray-600" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-5/6 mx-auto rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="mt-4 h-6 w-16 mx-auto rounded bg-gray-300 dark:bg-gray-600" />
        </div>
      ))}
    </div>
  );

  return (
    <section className="container mx-auto px-4 py-16 sm:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f5f5f5] sm:text-4xl font-display">
          Signature Services
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-body">
          Experience the art of grooming with our expert services.
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className={`grid grid-cols-1 gap-8 ${
          services.length === 1 
            ? 'md:grid-cols-1 max-w-md mx-auto' 
            : services.length === 2 
              ? 'md:grid-cols-2 max-w-2xl mx-auto' 
              : 'md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {services.map((service, index) => (
            <div 
              key={index}
              className="flex flex-col rounded-lg border border-white/10 bg-[#f5f5f5] dark:bg-[#2a2a2a] p-8 text-center transition-shadow hover:shadow-xl hover:shadow-[#d4af37]/10"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                {icons[service.icon] || icons['content_cut']}
              </div>
              <h3 className="mt-6 text-xl font-bold font-display text-[#1a1a1a] dark:text-[#f5f5f5]">
                {service.title}
              </h3>
              <p className="mt-2 text-base text-gray-600 dark:text-gray-400 font-body">
                {service.description}
              </p>
              <p className="mt-4 text-lg font-bold text-[#d4af37] font-display">
                {service.price}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-12">
        <Link
          href="/book"
          className="inline-flex items-center gap-2 text-[#d4af37] hover:text-[#c9a432] font-semibold text-lg transition-colors font-display"
        >
          View All Services
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
