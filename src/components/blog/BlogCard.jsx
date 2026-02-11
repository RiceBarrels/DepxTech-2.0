'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, ArrowRight, Sparkles } from 'lucide-react'

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function BlogCardGrid({ posts, className }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const t = useTranslations('blog')

  return (
    <div className={cn("grid md:grid-cols-2 lg:grid-cols-3 gap-2", className)}>
      {posts.map((post, idx) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-primary/5 dark:bg-primary/10 block rounded-3xl"
                layoutId="blogHoverBackground"
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
          <div className="relative z-20 flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 h-full transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5">
            {/* Image */}
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
              {post.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-xs font-semibold backdrop-blur-sm">
                    <Sparkles className="size-3" />
                    {t('featured')}
                  </span>
                </div>
              )}
              <Image
                src={post.image}
                alt={post.title}
                width={100}
                height={100}
                className="object-contain group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            {/* Content */}
            <div className="flex-1 p-5">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {post.category}
              </span>
              <h3 className="mt-2 font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {post.excerpt}
              </p>
            </div>
            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3" />
                  {formatDate(post.date)}
                </span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <ArrowRight className="size-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function FeaturedBlogCard({ posts, className }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const t = useTranslations('blog')

  return (
    <div className={cn("grid md:grid-cols-3 gap-2", className)}>
      {posts.map((post, idx) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-amber-500/10 dark:bg-amber-500/20 block rounded-3xl"
                layoutId="featuredHoverBackground"
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
          <div className="relative z-20 bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 h-full transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-xl group-hover:shadow-primary/5">
            {/* Image */}
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center p-8 relative overflow-hidden">
              <div className="absolute top-4 left-4 z-10">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-xs font-semibold backdrop-blur-sm">
                  {t('featured')}
                </span>
              </div>
              <Image
                src={post.image}
                alt={post.title}
                width={120}
                height={120}
                className="object-contain group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Content */}
            <div className="p-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {post.category}
              </span>
              <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                <span>{formatDate(post.date)}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
