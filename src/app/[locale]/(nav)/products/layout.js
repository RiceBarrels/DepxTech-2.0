import { getTranslations } from 'next-intl/server'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: {
      default: t('productsTitle'),
      template: '%s | DepxTech',
    },
    description: t('productsDescription'),
    keywords: [
      'electronics', 'products', 'smartphones', 'laptops', 'headphones',
      'gaming', 'smart home', 'accessories', 'depxtech', 'buy electronics',
    ],
    openGraph: {
      title: t('productsTitle'),
      description: t('productsDescription'),
      type: 'website',
      url: `${baseUrl}/${locale}/products`,
      siteName: 'DepxTech',
      images: [{ url: `${baseUrl}/lightLogo.svg`, width: 1200, height: 630, alt: 'DepxTech' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('productsTitle'),
      description: t('productsDescription'),
      images: [`${baseUrl}/lightLogo.svg`],
    },
    alternates: { canonical: `${baseUrl}/${locale}/products` },
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    category: 'Electronics',
  }
}

export default function ProductsLayout({ children }) {
  return children
}
