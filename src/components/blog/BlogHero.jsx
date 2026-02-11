'use client'

import { Spotlight } from '@/components/ui/aceternity/spotlight'
import { TextGenerateEffect } from '@/components/ui/aceternity/text-generate-effect'
import { useTranslations } from 'next-intl'
import { Sparkles } from 'lucide-react'

export function BlogHero() {
  const t = useTranslations('blog')

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="oklch(0.5393 0.2713 286.7462 / 0.3)"
      />

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <Sparkles className="size-4" />
            {t('expertInsights')}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            {t('theDepxtechBlog')} <span className="text-primary">{t('blogHighlight')}</span>
          </h1>
          <div className="mt-6 max-w-2xl mx-auto">
            <TextGenerateEffect
              words={t('heroDescription')}
              className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal"
              duration={0.3}
              filter={false}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
