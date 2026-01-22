'use client';

import type { FooterConfig } from '@/types';

const defaultConfig: FooterConfig = {
  business_name: 'The Modern Gentleman',
  address: 'TheJay Hair Studio, Villa Remedios East, Calle Excelente, Calamba, 4027 Laguna',
  phone: '(123) 456-7890',
  hours: ['Tue - Sunday: 9am - 7pm', 'Monday: Closed'],
  social_links: {}
};

interface FooterProps {
  config?: FooterConfig;
}

export default function Footer({ config }: FooterProps) {
  const footerConfig = config || defaultConfig;

  return (
    <footer className="bg-[var(--bg-dark)] border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Address */}
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              {footerConfig.business_name}
            </h3>
            <p className="mt-2 text-sm text-gray-400 font-body whitespace-pre-line">
              {footerConfig.address}
            </p>
            <p className="mt-2 text-sm text-gray-400 font-body">
              {footerConfig.phone}
            </p>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-bold font-display text-white">Opening Hours</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-400 font-body">
              {footerConfig.hours.map((hour, index) => (
                <li key={index}>{hour}</li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-bold font-display text-white">Follow Us</h3>
            <div className="mt-2 flex space-x-4">
              {footerConfig.social_links.facebook && (
                <a className="text-gray-400 hover:text-[var(--primary)] transition-colors" href={footerConfig.social_links.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <img src="/assets/facebook.svg" alt="Facebook" className="h-5 w-5 sm:h-6 sm:w-6" />
                </a>
              )}
              {footerConfig.social_links.instagram && (
                <a className="text-gray-400 hover:text-[var(--primary)] transition-colors" href={footerConfig.social_links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <img src="/assets/instagram.svg" alt="Instagram" className="h-5 w-5 sm:h-6 sm:w-6" />
                </a>
              )}
              {footerConfig.social_links.tiktok && (
                <a className="text-gray-400 hover:text-[var(--primary)] transition-colors" href={footerConfig.social_links.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <img src="/assets/tiktok.svg" alt="TikTok" className="h-5 w-5 sm:h-6 sm:w-6" />
                </a>
              )}
              {/* Show default icons if no social links configured */}
              {Object.keys(footerConfig.social_links).length === 0 && (
                <>
                  <a className="text-gray-400 hover:text-[var(--primary)] transition-colors" href="#" aria-label="Facebook">
                    <img src="/assets/facebook.svg" alt="Facebook" className="h-5 w-5 sm:h-6 sm:w-6" />
                  </a>
                  <a className="text-gray-400 hover:text-[var(--primary)] transition-colors" href="#" aria-label="Instagram">
                    <img src="/assets/instagram.svg" alt="Instagram" className="h-5 w-5 sm:h-6 sm:w-6" />
                  </a>
                  <a className="text-gray-400 hover:text-[var(--primary)] transition-colors" href="#" aria-label="TikTok">
                    <img src="/assets/tiktok.svg" alt="TikTok" className="h-5 w-5 sm:h-6 sm:w-6" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-gray-400 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} {footerConfig.business_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
