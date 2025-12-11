"use client"

import { ChevronLeftIcon, ShareIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTransitionRouter } from "./pageTransitions"
import { TopSafeArea } from "../safe-area"
import { usePathname } from "next/navigation"

export default function BackNav({ isShareButton = false }) {
    const router = useTransitionRouter()
    const pathname = usePathname()

    const handleBack = () => {
        if (pathname === "/login" || pathname === "/signup") {
            router.push("/")
        } else {
            router.back()
        }
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "Share",
                text: "Share",
                url: window.location.href
            })
        }
    }

    return (
        <>
            <TopSafeArea />
            {/* placeholder */}
            <div className="flex items-center justify-between relative top-0 left-0 right-0 z-50 p-5">
                <Button 
                    className="bg-background/50 backdrop-blur-sm" 
                    variant="outline" 
                    size="icon"
                    onClick={handleBack}
                >
                    <ChevronLeftIcon className="size-4.5" alt="Back" />
                </Button>
                {isShareButton && (
                    <Button 
                        className="bg-background/50 backdrop-blur-sm" 
                        variant="outline" 
                        size="icon" 
                        onClick={handleShare}
                    >
                        <ShareIcon className="size-4.5" alt="Share" />
                    </Button>
                )}
            </div>
        </>
    )
}
