import React, { useState } from 'react';
import { CTAButtonConfig } from '@/types';

interface CTAEditorProps {
    config: CTAButtonConfig;
    onChange: (update: Partial<CTAButtonConfig>) => void;
    label?: string;
}

export function CTAEditor({ config, onChange, label = "Call to Action" }: CTAEditorProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const styles: { value: 'solid' | 'outline' | 'gradient', label: string }[] = [
        { value: 'solid', label: 'Solid' },
        { value: 'outline', label: 'Outline' },
        { value: 'gradient', label: 'Gradient' },
    ];

    return (
        <section className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">touch_app</span>
                {label}
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {/* Button Label */}
                <label className="block col-span-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Button Label</span>
                    <input
                        type="text"
                        value={config.text}
                        onChange={(e) => onChange({ text: e.target.value })}
                        maxLength={30}
                        className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
                    />
                </label>

                {/* Button Style */}
                <label className="block col-span-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Button Style</span>
                    <div className="flex gap-3 mt-2">
                        {styles.map((style) => (
                            <button
                                key={style.value}
                                onClick={() => onChange({ style: style.value })}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-medium border transition-all
                  ${config.style === style.value
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }
                `}
                            >
                                {style.label}
                            </button>
                        ))}
                    </div>
                </label>

                {/* Helper text */}
                <div className="col-span-2">
                    <p className="text-xs text-slate-400">
                        * Button link is set to /book by default and cannot be changed.
                    </p>
                </div>
            </div>
        </section>
    );
}
