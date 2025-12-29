import React, { useState } from 'react';
import { ContentBlock, ImageTextBlock, TextBlock, FrameBlock, GalleryBlock } from '@/types';

interface CustomSectionsEditorProps {
    sections: ContentBlock[];
    onChange: (sections: ContentBlock[]) => void;
}

export function CustomSectionsEditor({ sections = [], onChange }: CustomSectionsEditorProps) {
    const handleAddSection = (type: ContentBlock['type']) => {
        const id = Date.now().toString();
        let newSection: ContentBlock;

        switch (type) {
            case 'image_text':
                newSection = {
                    id, type: 'image_text', enabled: true,
                    title: 'New Section', content: 'Add your content here.',
                    image_url: '', layout: 'left'
                } as ImageTextBlock;
                break;
            case 'text':
                newSection = {
                    id, type: 'text', enabled: true,
                    content: 'Add your text content here.', alignment: 'left'
                } as TextBlock;
                break;
            case 'gallery':
                newSection = {
                    id, type: 'gallery', enabled: true,
                    title: 'New Gallery', layout: 'grid', images: []
                } as GalleryBlock;
                break;
            case 'frame':
                newSection = {
                    id, type: 'frame', enabled: true,
                    url: '', height: 400
                } as FrameBlock;
                break;
            default:
                return;
        }

        onChange([...sections, newSection]);
    };

    const handleUpdateSection = (index: number, update: Partial<ContentBlock>) => {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], ...update } as ContentBlock;
        onChange(newSections);
    };

    const handleDeleteSection = (index: number) => {
        const newSections = sections.filter((_, i) => i !== index);
        onChange(newSections);
    };

    return (
        <section className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-6">
                Custom Content Sections
            </h3>

            <div className="space-y-6">
                {sections.map((section, index) => (
                    <div key={section.id} className="relative p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        {/* Header / Toggle / Delete */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold uppercase text-slate-500">{section.type.replace('_', ' ')}</span>
                            <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={section.enabled}
                                        onChange={(e) => handleUpdateSection(index, { enabled: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                                <button
                                    onClick={() => handleDeleteSection(index)}
                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        </div>

                        {/* Editor Controls based on Type */}
                        <div className="space-y-4">
                            {/* Common Title/Content fields if applicable */}
                            {'title' in section && (
                                <label className="block">
                                    <span className="text-xs font-medium text-slate-500 uppercase">Title</span>
                                    <input
                                        type="text"
                                        value={(section as any).title || ''}
                                        onChange={(e) => handleUpdateSection(index, { title: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm px-3 py-2"
                                    />
                                </label>
                            )}

                            {'content' in section && (
                                <label className="block">
                                    <span className="text-xs font-medium text-slate-500 uppercase">Content</span>
                                    <textarea
                                        rows={3}
                                        value={(section as any).content || ''}
                                        onChange={(e) => handleUpdateSection(index, { content: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm px-3 py-2"
                                    />
                                </label>
                            )}

                            {/* Type Specific Fields */}
                            {section.type === 'image_text' && (
                                <>
                                    <label className="block">
                                        <span className="text-xs font-medium text-slate-500 uppercase">Image URL</span>
                                        <input
                                            type="text"
                                            value={(section as ImageTextBlock).image_url}
                                            onChange={(e) => handleUpdateSection(index, { image_url: e.target.value })}
                                            placeholder="https://..."
                                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm px-3 py-2"
                                        />
                                    </label>
                                    <div className="block">
                                        <span className="text-xs font-medium text-slate-500 uppercase">Layout</span>
                                        <div className="mt-1 flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden">
                                            {['left', 'right'].map((layout) => (
                                                <button
                                                    key={layout}
                                                    onClick={() => handleUpdateSection(index, { layout: layout as any })}
                                                    className={`flex-1 py-1 text-center text-xs uppercase ${(section as ImageTextBlock).layout === layout
                                                            ? 'bg-primary text-white'
                                                            : 'bg-white dark:bg-slate-800 text-slate-500'
                                                        }`}
                                                >
                                                    Image {layout}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {section.type === 'text' && (
                                <div className="block">
                                    <span className="text-xs font-medium text-slate-500 uppercase">Alignment</span>
                                    <div className="mt-1 flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden">
                                        {['left', 'center', 'right'].map((align) => (
                                            <button
                                                key={align}
                                                onClick={() => handleUpdateSection(index, { alignment: align as any })}
                                                className={`flex-1 py-1 text-center text-xs uppercase ${(section as TextBlock).alignment === align
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white dark:bg-slate-800 text-slate-500'
                                                    }`}
                                            >
                                                {align}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {section.type === 'frame' && (
                                <>
                                    <label className="block">
                                        <span className="text-xs font-medium text-slate-500 uppercase">Embed URL</span>
                                        <input
                                            type="text"
                                            value={(section as FrameBlock).url}
                                            onChange={(e) => handleUpdateSection(index, { url: e.target.value })}
                                            placeholder="https://..."
                                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm px-3 py-2"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-medium text-slate-500 uppercase">Height (px)</span>
                                        <input
                                            type="number"
                                            value={(section as FrameBlock).height}
                                            onChange={(e) => handleUpdateSection(index, { height: parseInt(e.target.value) || 400 })}
                                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm px-3 py-2"
                                        />
                                    </label>
                                </>
                            )}

                            {section.type === 'gallery' && (
                                <p className="text-xs text-slate-400 italic">Gallery image management coming soon.</p>
                            )}

                        </div>
                    </div>
                ))}
            </div>

            {/* Add Section Buttons */}
            <div>
                <span className="text-xs font-bold uppercase text-slate-400 mb-2 block">Add New Section</span>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleAddSection('image_text')} className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary transition-colors text-left">
                        <span className="material-symbols-outlined text-primary">image</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Image with Text</span>
                    </button>
                    <button onClick={() => handleAddSection('text')} className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary transition-colors text-left">
                        <span className="material-symbols-outlined text-primary">notes</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Simple Text</span>
                    </button>
                    <button onClick={() => handleAddSection('gallery')} className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary transition-colors text-left">
                        <span className="material-symbols-outlined text-primary">grid_view</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Gallery</span>
                    </button>
                    <button onClick={() => handleAddSection('frame')} className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary transition-colors text-left">
                        <span className="material-symbols-outlined text-primary">iframe</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Embed Frame</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
