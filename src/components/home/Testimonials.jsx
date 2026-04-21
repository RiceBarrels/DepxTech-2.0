import { ExternalLink } from 'lucide-react'
import { ScrollStagger, ScrollReveal } from '@/components/ui/scroll-animation'
import { getTranslations } from 'next-intl/server'

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
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="bottom" className="max-w-2xl mb-14">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-3">
            {t('heading')}
          </h2>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
            {t('subheading')}
          </p>
        </ScrollReveal>

        {/* Dense, column-based quote wall — no cards, no rating stars, no avatar circles */}
        <ScrollStagger staggerChildren={0.1} className="columns-1 md:columns-2 lg:columns-3 gap-x-8 gap-y-10">
          {reviews.map((review, i) => (
            <ScrollReveal key={i} animation="bottom" className="break-inside-avoid mb-10">
              <figure className="flex flex-col gap-4">
                <blockquote className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <figcaption className="text-sm text-slate-500">
                  <span className="font-medium text-slate-900 dark:text-white">{review.name}</span>
                  <span className="mx-1.5 text-slate-300 dark:text-slate-700">·</span>
                  {review.device}
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </ScrollStagger>

        <ScrollReveal animation="bottom">
          <div className="mt-6 pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="text-sm text-slate-500">{t('moreReviews')}</p>
            <a
              href="https://www.ebay.com/str/depxtech?_tab=feedback"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              eBay <ExternalLink className="size-3" />
            </a>
            <a
              href="https://www.jawa.gg/sp/197528/depxtech/reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              Jawa <ExternalLink className="size-3" />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
