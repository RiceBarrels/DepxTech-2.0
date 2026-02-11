"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  SparklesIcon,
  TrendingDownIcon,
  CheckIcon,
  XIcon,
  LeafIcon,
  ShieldCheckIcon,
  TruckIcon,
  RefreshCwIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Interactive price comparison slider
export default function PriceCompare({
  newPrice = 1199,
  renewedPrice = 799,
  productName = 'iPhone 15 Pro',
  features = [],
}) {
  const [sliderValue, setSliderValue] = useState(50)
  const sliderRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const springValue = useSpring(sliderValue, { stiffness: 300, damping: 30 })
  const displayPrice = useTransform(
    springValue,
    [0, 100],
    [renewedPrice, newPrice]
  )

  const savings = newPrice - renewedPrice
  const savingsPercent = Math.round((savings / newPrice) * 100)

  // Calculate the interpolated values
  const [currentPrice, setCurrentPrice] = useState(renewedPrice)
  const [currentSavings, setCurrentSavings] = useState(savings)

  useEffect(() => {
    const unsubscribe = displayPrice.on('change', (v) => {
      setCurrentPrice(Math.round(v))
      setCurrentSavings(Math.round(newPrice - v))
    })
    return () => unsubscribe()
  }, [displayPrice, newPrice])

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value)
    setSliderValue(value)
  }

  const handleDragStart = () => setIsDragging(true)
  const handleDragEnd = () => setIsDragging(false)

  // Default features comparison
  const defaultFeatures = features.length > 0 ? features : [
    { name: 'Warranty', new: '1 Year', renewed: '12 Months', icon: ShieldCheckIcon },
    { name: 'Free Shipping', new: true, renewed: true, icon: TruckIcon },
    { name: 'Returns', new: '14 Days', renewed: '30 Days', icon: RefreshCwIcon },
    { name: 'Eco Impact', new: 'New Materials', renewed: 'Saves 45kg CO2', icon: LeafIcon },
  ]

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0">
            <SparklesIcon className="w-3 h-3 mr-1" />
            Interactive Comparison
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See How Much You{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Save
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Drag the slider to compare new vs renewed prices and discover your savings
          </p>
        </motion.div>

        {/* Main comparison container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Glowing background */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />

          <div className="relative backdrop-blur-sm bg-background/80 border-2 border-border/50 rounded-3xl p-8 md:p-12">
            {/* Price display */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Renewed Price */}
              <motion.div
                animate={{
                  scale: sliderValue < 30 ? 1.05 : 1,
                  opacity: sliderValue < 30 ? 1 : 0.7,
                }}
                className={cn(
                  'relative p-6 rounded-2xl border-2 transition-all duration-300',
                  sliderValue < 30
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-xl shadow-emerald-500/20'
                    : 'border-border bg-muted/30'
                )}
              >
                <div className="absolute -top-3 left-4">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                    Best Value
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Renewed</p>
                <p className="text-4xl font-bold text-emerald-500">${renewedPrice}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                  <LeafIcon className="w-3 h-3 inline mr-1" />
                  Eco-friendly choice
                </p>
              </motion.div>

              {/* Dynamic Price Display */}
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    scale: isDragging ? 1.1 : 1,
                  }}
                  className="relative"
                >
                  {/* Animated background glow */}
                  <motion.div
                    animate={{
                      background: `linear-gradient(135deg,
                        hsl(${120 + (sliderValue * 2.4)} 80% 50% / 0.3) 0%,
                        hsl(${180 + (sliderValue * 1.8)} 80% 50% / 0.3) 100%
                      )`,
                    }}
                    className="absolute -inset-4 rounded-full blur-xl"
                  />

                  <div className="relative text-center">
                    <p className="text-sm text-muted-foreground mb-1">You Pay</p>
                    <p className="text-5xl md:text-6xl font-bold tabular-nums">
                      <span
                        className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                      >
                        ${currentPrice}
                      </span>
                    </p>
                  </div>
                </motion.div>

                {/* Savings indicator */}
                <AnimatePresence mode="wait">
                  {currentSavings > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 flex items-center gap-2"
                    >
                      <TrendingDownIcon className="w-5 h-5 text-emerald-500" />
                      <span className="text-lg font-semibold text-emerald-500">
                        Save ${currentSavings}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* New Price */}
              <motion.div
                animate={{
                  scale: sliderValue > 70 ? 1.05 : 1,
                  opacity: sliderValue > 70 ? 1 : 0.7,
                }}
                className={cn(
                  'relative p-6 rounded-2xl border-2 transition-all duration-300',
                  sliderValue > 70
                    ? 'border-red-500 bg-red-500/10 shadow-xl shadow-red-500/20'
                    : 'border-border bg-muted/30'
                )}
              >
                <p className="text-sm text-muted-foreground mb-1">Brand New</p>
                <p className="text-4xl font-bold text-red-500">${newPrice}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Full retail price
                </p>
              </motion.div>
            </div>

            {/* Slider */}
            <div className="relative mb-12">
              {/* Slider track background */}
              <div className="absolute inset-0 h-4 top-1/2 -translate-y-1/2 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-20" />
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                  style={{ width: `${100 - sliderValue}%` }}
                />
              </div>

              {/* Custom slider */}
              <input
                ref={sliderRef}
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleSliderChange}
                onMouseDown={handleDragStart}
                onMouseUp={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchEnd={handleDragEnd}
                className="relative w-full h-4 appearance-none cursor-pointer bg-transparent z-10
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-8
                  [&::-webkit-slider-thumb]:h-8
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:border-4
                  [&::-webkit-slider-thumb]:border-primary
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:cursor-grab
                  [&::-webkit-slider-thumb]:active:cursor-grabbing
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:w-8
                  [&::-moz-range-thumb]:h-8
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:border-4
                  [&::-moz-range-thumb]:border-primary
                  [&::-moz-range-thumb]:shadow-lg
                  [&::-moz-range-thumb]:cursor-grab
                "
              />

              {/* Labels */}
              <div className="flex justify-between mt-4 text-sm">
                <span className="text-emerald-500 font-medium">Renewed</span>
                <span className="text-muted-foreground">Drag to compare</span>
                <span className="text-red-500 font-medium">Brand New</span>
              </div>
            </div>

            {/* Features comparison */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {defaultFeatures.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-muted/50 border border-border/50"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{feature.name}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">New:</span>
                      <span className="flex items-center gap-1">
                        {typeof feature.new === 'boolean' ? (
                          feature.new ? (
                            <CheckIcon className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XIcon className="w-4 h-4 text-red-500" />
                          )
                        ) : (
                          feature.new
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Renewed:</span>
                      <span className="flex items-center gap-1 text-emerald-500 font-medium">
                        {typeof feature.renewed === 'boolean' ? (
                          feature.renewed ? (
                            <CheckIcon className="w-4 h-4" />
                          ) : (
                            <XIcon className="w-4 h-4 text-red-500" />
                          )
                        ) : (
                          feature.renewed
                        )}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 text-center"
            >
              <p className="text-lg font-medium mb-2">
                By choosing renewed, you save{' '}
                <span className="text-emerald-500 font-bold">${savings}</span>{' '}
                and reduce{' '}
                <span className="text-teal-500 font-bold">45kg CO2</span>
              </p>
              <p className="text-sm text-muted-foreground">
                That's equivalent to planting 2 trees or driving 180 fewer miles
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
