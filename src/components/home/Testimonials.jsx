import { ExternalLink } from 'lucide-react'
import { GSAPReveal } from '@/components/ui/scroll-animation-gsap'
import { getTranslations } from 'next-intl/server'
import { TestimonialsHorizontal } from './TestimonialsHorizontal'

export async function Testimonials() {
  const t = await getTranslations('home.testimonials')

  const reviews = [
    { quote: t('review1Quote'), name: t('review1Name'), device: t('review1Device') },
    { quote: t('review2Quote'), name: t('review2Name'), device: t('review2Device') },
    { quote: t('review3Quote'), name: t('review3Name'), device: t('review3Device') },
    { quote: t('review4Quote'), name: t('review4Name'), device: t('review4Device') },
    { quote: t('review5Quote'), name: t('review5Name'), device: t('review5Device') },
    { quote: t('review6Quote'), name: t('review6Name'), device: t('review6Device') },
  ]

  return (
    <>
      <TestimonialsHorizontal
        heading={t('heading')}
        subheading={t('subheading')}
        reviews={reviews}
      />

      {/* Links to external review platforms */}
      <section className="bg-background pb-16">
        <GSAPReveal from="blur">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <p className="text-sm text-slate-500">{t('moreReviews')}</p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.ebay.com/str/depxtech?_tab=feedback"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                eBay <ExternalLink className="size-3.5" />
              </a>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <a
                href="https://www.jawa.gg/sp/197528/depxtech/reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Jawa <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </GSAPReveal>
      </section>
    </>
  )
}
