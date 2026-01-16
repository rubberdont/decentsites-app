/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'localhost',
    '*.app.github.dev',
    '*.github.dev'
  ],
};

module.exports = nextConfig;
