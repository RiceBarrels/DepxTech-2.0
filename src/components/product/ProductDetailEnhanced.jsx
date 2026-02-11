"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ProductActions } from '@/components/ui/ProductActions'
import { VariantSelector } from '@/components/ui/VariantSelector'
import {
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  EyeIcon,
  TagIcon,
  PackageIcon,
  TruckIcon,
  ShieldCheckIcon,
  RefreshCwIcon,
  LeafIcon,
  SparklesIcon,
  ZapIcon,
  CheckIcon,
  StarIcon,
  PlusIcon,
  MinusIcon,
} from 'lucide-react'

// Image Magnifier Component
function ImageMagnifier({ src, alt, magnifierSize = 150, zoomLevel = 2.5 }) {
  const [showMagnifier, setShowMagnifier] = useState(false)
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 })
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const imgRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!imgRef.current) return

    const elem = imgRef.current
    const { top, left, width, height } = elem.getBoundingClientRect()

    const x = e.clientX - left
    const y = e.clientY - top

    setCursorPos({ x, y })
    setMagnifierPos({
      x: ((x / width) * 100),
      y: ((y / height) * 100),
    })
  }, [])

  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-crosshair"
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        draggable={false}
      />

      <AnimatePresence>
        {showMagnifier && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute pointer-events-none rounded-full border-4 border-white shadow-2xl overflow-hidden"
            style={{
              width: magnifierSize,
              height: magnifierSize,
              left: cursorPos.x - magnifierSize / 2,
              top: cursorPos.y - magnifierSize / 2,
              backgroundImage: `url(${src})`,
              backgroundPosition: `${magnifierPos.x}% ${magnifierPos.y}%`,
              backgroundSize: `${zoomLevel * 100}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
      </AnimatePresence>

      {/* Zoom hint */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: showMagnifier ? 0 : 1 }}
        className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full"
      >
        Hover to zoom
      </motion.div>
    </div>
  )
}

// Enhanced Image Gallery with Thumbnails
function EnhancedImageGallery({ images = [], title = "" }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted rounded-2xl border-2 border-dashed border-border">
        <PackageIcon className="w-20 h-20 text-muted-foreground/50" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <motion.div
        className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-pink-500/5 border-2 border-border/50"
        layoutId="product-image"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <ImageMagnifier
              src={images[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-black transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-black transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </motion.button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentIndex
                  ? 'w-6 bg-primary'
                  : 'bg-white/60 hover:bg-white/80'
              )}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
                index === currentIndex
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <img
                src={img}
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === currentIndex && (
                <motion.div
                  layoutId="thumbnail-highlight"
                  className="absolute inset-0 bg-primary/10"
                />
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

// Animated Accordion Component
function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={false}
          className="rounded-xl border border-border overflow-hidden"
        >
          <motion.button
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {item.icon && <item.icon className="w-5 h-5 text-primary" />}
              <span className="font-medium">{item.title}</span>
            </div>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="px-4 pb-4 text-muted-foreground">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

// Condition Badge with Animation
function ConditionBadge({ condition = 'excellent' }) {
  const conditionConfig = {
    excellent: {
      label: 'Excellent',
      description: 'Like new, minimal signs of use',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/20 to-teal-500/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    good: {
      label: 'Good',
      description: 'Light wear, fully functional',
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-500/20 to-blue-500/20',
      textColor: 'text-cyan-600 dark:text-cyan-400',
    },
    fair: {
      label: 'Fair',
      description: 'Visible wear, works perfectly',
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/20 to-orange-500/20',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
  }

  const config = conditionConfig[condition.toLowerCase()] || conditionConfig.excellent

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full',
        `bg-gradient-to-r ${config.bgGradient}`
      )}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={cn('w-2 h-2 rounded-full bg-gradient-to-r', config.gradient)}
      />
      <span className={cn('font-semibold', config.textColor)}>{config.label}</span>
    </motion.div>
  )
}

// Trust Features Mini Bar
function TrustFeatures() {
  const features = [
    { icon: ShieldCheckIcon, text: '12-Month Warranty', color: 'text-emerald-500' },
    { icon: TruckIcon, text: 'Free Shipping', color: 'text-cyan-500' },
    { icon: RefreshCwIcon, text: '30-Day Returns', color: 'text-violet-500' },
    { icon: LeafIcon, text: 'Eco-Certified', color: 'text-green-500' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/50"
        >
          <feature.icon className={cn('w-5 h-5', feature.color)} />
          <span className="text-sm font-medium">{feature.text}</span>
        </motion.div>
      ))}
    </div>
  )
}

// Environmental Impact Card
function EnvironmentalImpact({ stats }) {
  const defaultStats = stats || {
    co2Saved: 45,
    waterSaved: 1200,
    treesEquivalent: 2,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <LeafIcon className="w-5 h-5 text-emerald-500" />
        <span className="font-semibold">Your Environmental Impact</span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-emerald-500">{defaultStats.co2Saved}kg</p>
          <p className="text-xs text-muted-foreground">CO2 Saved</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-cyan-500">{defaultStats.waterSaved}L</p>
          <p className="text-xs text-muted-foreground">Water Saved</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-500">{defaultStats.treesEquivalent}</p>
          <p className="text-xs text-muted-foreground">Trees Planted</p>
        </div>
      </div>
    </motion.div>
  )
}

// Animated Add to Cart Button
function AddToCartButton({ onClick, disabled, stocks }) {
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const handleClick = async () => {
    if (disabled || isAdding) return

    setIsAdding(true)

    // Simulate adding animation
    await new Promise(resolve => setTimeout(resolve, 800))

    setIsAdding(false)
    setIsAdded(true)

    if (onClick) onClick()

    // Reset after showing success
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || stocks === 0}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        'relative w-full py-4 px-6 rounded-2xl font-semibold text-white overflow-hidden transition-all',
        disabled || stocks === 0
          ? 'bg-muted text-muted-foreground cursor-not-allowed'
          : isAdded
          ? 'bg-emerald-500'
          : 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:shadow-lg hover:shadow-violet-500/25'
      )}
    >
      {/* Animated background */}
      {!disabled && !isAdded && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-600 via-violet-600 to-purple-600"
          animate={{
            x: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ opacity: 0.5 }}
        />
      )}

      <span className="relative flex items-center justify-center gap-2">
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
            />
          ) : isAdded ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex items-center gap-2"
            >
              <CheckIcon className="w-5 h-5" />
              Added to Cart!
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex items-center gap-2"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {stocks === 0 ? 'Out of Stock' : 'Add to Cart'}
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  )
}

// Quantity Selector
function QuantitySelector({ value = 1, onChange, max = 10 }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Qty:</span>
      <div className="flex items-center border border-border rounded-xl overflow-hidden">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          className="w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MinusIcon className="w-4 h-4" />
        </motion.button>
        <span className="w-12 text-center font-semibold">{value}</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-10 h-10 flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
}

// Main Enhanced Product Detail Component
export default function ProductDetailEnhanced({
  product,
  isAdmin = false,
  onEdit,
  onDelete,
  onAddToCart,
  onToggleFavorite,
  className = "",
}) {
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const containerRef = useRef(null)

  const {
    title = '',
    des = '',
    price = 0,
    stocks = 0,
    category = [],
    imgs = [],
    variant_of_id = '',
    variant_data = [],
    views = 0,
    id,
    condition = 'excellent',
    original_price,
  } = product || {}

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const savings = original_price ? original_price - price : 0
  const savingsPercent = original_price ? Math.round((savings / original_price) * 100) : 0

  const accordionItems = [
    {
      icon: PackageIcon,
      title: 'Product Details',
      content: des || 'No description available.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Warranty & Returns',
      content: 'This product comes with a 12-month warranty and 30-day hassle-free returns. All refurbished devices are professionally tested and certified.',
    },
    {
      icon: TruckIcon,
      title: 'Shipping Information',
      content: 'Free standard shipping on all orders. Express shipping available at checkout. Most orders ship within 1-2 business days.',
    },
    {
      icon: LeafIcon,
      title: 'Environmental Impact',
      content: 'By choosing renewed, you help reduce e-waste and carbon emissions. This device saves approximately 45kg of CO2 and 1,200L of water compared to buying new.',
    },
  ]

  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Product not found</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('w-full max-w-7xl mx-auto', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column - Sticky Image Gallery */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <EnhancedImageGallery images={imgs} title={title} />
        </div>

        {/* Right Column - Scrollable Details */}
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Condition Badge */}
            <ConditionBadge condition={condition} />

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>

            {/* Categories */}
            {category.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {category.map((cat, index) => (
                  <Badge key={index} variant="outline" className="rounded-full">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}

            {/* Price Section */}
            <div className="flex items-end gap-4">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent"
              >
                {formatPrice(price)}
              </motion.span>

              {original_price && original_price > price && (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(original_price)}
                  </span>
                  <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
                    -{savingsPercent}% OFF
                  </Badge>
                </div>
              )}
            </div>

            {/* Stock & Views */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <PackageIcon className="w-4 h-4" />
                <span>{stocks > 0 ? `${stocks} in stock` : 'Out of stock'}</span>
              </div>
              <div className="flex items-center gap-1">
                <EyeIcon className="w-4 h-4" />
                <span>{views} views</span>
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Variants */}
          {variant_data && variant_data.length > 0 && variant_data[0]?.variant_type && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <VariantSelector variants={variant_data} />
            </motion.div>
          )}

          {/* Quantity & Add to Cart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={Math.min(10, stocks)}
              />

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsFavorite(!isFavorite)
                    onToggleFavorite?.()
                  }}
                  className={cn(
                    'w-12 h-12 rounded-xl border flex items-center justify-center transition-colors',
                    isFavorite
                      ? 'bg-red-500/10 border-red-500/30 text-red-500'
                      : 'border-border hover:border-red-500/50 hover:text-red-500'
                  )}
                >
                  <HeartIcon className={cn('w-5 h-5', isFavorite && 'fill-current')} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-xl border border-border flex items-center justify-center hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <ShareIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <AddToCartButton
              onClick={() => onAddToCart?.(product, quantity)}
              disabled={stocks === 0}
              stocks={stocks}
            />
          </motion.div>

          <Separator />

          {/* Trust Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TrustFeatures />
          </motion.div>

          {/* Environmental Impact */}
          <EnvironmentalImpact />

          <Separator />

          {/* Accordion Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Accordion items={accordionItems} />
          </motion.div>

          {/* Admin Actions */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-4 border-t border-dashed"
            >
              <p className="text-xs text-muted-foreground mb-2">Admin Actions</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Edit Product
                </Button>
                <Button variant="destructive" size="sm" onClick={onDelete}>
                  Delete
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">ID: {id}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

// Loading Skeleton
export function ProductDetailEnhancedLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image skeleton */}
        <div className="space-y-4">
          <div className="aspect-square w-full bg-muted animate-pulse rounded-2xl" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="h-8 w-24 bg-muted animate-pulse rounded-full" />
            <div className="h-10 w-3/4 bg-muted animate-pulse rounded-lg" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 w-16 bg-muted animate-pulse rounded-full" />
              ))}
            </div>
            <div className="h-12 w-1/2 bg-muted animate-pulse rounded-lg" />
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-2">
            <div className="h-14 w-full bg-muted animate-pulse rounded-2xl" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>

          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
