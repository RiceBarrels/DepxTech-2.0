import Image from 'next/image'
import { ArrowRight, LayoutGridIcon } from 'lucide-react'
import { ScrollStagger, ScrollReveal } from '@/components/ui/scroll-animation'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { TransitionLink } from '../ui/pageTransitions'

export async function CategoryGrid() {
  const t = await getTranslations('home.categories')
  const tCommon = await getTranslations('common')

  const { data: categories } = await supabaseAdmin
    .from('trade_categories')
    .select('name, slug, description, img')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(4)

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 gap-6">
          <ScrollReveal animation="left">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {t('heading')}
            </h2>
            <p className="text-slate-500 mt-2">{t('subheading')}</p>
          </ScrollReveal>
          <ScrollReveal animation="right">
            <TransitionLink
              href="/trade"
              className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1 border-b border-slate-900/30 dark:border-white/30 pb-0.5 hover:border-slate-900 dark:hover:border-white transition-colors whitespace-nowrap"
            >
              {tCommon('viewAll')} <ArrowRight className="w-3.5 h-3.5" />
            </TransitionLink>
          </ScrollReveal>
        </div>

        {/* Categories — flat, no borders or shadows, just grid of product photos + labels */}
        <ScrollStagger staggerChildren={0.08} delayChildren={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
          {(categories || []).map((cat) => (
            <ScrollReveal key={cat.slug} animation="bottom">
              <TransitionLink
                href={`/trade/browse/${cat.slug}`}
                className="group flex flex-col gap-3 h-full"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 transition-transform duration-500 group-hover:scale-105">
                      {cat.img ? (
                        <Image
                          src={cat.img}
                          alt={cat.name}
                          fill
                          sizes="160px"
                          className="object-contain"
                        />
                      ) : (
                        <LayoutGridIcon className="w-16 h-16 text-slate-400/40" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-xs text-slate-500">{cat.description}</p>
                  )}
                </div>
              </TransitionLink>
            </ScrollReveal>
          ))}
        </ScrollStagger>
      </div>
    </section>
  )
}
