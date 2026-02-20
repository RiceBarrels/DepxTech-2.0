import Image from 'next/image'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { getTranslations } from 'next-intl/server'

const categoryKeys = [
  { key: 'smartphone', image: '/stockImg/tradein-cata-img/Smartphone.png', href: '/trade/browse?category=Smartphones' },
  { key: 'laptop', image: '/stockImg/tradein-cata-img/Laptop.png', href: '/trade/browse?category=Laptops' },
  { key: 'tablet', image: '/stockImg/tradein-cata-img/Tablet.png', href: '/trade/browse?category=Tablets' },
  { key: 'gaming', image: '/stockImg/tradein-cata-img/Gaming.png', href: '/trade/browse?category=Gaming' },
  { key: 'wearable', image: '/stockImg/tradein-cata-img/Wearable.png', href: '/trade/browse?category=Wearables' },
  { key: 'cpu', image: '/stockImg/tradein-cata-img/CPU.png', href: '/trade/browse?category=Processors' },
  { key: 'gpu', image: '/stockImg/tradein-cata-img/GPU.png', href: '/trade/browse?category=Graphics Cards' },
  { key: 'ram', image: '/stockImg/tradein-cata-img/RAM.png', href: '/trade/browse?category=Memory' },
]

export default async function CategoryGrid() {
  const t = await getTranslations('trade.categories')

  return (
    <section id="category-grid" className="py-12 px-4 w-full max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-foreground mb-8">
        {t('title')}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categoryKeys.map((category) => {
          const name = t(category.key)
          const description = t(`${category.key}Desc`)
          return (
            <TransitionLink
              key={category.key}
              href={category.href}
              className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="aspect-square bg-muted p-5 sm:p-6">
                <Image
                  src={category.image}
                  alt={name}
                  width={200}
                  height={200}
                  sizes="200px"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                  {name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {description}
                </p>
              </div>
            </TransitionLink>
          )
        })}
      </div>
    </section>
  )
}
