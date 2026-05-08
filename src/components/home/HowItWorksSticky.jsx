"use client"

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'motion/react'
import { CheckIcon, TagIcon, TruckIcon, BanknoteIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS = {
    tag: TagIcon,
    truck: TruckIcon,
    banknote: BanknoteIcon,
}

export function HowItWorksSticky({ heading, subheading, steps }) {
    const ref = useRef(null)
    const scrollYProgress = useMotionValue(0)
    const [active, setActive] = useState(0)

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

            const idx = Math.min(steps.length - 1, Math.floor(p * steps.length + 0.0001))
            setActive(idx)
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
    }, [scrollYProgress, steps.length])

    const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

    return (
        <section
            ref={ref}
            className="relative bg-background"
            style={{ minHeight: `${steps.length * 100}vh` }}
        >
            <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
                            {heading}
                        </h2>
                        <p className="text-slate-500 text-base sm:text-lg">{subheading}</p>
                    </div>

                    {/* Step indicator track */}
                    <div className="relative max-w-2xl mx-auto mb-10">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                style={{ scaleX: progressScaleX, transformOrigin: '0% 50%' }}
                                className="h-full w-full bg-primary"
                            />
                        </div>
                        <div className="relative flex justify-between">
                            {steps.map((step, i) => {
                                const reached = i <= active
                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            'size-10 sm:size-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border-4 transition-colors duration-300',
                                            reached
                                                ? 'bg-primary text-primary-foreground border-background'
                                                : 'bg-muted text-muted-foreground border-background'
                                        )}
                                    >
                                        {i < active ? <CheckIcon className="size-4 sm:size-5" /> : i + 1}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Active step card */}
                    <div className="relative h-[18rem] sm:h-[20rem] max-w-2xl mx-auto">
                        {steps.map((step, i) => {
                            const Icon = ICONS[step.iconKey] || TagIcon
                            const isActive = i === active
                            const isPast = i < active
                            return (
                                <motion.div
                                    key={i}
                                    initial={false}
                                    animate={{
                                        opacity: isActive ? 1 : 0,
                                        y: isActive ? 0 : isPast ? -24 : 24,
                                        scale: isActive ? 1 : 0.96,
                                    }}
                                    transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                                    style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                                >
                                    <div className="size-20 sm:size-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
                                        <Icon className="w-10 h-10 sm:w-12 sm:h-12" />
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-slate-900 dark:text-white">
                                        {step.title}
                                    </h3>
                                    <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-md">
                                        {step.description}
                                    </p>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Scroll hint */}
                    <motion.div
                        style={{ opacity: useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [1, 1, 0, 0]) }}
                        className="mt-10 sm:mt-14 text-center text-xs text-muted-foreground tracking-widest uppercase"
                    >
                        Scroll
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
