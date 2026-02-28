import { supabaseAdmin } from '@/lib/supabase-admin'
import { routing } from '@/i18n/routing'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'
const locales = routing.locales

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function urlEntry(path, { lastModified, changeFrequency, priority }) {
  return locales.map((locale) => {
    const loc = `${SITE_URL}/${locale}${path}`
    const alternates = locales
      .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${escapeXml(`${SITE_URL}/${l}${path}`)}" />`)
      .join('\n')
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
${alternates}
  </url>`
  })
}

export async function GET() {
  const entries = []

  // Static pages
  entries.push(
    ...urlEntry('', { lastModified: new Date(), changeFrequency: 'daily', priority: 1 }),
    ...urlEntry('/products', { lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 }),
    ...urlEntry('/trade', { lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 }),
    ...urlEntry('/trade/browse', { lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 }),
    ...urlEntry('/trade/faq', { lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 }),
    ...urlEntry('/trade/how-it-works', { lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 }),
    ...urlEntry('/offers', { lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 }),
    ...urlEntry('/blog', { lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 }),
    ...urlEntry('/privacy-policy', { lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 }),
    ...urlEntry('/terms-of-service', { lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 }),
    ...urlEntry('/refund-policy', { lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 }),
    ...urlEntry('/shipping-policy', { lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 }),
  )

  // Store products
  try {
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, updated_at')
      .gt('stocks', 0)
      .limit(10000)

    if (!error && products) {
      for (const product of products) {
        entries.push(
          ...urlEntry(`/products/${product.id}`, {
            lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          })
        )
      }
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
  }

  // Trade-in products + browse filter URLs
  try {
    const { data: tradableProducts, error } = await supabaseAdmin
      .from('tradable_products')
      .select('id, created_at, category, brand, series')
      .limit(10000)

    if (!error && tradableProducts) {
      for (const product of tradableProducts) {
        entries.push(
          ...urlEntry(`/trade/product/${product.id}`, {
            lastModified: product.created_at ? new Date(product.created_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          })
        )
      }

      // Build category name → slug mapping
      const { data: catRows } = await supabaseAdmin
        .from('trade_categories')
        .select('name, slug')
        .eq('is_active', true)
      const catSlugMap = new Map((catRows || []).map(c => [c.name, c.slug]))

      const uniqueCategories = new Set()
      const uniqueBrands = new Map()

      tradableProducts.forEach((p) => {
        if (p.category) uniqueCategories.add(p.category)
        if (p.category && p.brand) {
          const key = `${p.category}|${p.brand}`
          if (!uniqueBrands.has(key)) uniqueBrands.set(key, { category: p.category, brand: p.brand })
        }
      })

      uniqueCategories.forEach((category) => {
        const slug = catSlugMap.get(category) || encodeURIComponent(category).toLowerCase()
        entries.push(
          ...urlEntry(`/trade/browse/${slug}`, {
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          })
        )
      })

      uniqueBrands.forEach(({ category, brand }) => {
        const slug = catSlugMap.get(category) || encodeURIComponent(category).toLowerCase()
        entries.push(
          ...urlEntry(`/trade/browse/${slug}/${encodeURIComponent(brand)}`, {
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

  // Blog posts
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('slug, updated_at, category')
      .eq('published', true)
      .limit(10000)

    if (!error && posts) {
      for (const post of posts) {
        entries.push(
          ...urlEntry(`/blog/${post.slug}`, {
            lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          })
        )
      }

      const blogCategories = [...new Set(posts.map((p) => p.category).filter(Boolean))]
      for (const category of blogCategories) {
        entries.push(
          ...urlEntry(`/blog/category/${category.toLowerCase()}`, {
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
          })
        )
      }
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
