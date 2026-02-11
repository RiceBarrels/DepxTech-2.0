import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostsByCategory, getAllCategories } from '@/data/blog-posts'
import { CategoryHero, CategoryNav } from '@/components/blog/CategoryHero'
import { BlogCardGrid } from '@/components/blog/BlogCard'
import {
  BookOpen,
  ArrowRight,
  FolderOpen
} from 'lucide-react'

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = getAllCategories()
  return categories.map((category) => ({
    category: category.toLowerCase(),
  }))
}

// Generate metadata for each category
export async function generateMetadata({ params }) {
  const { category } = await params
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1)

  return {
    title: `${categoryName} - Blog`,
    description: `Browse all ${categoryName.toLowerCase()} articles about electronics trade-in and recycling.`,
  }
}

export default async function CategoryPage({ params }) {
  const { category } = await params
  const categories = getAllCategories()

  // Find the matching category (case-insensitive)
  const matchedCategory = categories.find(
    c => c.toLowerCase() === category.toLowerCase()
  )

  if (!matchedCategory) {
    notFound()
  }

  const posts = getPostsByCategory(matchedCategory)

  return (
    <main className="bg-background min-h-screen">
      {/* Header with Aceternity Spotlight */}
      <CategoryHero
        category={matchedCategory}
        postCount={posts.length}
        categories={categories}
      />

      {/* Category Navigation */}
      <CategoryNav
        categories={categories}
        currentCategory={matchedCategory}
      />

      {/* Posts Grid with Aceternity Hover Effect */}
      <section className="py-12 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length > 0 ? (
            <BlogCardGrid posts={posts} />
          ) : (
            <div className="text-center py-16">
              <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="size-8 text-slate-400" />
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">No articles found in this category.</p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                View all articles <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 rounded-[2rem] p-10 lg:p-16 text-center overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <BookOpen className="size-14 text-white/90 mx-auto mb-6" />
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Trade In Your Device?
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                Get an instant quote and turn your old electronics into cash today.
              </p>
              <Link
                href="/trade"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold py-4 px-10 rounded-xl hover:bg-slate-100 hover:shadow-lg transition-all"
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
