const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

export const metadata = {
  title: {
    default: 'Products | DepxTech',
    template: '%s | DepxTech',
  },
  description: 'Browse our wide selection of premium electronics at DepxTech. Find smartphones, laptops, headphones, gaming gear, smart home devices and more. Search and filter products to find exactly what you need.',
  keywords: [
    'electronics',
    'products',
    'smartphones',
    'laptops',
    'headphones',
    'gaming',
    'smart home',
    'accessories',
    'depxtech',
    'buy electronics',
    'online store',
    'premium electronics',
    'tech store',
    'in stock products',
  ],
  openGraph: {
    title: 'Products | DepxTech',
    description: 'Browse our wide selection of premium electronics at DepxTech. Find the latest tech, best prices, and quality electronics.',
    type: 'website',
    url: `${baseUrl}/products`,
    siteName: 'DepxTech',
    images: [
      {
        url: `${baseUrl}/lightLogo.svg`,
        width: 1200,
        height: 630,
        alt: 'DepxTech - Premium Electronics Store',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products | DepxTech',
    description: 'Browse our wide selection of premium electronics at DepxTech.',
    images: [`${baseUrl}/lightLogo.svg`],
  },
  alternates: {
    canonical: `${baseUrl}/products`,
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
  category: 'Electronics',
}

export default function ProductsLayout({ children }) {
  return children
}
