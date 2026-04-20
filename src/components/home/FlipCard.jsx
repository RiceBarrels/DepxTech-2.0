"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  LeafIcon,
  DropletIcon,
  BatteryIcon,
  RecycleIcon,
  TreesIcon,
  CloudIcon,
  FlameIcon,
  ZapIcon,
  ArrowRightLeftIcon,
  DollarSignIcon,
  TrendingUpIcon,
  SparklesIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Animated progress bar
function AnimatedProgress({ value, color, delay = 0 }) {
  return (
    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay, ease: 'easeOut' }}
        className={cn('h-full rounded-full', color)}
      />
    </div>
  )
}

// Individual flip card component
function FlipCard({
  frontContent,
  backContent,
  className = '',
  flipOnHover = true,
  colorScheme = 'violet',
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const { trigger } = useWebHaptics()

  const colorSchemes = {
    violet: {
      gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
      light: 'from-violet-500/20 to-fuchsia-500/20',
      border: 'border-violet-500/30',
    },
    emerald: {
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      light: 'from-emerald-500/20 to-cyan-500/20',
      border: 'border-emerald-500/30',
    },
    rose: {
      gradient: 'from-rose-600 via-pink-600 to-fuchsia-600',
      light: 'from-rose-500/20 to-fuchsia-500/20',
      border: 'border-rose-500/30',
    },
    amber: {
      gradient: 'from-amber-600 via-orange-600 to-red-600',
      light: 'from-amber-500/20 to-red-500/20',
      border: 'border-amber-500/30',
    },
  }

  const colors = colorSchemes[colorScheme] || colorSchemes.violet

  const handleFlip = () => {
    if (!flipOnHover) {
      trigger('light')
      setIsFlipped(!isFlipped)
    }
  }

  return (
    <div
      className={cn('relative h-[400px] perspective-1000', className)}
      onMouseEnter={() => flipOnHover && setIsFlipped(true)}
      onMouseLeave={() => flipOnHover && setIsFlipped(false)}
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 15 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front side */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full rounded-3xl overflow-hidden backface-hidden border-2',
            colors.border
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Gradient background */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-10',
              colors.light
            )}
          />
          <div className="relative h-full">{frontContent}</div>
        </div>

        {/* Back side */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full rounded-3xl overflow-hidden backface-hidden border-2',
            colors.border
          )}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Gradient background */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br',
              colors.gradient,
              'opacity-90'
            )}
          />
          <div className="relative h-full text-white">{backContent}</div>
        </div>
      </motion.div>

      {/* Flip indicator */}
      <div className="absolute bottom-4 right-4 z-10">
        <Badge
          variant="outline"
          className={cn(
            'bg-background/80 backdrop-blur-sm cursor-pointer',
            isFlipped ? 'opacity-0' : 'opacity-100',
            'transition-opacity'
          )}
        >
          <ArrowRightLeftIcon className="w-3 h-3 mr-1" />
          Flip to see impact
        </Badge>
      </div>
    </div>
  )
}

