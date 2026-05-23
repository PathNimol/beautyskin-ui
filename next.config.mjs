import { imageHosts } from './image-hosts.config.mjs';

/** Spring REST base URL including `/api` (trim trailing slash). NEXT_PUBLIC_* wins, then API_URL. */
const resolvedPublicApiUrl = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:8080/api'
)
  .trim()
  .replace(/\/$/, '');

/**
 * The backend origin only (no /api) — used for the proxy rewrite destination.
 * e.g. "http://localhost:8080/api" → "http://localhost:8080"
 */
const backendOrigin = resolvedPublicApiUrl.replace(/\/api$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: resolvedPublicApiUrl,
  },

  /**
   * Proxy all /api/* requests through Next.js to the Spring backend.
   * This eliminates CORS entirely — the browser only ever talks to localhost:4028.
   * The rewrite is server-side, so no cross-origin request is ever made by the browser.
   */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
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
  },
};

export default nextConfig;
