import { dirname } from 'path';
import { fileURLToPath } from 'url';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');
const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    viewTransition: true,
    optimizeCss: true,
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
      },
      {
        protocol: 'https',
        hostname: 'store.storeimages.cdn-apple.com',
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
      // Legacy /trade/category paths → new /trade/browse paths
      {
        source: '/:locale(en|zh-CN|zh-HK|ar|nl|fr|de|it|ja|ko|pl|pt|ru|es|sv)/trade/category/:cat',
        destination: '/:locale/trade/browse/:cat',
        permanent: true,
      },
      {
        source: '/:locale(en|zh-CN|zh-HK|ar|nl|fr|de|it|ja|ko|pl|pt|ru|es|sv)/trade/category/:cat/brand/:brand',
        destination: '/:locale/trade/browse/:cat/:brand',
        permanent: true,
      },
      {
        source: '/:locale(en|zh-CN|zh-HK|ar|nl|fr|de|it|ja|ko|pl|pt|ru|es|sv)/trade/category/:cat/brand/:brand/series/:series',
        destination: '/:locale/trade/browse/:cat/:brand',
        permanent: true,
      },
    ]
  },
  // reactStrictMode: true,
  // output: 'export',
};

export default withNextIntl(nextConfig);
