import { NewsletterForm } from '@/components/home/NewsletterForm'
import { ScrollReveal } from '@/components/ui/scroll-animation'
import { getTranslations } from 'next-intl/server'

export async function NewsletterSection() {
  const t = await getTranslations('home.newsletter')

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-20 items-center">
          <ScrollReveal animation="left">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {t('heading')}
            </h2>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed mt-4">
              {t('description')}
            </p>
          </ScrollReveal>
          <ScrollReveal animation="right">
            <NewsletterForm />
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
