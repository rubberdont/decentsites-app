'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface HeaderProps {
  /** Callback to toggle mobile sidebar */
  onMenuClick?: () => void;
  /** Whether sidebar is collapsed (affects left margin) */
  isSidebarCollapsed?: boolean;
}

/**
 * Top header bar component for admin dashboard
 * Features search input, notifications, and user dropdown
 */
export function Header({ onMenuClick, isSidebarCollapsed = false }: HeaderProps) {
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === UserRole.SUPERADMIN;
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Mock notification count - would come from API in real implementation
  const notificationCount = 3;

  /**
   * Close dropdowns when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Get user initials for avatar
   */
  const getUserInitials = (): string => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <header
      className={`
        fixed top-0 right-0 h-16 bg-admin-bg-card border-b border-admin-border
        flex items-center justify-between px-4 lg:px-6 z-30 transition-all duration-300
        ${isSidebarCollapsed ? 'lg:left-[72px]' : 'lg:left-[280px]'}
        left-0
      `}
    >
      {/* Left Section - Menu Button & Search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-admin-text-muted hover:bg-admin-bg-hover hover:text-admin-text transition-colors lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search Input - Hidden for superadmin */}
        {!isSuperAdmin && (
          <div className="relative flex-1 max-w-md hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-admin-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search bookings, customers..."
              className="w-full pl-10 pr-4 py-2 bg-admin-bg-input border border-admin-border rounded-lg text-admin-text placeholder:text-admin-text-dark focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-colors"
            />
          </div>
        )}
      </div>

      {/* Right Section - Notifications & User */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Mobile Search Button - Hidden for superadmin */}
        {!isSuperAdmin && (
          <button className="p-2 rounded-lg text-admin-text-muted hover:bg-admin-bg-hover hover:text-admin-text transition-colors sm:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg text-admin-text-muted hover:bg-admin-bg-hover hover:text-admin-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Notification Badge */}
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-status-cancelled text-white text-xs font-medium rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-admin-bg-card border border-admin-border rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-admin-border">
                <h3 className="text-sm font-semibold text-admin-text">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {/* Mock Notifications */}
                <div className="px-4 py-3 hover:bg-admin-bg-hover border-b border-admin-border cursor-pointer">
                  <p className="text-sm text-admin-text">New booking request from John Doe</p>
                  <p className="text-xs text-admin-text-muted mt-1">2 minutes ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-admin-bg-hover border-b border-admin-border cursor-pointer">
                  <p className="text-sm text-admin-text">Booking #BK001 has been confirmed</p>
                  <p className="text-xs text-admin-text-muted mt-1">15 minutes ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-admin-bg-hover cursor-pointer">
                  <p className="text-sm text-admin-text">Customer cancelled booking #BK002</p>
                  <p className="text-xs text-admin-text-muted mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-admin-border">
                <button className="text-sm text-admin-primary hover:text-admin-primary-light transition-colors w-full text-center">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-admin-bg-hover transition-colors"
          >
            {/* User Avatar */}
            <div className="w-8 h-8 bg-admin-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
              {getUserInitials()}
            </div>
            {/* User Name - Hidden on mobile */}
            <span className="text-sm font-medium text-admin-text hidden lg:block">
              {user?.name || 'User'}
            </span>
            {/* Dropdown Arrow */}
            <svg
              className={`w-4 h-4 text-admin-text-muted transition-transform hidden lg:block ${isUserDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* User Dropdown Menu */}
          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-admin-bg-card border border-admin-border rounded-lg shadow-lg overflow-hidden">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-admin-border">
                <p className="text-sm font-medium text-admin-text">{user?.name || 'User'}</p>
                <p className="text-xs text-admin-text-muted">{user?.email || user?.username}</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <a
                  href="/settings/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-admin-text-muted hover:bg-admin-bg-hover hover:text-admin-text transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Your Profile
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-admin-text-muted hover:bg-admin-bg-hover hover:text-admin-text transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </a>
              </div>

              {/* Logout */}
              <div className="border-t border-admin-border py-1">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-status-cancelled hover:bg-admin-bg-hover w-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
