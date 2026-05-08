"use client"

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'motion/react'
import { Star } from 'lucide-react'

export function TestimonialsHorizontal({ heading, subheading, reviews }) {
    const ref = useRef(null)
    const scrollYProgress = useMotionValue(0)

    useEffect(() => {
        if (typeof window === 'undefined') return
        const el = ref.current
        if (!el) return

        const inner = document.getElementById('scrollable-content')
        const listeners = [window]
        if (inner && inner !== document.documentElement) listeners.push(inner)

        let raf = 0
        const tick = () => {
            raf = 0
            const rect = el.getBoundingClientRect()
            const denom = Math.max(1, rect.height - (window.innerHeight || 800))
            const p = Math.max(0, Math.min(1, -rect.top / denom))
            scrollYProgress.set(p)
        }
        const onScroll = () => {
            if (raf) return
            raf = requestAnimationFrame(tick)
        }

        tick()
        listeners.forEach((node) => node.addEventListener('scroll', onScroll, { passive: true }))
        window.addEventListener('resize', onScroll)
        return () => {
            listeners.forEach((node) => node.removeEventListener('scroll', onScroll))
            window.removeEventListener('resize', onScroll)
            if (raf) cancelAnimationFrame(raf)
        }
    }, [scrollYProgress])

    // Translate the track so cards slide left as the user scrolls vertically.
    // Range: from "first card centered" to "last card just past viewport".
    const totalCards = reviews.length
    const trackTranslate = useTransform(
        scrollYProgress,
        [0, 1],
        ['0%', `-${(totalCards - 1) * (100 / totalCards)}%`]
    )

    const headerOpacity = useTransform(scrollYProgress, [0, 0.05, 0.92, 1], [1, 1, 0.4, 0.3])

    return (
        <section
            ref={ref}
            className="relative bg-background"
            style={{ minHeight: `${Math.max(2, totalCards) * 90}vh` }}
        >
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
                <motion.div
                    style={{ opacity: headerOpacity }}
                    className="text-center pt-16 pb-8 px-4"
                >
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
                        {heading}
                    </h2>
                    <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto">{subheading}</p>
                </motion.div>

                <div className="flex-1 flex items-center">
                    <motion.div
                        style={{ x: trackTranslate, width: `${totalCards * 100}%` }}
                        className="flex gap-4 sm:gap-6 px-[10vw] will-change-transform"
                    >
                        {reviews.map((r, i) => (
                            <article
                                key={i}
                                className="shrink-0 basis-[80vw] sm:basis-[60vw] md:basis-[40vw] lg:basis-[30vw] flex flex-col p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700"
                            >
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <Star key={j} className="size-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed flex-1 mb-6">
                                    &ldquo;{r.quote}&rdquo;
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                        {r.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white">
                                            {r.name}
                                        </p>
                                        <p className="text-xs text-slate-500">{r.device}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </motion.div>
                </div>

                {/* Progress dots */}
                <div className="pb-10 pt-4 flex items-center justify-center gap-2">
                    {reviews.map((_, i) => (
                        <Dot key={i} index={i} total={totalCards} progress={scrollYProgress} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function Dot({ index, total, progress }) {
    const center = total === 1 ? 0 : index / (total - 1)
    const span = total === 1 ? 1 : 1 / (total - 1)
    const scale = useTransform(
        progress,
        [center - span, center, center + span],
        [1, 1.6, 1]
    )
    const opacity = useTransform(
        progress,
        [center - span, center, center + span],
        [0.3, 1, 0.3]
    )
    return (
        <motion.span
            style={{ scale, opacity }}
            className="block size-1.5 rounded-full bg-primary"
        />
    )
}
