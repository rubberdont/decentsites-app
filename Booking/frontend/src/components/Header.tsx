'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
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
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
        ? 'bg-[#1a1a1a]/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border-b border-white/10'
        : 'bg-[#1a1a1a]/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border-b border-white/10'
        }`}
    >
      <div className="container mx-auto flex items-center justify-between whitespace-nowrap px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 text-[#f5f5f5] dark:text-[#f5f5f5]">
          <div className="relative size-12">
            <Image
              src="/barchair.svg"
              alt="Logo"
              fill
              className="object-contain"
            />
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
            <div className="flex items-center gap-4 relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="group flex flex-col items-center justify-center relative focus:outline-none"
                aria-label="Profile Menu"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${profileDropdownOpen ? 'bg-[#d4af37]/20 border border-[#d4af37]' : 'bg-gray-800 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'}`}>
                  <svg className={`size-5 transition-colors ${profileDropdownOpen ? 'text-[#d4af37]' : 'text-[#f5f5f5] dark:text-[#f5f5f5]'}`} fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-[#2a2a2a] dark:bg-[#2a2a2a] shadow-xl border border-white/10 dark:border-white/10 py-1 z-20">
                    <div className="px-4 py-2 border-b border-white/10 dark:border-white/10">
                      <p className="text-xs text-gray-400 dark:text-gray-400">Signed in as</p>
                      <p className="text-sm font-bold text-[#f5f5f5] dark:text-[#f5f5f5] truncate">{user?.name || user?.email || 'User'}</p>
                    </div>
                    <Link
                      href="/settings/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[#f5f5f5] dark:text-[#f5f5f5] hover:bg-gray-800 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      Profile
                    </Link>
                    <Link
                      href="/settings/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[#f5f5f5] dark:text-[#f5f5f5] hover:bg-gray-800 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#d4af37] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-100 dark:border-white/10"
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              )}
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
            className="p-2 text-[#f5f5f5] dark:text-[#f5f5f5]"
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
        <div className="md:hidden bg-[#1a1a1a] dark:bg-[#1a1a1a] border-t border-white/10 px-4 py-4">
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
