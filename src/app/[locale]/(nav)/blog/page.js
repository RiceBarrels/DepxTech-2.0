import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { getAllPosts, getFeaturedPosts, getAllCategories } from '@/lib/blog'
import { BlogHero } from '@/components/blog/BlogHero'
import { BlogCardGrid, FeaturedBlogCard } from '@/components/blog/BlogCard'
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp
} from 'lucide-react'

export async function generateMetadata({ params }) {
  const { getTranslations } = await import('next-intl/server')
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return { title: t('blogTitle'), description: t('blogDescription') }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default async function BlogPage({ params }) {
  const { locale } = await params
  const allPosts = await getAllPosts(locale)
  const featuredPosts = (await getFeaturedPosts(locale)).slice(0, 3)
  const categories = await getAllCategories()
  const latestPost = allPosts[0]
  const remainingPosts = allPosts.slice(1)

  return (
    <main className="bg-background min-h-screen">
      {/* Hero with Aceternity Effects */}
      <BlogHero />

      {/* Categories */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/blog"
              className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold transition-colors"
            >
              All Posts
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={`/blog/category/${category.toLowerCase().replace(/ /g, '-')}`}
                className="px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary dark:hover:text-primary transition-all"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Post - Hero Card */}
      {latestPost && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={`/blog/${latestPost.slug}`}
              className="group block relative bg-slate-900 dark:bg-slate-800 rounded-3xl overflow-hidden"
            >
              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 p-5 sm:p-8 lg:p-12">
                {/* Content */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                      Latest
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                      {latestPost.category}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 group-hover:text-primary transition-colors leading-tight">
                    {latestPost.title}
                  </h2>
                  <p className="text-slate-300 text-lg mb-6 line-clamp-2">
                    {latestPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-4" />
                      {formatDate(latestPost.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-4" />
                      {latestPost.read_time || latestPost.readTime}
                    </span>
                  </div>
                  <div className="mt-8">
                    <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                      Read Article <ArrowRight className="size-5" />
                    </span>
                  </div>
                </div>

                {/* Image */}
                {latestPost.image && (
                  <div className="relative flex items-center justify-center">
                    <div className="relative bg-white/5 rounded-2xl p-6 sm:p-12 border border-white/10 w-full aspect-square max-w-sm">
                      <Image
                        src={latestPost.image}
                        alt={latestPost.title}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-500 p-4"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Featured Posts with Aceternity Hover Effect */}
      {featuredPosts.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="size-5 text-primary" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Featured Articles
              </h2>
            </div>
            <FeaturedBlogCard posts={featuredPosts} />
          </div>
        </section>
      )}

      {/* All Posts Grid with Aceternity Hover Effect */}
      <section className="py-16 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            All Articles
          </h2>
          <BlogCardGrid posts={remainingPosts} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-[2rem] p-6 sm:p-10 lg:p-16 text-center">
            <div>
              <BookOpen className="size-14 text-white/90 mx-auto mb-6" />
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Trade In Your Device?
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                Put your knowledge into action. Get an instant quote and turn your old electronics into cash.
              </p>
              <Link
                href="/trade"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold py-4 px-10 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Get Your Quote <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
