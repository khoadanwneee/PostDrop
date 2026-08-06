import type { NextConfig } from 'next';

const apiUrl = process.env.API_URL || 'http://127.0.0.1:3001';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        // ffmpeg-core.js/.wasm (~32MB) are copied verbatim from the
        // @ffmpeg/core package at install time (see
        // scripts/copy-ffmpeg-core.js) and never change without a
        // dependency bump, so it's safe to cache them for a year — avoids
        // re-downloading them on every visit to the reveal page.
        source: '/ffmpeg/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
