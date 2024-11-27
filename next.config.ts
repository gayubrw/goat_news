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
          {
            protocol: 'https',
            hostname: 'img.clerk.com',
          },
        ],
        // Tambahkan ini untuk mengizinkan semua domains saat development
        // CATATAN: Ini hanya untuk development, jangan gunakan di production
        unoptimized: process.env.NODE_ENV === 'development',
    },
};

export default nextConfig;
