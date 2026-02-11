"use client"

import { motion } from 'framer-motion'

// Enhanced Skeleton with shimmer effect
function Skeleton({ className }) {
  return (
    <div className={`relative overflow-hidden bg-muted rounded-lg ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{ translateX: ['0%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        }}
      />
    </div>
  )
}

// Enhanced Product Details Skeleton
function ProductDetailsSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery Skeleton */}
        <div className="lg:sticky lg:top-24 lg:h-fit space-y-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Product Information Skeleton */}
        <div className="space-y-6">
          {/* Condition badge */}
          <Skeleton className="h-10 w-28 rounded-full" />

          {/* Title */}
          <Skeleton className="h-10 w-3/4 rounded-lg" />

          {/* Categories */}
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>

          {/* Price */}
          <Skeleton className="h-12 w-40 rounded-lg" />

          {/* Stock info */}
          <div className="flex gap-4">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Quantity and buttons */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </div>

          {/* Add to cart button */}
          <Skeleton className="h-14 w-full rounded-2xl" />

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Trust features grid */}
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>

          {/* Environmental impact card */}
          <Skeleton className="h-32 rounded-2xl" />

          {/* Separator */}
          <div className="h-px bg-border" />

          {/* Accordion items */}
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Recommendations Skeleton
function RecommendsSkeleton() {
  return (
    <div className="py-16 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto rounded-lg" />
          <Skeleton className="h-6 w-80 mx-auto mt-4 rounded" />
        </div>

        {/* Product cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-border overflow-hidden bg-card"
            >
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-6 w-1/2 rounded" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-background">
      <ProductDetailsSkeleton />
      <RecommendsSkeleton />
    </div>
  )
}
