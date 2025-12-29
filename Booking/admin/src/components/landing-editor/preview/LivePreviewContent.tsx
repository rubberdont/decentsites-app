import React from 'react';
import { LandingPageConfig } from '@/types';
import {
    HeroPreview,
    ServicesPreview,
    StatsPreview,
    PortfolioPreview,
    TestimonialsPreview,
    CustomSectionsPreview,
    FinalCTAPreview,
    FooterPreview
} from './PreviewComponents';

interface LivePreviewContentProps {
    config: LandingPageConfig;
}

export function LivePreviewContent({ config }: LivePreviewContentProps) {
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '0 0 0';
    };

    return (
        <div
            style={{
                '--primary': config.branding.primary_color,
                '--primary-rgb': hexToRgb(config.branding.primary_color),
                '--bg-light': config.branding.light_bg_color,
                '--bg-dark': config.branding.dark_bg_color,
            } as React.CSSProperties}
            className="h-full bg-[var(--bg-light)]"
        >
            <HeroPreview config={config.hero} />
            <ServicesPreview sectionConfig={config.services_section} />
            <PortfolioPreview sectionConfig={config.portfolio_section} items={config.portfolio_items} />
            <StatsPreview sectionConfig={config.stats_section} stats={config.stats} />
            <TestimonialsPreview sectionConfig={config.testimonials_section} testimonials={config.testimonials} />
            <CustomSectionsPreview sections={config.custom_sections} />
            <FinalCTAPreview config={config.final_cta} />
            <FooterPreview config={config.footer} />
        </div>
    );
}
