"use client"

import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import ProductDetailEnhanced from './ProductDetailEnhanced'
import Recommends from '@/components/ui/recommends'
import { motion } from 'framer-motion'

export default function ProductDetailClient({ product, productId }) {
  const { addToCart, user } = useAuth()
  const router = useTransitionRouter()

  const handleAddToCart = async (product, quantity = 1) => {
    if (!user) {
      toast.error('Please login to add items to cart')
      router.push('/login')
      return
    }

    try {
      const result = await addToCart(product.id, quantity)
      if (result.success) {
        toast.success('Added to cart', {
          description: `${product.title} x${quantity} has been added to your cart.`,
          action: {
            label: 'View Cart',
            onClick: () => router.push('/cart')
          }
        })
      } else {
        toast.error('Failed to add item to cart: ' + result.error)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

  const handleToggleFavorite = () => {
    toast.success('Added to favorites', {
      description: 'This product has been saved to your favorites.',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 px-4">
        <ProductDetailEnhanced
          product={product}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

      {/* Recommendations Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16 px-4 bg-gradient-to-b from-muted/30 to-background"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                You May Also Like
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Similar products you might be interested in
            </p>
          </motion.div>

          <Recommends
            title=""
            limit={8}
            excludeId={productId}
            categories={product?.category}
          />
        </div>
      </motion.section>
    </div>
  )
}
