'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { landingAPI } from '@/services/api';
import { LandingPageConfig, LandingPageConfigUpdate } from '@/types';
import { EditorPanel } from '@/components/landing-editor/EditorPanel';
import { PreviewPanel } from '@/components/landing-editor/PreviewPanel';

export default function LandingEditorPage() {
    const [config, setConfig] = useState<LandingPageConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const fetchConfig = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await landingAPI.getConfig();
            setConfig(response.data);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Failed to fetch config:', error);
            toast.error('Failed to load landing page configuration');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const handleConfigChange = (update: LandingPageConfigUpdate) => {
        if (!config) return;

        // Merge update into current config
        // Note: This is a shallow merge for top-level sections, deep merge for nested fields needs care
        // For now assuming the EditorPanel sends complete section objects or we handle it here

        // We'll update the local state immediately for live preview
        // In a real app we might want to debounce this or keep a separate "draft" state

        // For this simple editor, we can just spread the update
        setConfig((prev) => {
            if (!prev) return null;
            return { ...prev, ...update } as LandingPageConfig;
        });
        setHasUnsavedChanges(true);
    };

    const handleSaveAndPublish = async () => {
        if (!config) return;
        setIsSaving(true);
        try {
            // 1. Update config
            // We send the entire relevant parts as update
            const updateData: LandingPageConfigUpdate = {
                hero: config.hero,
                services_section: config.services_section,
                portfolio_section: config.portfolio_section,
                portfolio_items: config.portfolio_items,
                stats_section: config.stats_section,
                stats: config.stats,
                testimonials_section: config.testimonials_section,
                testimonials: config.testimonials,
                final_cta: config.final_cta,
                custom_sections: config.custom_sections,
                footer: config.footer,
                branding: config.branding,
            };

            await landingAPI.updateConfig(updateData);

            // 2. Publish
            await landingAPI.publish();

            toast.success('Changes published successfully!');
            setHasUnsavedChanges(false);

            // Optionally refetch?
            // fetchConfig(); 
        } catch (error) {
            console.error('Failed to publish changes:', error);
            toast.error('Failed to publish changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        if (confirm('Are you sure you want to discard your unsaved changes?')) {
            fetchConfig(); // Reload from server
        }
    };

    if (isLoading && !config) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-500">
                <p>Failed to load configuration.</p>
                <button onClick={fetchConfig} className="mt-4 text-primary hover:underline">Try Again</button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark h-[calc(100vh-64px)] overflow-hidden">
            {/* Header Area */}
            <header className="bg-white dark:bg-[#16202a] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col gap-4 shrink-0">
                {/* Page Heading & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">Landing Page Editor</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">Customize your customer-facing booking site</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDiscard}
                            disabled={!hasUnsavedChanges || isSaving}
                            className={`flex items-center justify-center rounded-lg h-10 px-4 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Discard Changes
                        </button>
                        <button
                            onClick={handleSaveAndPublish}
                            disabled={!hasUnsavedChanges || isSaving}
                            className={`flex items-center justify-center rounded-lg h-10 px-6 bg-primary hover:bg-blue-600 text-white shadow-sm transition-colors text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSaving ? 'Publishing...' : 'Publish Changes'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Editor Workspace (Split View) */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT PANEL: Editor Controls */}
                <EditorPanel config={config} onChange={handleConfigChange} />

                {/* RIGHT PANEL: Live Preview */}
                <PreviewPanel config={config} />
            </div>
        </div>
    );
}
