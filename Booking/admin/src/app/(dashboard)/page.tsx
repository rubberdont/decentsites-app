'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Route group root page - redirects to /dashboard
 */
export default function RouteGroupRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}
