'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide header on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  if (isAuthPage) {
    return null;
  }

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-[#f5f5f5]/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border-b border-white/10' 
          : 'bg-[#f5f5f5]/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border-b border-white/10'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between whitespace-nowrap px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 text-[#1a1a1a] dark:text-[#f5f5f5]">
          <div className="size-6 text-[#d4af37]">
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.25 3v1.5M4.5 8.25H19.5M18.75 3.75h-15a2.25 2.25 0 0 0-2.25 2.25v11.25c0 1.242 1.008 2.25 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25Zm-10.5 5.25h.008v.008h-.008v-.008Zm.75 2.25h.008v.008h-.008v-.008Zm2.25.75h.008v.008h-.008v-.008Zm2.25-.75h.008v.008h-.008v-.008Zm.75 2.25h.008v.008h-.008v-.008Zm2.25.75h.008v.008h-.008v-.008Zm-8.25-7.5h.008v.008h-.008v-.008Zm.75 2.25h.008v.008h-.008v-.008Z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tighter font-display">The Modern Gentleman</h2>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-end gap-8">
          <nav className="flex items-center gap-8">
            <Link 
              href="/book" 
              className="text-sm font-medium hover:text-[#d4af37] transition-colors font-display"
            >
              Services
            </Link>
            {isAuthenticated && (
              <Link 
                href="/my-bookings" 
                className="text-sm font-medium hover:text-[#d4af37] transition-colors font-display"
              >
                My Bookings
              </Link>
            )}
          </nav>

          {/* Auth Actions */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="hidden lg:inline text-sm text-[#1a1a1a] dark:text-[#f5f5f5] font-medium">
                Hey, {user?.name}
              </span>
              <Link
                href="/settings/profile"
                className="text-sm font-medium hover:text-[#d4af37] transition-colors font-display"
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 border border-[#d4af37] text-[#d4af37] text-sm font-bold tracking-wide hover:bg-[#d4af37]/10 transition-colors font-display"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium hover:text-[#d4af37] transition-colors font-display"
              >
                Sign In
              </Link>
              <Link
                href="/book"
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 border border-[#d4af37] text-[#d4af37] text-sm font-bold tracking-wide hover:bg-[#d4af37]/10 transition-colors font-display"
              >
                Book Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            className="p-2 text-[#1a1a1a] dark:text-[#f5f5f5]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#f5f5f5] dark:bg-[#1a1a1a] border-t border-white/10 px-4 py-4">
          <nav className="flex flex-col gap-4">
            <Link 
              href="/book" 
              className="text-sm font-medium hover:text-[#d4af37] transition-colors font-display"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  href="/my-bookings" 
                  className="text-sm font-medium hover:text-[#d4af37] transition-colors font-display"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Bookings
                </Link>
                <Link
                  href="/settings/profile"
                  className="text-sm font-medium hover:text-[#d4af37] transition-colors font-display"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left text-sm font-medium text-[#d4af37] transition-colors font-display"
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium hover:text-[#d4af37] transition-colors font-display"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium text-[#d4af37] transition-colors font-display"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
