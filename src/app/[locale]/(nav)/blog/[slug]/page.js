import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { getPostBySlug, getRelatedPosts, getAllPostSlugs } from '@/lib/blog'
import { MarkdownContent } from '@/components/blog/MarkdownContent'
import { BlogPostHero } from '@/components/blog/BlogPostHero'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import { getTranslations } from 'next-intl/server'
import { ArticleStructuredData, BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import {
  ArrowRight,
  Tag,
  Share2,
  BookOpen
} from 'lucide-react'

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

// Generate metadata for each post
export async function generateMetadata({ params }) {
  const { slug, locale } = await params
  const post = await getPostBySlug(slug, locale)
  const t = await getTranslations('blog')

  if (!post) {
    return {
      title: t('postNotFound'),
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: `${post.category}, trade-in, electronics, ${post.title.toLowerCase()}`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: [post.category],
      images: post.image ? [{ url: post.image, alt: post.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : [],
    },
  }
}


export default async function BlogPostPage({ params }) {
  const { slug, locale } = await params
  const post = await getPostBySlug(slug, locale)
  const t = await getTranslations('blog')

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(slug, 3, locale)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://depxtech.com'

  return (
    <main className="bg-background min-h-screen">
      <ArticleStructuredData article={post} />
      <BreadcrumbStructuredData items={[
        { name: 'Home', url: baseUrl },
        { name: 'Blog', url: `${baseUrl}/blog` },
        { name: post.title, url: `${baseUrl}/blog/${slug}` },
      ]} />
      {/* Hero Section with Aceternity Spotlight */}
      <BlogPostHero post={post} />

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800/30 rounded-3xl p-6 sm:p-10 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <MarkdownContent content={post.content} />
        </div>

        {/* Share Section */}
        <div className="mt-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-200/50 dark:bg-slate-700/50">
                <Tag className="size-4 text-slate-500" />
              </div>
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400 block">{t('category')}</span>
                <Link
                  href={`/blog/category/${post.category.toLowerCase()}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {post.category}
                </Link>
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm">
              <Share2 className="size-4" />
              {t('shareArticle')}
            </Button>
          </div>
        </div>
      </div>

      {/* Related Posts with Aceternity Hover Effect */}
      <RelatedPosts posts={relatedPosts} />

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-[2rem] p-6 sm:p-10 lg:p-16 text-center">
            <div>
              <div className="inline-flex items-center justify-center size-16 bg-white/20 rounded-2xl mb-6">
                <BookOpen className="size-8 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {t('readyToTrade')}
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                {t('postCtaSubheading')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/trade"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold py-4 px-10 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  {t('getYourQuote')} <ArrowRight className="size-5" />
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-bold py-4 px-10 rounded-xl hover:bg-white/30 transition-all border border-white/20"
                >
                  {t('moreArticles')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
