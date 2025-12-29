import React from 'react';
import { LandingPageConfig, LandingPageConfigUpdate } from '@/types';
import { BannerEditor } from './sections/BannerEditor';
import { ServicesEditor } from './sections/ServicesEditor';
import { ReviewsEditor } from './sections/ReviewsEditor';
import { CTAEditor } from './sections/CTAEditor';
import { CustomSectionsEditor } from './sections/CustomSectionsEditor';
import { BrandingEditor } from './sections/BrandingEditor';

interface EditorPanelProps {
    config: LandingPageConfig;
    onChange: (update: LandingPageConfigUpdate) => void;
    isLoading?: boolean;
}

export function EditorPanel({ config, onChange, isLoading }: EditorPanelProps) {
    if (isLoading) return <div className="p-6">Loading editor...</div>;

    return (
        <div className="w-full md:w-[500px] lg:w-[560px] overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16202a] p-6 space-y-8 pb-20 custom-scrollbar">
            <BannerEditor
                config={config.hero}
                onChange={(heroUpdate) => onChange({ hero: { ...config.hero, ...heroUpdate } })}
            />

            <ServicesEditor
                config={config.services_section}
                onChange={(sectionUpdate) => onChange({ services_section: { ...config.services_section, ...sectionUpdate } })}
            />

            <ReviewsEditor
                sectionConfig={config.testimonials_section}
                testimonials={config.testimonials}
                onChange={(sectionUpdate, testimonialsUpdate) => {
                    const update: LandingPageConfigUpdate = {};
                    if (sectionUpdate) update.testimonials_section = { ...config.testimonials_section, ...sectionUpdate };
                    if (testimonialsUpdate) update.testimonials = testimonialsUpdate;
                    onChange(update);
                }}
            />

            <CustomSectionsEditor
                sections={config.custom_sections || []}
                onChange={(sections) => onChange({ custom_sections: sections })}
            />

            <BrandingEditor
                config={config.branding}
                onChange={(brandingUpdate) => onChange({ branding: { ...config.branding, ...brandingUpdate } })}
            />

            <CTAEditor
                config={config.final_cta.cta_button}
                onChange={(btnUpdate) => onChange({
                    final_cta: {
                        ...config.final_cta,
                        cta_button: { ...config.final_cta.cta_button, ...btnUpdate }
                    }
                })}
                label="Final Call to Action"
            />
        </div>
    );
}
