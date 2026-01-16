/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'localhost',
    '*.app.github.dev',
    '*.github.dev'
  ],
  async rewrites() {
    return [
      {
        // Match all backend API paths (auth, profiles, bookings, admin, etc.)
        // Exclude Next.js internal paths (_next, static, favicon.ico)
        source: '/((?!_next|static|favicon.ico).*)',
        destination: 'http://localhost:1301/:1',
      },
    ];
  },
  output: 'standalone',
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
};

module.exports = nextConfig;
