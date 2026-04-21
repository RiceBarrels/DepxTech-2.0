'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const TRANSITION_CONFIG = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.55,
}

// True when an ancestor ScrollStagger is driving visibility — children skip
// their own whileInView and inherit hidden/visible from the parent variants.
const StaggerContext = React.createContext(false)

const useAnimationVariants = (animate) =>
  React.useMemo(
    () => ({
      hidden: {
        x: animate === 'left' ? -40 : animate === 'right' ? 40 : 0,
        y: animate === 'top' ? -30 : animate === 'bottom' ? 30 : 0,
        scale: animate === 'z' ? 0.92 : 1,
        opacity: 0,
      },
      visible: {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
      },
    }),
    [animate]
  )

const filterVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

// Container that staggers its children animations
export const ScrollStagger = React.forwardRef(
  (
    { children, className, staggerChildren = 0.1, delayChildren = 0.1, once = true, amount = 0.2, ...props },
    ref
  ) => {
    return (
      <StaggerContext.Provider value={true}>
        <motion.div
          className={cn('relative', className)}
          ref={ref}
          initial="hidden"
          whileInView="visible"
          viewport={{ once, amount }}
          transition={{ staggerChildren, delayChildren }}
          {...props}
        >
          {children}
        </motion.div>
      </StaggerContext.Provider>
    )
  }
)
ScrollStagger.displayName = 'ScrollStagger'

// Child reveal — standalone it drives itself, inside ScrollStagger it inherits.
export const ScrollReveal = React.forwardRef(
  (
    { animation = 'bottom', children, className, delay = 0, duration, once = true, amount = 0.2, ...props },
    ref
  ) => {
    const variants = useAnimationVariants(animation)
    const inStagger = React.useContext(StaggerContext)

    const viewportProps = inStagger
      ? {}
      : { initial: 'hidden', whileInView: 'visible', viewport: { once, amount } }

    return (
      <motion.div
        transition={{ ...TRANSITION_CONFIG, delay, ...(duration && { duration }) }}
        ref={ref}
        variants={animation ? variants : filterVariants}
        className={className}
        {...viewportProps}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
ScrollReveal.displayName = 'ScrollReveal'

// Standalone scroll animation (always drives itself)
export const ScrollFade = React.forwardRef(
  ({ children, className, animation = 'bottom', delay = 0, once = true, amount = 0.2, ...props }, ref) => {
    const variants = useAnimationVariants(animation)

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
        variants={variants}
        transition={{ ...TRANSITION_CONFIG, delay }}
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

// Scale on scroll — standalone; also works inside ScrollStagger via variants fallback.
export const ScrollScale = React.forwardRef(
  ({ children, className, once = true, amount = 0.2, ...props }, ref) => {
    const inStagger = React.useContext(StaggerContext)

    if (inStagger) {
      return (
        <motion.div
          ref={ref}
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={TRANSITION_CONFIG}
          className={className}
          {...props}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once, amount }}
        transition={TRANSITION_CONFIG}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
ScrollScale.displayName = 'ScrollScale'

// Counter animation on scroll — works whether parent scrolls window or a custom container.
export const ScrollCounter = ({
  value,
  suffix = '',
  prefix = '',
  className,
  duration = 2,
  once = true,
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
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}
