/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["localhost", "*.app.github.dev", "*.github.dev"],
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "http://localhost:1301/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
