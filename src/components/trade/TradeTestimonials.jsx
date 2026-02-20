import { Star } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function TradeTestimonials() {
  const t = await getTranslations('trade.testimonials')

  const reviews = [
    { quote: t('review1Quote'), name: t('review1Name'), device: t('review1Device') },
    { quote: t('review2Quote'), name: t('review2Name'), device: t('review2Device') },
    { quote: t('review3Quote'), name: t('review3Name'), device: t('review3Device') },
  ]

  return (
    <section className="w-full max-w-7xl py-12 sm:py-16 px-4">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('heading')}</h2>
        <p className="text-muted-foreground text-sm">{t('subheading')}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        {reviews.map((review, i) => (
          <div
            key={i}
            className="flex flex-col p-5 sm:p-6 bg-card rounded-xl border border-border"
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="size-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            {/* Quote */}
            <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
              &ldquo;{review.quote}&rdquo;
            </p>
            {/* Author */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-border">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {review.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-xs text-foreground">{review.name}</p>
                <p className="text-xs text-muted-foreground">{review.device}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