// Trade-in flip card with environmental impact
function TradeInFlipCard({
  device,
  colorScheme = 'violet',
}) {
  const {
    title = 'iPhone 15 Pro',
    image = '/stockImg/tradein-cata-img/Smartphone.svg',
    tradeInValue = { min: 400, max: 650 },
    condition = 'Working',
    stats = {
      co2Saved: 45,
      waterSaved: 1200,
      energySaved: 65,
      eWasteReduced: 0.2,
    },
  } = device || {}

  // Front content - Trade-in value
  const frontContent = (
    <div className="flex flex-col h-full p-6">
      {/* Badge */}
      <div className="flex justify-between items-start">
        <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
          <DollarSignIcon className="w-3 h-3 mr-1" />
          Trade-In
        </Badge>
        <Badge className="bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/30">
          <TrendingUpIcon className="w-3 h-3 mr-1" />
          High Value
        </Badge>
      </div>

      {/* Device image */}
      <div className="flex-1 flex items-center justify-center py-6">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="relative w-full max-w-[200px] aspect-square"
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain drop-shadow-xl"
          />
        </motion.div>
      </div>

      {/* Trade-in info */}
      <div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-1">Estimated Trade-In Value</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            ${tradeInValue.min} - ${tradeInValue.max}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Based on {condition} condition
        </p>
      </div>
    </div>
  )

  // Back content - Environmental impact
  const backContent = (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <LeafIcon className="w-10 h-10 mx-auto mb-2 text-white/90" />
        <h3 className="text-xl font-bold">Your Green Impact</h3>
        <p className="text-sm text-white/70">By trading in this device</p>
      </div>

      {/* Stats */}
      <div className="flex-1 space-y-4">
        {/* CO2 Saved */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm">
              <CloudIcon className="w-4 h-4" />
              CO2 Prevented
            </div>
            <span className="font-bold">{stats.co2Saved}kg</span>
          </div>
          <AnimatedProgress value={75} color="bg-emerald-300" delay={0.2} />
        </div>

        {/* Water Saved */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm">
              <DropletIcon className="w-4 h-4" />
              Water Conserved
            </div>
            <span className="font-bold">{stats.waterSaved}L</span>
          </div>
          <AnimatedProgress value={85} color="bg-cyan-300" delay={0.3} />
        </div>

        {/* Energy Saved */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm">
              <ZapIcon className="w-4 h-4" />
              Energy Conserved
            </div>
            <span className="font-bold">{stats.energySaved}%</span>
          </div>
          <AnimatedProgress value={65} color="bg-amber-300" delay={0.4} />
        </div>

        {/* E-Waste Reduced */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm">
              <RecycleIcon className="w-4 h-4" />
              E-Waste Diverted
            </div>
            <span className="font-bold">{stats.eWasteReduced}kg</span>
          </div>
          <AnimatedProgress value={90} color="bg-purple-300" delay={0.5} />
        </div>
      </div>

      {/* Equivalent */}
      <div className="mt-4 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-sm">
          <TreesIcon className="w-4 h-4" />
          <span>Equivalent to planting 2 trees</span>
        </div>
      </div>
    </div>
  )

  return (
    <FlipCard
      frontContent={frontContent}
      backContent={backContent}
      colorScheme={colorScheme}
    />
  )
}

// Legacy ProductFlipCard - kept for backward compatibility
function ProductFlipCard({
  product,
  colorScheme = 'violet',
}) {
  // Convert product format to trade-in format
  const device = {
    title: product?.title || 'iPhone 15 Pro',
    image: product?.image || '/stockImg/tradein-cata-img/Smartphone.svg',
    tradeInValue: {
      min: Math.round((product?.price || 899) * 0.4),
      max: Math.round((product?.price || 899) * 0.65),
    },
    condition: product?.condition || 'Working',
    stats: product?.stats || {
      co2Saved: 45,
      waterSaved: 1200,
      energySaved: 65,
      eWasteReduced: 0.2,
    },
  }

  return <TradeInFlipCard device={device} colorScheme={colorScheme} />
}

// Flip cards grid section - Trade-in focused
export default function FlipCardsSection({ devices }) {
  const sampleDevices = devices || [
    {
      title: 'iPhone 15 Pro Max',
      image: '/stockImg/tradein-cata-img/Smartphone.svg',
      tradeInValue: { min: 450, max: 720 },
      condition: 'Working',
      stats: { co2Saved: 45, waterSaved: 1200, energySaved: 65, eWasteReduced: 0.2 },
    },
    {
      title: 'MacBook Pro 14"',
      image: '/stockImg/tradein-cata-img/Laptop.svg',
      tradeInValue: { min: 800, max: 1400 },
      condition: 'Working',
      stats: { co2Saved: 120, waterSaved: 3500, energySaved: 78, eWasteReduced: 1.5 },
    },
    {
      title: 'iPad Pro 12.9"',
      image: '/stockImg/tradein-cata-img/Tablet.svg',
      tradeInValue: { min: 350, max: 580 },
      condition: 'Working',
      stats: { co2Saved: 35, waterSaved: 900, energySaved: 55, eWasteReduced: 0.4 },
    },
    {
      title: 'Apple Watch Ultra',
      image: '/stockImg/tradein-cata-img/Wearable.svg',
      tradeInValue: { min: 200, max: 380 },
      condition: 'Working',
      stats: { co2Saved: 8, waterSaved: 200, energySaved: 40, eWasteReduced: 0.05 },
    },
  ]

  const colorSchemes = ['violet', 'emerald', 'rose', 'amber']

  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
            <LeafIcon className="w-3 h-3 mr-1" />
            Eco Impact
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trade In &{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Make an Impact
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every device you trade in helps the planet. Hover or tap to see the environmental
            impact of your sustainable choice.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleDevices.map((device, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <TradeInFlipCard
                device={device}
                colorScheme={colorSchemes[index % colorSchemes.length]}
              />
            </motion.div>
          ))}
        </div>

        {/* Total impact counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20"
        >
          <h3 className="text-xl font-bold text-center mb-8">
            Total Community Impact from Trade-Ins
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: CloudIcon, value: '2.5M', label: 'kg CO2 Prevented', color: 'text-emerald-500' },
              { icon: DropletIcon, value: '50M', label: 'Liters Conserved', color: 'text-cyan-500' },
              { icon: RecycleIcon, value: '10K', label: 'Devices Recycled', color: 'text-amber-500' },
              { icon: TreesIcon, value: '100K', label: 'Trees Equivalent', color: 'text-green-500' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className={cn('w-8 h-8 mx-auto mb-2', stat.color)} />
                <p className={cn('text-3xl font-bold', stat.color)}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export { FlipCard, ProductFlipCard, TradeInFlipCard }
