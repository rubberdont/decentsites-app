import React, { useState } from 'react';
import { LandingPageConfig } from '@/types';
import { PhoneFrame } from './preview/PhoneFrame';
import { LivePreviewContent } from './preview/LivePreviewContent';

interface PreviewPanelProps {
    config: LandingPageConfig;
    isLoading?: boolean;
}

export function PreviewPanel({ config, isLoading }: PreviewPanelProps) {
    const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

    if (isLoading) {
        return <div className="flex-1 flex items-center justify-center bg-slate-100 dark:bg-[#0B1219]">Loading preview...</div>;
    }

    if (!config) return null;

    return (
        <div className="flex-1 bg-slate-100 dark:bg-[#0B1219] flex flex-col items-center py-8 px-4 overflow-y-hidden relative select-none">
            {/* View Toggle */}
            <div className="mb-8 bg-white dark:bg-[#16202a] p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm inline-flex z-10">
                <button
                    onClick={() => setViewMode('mobile')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium shadow-sm transition-all ${viewMode === 'mobile'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    <span className="material-symbols-outlined text-[18px]">smartphone</span>
                    Mobile
                </button>
                <button
                    onClick={() => setViewMode('desktop')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-all ${viewMode === 'desktop'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
                    Desktop
                </button>
            </div>

            {/* Phone Frame */}
            {viewMode === 'mobile' ? (
                <PhoneFrame>
                    <LivePreviewContent config={config} />
                </PhoneFrame>
            ) : (
                <div className="w-full h-full max-w-6xl bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-300">
                    {/* Simulated Browser Toolbar */}
                    <div className="h-10 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-4 shrink-0">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                        </div>

                        {/* Fake URL Bar */}
                        <div className="flex-1 max-w-2xl mx-auto">
                            <div className="h-7 bg-white dark:bg-black border border-slate-200 dark:border-slate-700 rounded-md flex items-center px-3 gap-2">
                                <span className="material-symbols-outlined text-[14px] text-slate-400">lock</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex-1 truncate">
                                    your-site.com
                                </span>
                                <span className="material-symbols-outlined text-[14px] text-slate-400">refresh</span>
                            </div>
                        </div>

                        <div className="w-14"></div> {/* Spacer for balance */}
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        <LivePreviewContent config={config} />
                    </div>
                </div>
            )}
        </div>
    );
}
