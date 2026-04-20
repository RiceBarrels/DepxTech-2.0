import { buildPageMeta } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMeta(locale, {
    titleKey: 'faqTitle',
    descKey: 'faqDescription',
    path: '/trade/faq',
  })
}

export default function FAQLayout({ children }) {
  return children
}
