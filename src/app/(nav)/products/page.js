import { Metadata } from 'next'
import ProductsPageClient from './page.client'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

export async function generateMetadata({ searchParams }) {
  // Handle both Promise and direct object (Next.js 15 compatibility)
  const params = searchParams instanceof Promise ? await searchParams : searchParams
  const search = params?.search || ''
  const page = parseInt(params?.page || '1')
  
  const title = search 
    ? `Search: "${search}" | Products | DepxTech`
    : 'Products | DepxTech - Premium Electronics Store'
  
  const description = search
    ? `Find ${search} and more premium electronics at DepxTech. Browse our wide selection of in-stock products including smartphones, laptops, headphones, gaming gear, and smart home devices.`
    : 'Browse our wide selection of premium electronics at DepxTech. Find smartphones, laptops, headphones, gaming gear, smart home devices and more. Search and filter products to find exactly what you need.'
  
  const keywords = search
    ? [
        search,
        'electronics',
        'products',
        'depxtech',
        'buy online',
        'in stock',
        'smartphones',
        'laptops',
        'headphones',
        'gaming',
        'smart home',
        'accessories',
      ]
    : [
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
      ]

  const url = search || page > 1
    ? `${baseUrl}/products?${new URLSearchParams({
        ...(search && { search }),
        ...(page > 1 && { page: page.toString() }),
      }).toString()}`
    : `${baseUrl}/products`

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'DepxTech',
      images: [
        {
          url: `${baseUrl}/lightLogo.svg`,
          width: 1200,
          height: 630,
          alt: 'DepxTech - Premium Electronics Store',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/lightLogo.svg`],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      ...(search && {
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      }),
    },
    other: {
      'product:category': 'Electronics',
    },
  }
}

export default async function ProductsPage({ searchParams }) {
  // Handle both Promise and direct object (Next.js 15 compatibility)
  const params = searchParams instanceof Promise ? await searchParams : searchParams
  return <ProductsPageClient />
}
