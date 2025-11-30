'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Route name mapping for breadcrumb display
 */
const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  bookings: 'Bookings',
  availability: 'Availability',
  services: 'Services',
  customers: 'Customers',
  analytics: 'Analytics',
  settings: 'Settings',
  profile: 'Profile',
  notifications: 'Notifications',
  security: 'Security',
  new: 'New',
  edit: 'Edit',
  view: 'View',
};

/**
 * Get display name for a route segment
 */
function getRouteName(segment: string): string {
  // Check if it's a known route
  const lowerSegment = segment.toLowerCase();
  if (routeNames[lowerSegment]) {
    return routeNames[lowerSegment];
  }
  
  // Check if it's an ID (alphanumeric string)
  if (/^[a-f0-9]{24}$/i.test(segment) || /^[a-f0-9-]{36}$/i.test(segment)) {
    return 'Details';
  }
  
  // Capitalize and replace hyphens/underscores
  return segment
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast: boolean;
}

/**
 * Breadcrumb navigation component
 * Shows current location path with clickable links
 */
export function Breadcrumb() {
  const pathname = usePathname();
  
  /**
   * Build breadcrumb items from pathname
   */
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    
    // Always start with Dashboard as home
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard', isLast: segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard') }
    ];
    
    // Skip if we're just on dashboard
    if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
      return breadcrumbs;
    }
    
    // Build path progressively
    let currentPath = '';
    segments.forEach((segment, index) => {
      // Skip 'dashboard' if it's the first segment
      if (index === 0 && segment === 'dashboard') {
        return;
      }
      
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      breadcrumbs.push({
        label: getRouteName(segment),
        href: currentPath,
        isLast,
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  // Don't render if only Dashboard
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {/* Separator */}
            {index > 0 && (
              <svg
                className="w-4 h-4 text-admin-text-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            
            {/* Breadcrumb Item */}
            {item.isLast ? (
              <span className="text-admin-text font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-admin-text-muted hover:text-admin-text transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
