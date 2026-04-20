import Image from 'next/image'
import { Link } from '@/i18n/navigation'
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
    <section className="py-16 bg-white dark:bg-background/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollStagger staggerChildren={0.1} className="flex items-center justify-between mb-10">
          <ScrollReveal animation="left">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('heading')}</h2>
              <p className="text-slate-500 mt-2">{t('subheading')}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="right">
            <TransitionLink
              href="/trade"
              className="text-primary font-semibold flex items-center gap-1 hover:underline"
            >
              {tCommon('viewAll')} <ArrowRight className="w-4 h-4" />
            </TransitionLink>
          </ScrollReveal>
        </ScrollStagger>

        {/* Categories Grid */}
        <ScrollStagger staggerChildren={0.08} delayChildren={0.2} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2">
          {(categories || []).map((cat) => (
            <ScrollReveal key={cat.slug} animation="z">
              <TransitionLink
                href={`/trade/browse/${cat.slug}`}
                className="relative group block h-full w-full"
              >
                <div className="relative flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 h-full transition-all group-hover:border-primary/50 group-hover:shadow-xl group-hover:shadow-primary/5">
                  <div className="w-full aspect-square rounded-xl mb-2 flex items-center justify-center overflow-hidden">
                    <div className="relative w-32 h-32 transition-transform group-hover:scale-110 duration-300">
                      {cat.img ? (
                        <Image
                          src={cat.img}
                          alt={cat.name}
                          fill
                          sizes="128px"
                          className="object-contain"
                        />
                      ) : (
                        <LayoutGridIcon className="w-16 h-16 text-muted-foreground/30" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-sm text-slate-500">{cat.description}</p>
                    )}
                  </div>
                </div>
              </TransitionLink>
            </ScrollReveal>
          ))}
        </ScrollStagger>
      </div>
    </section>
  )
}
