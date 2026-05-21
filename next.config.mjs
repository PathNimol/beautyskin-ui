import { imageHosts } from './image-hosts.config.mjs';

/** Spring REST base URL including `/api` (trim trailing slash). NEXT_PUBLIC_* wins, then API_URL. */
const resolvedPublicApiUrl = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:8080/api'
)
  .trim()
  .replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: resolvedPublicApiUrl,
  },

  productionBrowserSourceMaps: true,
  distDir: process.env.DIST_DIR || '.next',

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
  }
};
export default nextConfig;