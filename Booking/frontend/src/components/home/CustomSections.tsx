'use client';

import React from 'react';
import type { ContentBlock, ImageTextBlock, TextBlock, GalleryBlock, FrameBlock } from '@/types';

interface CustomSectionsProps {
    sections?: ContentBlock[];
}

export default function CustomSections({ sections }: CustomSectionsProps) {
    if (!sections || sections.length === 0) return null;

    return (
        <>
            {sections.map((section) => {
                if (section.enabled === false) return null;

                switch (section.type) {
                    case 'image_text':
                        return <ImageTextSection key={section.id} block={section as ImageTextBlock} />;
                    case 'text':
                        return <TextSection key={section.id} block={section as TextBlock} />;
                    case 'gallery':
                        return <GallerySection key={section.id} block={section as GalleryBlock} />;
                    case 'frame':
                        return <FrameSection key={section.id} block={section as FrameBlock} />;
                    default:
                        return null;
                }
            })}
        </>
    );
}

// Sub-components

function ImageTextSection({ block }: { block: ImageTextBlock }) {
    const isRight = block.layout === 'right';

    return (
        <section className="py-16 md:py-24 bg-white/5 dark:bg-white/5/5">
            <div className="container mx-auto px-4">
                <div className={`flex flex-col md:flex-row gap-12 items-center ${isRight ? 'md:flex-row-reverse' : ''}`}>
                    {/* Image */}
                    <div className="w-full md:w-1/2">
                        <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src={block.image_url}
                                alt={block.title}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>
                    {/* Content */}
                    <div className="w-full md:w-1/2 flex flex-col gap-6">
                        <h2 className="text-3xl md:text-4xl font-bold font-display text-white dark:text-white">
                            {block.title}
                        </h2>
                        <div className="prose dark:prose-invert dark:prose dark:prose-invert-invert text-lg text-gray-300 dark:text-gray-300 font-body">
                            {block.content.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TextSection({ block }: { block: TextBlock }) {
    const alignClass = {
        left: 'text-left items-start',
        center: 'text-center items-center',
        right: 'text-right items-end'
    }[block.alignment || 'left'];

    return (
        <section className="py-16 md:py-24 bg-[var(--bg-dark)] dark:bg-[var(--bg-dark)]">
            <div className="container mx-auto px-4">
                <div className={`max-w-4xl mx-auto flex flex-col gap-6 ${alignClass}`}>
                    {block.title && (
                        <h2 className="text-3xl md:text-4xl font-bold font-display text-white dark:text-white">
                            {block.title}
                        </h2>
                    )}
                    <div className={`prose dark:prose-invert dark:prose dark:prose-invert-invert text-lg text-gray-300 dark:text-gray-300 font-body max-w-none w-full`}>
                        {block.content.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function GallerySection({ block }: { block: GalleryBlock }) {
    return (
        <section className="py-16 md:py-24 bg-white/5 dark:bg-white/5/5">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-8 dark:text-white">{block.title || 'Gallery'}</h2>
                <p className="text-gray-500 italic">Gallery display coming soon...</p>
            </div>
        </section>
    );
}

function FrameSection({ block }: { block: FrameBlock }) {
    return (
        <section className="py-8 md:py-12 bg-white/5 dark:bg-white/5/5">
            <div className="container mx-auto px-4">
                <iframe
                    src={block.url}
                    style={{ height: `${block.height}px` }}
                    className="w-full rounded-xl border border-gray-800 dark:border-gray-800 shadow-sm"
                    title="Embedded Content"
                />
            </div>
        </section>
    );
}
