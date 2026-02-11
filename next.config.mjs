import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logos-world.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.samsung.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Allow cross-origin requests from Capacitor dev server
  allowedDevOrigins: [
    'http://192.168.1.108:3000',
    'http://localhost:3000',
  ],
  async redirects() {
    return [
      {
        source: '/trade/category/:cat',
        destination: '/trade/browse?category=:cat',
        permanent: true,
      },
      {
        source: '/trade/category/:cat/brand/:brand',
        destination: '/trade/browse?category=:cat&brand=:brand',
        permanent: true,
      },
      {
        source: '/trade/category/:cat/brand/:brand/series/:series',
        destination: '/trade/browse?category=:cat&brand=:brand&series=:series',
        permanent: true,
      },
    ]
  },
  // reactStrictMode: true,
  // output: 'export',
};

export default nextConfig;
