"use client"

import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import ProductDetailEnhanced from './ProductDetailEnhanced'
import Recommends from '@/components/ui/recommends'
import { RecentlyViewed } from '@/components/product/RecentlyViewed'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function ProductDetailClient({ product, productId }) {
  const t = useTranslations('productDetail')
  const { addToCart, user } = useAuth()
  const router = useTransitionRouter()
  const { addItem } = useRecentlyViewed()

  useEffect(() => {
    if (product) {
      addItem({
        id: productId,
        title: product.title,
        price: product.price,
        image: product.imgs?.[0] || null,
      })
    }
  }, [productId])

  const handleAddToCart = async (product, quantity = 1) => {
    if (!user) {
      toast.error(t('pleaseLoginToCart'))
      router.push('/login')
      return
    }

    try {
      const result = await addToCart(product.id, quantity)
      if (result.success) {
        toast.success(t('addedToCartToast'), {
          description: t('addedToCartDesc', { title: product.title, quantity }),
          action: {
            label: t('viewCart'),
            onClick: () => router.push('/cart')
          }
        })
      } else {
        toast.error(t('failedAddToCart') + ': ' + result.error)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error(t('failedAddToCart'))
    }
  }

  const handleToggleFavorite = () => {
    toast.success(t('addedToFavorites'), {
      description: t('addedToFavoritesDesc'),
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
                {t('youMayAlsoLike')}
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('similarProducts')}
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

      {/* Recently Viewed */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <RecentlyViewed excludeId={productId} />
      </div>
    </div>
  )
}
