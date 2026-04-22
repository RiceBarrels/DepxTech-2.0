import { Star, ExternalLink } from 'lucide-react'
import { GSAPStagger, GSAPReveal } from '@/components/ui/scroll-animation-gsap'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <GSAPReveal from="top">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              {t('heading')}
            </h2>
          </GSAPReveal>
          <GSAPReveal from="blur" delay={0.1}>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('subheading')}
            </p>
          </GSAPReveal>
        </div>

        <GSAPStagger staggerChildren={0.12} delayChildren={0.1} from="bottom" className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="flex flex-col h-full p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              {/* Quote */}
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed flex-1 mb-6">
                &ldquo;{review.quote}&rdquo;
              </p>
              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{review.name}</p>
                  <p className="text-xs text-slate-500">{review.device}</p>
                </div>
              </div>
            </div>
          ))}
        </GSAPStagger>

        {/* Links to external review platforms */}
        <GSAPReveal from="blur">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
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
      </div>
    </section>
  )
}
