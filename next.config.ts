import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Turbopack config (empty to satisfy Next.js 16 requirement)
  turbopack: {},
  
  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
      },
      {
        protocol: 'https',
        hostname: '**.mapbox.com',
      },
    ],
  },
  
  // Headers configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
    ];
  },
};

export default nextConfig;