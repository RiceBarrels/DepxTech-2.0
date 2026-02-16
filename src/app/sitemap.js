import { supabaseAdmin } from '@/lib/supabase-admin'
import { routing } from '@/i18n/routing'

const locales = routing.locales

function localizedEntries(path, { lastModified, changeFrequency, priority }) {
  return locales.map((locale) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'}/${locale}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [
          l,
          `${process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'}/${l}${path}`,
        ])
      ),
    },
  }))
}

export default async function sitemap() {
  // Static pages
  const staticPages = [
    ...localizedEntries('', { lastModified: new Date(), changeFrequency: 'daily', priority: 1 }),
    ...localizedEntries('/products', { lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 }),
    ...localizedEntries('/trade', { lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 }),
    ...localizedEntries('/trade/browse', { lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 }),
    ...localizedEntries('/trade/faq', { lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 }),
    ...localizedEntries('/trade/how-it-works', { lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 }),
    ...localizedEntries('/offers', { lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 }),
    ...localizedEntries('/blog', { lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 }),
    ...localizedEntries('/privacy-policy', { lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 }),
    ...localizedEntries('/terms-of-service', { lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 }),
    ...localizedEntries('/refund-policy', { lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 }),
    ...localizedEntries('/shipping-policy', { lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 }),
  ]

  // Fetch store products
  let productPages = []
  try {
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, updated_at')
      .gt('stocks', 0)
      .limit(10000)

    if (!error && products) {
      productPages = products.flatMap((product) =>
        localizedEntries(`/products/${product.id}`, {
          lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      )
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
  }

  // Fetch ALL trade-in products + build browse filter URLs
  let tradeProductPages = []
  let tradeBrowsePages = []
  try {
    const { data: tradableProducts, error } = await supabaseAdmin
      .from('tradable_products')
      .select('id, created_at, category, brand, series')
      .limit(10000)

    if (!error && tradableProducts) {
      // Individual trade-in product pages
      tradeProductPages = tradableProducts.flatMap((product) =>
        localizedEntries(`/trade/product/${product.id}`, {
          lastModified: product.created_at ? new Date(product.created_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      )

      // Browse filter pages: category, category+brand, category+brand+series
      const uniqueCategories = new Set()
      const uniqueBrands = new Map()
      const uniqueSeries = new Map()

      tradableProducts.forEach((p) => {
        if (p.category) {
          uniqueCategories.add(p.category)
        }
        if (p.category && p.brand) {
          const key = `${p.category}|${p.brand}`
          if (!uniqueBrands.has(key)) {
            uniqueBrands.set(key, { category: p.category, brand: p.brand })
          }
        }
        if (p.category && p.brand && p.series) {
          const key = `${p.category}|${p.brand}|${p.series}`
          if (!uniqueSeries.has(key)) {
            uniqueSeries.set(key, { category: p.category, brand: p.brand, series: p.series })
          }
        }
      })

      uniqueCategories.forEach((category) => {
        tradeBrowsePages.push(
          ...localizedEntries(`/trade/browse?category=${encodeURIComponent(category)}`, {
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          })
        )
      })

      uniqueBrands.forEach(({ category, brand }) => {
        tradeBrowsePages.push(
          ...localizedEntries(`/trade/browse?category=${encodeURIComponent(category)}&brand=${encodeURIComponent(brand)}`, {
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          })
        )
      })

      uniqueSeries.forEach(({ category, brand, series }) => {
        tradeBrowsePages.push(
          ...localizedEntries(`/trade/browse?category=${encodeURIComponent(category)}&brand=${encodeURIComponent(brand)}&series=${encodeURIComponent(series)}`, {
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          })
        )
      })
    }
  } catch (error) {
    console.error('Error fetching trade products for sitemap:', error)
  }

  // Fetch published blog posts
  let blogPages = []
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('slug, updated_at, category')
      .eq('published', true)
      .limit(10000)

    if (!error && posts) {
      blogPages = posts.flatMap((post) =>
        localizedEntries(`/blog/${post.slug}`, {
          lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      )

      // Blog category pages
      const blogCategories = [...new Set(posts.map((p) => p.category).filter(Boolean))]
      blogCategories.forEach((category) => {
        blogPages.push(
          ...localizedEntries(`/blog/category/${category.toLowerCase()}`, {
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
          })
        )
      })
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error)
  }

  return [...staticPages, ...productPages, ...tradeProductPages, ...tradeBrowsePages, ...blogPages]
}
