import { buildPageMeta } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMeta(locale, {
    titleKey: 'sustainabilityTitle',
    descKey: 'sustainabilityDescription',
    path: '/trade/sustainability',
  })
}

export default function SustainabilityLayout({ children }) {
  return children
}
