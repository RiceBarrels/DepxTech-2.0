'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ScrollStagger, ScrollReveal } from '@/components/ui/scroll-animation'
import { useTranslations } from 'next-intl'

const categoryData = [
  { key: 'smartphones', image: '/stockImg/iphone_17_pro_max.png', href: '/trade/category/Smartphones' },
  { key: 'laptops', image: '/stockImg/macbook_pro.png', href: '/trade/category/Laptops' },
  { key: 'tablets', image: '/stockImg/ipad_pro.png', href: '/trade/category/Tablets' },
  { key: 'wearables', image: '/stockImg/apple_watch.png', href: '/trade/category/Wearables' },
]

export function CategoryGrid() {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const t = useTranslations('home.categories')
  const tCommon = useTranslations('common')

  const categories = categoryData.map(c => ({
    ...c,
    title: t(c.key),
    description: t(`${c.key}Desc`),
  }))

  return (
    <section className="py-16 bg-white dark:bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollStagger staggerChildren={0.1} className="flex items-center justify-between mb-10">
          <ScrollReveal animation="left">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('heading')}</h2>
              <p className="text-slate-500 mt-2">{t('subheading')}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="right">
            <Link
              href="/trade"
              className="text-primary font-semibold flex items-center gap-1 hover:underline"
            >
              {tCommon('viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </ScrollStagger>

        {/* Categories Grid with Hover Effect */}
        <ScrollStagger staggerChildren={0.08} delayChildren={0.2} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, idx) => (
            <ScrollReveal key={category.key} animation="z">
              <Link
                href={category.href}
                className="relative group block p-2 h-full w-full"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <AnimatePresence>
                  {hoveredIndex === idx && (
                    <motion.span
                      className="absolute inset-0 h-full w-full bg-primary/10 dark:bg-primary/20 block rounded-3xl"
                      layoutId="categoryHoverBackground"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        transition: { duration: 0.15 },
                      }}
                      exit={{
                        opacity: 0,
                        transition: { duration: 0.15, delay: 0.2 },
                      }}
                    />
                  )}
                </AnimatePresence>
                <div className="relative z-20 flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 h-full transition-all group-hover:border-primary/50 group-hover:shadow-xl group-hover:shadow-primary/5">
                  <div className="w-full aspect-square rounded-xl bg-slate-100 dark:bg-slate-700 mb-2 flex items-center justify-center overflow-hidden">
                    <div className="relative w-32 h-32 transition-transform group-hover:scale-110 duration-300">
                      <Image
                        src={category.image}
                        alt={category.title}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{category.title}</h3>
                    <p className="text-sm text-slate-500">{category.description}</p>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </ScrollStagger>
      </div>
    </section>
  )
}
