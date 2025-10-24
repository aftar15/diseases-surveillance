import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['placekitten.com'],
    formats: ['image/webp'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    },
  },
  typescript: {
    // Only skip type checking in development for faster builds
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Only skip ESLint in development for faster builds
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  // Enable standalone output for Docker
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/analytics',
        destination: '/dashboard/analytics',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
