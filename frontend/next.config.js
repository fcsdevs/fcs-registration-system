/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Force dynamic rendering for all pages
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
