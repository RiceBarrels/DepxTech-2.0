'use client'

import Image from 'next/image'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { motion } from 'framer-motion'

const categories = [
  {
    name: 'Smartphone',
    image: '/stockImg/tradein-cata-img/Smartphone.png',
    href: '/trade/browse?category=Smartphones',
    description: 'iPhones, Samsung, Google Pixel & more'
  },
  {
    name: 'Laptop',
    image: '/stockImg/tradein-cata-img/Laptop.png',
    href: '/trade/browse?category=Laptops',
    description: 'MacBooks, ThinkPads, Gaming laptops'
  },
  {
    name: 'Tablet',
    image: '/stockImg/tradein-cata-img/Tablet.png',
    href: '/trade/browse?category=Tablets',
    description: 'iPads, Galaxy Tabs, Surface Pro'
  },
  {
    name: 'Gaming',
    image: '/stockImg/tradein-cata-img/Gaming.png',
    href: '/trade/browse?category=Gaming',
    description: 'Consoles, controllers & accessories'
  },
  {
    name: 'Wearable',
    image: '/stockImg/tradein-cata-img/Wearable.png',
    href: '/trade/browse?category=Wearables',
    description: 'Apple Watch, Fitbit, Galaxy Watch'
  },
  {
    name: 'CPU',
    image: '/stockImg/tradein-cata-img/CPU.png',
    href: '/trade/browse?category=Processors',
    description: 'Intel, AMD processors'
  },
  {
    name: 'GPU',
    image: '/stockImg/tradein-cata-img/GPU.png',
    href: '/trade/browse?category=Graphics Cards',
    description: 'NVIDIA, AMD, Intel graphics cards'
  },
  {
    name: 'RAM',
    image: '/stockImg/tradein-cata-img/RAM.png',
    href: '/trade/browse?category=Memory',
    description: 'DDR4, DDR5 memory modules'
  }
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
}

export default function CategoryGrid() {
  return (
    <section id="category-grid" className="py-12 px-4 w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-foreground mb-8">
        What do you want to sell?
      </h2>
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        {categories.map((category) => (
          <motion.div key={category.name} variants={itemVariants}>
            <TransitionLink
              href={category.href}
              className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="aspect-square bg-muted p-5 sm:p-6">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {category.description}
                </p>
              </div>
            </TransitionLink>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
