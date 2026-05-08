"use client"

import { ChevronLeftIcon, ShareIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTransitionRouter } from "./pageTransitions"
import { motion, AnimatePresence } from "framer-motion"
import { useWebHaptics } from "web-haptics/react"

export default function BackNav({ isShareButton = false }) {
    const router = useTransitionRouter()
    const { trigger } = useWebHaptics()

    const handleBack = () => {
        trigger([{ duration: 30, intensity: 1 }])
        router.back()
    }

    const handleShare = () => {
        trigger([{ duration: 30, intensity: 1 }])
        if (navigator.share) {
            navigator.share({
                title: "Share",
                text: "Share",
                url: window.location.href
            })
        }
    }

    return (
        <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.6 }}
            className="rounded-t-3xl flex flex-col sticky top-0 left-0 right-0 z-50 py-4 px-4 bg-[linear-gradient(to_bottom,var(--background)_25%,rgba(255,255,255,0)_100%)]"
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
                            >
                                <motion.span
                                    initial={{ y: 0 }}
                                    whileHover={{ y: -2 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                                    className="inline-flex"
                                >
                                    <ShareIcon className="size-4.5" alt="Share" />
                                </motion.span>
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
