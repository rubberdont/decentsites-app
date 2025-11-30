'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar, Header, Breadcrumb } from '@/components/layout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard layout component for /dashboard route
 * Provides sidebar navigation, header, and main content area
 * Protected by authentication
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  /**
   * Handle window resize to auto-collapse sidebar on smaller screens
   */
  useEffect(() => {
    const handleResize = () => {
      // Auto-collapse on medium screens, fully hide on mobile
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setIsSidebarCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        setIsSidebarCollapsed(false);
      }
      // Always close mobile sidebar on resize
      setIsMobileSidebarOpen(false);
    };

    // Run on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Toggle sidebar collapse state
   */
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  /**
   * Toggle mobile sidebar visibility
   */
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  /**
   * Close mobile sidebar
   */
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-admin-bg">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={closeMobileSidebar}
        />

        {/* Header */}
        <Header
          onMenuClick={toggleMobileSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Main Content Area */}
        <main
          className={`
            min-h-screen pt-16 transition-all duration-300
            ${isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[280px]'}
          `}
        >
          <div className="p-4 lg:p-6">
            {/* Breadcrumb Navigation */}
            <Breadcrumb />

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
