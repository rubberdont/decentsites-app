import React from 'react';
import {
    LandingPageConfig,
    HeroConfig,
    SectionConfig,
    SocialStat,
    Service,
    PortfolioItem,
    Testimonial,
    ContentBlock,
    ImageTextBlock,
    TextBlock,
    GalleryBlock,
    FrameBlock,
    FinalCTAConfig,
    FooterConfig
} from '@/types';

// ==========================================
// Hero Preview
// ==========================================

export function HeroPreview({ config }: { config: HeroConfig }) {
    const ctaButton = config.cta_button;

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

    const getFontFamily = (font?: string) => {
        switch (font) {
            case 'playfair': return 'font-serif';
            case 'lora': return 'font-serif';
            case 'roboto': return 'font-mono';
            default: return 'font-display';
        }
    };

    const getTitleSize = (size?: string) => {
        switch (size) {
            case 'small': return 'text-3xl sm:text-4xl md:text-5xl';
            case 'medium': return 'text-4xl sm:text-5xl md:text-6xl';
            case 'xl': return 'text-6xl sm:text-7xl md:text-8xl';
            default: return 'text-4xl sm:text-5xl md:text-6xl';
        }
    };

    const getHeightClass = (height?: string) => {
        switch (height) {
            case 'small': return 'min-h-[300px]';
            case 'large': return 'min-h-[700px]';
            case 'full': return 'min-h-[80vh]';
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

    const containerClasses = `flex flex-col justify-center gap-6 rounded-xl bg-no-repeat p-8 ${getHeightClass(config.height)} ${config.image_fit === 'contain' ? 'bg-contain bg-center' : 'bg-cover bg-center'} ${getAlignClass(config.text_alignment)}`;

    return (
        <section className="relative">
            <div className="container mx-auto px-4 py-12 md:py-20">
                <div
                    className={containerClasses}
                    style={{
                        backgroundImage: `linear-gradient(rgba(26, 26, 26, 0.5) 0%, rgba(26, 26, 26, 0.8) 100%), url("${config.background_image_url || 'https://via.placeholder.com/800x400'}")`
                    }}
                >
                    <div className={`flex flex-col gap-4 max-w-3xl ${config.text_alignment === 'right' ? 'items-end' : config.text_alignment === 'left' ? 'items-start' : 'items-center'}`}>
                        <h1 className={`${getTitleSize(config.title_font_size)} font-black tracking-tighter text-white ${getFontFamily(config.font_family)}`}>
                            {config.title}
                        </h1>
                        <p className="text-base text-gray-200 md:text-lg font-body">
                            {config.subtitle}
                        </p>
                    </div>
                    {/* Simulated Button */}
                    <div className={getButtonClasses()}>
                        {ctaButton.text || 'Book Now'}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ==========================================
// Stats Preview
// ==========================================

export function StatsPreview({ sectionConfig, stats }: { sectionConfig: SectionConfig; stats?: SocialStat[] }) {
    if (sectionConfig.enabled === false) return null;

    // Dummy stats if none provided, to match frontend fallback or show example
    const displayStats = stats && stats.length > 0 ? stats : [
        { id: '1', value: '15.2K', label: 'Followers', platform: 'instagram' },
        { id: '2', value: '4.9/5', label: '350+ Reviews', platform: 'facebook' },
        { id: '3', value: '4.9', label: 'stars', platform: 'google' },
        { id: '4', value: '1M+', label: 'Video Views', platform: 'twitter' }
    ] as SocialStat[];

    return (
        <section className="bg-[#f5f5f5] dark:bg-[#1a1a1a] py-16 sm:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f5f5f5] sm:text-4xl font-display">
                        {sectionConfig.title}
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-body">
                        {sectionConfig.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {displayStats.map((stat) => (
                        <div
                            key={stat.id}
                            className="group relative flex flex-col items-center justify-center rounded-xl bg-[#f5f5f5] dark:bg-[#2a2a2a] p-8 text-center transition-all duration-300 hover:shadow-xl hover:shadow-[#d4af37]/20 border border-transparent hover:border-[#d4af37]/20"
                        >
                            <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg text-[#1a1a1a] dark:text-[#f5f5f5]">
                                {/* Icon placeholder */}
                                <span className="material-symbols-outlined">{stat.platform === 'custom' ? 'star' : 'public'}</span>
                            </div>
                            <p className="font-display text-5xl font-black text-[#d4af37]">{stat.value}</p>
                            <p className="mt-2 font-body text-gray-500 dark:text-gray-400">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==========================================
// Services Preview
// ==========================================

export function ServicesPreview({ sectionConfig }: { sectionConfig: SectionConfig }) {
    if (sectionConfig.enabled === false) return null;

    // Dummy Services for preview since admin doesn't fetch from API
    const dummyServices = [
        { title: "Classic Haircut", price: "₱45", description: "Timeless cut tailored to your style." },
        { title: "Hot Towel Shave", price: "₱50", description: "Luxurious straight-razor shave." },
        { title: "Beard Trim", price: "₱30", description: "Expert shaping and trimming." }
    ];

    return (
        <section className="container mx-auto px-4 py-16 sm:py-24">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f5f5f5] sm:text-4xl font-display">
                    {sectionConfig.title}
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-body">
                    {sectionConfig.subtitle}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dummyServices.map((service, index) => (
                    <div
                        key={index}
                        className="flex flex-col rounded-lg border border-white/10 bg-white dark:bg-white/5 p-8 text-center transition-shadow hover:shadow-xl hover:shadow-[rgba(var(--primary-rgb),0.1)]"
                    >
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(var(--primary-rgb),0.1)] text-[var(--primary)]">
                            <span className="material-symbols-outlined text-2xl">content_cut</span>
                        </div>
                        <h3 className="mt-6 text-xl font-bold font-display text-slate-900 dark:text-gray-100">
                            {service.title}
                        </h3>
                        <p className="mt-2 text-base text-gray-600 dark:text-gray-400 font-body">
                            {service.description}
                        </p>
                        <p className="mt-4 text-lg font-bold text-[var(--primary)] font-display">
                            {service.price}
                        </p>
                    </div>
                ))}
            </div>
            <div className="text-center mt-12">
                <div className="inline-flex items-center gap-2 text-[var(--primary)] hover:opacity-80 font-semibold text-lg font-display cursor-pointer">
                    View All Services
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
            </div>
        </section>
    );
}

// ==========================================
// Portfolio Preview
// ==========================================

export function PortfolioPreview({ sectionConfig, items }: { sectionConfig: SectionConfig; items?: PortfolioItem[] }) {
    if (sectionConfig.enabled === false) return null;

    const displayItems = items && items.length > 0 ? items : [
        { id: '1', title: 'Classic Fade', image_url: 'https://via.placeholder.com/300x400' },
        { id: '2', title: 'Beard Trim', image_url: 'https://via.placeholder.com/300x400' },
        { id: '3', title: 'Modern Cut', image_url: 'https://via.placeholder.com/300x400' }
    ] as PortfolioItem[];

    return (
        <section className="container mx-auto px-4 py-16 sm:py-24">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f5f5f5] sm:text-4xl font-display">
                    {sectionConfig.title}
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-body">
                    {sectionConfig.subtitle}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayItems.map((item) => (
                    <div key={item.id} className="group relative overflow-hidden rounded-lg aspect-[3/4]">
                        <div
                            className="bg-cover bg-center w-full h-full transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundImage: `url("${item.image_url}")` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <p className="absolute bottom-4 left-4 text-white text-lg font-bold font-display">
                            {item.title}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ==========================================
// Testimonials Preview
// ==========================================

export function TestimonialsPreview({ sectionConfig, testimonials }: { sectionConfig: SectionConfig; testimonials?: Testimonial[] }) {
    if (sectionConfig.enabled === false) return null;

    const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : [
        { id: '1', quote: "Best haircut I've ever had.", name: 'John D.', title: 'Client' },
        { id: '2', quote: "Great atmosphere and service.", name: 'Mike P.', title: 'Visitor' }
    ] as Testimonial[];

    return (
        <section className="bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] py-16 sm:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-100 sm:text-4xl font-display">
                        {sectionConfig.title}
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-body">
                        {sectionConfig.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {displayTestimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="flex flex-col rounded-lg border border-white/10 bg-white dark:bg-white/5 p-6"
                        >
                            <p className="flex-grow text-base italic text-gray-700 dark:text-gray-300 font-body">
                                "{testimonial.quote}"
                            </p>
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-sm font-bold text-slate-900 dark:text-gray-100 font-display">
                                    {testimonial.name}
                                </p>
                                <p className="text-sm text-gray-500">{testimonial.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==========================================
// Custom Sections Preview
// ==========================================

export function CustomSectionsPreview({ sections }: { sections?: ContentBlock[] }) {
    if (!sections || sections.length === 0) return null;

    return (
        <>
            {sections.map(section => {
                if (section.enabled === false) return null;
                switch (section.type) {
                    case 'image_text':
                        const imgBlock = section as ImageTextBlock;
                        const isRight = imgBlock.layout === 'right';
                        return (
                            <section key={section.id} className="py-16 md:py-24 bg-white dark:bg-white/5">
                                <div className="container mx-auto px-4">
                                    <div className={`flex flex-col md:flex-row gap-12 items-center ${isRight ? 'md:flex-row-reverse' : ''}`}>
                                        <div className="w-full md:w-1/2">
                                            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                                                <img src={imgBlock.image_url} alt={imgBlock.title} className="object-cover w-full h-full" />
                                            </div>
                                        </div>
                                        <div className="w-full md:w-1/2 flex flex-col gap-6">
                                            <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-900 dark:text-white">{imgBlock.title}</h2>
                                            <div className="prose dark:prose-invert text-lg text-gray-600 dark:text-gray-300 font-body">
                                                {imgBlock.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        );
                    case 'text':
                        const txtBlock = section as TextBlock;
                        const alignClass = { left: 'text-left items-start', center: 'text-center items-center', right: 'text-right items-end' }[txtBlock.alignment || 'left'];
                        return (
                            <section key={section.id} className="py-16 md:py-24 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)]">
                                <div className="container mx-auto px-4">
                                    <div className={`max-w-4xl mx-auto flex flex-col gap-6 ${alignClass}`}>
                                        {txtBlock.title && <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-900 dark:text-white">{txtBlock.title}</h2>}
                                        <div className="prose dark:prose-invert text-lg text-gray-600 dark:text-gray-300 font-body max-w-none w-full">
                                            {txtBlock.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        );
                    case 'gallery':
                        const galBlock = section as GalleryBlock;
                        return (
                            <section key={section.id} className="py-16 md:py-24 bg-white dark:bg-white/5">
                                <div className="container mx-auto px-4 text-center">
                                    <h2 className="text-3xl font-bold mb-8 dark:text-white">{galBlock.title || 'Gallery'}</h2>
                                    <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">Gallery Preview Placeholder</div>
                                </div>
                            </section>
                        );
                    case 'frame':
                        const frmBlock = section as FrameBlock;
                        return (
                            <section key={section.id} className="py-8 md:py-12 bg-white dark:bg-white/5">
                                <div className="container mx-auto px-4">
                                    <div style={{ height: `${frmBlock.height}px` }} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                                        <span className="text-gray-400">Embedded Content: {frmBlock.url}</span>
                                    </div>
                                </div>
                            </section>
                        );
                    default: return null;
                }
            })}
        </>
    );
}

// ==========================================
// Final CTA Preview
// ==========================================

export function FinalCTAPreview({ config }: { config: FinalCTAConfig }) {
    const getBackgroundClasses = () => {
        switch (config.background_style) {
            case 'accent': return 'bg-[rgba(var(--primary-rgb),0.2)]';
            case 'gradient': return 'bg-gradient-to-r from-[rgba(var(--primary-rgb),0.1)] to-[rgba(var(--primary-rgb),0.2)]';
            case 'default':
            default: return 'bg-[rgba(var(--primary-rgb),0.1)]';
        }
    };

    const getButtonClasses = () => {
        let styleClasses = '';
        switch (config.cta_button.style) {
            case 'outline': styleClasses = 'border-2 border-[var(--primary)] text-[var(--primary)] bg-transparent hover:bg-[var(--primary)] hover:text-black'; break;
            case 'gradient': styleClasses = 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] brightness-90 text-white'; break;
            case 'solid': default: styleClasses = 'bg-[var(--primary)] text-white'; break;
        }
        return `mt-8 inline-flex mx-auto min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg font-bold tracking-wide transition-transform hover:scale-105 font-display h-12 px-6 text-base ${styleClasses}`;
    };

    return (
        <section className="container mx-auto px-4 py-16 sm:py-24">
            <div className={`rounded-lg ${getBackgroundClasses()} p-8 text-center md:p-16`}>
                <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f5f5f5] sm:text-4xl font-display">
                    {config.title}
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-body">
                    {config.subtitle}
                </p>
                <div className={getButtonClasses()}>
                    {config.cta_button.text || 'Book Now'}
                </div>
            </div>
        </section>
    );
}

// ==========================================
// Footer Preview
// ==========================================

export function FooterPreview({ config }: { config: FooterConfig }) {
    return (
        <footer className="bg-[var(--bg-dark)] border-t border-white/10">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div>
                        <h3 className="text-lg font-bold font-display text-white">{config.business_name}</h3>
                        <p className="mt-2 text-sm text-gray-400 font-body whitespace-pre-line">{config.address}</p>
                        <p className="mt-2 text-sm text-gray-400 font-body">{config.phone}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold font-display text-white">Opening Hours</h3>
                        <ul className="mt-2 space-y-1 text-sm text-gray-400 font-body">
                            {config.hours.map((hour, i) => <li key={i}>{hour}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold font-display text-white">Follow Us</h3>
                        <div className="mt-2 flex space-x-4">
                            {/* Mock Social Icons */}
                            {['instagram', 'facebook', 'twitter'].map(platform => (
                                <div key={platform} className="h-6 w-6 bg-gray-600 rounded-full hover:bg-[var(--primary)] transition-colors"></div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>&copy; {new Date().getFullYear()} {config.business_name}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
