'use client';

import Link from 'next/link';
import type { HeroConfig } from '@/types';

// Default values (current hardcoded content)
const defaultConfig: HeroConfig = {
  title: 'Crafting Style, One Cut at a Time.',
  subtitle: 'The Premier Grooming Experience for the Modern Gentleman.',
  background_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB-1Y0s_lXFpiS9ml5idUXFUVfIBMGuVoEN3qLipabNdvj2DdwWbZxPnecBGrRRbT94R6Yx-WjqHFk4NN0szH6tuQP5wg44gdMPxtV9xYsLa6F2ULt3J8W2amTBNJHYFv3is8deauXZENKHlUDUXvDQfk7215oHCJKzxqxu6kPcT7ELvWJsKfBhsIFlfRIjdgs0e0DXGMwaozYPQg1YiL9LwlLQaCgig_NlljEmxfWO4DfCA55RKKbM3PQ-QQy1YQX0kfnpfLecm8',
  cta_button: {
    text: 'Book Now',
    style: 'solid',
    size: 'default'
  }
};

interface HeroSectionProps {
  config?: HeroConfig;
}

export default function HeroSection({ config }: HeroSectionProps) {
  // Merge with defaults - use provided config or fall back to defaults
  const heroConfig = config || defaultConfig;
  const ctaButton = heroConfig.cta_button || defaultConfig.cta_button;

  // Button style classes based on config
  const getButtonClasses = () => {
    const baseClasses = 'mt-4 flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg font-bold tracking-wide transition-transform hover:scale-105 font-display';
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

  // Helper to get font family class
  const getFontFamily = (font?: string) => {
    switch (font) {
      case 'playfair': return 'font-serif';
      case 'lora': return 'font-serif'; // fallback
      case 'roboto': return 'font-mono'; // fallback/example
      default: return 'font-display'; // default Inter/Sans
    }
  };

  // Helper to get size classes
  const getTitleSize = (size?: string) => {
    switch (size) {
      case 'small': return 'text-3xl sm:text-4xl md:text-5xl';
      case 'medium': return 'text-4xl sm:text-5xl md:text-6xl';
      case 'xl': return 'text-6xl sm:text-7xl md:text-8xl';
      default: return 'text-4xl sm:text-5xl md:text-6xl'; // large/default
    }
  };

  const getSubtitleSize = (size?: string) => {
    switch (size) {
      case 'small': return 'text-sm md:text-base';
      case 'large': return 'text-lg md:text-xl';
      default: return 'text-base md:text-lg'; // medium/default
    }
  };

  const getHeightClass = (height?: string) => {
    switch (height) {
      case 'small': return 'min-h-[300px]';
      case 'large': return 'min-h-[700px]';
      case 'full': return 'min-h-[80vh]'; // slightly less than screen to see content
      default: return 'min-h-[520px]';
    }
  };

  const getAlignClass = (align?: string) => {
    switch (align) {
      case 'left': return 'items-start text-left md:pl-20';
      case 'right': return 'items-end text-right md:pr-20';
      default: return 'items-center text-center';
    }
  };

  const containerClasses = `flex flex-col justify-center gap-6 rounded-xl bg-no-repeat p-8 ${getHeightClass(heroConfig.height)} ${heroConfig.image_fit === 'contain' ? 'bg-contain bg-center' : 'bg-cover bg-center'} ${getAlignClass(heroConfig.text_alignment)}`;

  return (
    <section className="relative">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div
          className={containerClasses}
          style={{
            backgroundImage: `linear-gradient(rgba(26, 26, 26, 0.5) 0%, rgba(26, 26, 26, 0.8) 100%), url("${heroConfig.background_image_url}")`
          }}
        >
          <div className={`flex flex-col gap-4 max-w-3xl ${heroConfig.text_alignment === 'right' ? 'items-end' : heroConfig.text_alignment === 'left' ? 'items-start' : 'items-center'}`}>
            <h1 className={`${getTitleSize(heroConfig.title_font_size)} font-black tracking-tighter text-white ${getFontFamily(heroConfig.font_family)}`}>
              {heroConfig.title}
            </h1>
            <p className="text-base text-gray-200 md:text-lg font-body">
              {heroConfig.subtitle}
            </p>
          </div>
          {/* CTA Button - ALWAYS links to /book (hardcoded) */}
          <Link
            href="/book"
            className={getButtonClasses()}
          >
            {ctaButton.text || 'Book Now'}
          </Link>
        </div>
      </div>
    </section>
  );
}
