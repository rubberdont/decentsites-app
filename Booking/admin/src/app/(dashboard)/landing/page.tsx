'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { LandingPageConfig } from '@/types';
import { landingAPI } from '@/services/api';
import { LoadingSpinner } from '@/components/ui';
import HeroEditor from '@/components/landing-editor/HeroEditor';
import PortfolioEditor from '@/components/landing-editor/PortfolioEditor';
import StatsEditor from '@/components/landing-editor/StatsEditor';
import TestimonialsEditor from '@/components/landing-editor/TestimonialsEditor';
import FinalCTAEditor from '@/components/landing-editor/FinalCTAEditor';
import FooterEditor from '@/components/landing-editor/FooterEditor';
import BrandingEditor from '@/components/landing-editor/BrandingEditor';

/**
 * Landing Page Editor Page
 * Allows owners to customize their landing page content
 */
export default function LandingPageEditor() {
  const [config, setConfig] = useState<LandingPageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  /**
   * Fetch landing page configuration
   */
  const fetchConfig = async () => {
    try {
      const response = await landingAPI.getConfig();
      setConfig(response.data);
    } catch (error) {
      console.error('Error fetching landing config:', error);
      toast.error('Failed to load landing page configuration');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  /**
   * Save configuration changes
   */
  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    try {
      await landingAPI.updateConfig(config);
      toast.success('Landing page updated successfully');
    } catch (error) {
      console.error('Error saving landing config:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Publish/unpublish the landing page
   */
  const handleTogglePublish = async () => {
    if (!config) return;

    try {
      if (config.is_published) {
        await landingAPI.unpublish();
        setConfig({ ...config, is_published: false });
        toast.success('Landing page unpublished');
      } else {
        await landingAPI.publish();
        setConfig({ ...config, is_published: true });
        toast.success('Landing page published');
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

  /**
   * Update hero configuration
   */
  const updateHero = (hero: any) => {
    if (!config) return;
    setConfig({ ...config, hero });
  };

  /**
   * Update portfolio configuration
   */
  const updatePortfolioSection = (portfolio_section: any) => {
    if (!config) return;
    setConfig({ ...config, portfolio_section });
  };

  const updatePortfolioItems = (portfolio_items: any) => {
    if (!config) return;
    setConfig({ ...config, portfolio_items });
  };

  /**
   * Update stats configuration
   */
  const updateStatsSection = (stats_section: any) => {
    if (!config) return;
    setConfig({ ...config, stats_section });
  };

  const updateStats = (stats: any) => {
    if (!config) return;
    setConfig({ ...config, stats });
  };

  /**
   * Update testimonials configuration
   */
  const updateTestimonialsSection = (testimonials_section: any) => {
    if (!config) return;
    setConfig({ ...config, testimonials_section });
  };

  const updateTestimonials = (testimonials: any) => {
    if (!config) return;
    setConfig({ ...config, testimonials });
  };

  /**
   * Update final CTA configuration
   */
  const updateFinalCTA = (final_cta: any) => {
    if (!config) return;
    setConfig({ ...config, final_cta });
  };

  /**
   * Update footer configuration
   */
  const updateFooter = (footer: any) => {
    if (!config) return;
    setConfig({ ...config, footer });
  };

  /**
   * Update branding configuration
   */
  const updateBranding = (branding: any) => {
    if (!config) return;
    setConfig({ ...config, branding });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (!config) {
    return (
      <div className="text-center py-16 bg-admin-bg-card rounded-lg border border-admin-border">
        <svg
          className="w-16 h-16 mx-auto text-red-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-lg font-medium text-admin-text mb-2">Configuration Not Found</h3>
        <p className="text-admin-text-muted">Unable to load landing page configuration.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'hero', label: 'Hero', icon: '🎯' },
    { id: 'portfolio', label: 'Portfolio', icon: '📸' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'testimonials', label: 'Testimonials', icon: '💬' },
    { id: 'final-cta', label: 'Final CTA', icon: '🎯' },
    { id: 'footer', label: 'Footer', icon: '📄' },
    { id: 'branding', label: 'Branding', icon: '🎨' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-admin-text">Landing Page Editor</h1>
          <p className="text-sm text-admin-text-muted mt-1">
            Customize your landing page content and branding
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Publish Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${config.is_published ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-admin-text-muted">
              {config.is_published ? 'Published' : 'Draft'}
            </span>
          </div>

          {/* Publish Toggle */}
          <button
            onClick={handleTogglePublish}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              config.is_published
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {config.is_published ? 'Unpublish' : 'Publish'}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-admin-primary hover:bg-admin-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-admin-border">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-admin-primary text-admin-primary'
                  : 'border-transparent text-admin-text-muted hover:text-admin-text hover:border-admin-border'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-xl font-semibold text-admin-text">Hero Section</h2>
            </div>
            <HeroEditor config={config.hero} onChange={updateHero} />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-admin-text">Portfolio Section</h2>
            </div>
            <PortfolioEditor
              sectionConfig={config.portfolio_section}
              items={config.portfolio_items}
              onSectionChange={updatePortfolioSection}
              onItemsChange={updatePortfolioItems}
            />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-xl font-semibold text-admin-text">Stats Section</h2>
            </div>
            <StatsEditor
              sectionConfig={config.stats_section}
              stats={config.stats}
              onSectionChange={updateStatsSection}
              onStatsChange={updateStats}
            />
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="text-xl font-semibold text-admin-text">Testimonials Section</h2>
            </div>
            <TestimonialsEditor
              sectionConfig={config.testimonials_section}
              testimonials={config.testimonials}
              onSectionChange={updateTestimonialsSection}
              onTestimonialsChange={updateTestimonials}
            />
          </div>
        )}

        {activeTab === 'final-cta' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-xl font-semibold text-admin-text">Final Call-to-Action</h2>
            </div>
            <FinalCTAEditor config={config.final_cta} onChange={updateFinalCTA} />
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-admin-text">Footer</h2>
            </div>
            <FooterEditor config={config.footer} onChange={updateFooter} />
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              <h2 className="text-xl font-semibold text-admin-text">Branding</h2>
            </div>
            <BrandingEditor config={config.branding} onChange={updateBranding} />
          </div>
        )}
      </div>
    </div>
  );
}