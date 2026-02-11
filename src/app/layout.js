import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { WindowsLayer } from "@/components/ui/windows";
import AdminUI from "@/components/ui/adminUI";
import { Toaster } from "@/components/ui/sonner";
import { ViewTransitions } from "next-view-transitions";
import { ThemeProvider } from "@/components/theme-provider"
import { OrganizationStructuredData, WebSiteStructuredData } from "@/components/seo/StructuredData"
import { DisableLinkContextMenu } from "@/components/ui/disableLinkContextMenu"
import Nav from "@/components/ui/nav";
import MobileSetupGuard from "@/components/mobile-setup-guard";
import PasswordWall from "@/components/password-wall";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'),
  title: {
    default: 'DepxTech - Trade-in Your Electronics for Cash',
    template: '%s | DepxTech',
  },
  description: 'Turn your old electronics into instant cash. Fast quotes, free shipping, and high payouts guaranteed. The smarter way to recycle your tech.',
  keywords: [
    'trade-in',
    'electronics',
    'recycle',
    'sell phone',
    'sell laptop',
    'sell tablet',
    'cash for electronics',
    'tech buyback',
    'eco-friendly',
    'depxtech',
  ],
  authors: [{ name: 'DepxTech' }],
  creator: 'DepxTech',
  publisher: 'DepxTech',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // PWA Configuration
  manifest: '/manifest.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DepxTech',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com',
    siteName: 'DepxTech',
    title: 'DepxTech - Trade-in Your Electronics for Cash',
    description: 'Turn your old electronics into instant cash. Fast quotes, free shipping, and high payouts guaranteed.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DepxTech - Trade-in Your Electronics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DepxTech - Trade-in Your Electronics for Cash',
    description: 'Turn your old electronics into instant cash. Fast quotes, free shipping, and high payouts guaranteed.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <head>
          <OrganizationStructuredData />
          <WebSiteStructuredData />

          <script
            async
            crossOrigin="anonymous"
            src="https://tweakcn.com/live-preview.min.js"
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased select-none`}
        >
          <PasswordWall>
            <AuthProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
              >
                <DisableLinkContextMenu />
                <MobileSetupGuard>
                  {children}
                </MobileSetupGuard>
                <WindowsLayer />
                <AdminUI/>
                <Toaster />
                <ServiceWorkerRegistration />
              </ThemeProvider>
            </AuthProvider>
          </PasswordWall>
        </body>
      </html>
    </ViewTransitions>
  );
}
