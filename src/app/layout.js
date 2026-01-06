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
    default: 'DepxTech - Premium Electronics Store',
    template: '%s | DepxTech',
  },
  description: 'Latest tech, best prices, premium quality electronics. Discover smartphones, laptops, headphones, gaming gear, smart home devices and accessories. Trade in your old devices for credit.',
  keywords: [
    'electronics',
    'technology',
    'smartphones',
    'laptops',
    'headphones',
    'gaming',
    'smart home',
    'accessories',
    'tech store',
    'trade in',
    'electronics store',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com',
    siteName: 'DepxTech',
    title: 'DepxTech - Premium Electronics Store',
    description: 'Latest tech, best prices, premium quality electronics. Discover smartphones, laptops, headphones, gaming gear, smart home devices and accessories.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DepxTech - Premium Electronics Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DepxTech - Premium Electronics Store',
    description: 'Latest tech, best prices, premium quality electronics',
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
              </ThemeProvider>
            </AuthProvider>
          </PasswordWall>
        </body>
      </html>
    </ViewTransitions>
  );
}
