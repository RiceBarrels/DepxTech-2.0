import { buildPageMeta } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMeta(locale, {
    titleKey: 'shippingTitle',
    descKey: 'shippingDescription',
    path: '/shipping',
  })
}

export default function ShippingLayout({ children }) {
  return children
}
