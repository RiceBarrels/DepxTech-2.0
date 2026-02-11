import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return { title: t('sustainabilityTitle'), description: t('sustainabilityDescription') }
}

export default function SustainabilityLayout({ children }) {
  return children
}
