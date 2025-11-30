/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable experimental features if needed
  experimental: {
    // optimizePackageImports: ["date-fns"],
  },
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
};

module.exports = nextConfig;
