import ProductsPageClient from './page.client'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'

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

async function fetchProductsServer(search = '', page = 1, limit = 12) {
  try {
    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    // Only show in-stock products
    query = query.gt('stocks', 0)

    const { data: products, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    if (error) {
      console.error('Error fetching products:', error)
      return { products: [], pagination: null }
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return {
      products: products || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { products: [], pagination: null }
  }
}

export default async function ProductsPage({ searchParams }) {
  // Handle both Promise and direct object (Next.js 15 compatibility)
  const params = searchParams instanceof Promise ? await searchParams : searchParams
  const search = params?.search || ''
  const page = parseInt(params?.page || '1')
  
  // Fetch initial products on server for SEO
  const initialData = await fetchProductsServer(search, page, 12)
  
  return (
    <>
      <BreadcrumbStructuredData items={[
        { name: 'Home', url: baseUrl },
        { name: 'Products', url: `${baseUrl}/products` },
      ]} />
      <ProductsPageClient
        initialProducts={initialData.products}
        initialPagination={initialData.pagination}
        initialSearch={search}
        initialPage={page}
      />
    </>
  )
}
