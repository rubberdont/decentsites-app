import type { NextConfig } from "next";

console.log('[NextConfig] Loading config...');
console.log('[NextConfig] INTERNAL_API_URL:', process.env.INTERNAL_API_URL);
console.log('[NextConfig] NODE_ENV:', process.env.NODE_ENV);

const nextConfig: NextConfig = {
  output: 'standalone',
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  onDemandEntries: {
    // Make sure we see logs
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  allowedDevOrigins: [
    'localhost',
    '*.app.github.dev',
    '*.github.dev'
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.INTERNAL_API_URL || 'http://localhost:1301'}/:path*`
      },
    ];
  },
};

export default nextConfig;
