import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack: (config) => {
        return config
    },
    async rewrites() {
        return []
    },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'placehold.co',
          },
        ],
      },
};

export default nextConfig;
