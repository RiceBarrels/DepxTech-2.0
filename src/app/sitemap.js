import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trade`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/offers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Fetch all products (only in-stock products for better SEO)
  let productPages = []
  try {
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, updated_at')
      .gt('stocks', 0)
      .limit(10000) // Adjust based on your needs
    
    if (!error && products) {
      productPages = products.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
  }

  // Fetch categories and brands for trade pages
  let tradePages = []
  try {
    const { data: tradableProducts, error } = await supabaseAdmin
      .from('tradable_products')
      .select('category, brand, series')
      .limit(10000)
    
    if (!error && tradableProducts) {
      const uniqueCategories = [...new Set(tradableProducts.map(p => p.category).filter(Boolean))]
      const uniqueBrands = new Map()
      const uniqueSeries = new Map()
      
      tradableProducts.forEach((product) => {
        if (product.category && product.brand) {
          const key = `${product.category}|${product.brand}`
          if (!uniqueBrands.has(key)) {
            uniqueBrands.set(key, { category: product.category, brand: product.brand })
          }
        }
        
        if (product.category && product.brand && product.series) {
          const key = `${product.category}|${product.brand}|${product.series}`
          if (!uniqueSeries.has(key)) {
            uniqueSeries.set(key, {
              category: product.category,
              brand: product.brand,
              series: product.series,
            })
          }
        }
      })

      // Category pages
      uniqueCategories.forEach((category) => {
        tradePages.push({
          url: `${baseUrl}/trade/category/${encodeURIComponent(category)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      })

      // Brand pages
      uniqueBrands.forEach(({ category, brand }) => {
        tradePages.push({
          url: `${baseUrl}/trade/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(brand)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      })

      // Series pages
      uniqueSeries.forEach(({ category, brand, series }) => {
        tradePages.push({
          url: `${baseUrl}/trade/category/${encodeURIComponent(category)}/brand/${encodeURIComponent(brand)}/series/${encodeURIComponent(series)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      })
    }
  } catch (error) {
    console.error('Error fetching trade pages for sitemap:', error)
  }

  return [...staticPages, ...productPages, ...tradePages]
}
