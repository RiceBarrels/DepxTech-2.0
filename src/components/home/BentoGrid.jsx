"use client"

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  HeartIcon,
  StarIcon,
  ZapIcon,
  TrendingDownIcon,
  ShoppingCartIcon,
  SparklesIcon,
  LeafIcon,
  BatteryFullIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Color schemes for different product conditions
const conditionColors = {
  excellent: {
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/50',
    glow: 'shadow-emerald-500/25',
  },
  good: {
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/50',
    glow: 'shadow-cyan-500/25',
  },
  fair: {
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/50',
    glow: 'shadow-amber-500/25',
  },
}

// Category color schemes
const categoryColors = {
  smartphones: {
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    accent: 'bg-violet-500',
    light: 'bg-violet-500/10',
  },
  laptops: {
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    accent: 'bg-blue-500',
    light: 'bg-blue-500/10',
  },
  tablets: {
    gradient: 'from-pink-600 via-rose-600 to-red-600',
    accent: 'bg-pink-500',
    light: 'bg-pink-500/10',
  },
  wearables: {
    gradient: 'from-orange-600 via-amber-600 to-yellow-600',
    accent: 'bg-orange-500',
    light: 'bg-orange-500/10',
  },
  gaming: {
    gradient: 'from-red-600 via-orange-600 to-amber-600',
    accent: 'bg-red-500',
    light: 'bg-red-500/10',
  },
  audio: {
    gradient: 'from-indigo-600 via-violet-600 to-purple-600',
    accent: 'bg-indigo-500',
    light: 'bg-indigo-500/10',
  },
}

// 3D Tilt Card Component
function TiltCard({ children, className = '', glowColor = 'primary' }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg'])

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    x.set(mouseX / width - 0.5)
    y.set(mouseY / height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={cn('relative group', className)}
    >
      {/* Glow effect */}
      <motion.div
        className={cn(
          'absolute -inset-[2px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm',
          `bg-gradient-to-r ${conditionColors[glowColor]?.gradient || 'from-primary via-purple-500 to-pink-500'}`
        )}
        style={{ transform: 'translateZ(-10px)' }}
      />
      <div
        className="relative bg-background rounded-3xl h-full"
        style={{ transform: 'translateZ(0)' }}
      >
        {children}
      </div>
    </motion.div>
  )
}

