'use client';

import Link from 'next/link';
import type { FinalCTAConfig } from '@/types';

const defaultConfig: FinalCTAConfig = {
  title: 'Ready for a Transformation?',
  subtitle: 'Book your appointment today and experience the difference.',
  cta_button: {
    text: 'Book Now',
    style: 'solid',
    size: 'default'
  },
  background_style: 'default'
};

interface FinalCTAProps {
  config?: FinalCTAConfig;
}

export default function FinalCTA({ config }: FinalCTAProps) {
  const ctaConfig = config || defaultConfig;
  const ctaButton = ctaConfig.cta_button || defaultConfig.cta_button;

  // Background style classes
  const getBackgroundClasses = () => {
    switch (ctaConfig.background_style) {
      case 'accent':
        return 'bg-[rgba(var(--primary-rgb),0.2)]';
      case 'gradient':
        return 'bg-gradient-to-r from-[rgba(var(--primary-rgb),0.1)] to-[rgba(var(--primary-rgb),0.2)]';
      case 'default':
      default:
        return 'bg-[rgba(var(--primary-rgb),0.1)]';
    }
  };

  // Button style classes
  const getButtonClasses = () => {
    const baseClasses = 'mt-8 inline-flex mx-auto min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg font-bold tracking-wide transition-transform hover:scale-105 font-display';
    const sizeClasses = ctaButton.size === 'large' ? 'h-14 px-8 text-lg' : 'h-12 px-6 text-base';

    let styleClasses = '';
    switch (ctaButton.style) {
      case 'outline':
        styleClasses = 'border-2 border-[var(--primary)] text-[var(--primary)] bg-transparent hover:bg-[var(--primary)] hover:text-black';
        break;
      case 'gradient':
        styleClasses = 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] brightness-90 text-white';
        break;
      case 'solid':
      default:
        styleClasses = 'bg-[var(--primary)] text-white';
        break;
    }

    return `${baseClasses} ${sizeClasses} ${styleClasses}`;
  };

  return (
    <section className="container mx-auto px-4 py-16 sm:py-24">
      <div className={`rounded-lg ${getBackgroundClasses()} p-8 text-center md:p-16`}>
        <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f5f5f5] sm:text-4xl font-display">
          {ctaConfig.title}
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-body">
          {ctaConfig.subtitle}
        </p>
        {/* CTA Button - ALWAYS links to /book (hardcoded) */}
        <Link
          href="/book"
          className={getButtonClasses()}
        >
          {ctaButton.text || 'Book Now'}
        </Link>
      </div>
    </section>
  );
}
