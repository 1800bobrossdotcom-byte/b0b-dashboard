import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // For Docker self-hosted fallback
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
};

export default nextConfig;
