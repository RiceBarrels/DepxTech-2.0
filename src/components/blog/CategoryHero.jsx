'use client'

import { Link } from '@/i18n/navigation'
import { Spotlight } from '@/components/ui/aceternity/spotlight'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ArrowLeft, FolderOpen, Sparkles } from 'lucide-react'

export function CategoryHero({ category, postCount, categories }) {
  const t = useTranslations('blog')

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
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
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          {t('backToBlog')}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="size-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20"
          >
            <FolderOpen className="size-10 text-white" />
          </motion.div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Sparkles className="size-4" />
            {t('categoryLabel')}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
            <span className="text-primary">{category}</span> {t('allArticles')}
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('articles', { count: postCount })}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export function CategoryNav({ categories, currentCategory }) {
  const t = useTranslations('blog')

  return (
    <section className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/blog"
            className="px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary transition-all"
          >
            {t('allPosts2')}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/blog/category/${cat.toLowerCase()}`}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                cat === currentCategory
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
