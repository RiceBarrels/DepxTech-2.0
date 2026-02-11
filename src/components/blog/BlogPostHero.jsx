'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Spotlight } from '@/components/ui/aceternity/spotlight'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Sparkles
} from 'lucide-react'

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function BlogPostHero({ post }) {
  return (
    <div className="relative overflow-hidden">
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

      {/* Back Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-8 relative z-10"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category & Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link
              href={`/blog/category/${post.category.toLowerCase()}`}
              className="px-4 py-1.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              {post.category}
            </Link>
            {post.featured && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium">
                <Sparkles className="size-3.5" />
                Featured
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="size-4" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Clock className="size-4" />
              {post.readTime}
            </span>
          </div>

          {/* Title with animation */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-6"
          >
            {post.title}
          </motion.h1>

          {/* Excerpt */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-3xl"
          >
            {post.excerpt}
          </motion.p>

          {/* Author Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm w-fit"
          >
            <div className="size-14 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="size-7 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{post.author}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Published on {formatDate(post.date)}</p>
            </div>
          </motion.div>
        </div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-12 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <Image
              src={post.image}
              alt={post.title}
              width={240}
              height={240}
              className="object-contain relative z-10"
              priority
            />
          </div>
        </motion.div>
      </motion.article>
    </div>
  )
}
