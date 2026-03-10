import { buildPageMeta } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMeta(locale, {
    titleKey: 'howItWorksTitle',
    descKey: 'howItWorksDescription',
    path: '/trade/how-it-works',
  })
}

export default function HowItWorksLayout({ children }) {
  return children
}
