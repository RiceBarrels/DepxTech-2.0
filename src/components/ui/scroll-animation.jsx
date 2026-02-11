'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const SPRING_CONFIG = {
  type: 'spring',
  stiffness: 100,
  damping: 16,
  mass: 0.75,
  restDelta: 0.005,
  duration: 0.3,
}

const useAnimationVariants = (animate) =>
  React.useMemo(
    () => ({
      hidden: {
        x: animate === 'left' ? '-100%' : animate === 'right' ? '100%' : 0,
        y: animate === 'top' ? '-50px' : animate === 'bottom' ? '50px' : 0,
        scale: animate === 'z' ? 0.8 : 1,
        filter: animate === 'blur' ? 'blur(10px)' : 'blur(0px)',
        opacity: 0,
      },
      visible: {
        x: 0,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        opacity: 1,
      },
    }),
    [animate]
  )

const filterVariants = {
  hidden: {
    opacity: 0,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
  },
}

// Container that staggers its children animations
export const ScrollStagger = React.forwardRef(
  ({ children, className, staggerChildren = 0.1, delayChildren = 0.1, once = true, amount = 0.3, ...props }, ref) => {
    return (
      <motion.div
        className={cn('relative', className)}
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
        transition={{
          staggerChildren,
          delayChildren,
        }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
ScrollStagger.displayName = 'ScrollStagger'

// Animated child element with various animation types
export const ScrollReveal = React.forwardRef(
  ({ animation = 'blur', children, className, delay = 0, duration, ...props }, ref) => {
    const variants = useAnimationVariants(animation)

    return (
      <motion.div
        transition={{
          ...SPRING_CONFIG,
          delay,
          ...(duration && { duration })
        }}
        ref={ref}
        variants={animation ? variants : filterVariants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
ScrollReveal.displayName = 'ScrollReveal'

// Standalone scroll animation (not part of stagger group)
export const ScrollFade = React.forwardRef(
  ({
    children,
    className,
    animation = 'bottom',
    delay = 0,
    once = true,
    amount = 0.3,
    ...props
  }, ref) => {
    const variants = useAnimationVariants(animation)

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
        variants={variants}
        transition={{ ...SPRING_CONFIG, delay }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
ScrollFade.displayName = 'ScrollFade'

// Parallax scroll effect
export const ScrollParallax = React.forwardRef(
  ({ children, className, speed = 0.5, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ y: 0 }}
        whileInView={{ y: speed * -50 }}
        viewport={{ once: false, amount: 0 }}
        transition={{ type: 'tween', ease: 'linear' }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
ScrollParallax.displayName = 'ScrollParallax'

// Scale on scroll
export const ScrollScale = React.forwardRef(
  ({ children, className, once = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once, amount: 0.3 }}
        transition={SPRING_CONFIG}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
ScrollScale.displayName = 'ScrollScale'

// Counter animation on scroll
export const ScrollCounter = ({
  value,
  suffix = '',
  prefix = '',
  className,
  duration = 2,
  once = true
}) => {
  const [count, setCount] = React.useState(0)
  const [hasAnimated, setHasAnimated] = React.useState(false)
  const ref = React.useRef(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated)) {
          setHasAnimated(true)
          let start = 0
          const end = parseInt(value)
          const increment = end / (duration * 60)

          const timer = setInterval(() => {
            start += increment
            if (start >= end) {
              setCount(end)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 1000 / 60)

          return () => clearInterval(timer)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value, duration, once, hasAnimated])

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}
