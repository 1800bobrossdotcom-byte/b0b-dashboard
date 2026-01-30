import path from "path";
import type { NextConfig } from "next";

// Security headers — c0m auto-fix protocol
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    // Remove X-Powered-By header
    key: 'X-Powered-By',
    value: ''
  }
];

const nextConfig: NextConfig = {
  // Note: standalone output is for Docker deployments only
  // Railway uses nixpacks which handles everything automatically
  // output: 'standalone',
  
  // Security: Remove X-Powered-By header
  poweredByHeader: false,
  
  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.clanker.world',
      },
      {
        protocol: 'https',
        hostname: 'www.anthropic.com',
      },
    ],
  },
  // Point output tracing to repo root to avoid monorepo root inference warnings
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
