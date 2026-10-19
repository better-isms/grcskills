import type { NextConfig } from 'next';

// Static export only: no server, no functions, no image optimizer.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  // Pin the workspace root to this folder (a stray lockfile higher up would
  // otherwise be picked).
  turbopack: { root: process.cwd() },
};

export default nextConfig;
