import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/lib/auth";
import { WindowsLayer } from "@/components/ui/windows";
import AdminUI from "@/components/ui/adminUI";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"
import { OrganizationStructuredData, WebSiteStructuredData } from "@/components/seo/StructuredData"
import { DisableLinkContextMenu } from "@/components/ui/disableLinkContextMenu"
import PasswordWall from "@/components/password-wall";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { ViewTransitions } from 'next-view-transitions'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

const rtlLocales = ['ar']

const ogLocaleMap = { en: 'en_US', 'zh-CN': 'zh_CN', 'zh-HK': 'zh_HK', ar: 'ar_AR', nl: 'nl_NL', fr: 'fr_FR', de: 'de_DE', it: 'it_IT', ja: 'ja_JP', ko: 'ko_KR', pl: 'pl_PL', pt: 'pt_BR', ru: 'ru_RU', es: 'es_ES', sv: 'sv_SE' }

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t('defaultTitle'),
      template: '%s | DepxTech',
    },
    description: t('defaultDescription'),
    keywords: [
      'trade-in', 'electronics', 'recycle', 'sell phone', 'sell laptop',
      'sell tablet', 'cash for electronics', 'tech buyback', 'eco-friendly', 'depxtech',
    ],
    authors: [{ name: 'DepxTech' }],
    creator: 'DepxTech',
    publisher: 'DepxTech',
    formatDetection: { email: false, address: false, telephone: false },
    manifest: '/manifest.webmanifest',
    appleWebApp: { capable: true, statusBarStyle: 'default', title: 'DepxTech' },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
      type: 'website',
      locale: ogLocaleMap[locale] || 'en_US',
      url: baseUrl,
      siteName: 'DepxTech',
      title: t('defaultTitle'),
      description: t('defaultDescription'),
      images: [{ url: `${baseUrl}/opengraph-image`, width: 1200, height: 630, alt: 'DepxTech' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('defaultTitle'),
      description: t('defaultDescription'),
      images: [`${baseUrl}/opengraph-image`],
    },
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    alternates: {
      canonical: baseUrl,
      languages: Object.fromEntries(routing.locales.map(l => [l, `/${l}`])),
    },
  }
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
    ],
  }
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <ViewTransitions>
    <html lang={locale} dir={rtlLocales.includes(locale) ? 'rtl' : 'ltr'} suppressHydrationWarning>
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background overflow-y-hidden`}
      >
        <PasswordWall>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
            >
              <NextIntlClientProvider messages={messages}>
                <DisableLinkContextMenu />
                {children}
                <WindowsLayer />
                <AdminUI/>
                <Toaster />
                <CookieConsent />
                <ServiceWorkerRegistration />
              </NextIntlClientProvider>
            </ThemeProvider>
          </AuthProvider>
        </PasswordWall>
      </body>
    </html>
    </ViewTransitions>
  );
}
