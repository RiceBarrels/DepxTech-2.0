import { buildPageMeta } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMeta(locale, {
    titleKey: 'processTitle',
    descKey: 'processDescription',
    path: '/trade/process',
  })
}

export default function ProcessLayout({ children }) {
  return children
}
