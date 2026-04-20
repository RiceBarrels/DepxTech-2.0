import TermsOfServiceContent from '@/components/legal/TermsOfServiceContent'

export async function generateMetadata({ params }) {
  const { getTranslations } = await import('next-intl/server')
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('tosTitle'),
    description: t('tosDescription'),
    openGraph: { title: t('tosTitle'), description: t('tosDescription'), type: 'website' },
    robots: { index: true, follow: true },
  }
}

export default function TermsOfService() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <p className="text-muted-foreground mb-6">Effective Date: January 1, 2025</p>
            <TermsOfServiceContent />
        </div>
    );
}
