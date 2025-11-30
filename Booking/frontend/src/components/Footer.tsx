'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#f5f5f5] dark:bg-[#2a2a2a] border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Address */}
          <div>
            <h3 className="text-lg font-bold font-display text-[#1a1a1a] dark:text-[#f5f5f5]">The Modern Gentleman</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-body">
              123 Style Street, Suite 100<br/>
              Metropolis, ST 12345
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-body">(123) 456-7890</p>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-bold font-display text-[#1a1a1a] dark:text-[#f5f5f5]">Opening Hours</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400 font-body">
              <li>Mon - Fri: 9am - 7pm</li>
              <li>Saturday: 10am - 5pm</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-bold font-display text-[#1a1a1a] dark:text-[#f5f5f5]">Follow Us</h3>
            <div className="mt-2 flex space-x-4">
              <a className="text-gray-500 dark:text-gray-400 hover:text-[#d4af37] transition-colors" href="#" aria-label="Instagram">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 012.153 2.153c.247.636.316 1.363.364 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-2.153 2.153c-.636.247-1.363.316-2.427.364-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-2.153-2.153c-.247-.636-.316-1.363-.364-2.427C2.013 15.093 2 14.74 2 12.315s.013-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 012.153-2.153c.636-.247 1.363.316 2.427-.364C9.53 2.013 9.884 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0-2a7 7 0 110 14 7 7 0 010-14zm6.5-4.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" fillRule="evenodd" clipRule="evenodd"/>
                </svg>
              </a>
              <a className="text-gray-500 dark:text-gray-400 hover:text-[#d4af37] transition-colors" href="#" aria-label="Facebook">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a className="text-gray-500 dark:text-gray-400 hover:text-[#d4af37] transition-colors" href="#" aria-label="Twitter">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 2.9,4.79C2.53,5.42 2.33,6.15 2.33,6.94C2.33,8.43 3.11,9.75 4.26,10.54C3.54,10.51 2.87,10.31 2.3,10.01C2.3,10.03 2.3,10.05 2.3,10.07C2.3,12.17 3.81,13.95 5.79,14.33C5.45,14.42 5.08,14.47 4.7,14.47C4.42,14.47 4.15,14.45 3.89,14.4C4.43,16.15 6.08,17.43 8.12,17.47C6.63,18.61 4.81,19.33 2.83,19.33C2.5,19.33 2.17,19.31 1.85,19.26C3.91,20.59 6.36,21.36 9,21.36C16,21.36 20.24,15.39 20.24,10.29C20.24,10.13 20.24,9.97 20.23,9.81C21.01,9.26 21.78,8.55 22.46,7.74"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} The Modern Gentleman. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
