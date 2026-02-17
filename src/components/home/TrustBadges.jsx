"use client"

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ShieldCheckIcon,
  TruckIcon,
  RefreshCwIcon,
  HeadphonesIcon,
  LeafIcon,
  StarIcon,
  BadgeCheckIcon,
  CreditCardIcon,
  LockIcon,
  ClockIcon,
  AwardIcon,
  HeartIcon,
} from 'lucide-react'

// Animated SVG icon with pulse effect
function AnimatedIcon({ icon: Icon, color, isActive }) {
  return (
    <div className="relative">
      {/* Pulse rings */}
      {isActive && (
        <>
          <motion.div
            className={cn('absolute inset-0 rounded-full', color)}
            initial={{ scale: 1, opacity: 0.3 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className={cn('absolute inset-0 rounded-full', color)}
            initial={{ scale: 1, opacity: 0.3 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}

      {/* Icon container */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={cn(
          'relative w-14 h-14 rounded-2xl flex items-center justify-center',
          'bg-gradient-to-br',
          color
        )}
      >
        <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
      </motion.div>
    </div>
  )
}

// Trust badge card
function TrustBadge({
  icon,
  title,
  description,
  color,
  delay = 0,
}) {
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const colorMap = {
    emerald: {
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    violet: {
      gradient: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/30',
      text: 'text-violet-600 dark:text-violet-400',
    },
    cyan: {
      gradient: 'from-cyan-500 to-blue-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-600 dark:text-cyan-400',
    },
    amber: {
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
    },
    rose: {
      gradient: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-600 dark:text-rose-400',
    },
    indigo: {
      gradient: 'from-indigo-500 to-violet-500',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
  }

  const colors = colorMap[color] || colorMap.emerald

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'group relative p-6 rounded-3xl border-2 transition-all duration-500',
        'bg-background hover:shadow-xl cursor-pointer',
        colors.border,
        isHovered && `${colors.bg} shadow-lg`
      )}
    >
      {/* Gradient glow on hover */}
      <motion.div
        className={cn(
          'absolute inset-0 rounded-3xl opacity-0 transition-opacity',
          `bg-gradient-to-br ${colors.gradient}`
        )}
        animate={{ opacity: isHovered ? 0.05 : 0 }}
      />

      <div className="relative flex flex-col items-center text-center gap-4">
        <AnimatedIcon
          icon={icon}
          color={colors.gradient}
          isActive={isHovered}
        />

        <div>
          <h3 className={cn(
            'font-semibold text-lg mb-1 transition-colors',
            isHovered && colors.text
          )}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

// Scrolling trust strip (marquee)
function TrustMarquee() {
  const items = [
    { icon: BadgeCheckIcon, text: '100% Verified Devices', color: 'text-emerald-500' },
    { icon: StarIcon, text: '4.9/5 Customer Rating', color: 'text-amber-500' },
    { icon: LockIcon, text: 'Secure Checkout', color: 'text-violet-500' },
    { icon: AwardIcon, text: '12-Month Warranty', color: 'text-cyan-500' },
    { icon: LeafIcon, text: 'Eco-Certified', color: 'text-green-500' },
    { icon: HeartIcon, text: '5k+ Happy Customers', color: 'text-rose-500' },
  ]

  const duplicatedItems = [...items, ...items]

  return (
    <div className="relative overflow-hidden py-6 bg-muted/30 border-y border-border/50">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <item.icon className={cn('w-5 h-5', item.color)} />
            <span>{item.text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// Main trust section
export default function TrustBadges() {
  const badges = [
    {
      icon: ShieldCheckIcon,
      title: '12-Month Warranty',
      description: 'Every device comes with comprehensive coverage',
      color: 'emerald',
    },
    {
      icon: TruckIcon,
      title: 'Free Shipping',
      description: 'Fast, insured delivery on all orders',
      color: 'cyan',
    },
    {
      icon: RefreshCwIcon,
      title: '30-Day Returns',
      description: 'Not satisfied? Return it hassle-free',
      color: 'violet',
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Expert help whenever you need it',
      color: 'amber',
    },
    {
      icon: LeafIcon,
      title: 'Eco-Certified',
      description: 'Sustainable choice for the planet',
      color: 'emerald',
    },
    {
      icon: CreditCardIcon,
      title: 'Secure Payment',
      description: 'Your data is always protected',
      color: 'indigo',
    },
  ]

  return (
    <section className="py-16 md:py-24">
      {/* Marquee strip */}
      <TrustMarquee />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              DepxTech
            </span>
            ?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We're committed to quality, sustainability, and your satisfaction
          </p>
        </motion.div>

        {/* Badges grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge, index) => (
            <TrustBadge
              key={index}
              icon={badge.icon}
              title={badge.title}
              description={badge.description}
              color={badge.color}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-500/20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '5k+', label: 'Happy Customers', icon: HeartIcon, color: 'text-rose-500' },
              { value: '98%', label: 'Satisfaction Rate', icon: StarIcon, color: 'text-amber-500' },
              { value: '100K+', label: 'Devices Sold', icon: BadgeCheckIcon, color: 'text-emerald-500' },
              { value: '24/7', label: 'Support Available', icon: ClockIcon, color: 'text-cyan-500' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <stat.icon className={cn('w-6 h-6 mb-2', stat.color)} />
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

export { TrustBadge, TrustMarquee }
