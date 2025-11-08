'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export default function Header() {
  const { user, isAuthenticated, isOwner, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-2xl font-bold text-gray-900 dark:text-white hover:text-[#14B8A6] transition-colors"
            >
              ✂️ Barber<span className="text-[#14B8A6]">Shop</span>
            </Link>
            
            <nav className="hidden lg:flex space-x-8">
              <Link 
                href="/customer-view" 
                className="text-gray-800 dark:text-gray-200 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] font-medium transition-colors"
              >
                Services
              </Link>
              <Link 
                href="/booking-lookup" 
                className="text-gray-800 dark:text-gray-200 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] font-medium transition-colors"
              >
                Lookup Booking
              </Link>
              {isAuthenticated && (
                <Link 
                  href="/my-bookings" 
                  className="text-gray-800 dark:text-gray-200 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] font-medium transition-colors"
                >
                  My Bookings
                </Link>
              )}
              {isAuthenticated && isOwner && (
                <Link 
                  href="/owner/dashboard" 
                  className="text-gray-800 dark:text-gray-200 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] font-semibold transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="hidden sm:inline text-sm text-gray-800 dark:text-gray-200 font-medium">
                  Hey, {user?.name}
                </span>
                <Link
                  href="/settings/profile"
                  className="text-gray-800 dark:text-gray-200 hover:text-[#14B8A6] text-sm font-medium transition-colors"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-800/10 dark:bg-gray-200/10 hover:bg-gray-800/20 dark:hover:bg-gray-200/20 backdrop-blur-sm text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full text-sm font-medium transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/login"
                  className="text-gray-800 dark:text-gray-200 hover:text-[#14B8A6] px-4 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup"
                  className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-6 py-2 rounded-full text-sm font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
