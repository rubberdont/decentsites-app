import React, { useState } from 'react';
import { Testimonial, SectionConfig } from '@/types';

interface ReviewsEditorProps {
    sectionConfig: SectionConfig;
    testimonials: Testimonial[];
    onChange: (sectionUpdate: Partial<SectionConfig>, testimonialsUpdate?: Testimonial[]) => void;
}

export function ReviewsEditor({ sectionConfig, testimonials, onChange }: ReviewsEditorProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleTestimonialChange = (index: number, field: keyof Testimonial, value: string) => {
        const newTestimonials = [...testimonials];
        newTestimonials[index] = { ...newTestimonials[index], [field]: value };
        onChange({}, newTestimonials);
    };

    const handleAddTestimonial = () => {
        const newTestimonial: Testimonial = {
            id: Date.now().toString(),
            quote: 'New review...',
            name: 'Customer Name',
            title: 'Customer Title'
        };
        onChange({}, [...testimonials, newTestimonial]);
    };

    const handleDeleteTestimonial = (index: number) => {
        const newTestimonials = testimonials.filter((_, i) => i !== index);
        onChange({}, newTestimonials);
    };

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div
                    className="flex items-center gap-2 cursor-pointer select-none"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">star</span>
                        Reviews & Ratings
                    </h3>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${isExpanded ? '' : 'rotate-180'}`}>
                        expand_less
                    </span>
                </div>
                {/* Section Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={sectionConfig.enabled !== false}
                        onChange={(e) => onChange({ enabled: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>

            {isExpanded && (sectionConfig.enabled !== false) && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    {testimonials.map((testimonial, index) => (
                        <div key={testimonial.id} className="relative p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            {/* Delete Button */}
                            <button
                                onClick={() => handleDeleteTestimonial(index)}
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete Review"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>

                            <div className="space-y-3 pr-6">
                                <label className="block">
                                    <span className="text-xs font-medium text-slate-500 uppercase">Review Quote</span>
                                    <textarea
                                        rows={2}
                                        value={testimonial.quote}
                                        onChange={(e) => handleTestimonialChange(index, 'quote', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-sm px-3 py-2"
                                    />
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="block">
                                        <span className="text-xs font-medium text-slate-500 uppercase">Author Name</span>
                                        <input
                                            type="text"
                                            value={testimonial.name}
                                            onChange={(e) => handleTestimonialChange(index, 'name', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-sm px-3 py-2"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-medium text-slate-500 uppercase">Title / Role</span>
                                        <input
                                            type="text"
                                            value={testimonial.title}
                                            onChange={(e) => handleTestimonialChange(index, 'title', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary text-sm px-3 py-2"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleAddTestimonial}
                        className="w-full py-2 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 hover:text-primary hover:border-primary transition-colors font-medium text-sm"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add New Review
                    </button>
                </div>
            )}

            <hr className="border-slate-200 dark:border-slate-800" />
        </section>
    );
}
