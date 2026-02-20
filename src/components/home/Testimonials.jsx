import { Star } from 'lucide-react'
import { ScrollStagger, ScrollReveal } from '@/components/ui/scroll-animation'
import { getTranslations } from 'next-intl/server'

export async function Testimonials() {
  const t = await getTranslations('home.testimonials')

  const reviews = [
    { quote: t('review1Quote'), name: t('review1Name'), device: t('review1Device') },
    { quote: t('review2Quote'), name: t('review2Name'), device: t('review2Device') },
    { quote: t('review3Quote'), name: t('review3Name'), device: t('review3Device') },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollStagger staggerChildren={0.12} className="text-center mb-12">
          <ScrollReveal animation="top">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              {t('heading')}
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="blur">
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t('subheading')}
            </p>
          </ScrollReveal>
        </ScrollStagger>

        <ScrollStagger staggerChildren={0.15} delayChildren={0.1} className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <ScrollReveal key={i} animation="bottom">
              <div className="flex flex-col h-full p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
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
            </ScrollReveal>
          ))}
        </ScrollStagger>
      </div>
    </section>
  )
}
