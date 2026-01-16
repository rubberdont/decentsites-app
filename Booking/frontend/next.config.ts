import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
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
        // Match all backend API paths (auth, profiles, bookings, admin, etc.)
        // Exclude Next.js internal paths (_next, static, favicon.ico)
        source: '/((?!_next|static|favicon.ico).*)',
        destination: 'http://localhost:1301/',
      },
    ];
  },
};

export default nextConfig;
