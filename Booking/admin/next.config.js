/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  allowedDevOrigins: ["localhost", "*.app.github.dev", "*.github.dev"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.INTERNAL_API_URL || "http://localhost:1301"}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
