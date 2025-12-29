import React, { useState } from 'react';
import { BrandingConfig } from '@/types';

interface BrandingEditorProps {
    config: BrandingConfig;
    onChange: (update: Partial<BrandingConfig>) => void;
}

export function BrandingEditor({ config, onChange }: BrandingEditorProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleChange = (field: keyof BrandingConfig, value: string) => {
        onChange({ [field]: value });
    };

    return (
        <section className="flex flex-col gap-4">
            <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">palette</span>
                    Branding & Colors
                </h3>
                <span className={`material-symbols-outlined text-slate-400 transition-transform ${isExpanded ? '' : 'rotate-180'}`}>
                    expand_less
                </span>
            </div>

            {isExpanded && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Primary Color (Action Buttons)</span>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="color"
                                    value={config.primary_color}
                                    onChange={(e) => handleChange('primary_color', e.target.value)}
                                    className="h-10 w-20 p-1 rounded border border-slate-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={config.primary_color}
                                    onChange={(e) => handleChange('primary_color', e.target.value)}
                                    className="flex-1 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                                />
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Light Background (Sections)</span>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="color"
                                    value={config.light_bg_color}
                                    onChange={(e) => handleChange('light_bg_color', e.target.value)}
                                    className="h-10 w-20 p-1 rounded border border-slate-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={config.light_bg_color}
                                    onChange={(e) => handleChange('light_bg_color', e.target.value)}
                                    className="flex-1 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                                />
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark Background (Hero/Footer)</span>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="color"
                                    value={config.dark_bg_color}
                                    onChange={(e) => handleChange('dark_bg_color', e.target.value)}
                                    className="h-10 w-20 p-1 rounded border border-slate-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={config.dark_bg_color}
                                    onChange={(e) => handleChange('dark_bg_color', e.target.value)}
                                    className="flex-1 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                                />
                            </div>
                        </label>
                    </div>
                </div>
            )}
        </section>
    );
}
