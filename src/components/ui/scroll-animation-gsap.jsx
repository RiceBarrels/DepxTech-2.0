'use client'

import * as React from 'react'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

/**
 * Resolve the element we should treat as the scroll container. Prefer the
 * explicit `#scrollable-content` node when it is actually scrolling, otherwise
 * walk up the ancestor chain, and finally fall back to `window`.
 */
export function findScroller(el) {
  if (typeof window === 'undefined') return null
  const explicit = document.getElementById('scrollable-content')
  if (explicit) {
    const style = window.getComputedStyle(explicit)
    const canScroll =
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      explicit.scrollHeight > explicit.clientHeight + 2
    if (canScroll) return explicit
  }
  let node = el?.parentElement
  while (node && node !== document.documentElement) {
    const style = window.getComputedStyle(node)
    const overflowY = style.overflowY
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      node.scrollHeight > node.clientHeight + 2
    ) {
      return node
    }
    node = node.parentElement
  }
  return explicit || window
}

// Initial "from" states — hidden before the trigger fires, then fade in.
// We compensate for the zero-opacity risk by firing the trigger at
// `top 98%`, i.e. the moment the element peeks into the viewport, so
// there's no perceptible blank gap.
const FROM = {
  bottom: { y: 40, autoAlpha: 0 },
  top: { y: -36, autoAlpha: 0 },
  left: { x: -48, autoAlpha: 0 },
  right: { x: 48, autoAlpha: 0 },
  scale: { scale: 0.94, autoAlpha: 0 },
  z: { scale: 0.94, autoAlpha: 0 },
  blur: { autoAlpha: 0, filter: 'blur(6px)' },
  fade: { autoAlpha: 0 },
}

function toVars(fromKey) {
  const base = { y: 0, x: 0, scale: 1, autoAlpha: 1 }
  if (fromKey === 'blur') base.filter = 'blur(0px)'
  return base
}

export function GSAPStagger({
  children,
  className,
  staggerChildren = 0.1,
  delayChildren = 0,
  from = 'bottom',
  duration = 0.7,
  once = true,
  // Fire well before the element reaches comfortable reading position so the
  // viewer never sees the "from" state sitting mid-screen.
  start = 'top 98%',
  as: Tag = 'div',
}) {
  const ref = useRef(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const targets = Array.from(el.children)
      if (!targets.length) return
      const scroller = findScroller(el)
      const fromVars = FROM[from] || FROM.bottom

      gsap.fromTo(
        targets,
        fromVars,
        {
          ...toVars(from),
          duration,
          ease: 'power3.out',
          stagger: staggerChildren,
          delay: delayChildren,
          scrollTrigger: {
            trigger: el,
            start,
            scroller,
            toggleActions: once ? 'play none none none' : 'play none none reverse',
          },
        }
      )
    },
    { scope: ref }
  )

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}

export function GSAPReveal({
  children,
  className,
  from = 'bottom',
  delay = 0,
  duration = 0.7,
  once = true,
  start = 'top 98%',
  as: Tag = 'div',
}) {
  const ref = useRef(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const scroller = findScroller(el)
      const fromVars = FROM[from] || FROM.bottom

      gsap.fromTo(
        el,
        fromVars,
        {
          ...toVars(from),
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start,
            scroller,
            toggleActions: once ? 'play none none none' : 'play none none reverse',
          },
        }
      )
    },
    { scope: ref }
  )

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}

export function GSAPCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 1.8,
  className,
  once = true,
}) {
  const ref = useRef(null)
  const target = typeof value === 'number' ? value : parseFloat(value) || 0
  const initialText = `${prefix}${target.toLocaleString()}${suffix}`

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const scroller = findScroller(el)
      const obj = { n: target }

      gsap.fromTo(
        obj,
        { n: 0 },
        {
          n: target,
          duration,
          ease: 'power2.out',
          immediateRender: false,
          onStart: () => {
            obj.n = 0
          },
          onUpdate: () => {
            if (!ref.current) return
            ref.current.textContent = `${prefix}${Math.floor(obj.n).toLocaleString()}${suffix}`
          },
          onComplete: () => {
            if (!ref.current) return
            ref.current.textContent = `${prefix}${target.toLocaleString()}${suffix}`
          },
          scrollTrigger: {
            trigger: el,
            start: 'top 95%',
            scroller,
            toggleActions: once ? 'play none none none' : 'play none none reset',
          },
        }
      )
    },
    { scope: ref, dependencies: [value, suffix, prefix] }
  )

  return (
    <span ref={ref} className={className}>
      {initialText}
    </span>
  )
}

export function GSAPParallax({ children, className, speed = 0.3, as: Tag = 'div' }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const scroller = findScroller(el)
      gsap.fromTo(
        el,
        { y: speed * 80 },
        {
          y: speed * -80,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            scroller,
          },
        }
      )
    },
    { scope: ref }
  )

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  )
}
