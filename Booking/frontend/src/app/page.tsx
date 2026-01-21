'use client';

import { useState, useEffect } from 'react';
import HeroSection from '@/components/home/HeroSection';
import MapSection from '@/components/home/MapSection';
import StatsBar from '@/components/home/StatsBar';
import ServicesShowcase from '@/components/home/ServicesShowcase';
import PortfolioGallery from '@/components/home/PortfolioGallery';
import Testimonials from '@/components/home/Testimonials';
import CustomSections from '@/components/home/CustomSections';
import FinalCTA from '@/components/home/FinalCTA';
import Footer from '@/components/Footer';
import { landingAPI } from '@/services/api';
import type { LandingPageConfig } from '@/types';

import HairReveal from '@/components/HairReveal';

export default function Home() {
  const [config, setConfig] = useState<LandingPageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await landingAPI.getPublicConfig();
        setConfig(response.data);
      } catch (error) {
        console.error('Failed to fetch landing config:', error);
        // Config remains null, components will use fallbacks
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '0 0 0';
  };

  const getStyle = () => {
    if (!config) return {};
    return {
      '--primary': config.branding.primary_color,
      '--primary-rgb': hexToRgb(config.branding.primary_color),
      '--bg-light': config.branding.light_bg_color,
      '--bg-dark': config.branding.dark_bg_color,
    } as React.CSSProperties;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-light)]" style={getStyle()}>
      <HairReveal />
      <HeroSection config={config?.hero} />
      <ServicesShowcase sectionConfig={config?.services_section} />
      <PortfolioGallery
        sectionConfig={config?.portfolio_section}
        items={config?.portfolio_items}
      />
      <MapSection />
      <StatsBar
        sectionConfig={config?.stats_section}
        stats={config?.stats}
      />
      <Testimonials
        sectionConfig={config?.testimonials_section}
        testimonials={config?.testimonials}
      />
      <CustomSections sections={config?.custom_sections} />
      <FinalCTA config={config?.final_cta} />
      <Footer config={config?.footer} />
    </div>
  );
}
