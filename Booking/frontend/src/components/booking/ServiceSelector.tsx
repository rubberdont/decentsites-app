'use client';

import React from 'react';
import Image from 'next/image';
import type { Service } from '@/types';

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string | null;
  onServiceSelect: (serviceId: string) => void;
}

/**
 * Service selection grid component
 * Displays available services as cards with selection state
 */
export default function ServiceSelector({
  services,
  selectedServiceId,
  onServiceSelect,
}: ServiceSelectorProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#a0a0a0]">No services available at this time.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => {
        const isSelected = selectedServiceId === service.id;
        
        return (
          <div
            key={service.id}
            className={`
              bg-[#2a2a2a] rounded-xl border-2 overflow-hidden transition-all duration-200 flex flex-col
              ${isSelected 
                ? 'border-[#d4af37] ring-2 ring-[#d4af37]/30' 
                : 'border-[#444444] hover:border-[#555555]'
              }
            `}
          >
            {/* Service Image Placeholder */}
            <div className="h-48 sm:h-56 bg-[#1a1a1a] flex items-center justify-center shrink-0">
              {service.image_url ? (
                <Image
                  src={service.image_url}
                  alt={service.title}
                  width={600}
                  height={450}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-16 h-16 text-[#444444]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
            </div>

            {/* Service Details */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-[#eaeaea] font-semibold text-lg mb-1">
                {service.title}
              </h3>
              
              {service.description && (
                <p className="text-[#a0a0a0] text-sm mb-3 line-clamp-2 flex-grow">
                  {service.description}
                </p>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-[#d4af37] font-bold text-xl">
                  ₱{service.price.toFixed(2)}
                </span>
                <span className="text-[#a0a0a0] text-sm">
                  45 min
                </span>
              </div>

              <button
                onClick={() => onServiceSelect(service.id)}
                className={`
                  w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200
                  flex items-center justify-center gap-2
                  ${isSelected
                    ? 'bg-[#d4af37] text-[#1a1a1a]'
                    : 'bg-transparent border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10'
                  }
                `}
              >
                {isSelected ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Selected
                  </>
                ) : (
                  'Select'
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
