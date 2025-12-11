export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/account/',
          '/cart/',
          '/checkout/',
          '/login/',
          '/signup/',
          '/address/',
          '/orders/',
          '/settings/',
          '/inbox/',
          '/membership/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