// Product Card Component
function ProductCard({
  product,
  size = 'normal', // 'large', 'normal', 'small'
  showDetails = true,
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const condition = product.condition || 'excellent'
  const colors = conditionColors[condition]
  const categoryColor = categoryColors[product.category?.toLowerCase()] || categoryColors.smartphones

  const sizeClasses = {
    large: 'col-span-2 row-span-2',
    normal: 'col-span-1 row-span-1',
    small: 'col-span-1 row-span-1',
  }

  const savings = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  return (
    <TiltCard className={cn(sizeClasses[size])} glowColor={condition}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'relative h-full overflow-hidden rounded-3xl border-2 transition-all duration-500',
          colors.border,
          isHovered && `shadow-2xl ${colors.glow}`
        )}
      >
        {/* Gradient background overlay */}
        <div
          className={cn(
            'absolute inset-0 opacity-5 transition-opacity duration-500',
            `bg-gradient-to-br ${categoryColor.gradient}`,
            isHovered && 'opacity-10'
          )}
        />

        {/* Product image section */}
        <div className="relative aspect-square overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted" />

          {/* Floating badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {/* Condition badge */}
            <Badge
              className={cn(
                'font-semibold capitalize backdrop-blur-sm',
                colors.bg,
                colors.text,
                'border',
                colors.border
              )}
            >
              <SparklesIcon className="w-3 h-3 mr-1" />
              {condition}
            </Badge>

            {/* Savings badge */}
            {savings && (
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
                <TrendingDownIcon className="w-3 h-3 mr-1" />
                Save {savings}%
              </Badge>
            )}
          </div>

          {/* Like button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className={cn(
              'absolute top-4 right-4 z-10 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all',
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white/80 dark:bg-black/50 text-muted-foreground hover:text-red-500'
            )}
          >
            <HeartIcon className={cn('w-5 h-5', isLiked && 'fill-current')} />
          </motion.button>

          {/* Product image */}
          <motion.div
            animate={{
              scale: isHovered ? 1.1 : 1,
              y: isHovered ? -10 : 0,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative w-full h-full flex items-center justify-center p-8"
          >
            {product.image && (
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-6"
              />
            )}
          </motion.div>

          {/* Quick add overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            className="absolute bottom-4 left-4 right-4 z-10"
          >
            <Button
              className={cn(
                'w-full gap-2 backdrop-blur-sm',
                `bg-gradient-to-r ${categoryColor.gradient} hover:opacity-90`
              )}
            >
              <ShoppingCartIcon className="w-4 h-4" />
              Quick Add
            </Button>
          </motion.div>
        </div>

        {/* Product details */}
        {showDetails && (
          <div className="p-4 space-y-3">
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={cn('text-xs', categoryColor.light)}>
                {product.category}
              </Badge>
              <div className="flex items-center gap-1">
                <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.rating || '4.8'}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>

            {/* Specs */}
            <div className="flex flex-wrap gap-2">
              {product.specs?.map((spec, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {spec}
                </span>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-end justify-between pt-2">
              <div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      'text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
                      categoryColor.gradient
                    )}
                  >
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Battery health indicator */}
              {product.batteryHealth && (
                <div className="flex items-center gap-1 text-sm">
                  <BatteryFullIcon className={cn('w-4 h-4', colors.text)} />
                  <span className={colors.text}>{product.batteryHealth}%</span>
                </div>
              )}
            </div>

            {/* Eco impact */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <LeafIcon className="w-3 h-3" />
                <span>Saves {product.co2Saved || '12'}kg CO2</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <ZapIcon className="w-3 h-3" />
                <span>Fast Ship</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </TiltCard>
  )
}

// Bento Grid Component
export default function BentoGrid({ products = [], title, subtitle }) {
  // Sample products if none provided
  const sampleProducts = products.length > 0 ? products : [
    {
      id: 1,
      title: 'iPhone 15 Pro Max 256GB',
      category: 'Smartphones',
      price: 899,
      originalPrice: 1199,
      condition: 'excellent',
      image: '/stockImg/tradein-cata-img/Smartphone.svg',
      specs: ['256GB', 'Titanium Blue'],
      batteryHealth: 98,
      rating: 4.9,
      co2Saved: 45,
    },
    {
      id: 2,
      title: 'MacBook Pro 14" M3 Pro',
      category: 'Laptops',
      price: 1599,
      originalPrice: 2199,
      condition: 'excellent',
      image: '/stockImg/tradein-cata-img/Laptop.svg',
      specs: ['16GB RAM', '512GB SSD'],
      batteryHealth: 96,
      rating: 4.8,
      co2Saved: 120,
    },
    {
      id: 3,
      title: 'iPad Pro 12.9" M2',
      category: 'Tablets',
      price: 799,
      originalPrice: 1099,
      condition: 'good',
      image: '/stockImg/tradein-cata-img/Tablet.svg',
      specs: ['256GB', 'Wi-Fi + Cell'],
      batteryHealth: 94,
      rating: 4.7,
      co2Saved: 35,
    },
    {
      id: 4,
      title: 'Apple Watch Ultra 2',
      category: 'Wearables',
      price: 599,
      originalPrice: 799,
      condition: 'excellent',
      image: '/stockImg/tradein-cata-img/Wearable.svg',
      specs: ['49mm', 'Alpine Loop'],
      batteryHealth: 100,
      rating: 4.9,
      co2Saved: 8,
    },
    {
      id: 5,
      title: 'PlayStation 5 Digital',
      category: 'Gaming',
      price: 349,
      originalPrice: 449,
      condition: 'good',
      image: '/stockImg/tradein-cata-img/Gaming.svg',
      specs: ['Digital Edition'],
      rating: 4.6,
      co2Saved: 25,
    },
    {
      id: 6,
      title: 'NVIDIA RTX 4080 Super',
      category: 'Components',
      price: 799,
      originalPrice: 999,
      condition: 'fair',
      image: '/stockImg/tradein-cata-img/GPU.svg',
      specs: ['16GB GDDR6X'],
      rating: 4.8,
      co2Saved: 15,
    },
  ]

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {title}
                </span>
              </h2>
            )}
            {subtitle && (
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
          {sampleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={cn(
                index === 0 && 'md:col-span-2 md:row-span-2',
                index === 3 && 'lg:col-span-1 lg:row-span-2'
              )}
            >
              <TransitionLink href={`/products/${product.id}`} className="h-full block">
                <ProductCard
                  product={product}
                  size={index === 0 ? 'large' : 'normal'}
                />
              </TransitionLink>
            </motion.div>
          ))}
        </div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <TransitionLink href="/products">
            <Button
              variant="outline"
              size="lg"
              className="group border-2 hover:border-primary"
            >
              View All Products
              <motion.span
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Button>
          </TransitionLink>
        </motion.div>
      </div>
    </section>
  )
}

export { ProductCard, TiltCard, conditionColors, categoryColors }
