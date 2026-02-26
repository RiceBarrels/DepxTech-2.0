import Image from 'next/image'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { LayoutGridIcon } from 'lucide-react'

export default async function CategoryGrid() {
  const { data: categories } = await supabaseAdmin
    .from('trade_categories')
    .select('name, slug, description, img')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  return (
    <section id="category-grid" className="py-12 px-4 w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {(categories || []).map((cat) => (
          <TransitionLink
            key={cat.slug}
            href={`/trade/browse?category=${cat.slug}`}
            className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200"
          >
            <div className="aspect-square bg-muted p-5 sm:p-6 flex items-center justify-center">
              {cat.img ? (
                <Image
                  src={cat.img}
                  alt={cat.name}
                  width={200}
                  height={200}
                  sizes="200px"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <LayoutGridIcon className="w-16 h-16 text-muted-foreground/30 group-hover:scale-105 transition-transform duration-200" />
              )}
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                {cat.name}
              </h3>
              {cat.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {cat.description}
                </p>
              )}
            </div>
          </TransitionLink>
        ))}
      </div>
    </section>
  )
}
