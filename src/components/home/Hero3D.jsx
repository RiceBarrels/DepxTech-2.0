"use client"

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import Image from 'next/image'
import { TransitionLink } from '@/components/ui/pageTransitions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRightIcon, SparklesIcon, LeafIcon, ShieldCheckIcon } from 'lucide-react'

// Floating product with 3D parallax effect
function FloatingProduct({
  src,
  alt,
  className = '',
  delay = 0,
  rotateRange = 15,
  floatRange = 20,
  scale = 1
}) {
  const ref = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [rotateRange, -rotateRange]), {
    stiffness: 150,
    damping: 20
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-rotateRange, rotateRange]), {
    stiffness: 150,
    damping: 20
  })

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect) return
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set((e.clientX - centerX) / window.innerWidth)
      mouseY.set((e.clientY - centerY) / window.innerHeight)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <motion.div
      ref={ref}
      className={`absolute ${className}`}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale }}
      transition={{
        duration: 0.8,
        delay,
        type: 'spring',
        stiffness: 100
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 blur-3xl opacity-30 bg-primary rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        }}
      />

      {/* Float animation */}
      <motion.div
        animate={{
          y: [-floatRange/2, floatRange/2, -floatRange/2],
        }}
        transition={{
          duration: 4 + delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={300}
          height={300}
          className="drop-shadow-2xl"
          style={{ transform: 'translateZ(50px)' }}
        />
      </motion.div>
    </motion.div>
  )
}

// Glassmorphism card component
function GlassCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className={`
        relative backdrop-blur-xl bg-white/10 dark:bg-black/20
        border border-white/20 dark:border-white/10
        rounded-2xl shadow-xl
        ${className}
      `}
    >
      {/* Gradient border glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-emerald-500/20 opacity-50" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// Animated stat counter
function AnimatedCounter({ value, suffix = '', prefix = '', duration = 2 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, (duration * 1000) / steps)

    return () => clearInterval(timer)
  }, [isVisible, value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

export default function Hero3D() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])

  // Dynamic gradient based on time
  const [gradientAngle, setGradientAngle] = useState(135)

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientAngle((prev) => (prev + 0.5) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-30 dark:opacity-50"
        style={{
          background: `linear-gradient(${gradientAngle}deg,
            hsl(var(--primary) / 0.3) 0%,
            hsl(160 84% 39% / 0.2) 50%,
            hsl(200 80% 50% / 0.3) 100%
          )`,
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content container */}
      <motion.div
        style={{ y: y1, opacity, scale }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="px-4 py-2 text-sm border-primary/50 bg-primary/5 backdrop-blur-sm"
              >
                <SparklesIcon className="w-4 h-4 mr-2 text-primary" />
                Up to 70% off retail prices
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              Premium Tech,{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-primary via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  Renewed
                </span>
                {/* Underline animation */}
                <motion.span
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-lg"
            >
              Discover professionally refurbished devices with warranty,
              free shipping, and a 30-day money-back guarantee.
              Better for your wallet, better for the planet.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <TransitionLink href="/products">
                <Button size="lg" className="group relative overflow-hidden px-8">
                  <span className="relative z-10 flex items-center gap-2">
                    Shop Now
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {/* Ripple effect */}
                  <motion.span
                    className="absolute inset-0 bg-white/20"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 2, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ borderRadius: '50%', transformOrigin: 'center' }}
                  />
                </Button>
              </TransitionLink>

              <TransitionLink href="/trade">
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-2 hover:bg-primary/5"
                >
                  <LeafIcon className="w-4 h-4 mr-2 text-emerald-500 group-hover:rotate-12 transition-transform" />
                  Trade-in Your Device
                </Button>
              </TransitionLink>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-6 pt-4"
            >
              {[
                { icon: ShieldCheckIcon, text: '12-Month Warranty' },
                { icon: LeafIcon, text: 'Eco-Certified' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <item.icon className="w-4 h-4 text-primary" />
                  {item.text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right side - 3D floating products */}
          <div className="relative h-[500px] hidden lg:block">
            <FloatingProduct
              src="/stockImg/tradein-cata-img/Smartphone.svg"
              alt="iPhone"
              className="top-10 right-20 z-30"
              delay={0.2}
              scale={1.1}
            />
            <FloatingProduct
              src="/stockImg/tradein-cata-img/Laptop.svg"
              alt="MacBook"
              className="bottom-20 left-10 z-20"
              delay={0.4}
              rotateRange={10}
            />
            <FloatingProduct
              src="/stockImg/tradein-cata-img/Wearable.svg"
              alt="Watch"
              className="top-40 left-20 z-10"
              delay={0.6}
              scale={0.7}
              floatRange={15}
            />
          </div>
        </div>

        {/* Stats section with glassmorphism */}
        <motion.div
          style={{ y: y2 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: 50000, suffix: '+', label: 'Devices Sold' },
            { value: 70, suffix: '%', label: 'Avg. Savings' },
            { value: 12, suffix: ' mo', label: 'Warranty' },
            { value: 4.9, suffix: '/5', label: 'Customer Rating' },
          ].map((stat, i) => (
            <GlassCard key={i} delay={0.5 + i * 0.1} className="p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </GlassCard>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ height: ['20%', '40%', '20%'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 bg-primary rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
