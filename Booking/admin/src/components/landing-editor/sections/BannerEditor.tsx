import React, { useState } from 'react';
import { HeroConfig } from '@/types';

interface BannerEditorProps {
    config: HeroConfig;
    onChange: (update: Partial<HeroConfig>) => void;
}

export function BannerEditor({ config, onChange }: BannerEditorProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleChange = (field: keyof HeroConfig, value: string) => {
        onChange({ [field]: value });
    };

    return (
        <section className="flex flex-col gap-4">
            {/* Header */}
            <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">image</span>
                    Banner Settings
                </h3>
                <span className={`material-symbols-outlined text-slate-400 transition-transform ${isExpanded ? '' : 'rotate-180'}`}>
                    expand_less
                </span>
            </div>

            {isExpanded && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Image URL Input (Replacing Upload Area) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Banner Image URL
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={config.background_image_url}
                                onChange={(e) => handleChange('background_image_url', e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="flex-1 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                            />
                        </div>
                        {/* Tiny preview thumbnail */}
                        {config.background_image_url && (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                                <img
                                    src={config.background_image_url}
                                    alt="Banner Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                                    <p className="text-white text-xs font-bold">Preview</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="border-slate-200 dark:border-slate-800" />

                    {/* Layout Controls */}
                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-xs font-medium text-slate-500 uppercase">Height</span>
                            <select
                                value={config.height || 'medium'}
                                onChange={(e) => handleChange('height', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-sm px-3 py-2"
                            >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                                <option value="full">Full Screen</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-xs font-medium text-slate-500 uppercase">Image Fit</span>
                            <select
                                value={config.image_fit || 'cover'}
                                onChange={(e) => handleChange('image_fit', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-sm px-3 py-2"
                            >
                                <option value="cover">Cover (Fill)</option>
                                <option value="contain">Contain (Fit)</option>
                            </select>
                        </label>
                    </div>

                    {/* Typography Controls */}
                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-xs font-medium text-slate-500 uppercase">Text Align</span>
                            <div className="mt-1 flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
                                {['left', 'center', 'right'].map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => handleChange('text_alignment', align)}
                                        className={`flex-1 py-2 text-center transition-colors ${(config.text_alignment || 'center') === align
                                                ? 'bg-primary text-white'
                                                : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">format_align_{align}</span>
                                    </button>
                                ))}
                            </div>
                        </label>
                        <label className="block">
                            <span className="text-xs font-medium text-slate-500 uppercase">Font Family</span>
                            <select
                                value={config.font_family || 'inter'}
                                onChange={(e) => handleChange('font_family', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-sm px-3 py-2"
                            >
                                <option value="inter">Inter (Modern)</option>
                                <option value="playfair">Playfair (Elegant)</option>
                                <option value="roboto">Roboto (Clean)</option>
                                <option value="lora">Lora (Serif)</option>
                            </select>
                        </label>
                    </div>

                    {/* Font Sizes */}
                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-xs font-medium text-slate-500 uppercase">Title Size</span>
                            <select
                                value={config.title_font_size || 'large'}
                                onChange={(e) => handleChange('title_font_size', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-sm px-3 py-2"
                            >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                                <option value="xl">Extra Large</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-xs font-medium text-slate-500 uppercase">Subtitle Size</span>
                            <select
                                value={config.subtitle_font_size || 'medium'}
                                onChange={(e) => handleChange('subtitle_font_size', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-sm px-3 py-2"
                            >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </label>
                    </div>

                    <hr className="border-slate-200 dark:border-slate-800" />

                    {/* Text Inputs */}
                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Shop Headline</span>
                            <input
                                type="text"
                                value={config.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sub-headline</span>
                            <input
                                type="text"
                                value={config.subtitle}
                                onChange={(e) => handleChange('subtitle', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                            />
                        </label>
                    </div>
                </div>
            )}
        </section>
    );
}
