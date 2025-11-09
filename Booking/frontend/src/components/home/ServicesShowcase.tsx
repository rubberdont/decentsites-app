'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import type { Service } from '@/types';

export default function ServicesShowcase() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Haircut', 'Beard', 'Styling', 'Treatment'];

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await axios.get(`${API_BASE}/profiles/default-profile`);
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">Loading services...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-gray-900 lg:-mt-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 pt-24">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our Services <span className="text-[#F59E0B]">Available 24/7</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Professional grooming services tailored to your style and needs
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-[#F59E0B] text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service) => (
              <div
                key={service.id}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
              >
                {service.image_url && (
                  <div className="h-48 overflow-hidden bg-gradient-to-br from-teal-100 to-amber-100 dark:from-teal-900 dark:to-amber-900">
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#14B8A6]">
                      ${service.price}
                    </span>
                    <Link
                      href="/customer-view"
                      className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No services available yet. Check back soon!
            </p>
            <Link
              href="/profile"
              className="inline-block bg-[#14B8A6] hover:bg-[#0F9488] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
            >
              Add Services
            </Link>
          </div>
        )}

        {/* View All Link */}
        {services.length > 6 && (
          <div className="text-center mt-12">
            <Link
              href="/customer-view"
              className="inline-flex items-center gap-2 text-[#14B8A6] hover:text-[#0F9488] font-semibold text-lg transition-colors duration-300"
            >
              View All Services
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
