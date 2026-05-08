"use client"

import { ChevronLeftIcon, ShareIcon, CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTransitionRouter } from "./pageTransitions"
import { motion, AnimatePresence } from "framer-motion"
import { useWebHaptics } from "web-haptics/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function BackNav({ isShareButton = false }) {
    const router = useTransitionRouter()
    const { trigger } = useWebHaptics()
    const [justShared, setJustShared] = useState(false)

    const handleBack = () => {
        trigger([{ duration: 30, intensity: 1 }])
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back()
        } else {
            router.push("/")
        }
    }

    const handleShare = async () => {
        trigger([{ duration: 30, intensity: 1 }])
        const url = typeof window !== "undefined" ? window.location.href : ""
        const shareData = { title: document.title || "Share", url }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
                return
            }
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url)
                setJustShared(true)
                toast.success("Link copied to clipboard")
                setTimeout(() => setJustShared(false), 1600)
            }
        } catch (err) {
            if (err?.name !== "AbortError") {
                toast.error("Couldn't share link")
            }
        }
    }

    const handleBarTap = (e) => {
        if (e.target.closest("button")) return
        const el = document.getElementById("scrollable-content")
        if (el && el.scrollTop > 0) {
            trigger([{ duration: 20, intensity: 1 }])
            el.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                e.preventDefault()
                handleBack()
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    return (
        <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.6 }}
            onClick={handleBarTap}
            className="rounded-t-3xl flex flex-col sticky top-0 left-0 right-0 z-50 py-4 px-4 bg-[linear-gradient(to_bottom,var(--background)_25%,rgba(255,255,255,0)_100%)] cursor-default"
        >
            <div className="flex items-center justify-between">
                <motion.div
                    whileTap={{ scale: 0.88 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                    <Button
                        className="bg-background/50 backdrop-blur-sm group overflow-hidden"
                        variant="outline"
                        size="icon"
                        onClick={handleBack}
                        aria-label="Back (Esc)"
                        title="Back (Esc)"
                    >
                        <motion.span
                            initial={{ x: 0 }}
                            whileHover={{ x: -2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 18 }}
                            className="inline-flex"
                        >
                            <ChevronLeftIcon className="size-4.5" alt="Back" />
                        </motion.span>
                    </Button>
                </motion.div>

                <AnimatePresence initial={false}>
                    {isShareButton && (
                        <motion.div
                            key="share-btn"
                            initial={{ scale: 0, opacity: 0, rotate: -30 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0, rotate: 30 }}
                            whileTap={{ scale: 0.88 }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        >
                            <Button
                                className="bg-background/50 backdrop-blur-sm"
                                variant="outline"
                                size="icon"
                                onClick={handleShare}
                                aria-label="Share"
                                title="Share"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {justShared ? (
                                        <motion.span
                                            key="check"
                                            initial={{ scale: 0, rotate: -90 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            exit={{ scale: 0, rotate: 90 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                            className="inline-flex text-emerald-500"
                                        >
                                            <CheckIcon className="size-4.5" />
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="share"
                                            initial={{ scale: 0, rotate: 90 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            exit={{ scale: 0, rotate: -90 }}
                                            whileHover={{ y: -2 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 18 }}
                                            className="inline-flex"
                                        >
                                            <ShareIcon className="size-4.5" alt="Share" />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
