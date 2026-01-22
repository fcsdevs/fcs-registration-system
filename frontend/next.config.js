/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable SWR (stale-while-revalidate) to prevent excessive recompilation
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Optimize dev server performance
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
};

module.exports = nextConfig;
