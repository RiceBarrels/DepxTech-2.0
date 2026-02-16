export function OrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DepxTech',
    url: baseUrl,
    logo: `${baseUrl}/lightLogo.svg`,
    description: 'Premium electronics store offering the latest tech, best prices, and quality electronics including smartphones, laptops, headphones, gaming gear, and smart home devices.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'Customer Service',
      email: 'support@depxtech.com',
      availableLanguage: 'English',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '08:00',
        closes: '22:00',
        timeZone: 'America/New_York',
      },
    },
    sameAs: [
      // Add your social media profiles here when available
      // 'https://www.facebook.com/depxtech',
      // 'https://www.twitter.com/depxtech',
      // 'https://www.instagram.com/depxtech',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  )
}

export function WebSiteStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'
  
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DepxTech',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  )
}

export function ProductStructuredData({ product }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'
  
  if (!product) return null
  
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.des || `${product.title} - Available at DepxTech`,
    image: product.imgs && product.imgs.length > 0 ? product.imgs : [`${baseUrl}/placeholder-image.svg`],
    brand: {
      '@type': 'Brand',
      name: product.brand || 'DepxTech',
    },
    category: product.category?.[0] || 'Electronics',
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products/${product.id}`,
      priceCurrency: 'USD',
      price: product.price?.toString() || '0',
      availability: product.stocks > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'DepxTech',
      },
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      reviewCount: product.reviewCount?.toString() || '0',
    } : undefined,
  }

  // Remove undefined fields
  if (!productSchema.aggregateRating) {
    delete productSchema.aggregateRating
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  )
}

export function BreadcrumbStructuredData({ items }) {
  if (!items || items.length === 0) return null
  
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  )
}

export function FAQPageStructuredData({ questions }) {
  if (!questions || questions.length === 0) return null

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  )
}

export function ArticleStructuredData({ article }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

  if (!article) return null

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image ? `${baseUrl}${article.image}` : undefined,
    datePublished: article.date,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'DepxTech',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/lightLogo.svg` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${article.slug}`,
    },
  }

  if (!articleSchema.image) delete articleSchema.image

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
    />
  )
}

export function TradeProductStructuredData({ product, depreciatedPrice }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

  if (!product) return null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.des || `Trade in your ${product.title} at DepxTech`,
    image: product.imgs && product.imgs.length > 0 ? product.imgs : undefined,
    brand: { '@type': 'Brand', name: product.brand },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/trade/product/${product.id}`,
      priceCurrency: 'USD',
      price: (depreciatedPrice || product.base_price)?.toString() || '0',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'DepxTech' },
      description: `Trade-in value up to $${(depreciatedPrice || product.base_price)?.toFixed(2)}`,
    },
  }

  if (!schema.image) delete schema.image

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function ItemListStructuredData({ products, searchTerm, currentPage, totalItems }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'
  
  if (!products || products.length === 0) return null
  
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: searchTerm 
      ? `Search results for "${searchTerm}"` 
      : 'Products - DepxTech',
    description: searchTerm
      ? `Find ${totalItems || products.length} products matching "${searchTerm}" at DepxTech`
      : 'Browse our wide selection of premium electronics including smartphones, laptops, headphones, gaming gear, and smart home devices.',
    numberOfItems: totalItems || products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: (currentPage - 1) * 12 + index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        description: product.des || `${product.title} - Available at DepxTech`,
        image: product.imgs && product.imgs.length > 0 ? product.imgs[0] : `${baseUrl}/placeholder-image.svg`,
        url: `${baseUrl}/products/${product.id}`,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'DepxTech',
        },
        category: product.category?.[0] || 'Electronics',
        offers: {
          '@type': 'Offer',
          url: `${baseUrl}/products/${product.id}`,
          priceCurrency: 'USD',
          price: product.price?.toString() || '0',
          availability: product.stocks > 0 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'DepxTech',
          },
        },
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
    />
  )
}
