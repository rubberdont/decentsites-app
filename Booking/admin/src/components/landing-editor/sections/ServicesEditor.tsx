import React from 'react';
import { SectionConfig } from '@/types';

interface ServicesEditorProps {
    config: SectionConfig;
    onChange: (update: Partial<SectionConfig>) => void;
}

export function ServicesEditor({ config, onChange }: ServicesEditorProps) {
    // Dummy data for visual match with mockup
    const dummyServices = [
        { name: "Men's Haircut", price: "$30.00", duration: "30 mins", icon: "person" },
        { name: "Beard Trim", price: "$15.00", duration: "15 mins", icon: "face" },
        { name: "Kids Cut", price: "$25.00", duration: "30 mins", icon: "child_care", opacity: "opacity-60", checked: false },
    ];

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">content_cut</span>
                    Services List
                </h3>
                {/* Section Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => onChange({ enabled: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>

            <div className="flex flex-col gap-3">
                {dummyServices.map((service, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${service.opacity || ''}`}>
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md">
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-[20px]">{service.icon}</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{service.name}</p>
                                <p className="text-xs text-slate-500">{service.price} • {service.duration}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked={service.checked !== false} className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                            <button className="p-1 text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-xs text-slate-400 italic text-center mt-2">
                * Services management coming soon. Currently showing mockup data.
            </p>

            <hr className="border-slate-200 dark:border-slate-800" />
        </section>
    );
}
