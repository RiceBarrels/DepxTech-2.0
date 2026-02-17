'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 5000

export function BannerControls({ count }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const scrollTo = useCallback((index) => {
    const scroller = document.getElementById('banner-scroller')
    if (!scroller) return
    const width = scroller.offsetWidth
    scroller.scrollTo({ left: width * index, behavior: 'smooth' })
    setCurrent(index)
  }, [])

  const next = useCallback(() => {
    scrollTo(current >= count - 1 ? 0 : current + 1)
  }, [current, count, scrollTo])

  const prev = useCallback(() => {
    scrollTo(current <= 0 ? count - 1 : current - 1)
  }, [current, count, scrollTo])

  // Sync current index on native scroll/swipe
  useEffect(() => {
    const scroller = document.getElementById('banner-scroller')
    if (!scroller) return

    let timeout
    const onScroll = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        const index = Math.round(scroller.scrollLeft / scroller.offsetWidth)
        setCurrent(index)
      }, 80)
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      clearTimeout(timeout)
    }
  }, [])

  // Autoplay
  useEffect(() => {
    if (paused || count <= 1) return
    const timer = setInterval(next, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [paused, next, count])

  // Pause on hover (delegate to parent section)
  useEffect(() => {
    const section = document.getElementById('banner-scroller')?.closest('section')
    if (!section) return

    const enter = () => setPaused(true)
    const leave = () => setPaused(false)

    section.addEventListener('mouseenter', enter)
    section.addEventListener('mouseleave', leave)
    return () => {
      section.removeEventListener('mouseenter', enter)
      section.removeEventListener('mouseleave', leave)
    }
  }, [])

  if (count <= 1) return null

  return (
    <>
      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === current ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </>
  )
}
