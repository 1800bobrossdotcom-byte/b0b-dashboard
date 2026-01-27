import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
