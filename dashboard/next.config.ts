import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: standalone output is for Docker deployments only
  // Railway uses nixpacks which handles everything automatically
  // output: 'standalone',
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
