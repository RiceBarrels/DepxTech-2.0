import Image from 'next/image'
import { TransitionLink } from '@/components/ui/pageTransitions'

const categories = [
  {
    name: 'Smartphone',
    image: '/stockImg/tradein-cata-img/Smartphone.png',
    href: '/trade/category/Smartphones',
    description: 'iPhones, Samsung, Google Pixel & more'
  },
  {
    name: 'Laptop',
    image: '/stockImg/tradein-cata-img/Laptop.png',
    href: '/trade/category/Laptops',
    description: 'MacBooks, ThinkPads, Gaming laptops'
  },
  {
    name: 'Tablet',
    image: '/stockImg/tradein-cata-img/Tablet.png',
    href: '/trade/category/Tablets',
    description: 'iPads, Galaxy Tabs, Surface Pro'
  },
  {
    name: 'Gaming',
    image: '/stockImg/tradein-cata-img/Gaming.png',
    href: '/trade/category/Gaming',
    description: 'Consoles, controllers & accessories'
  },
  {
    name: 'Wearable',
    image: '/stockImg/tradein-cata-img/Wearable.png',
    href: '/trade/category/Wearables',
    description: 'Apple Watch, Fitbit, Galaxy Watch'
  },
  {
    name: 'CPU',
    image: '/stockImg/tradein-cata-img/CPU.png',
    href: '/trade/category/Processors',
    description: 'Intel, AMD processors'
  },
  {
    name: 'GPU',
    image: '/stockImg/tradein-cata-img/GPU.png',
    href: '/trade/category/Graphics Cards',
    description: 'NVIDIA, AMD graphics cards'
  },
  {
    name: 'RAM',
    image: '/stockImg/tradein-cata-img/RAM.png',
    href: '/trade/category/Memory',
    description: 'DDR4, DDR5 memory modules'
  }
]

export default function CategoryGrid() {
  return (
    <section id="category-grid" className="py-12 px-4 w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">
        What do you want to sell?
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <TransitionLink
            key={category.name}
            href={category.href}
            className="group flex flex-col rounded-xl border border-border bg-background overflow-hidden hover:border-primary/40 transition-colors"
          >
            <div className="aspect-square bg-muted p-6">
              <Image
                src={category.image}
                alt={category.name}
                width={200}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {category.description}
              </p>
            </div>
          </TransitionLink>
        ))}
      </div>
    </section>
  )
}
