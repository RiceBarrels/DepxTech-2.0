"use client"

import { ChevronLeftIcon, ShareIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTransitionRouter } from "./pageTransitions"

export default function BackNav({ isShareButton = false }) {
    const router = useTransitionRouter()

    const handleBack = () => {
    // if (document.startViewTransition) {
    //     document.startViewTransition(() => {
            router.back();
    //     });
    // } else {
    //     router.back(); // Fallback for unsupported browsers
    // }
    };

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
            <div className="flex flex-col sticky top-[-1px] left-0 right-0 z-50 py-4 px-4 bg-[linear-gradient(to_bottom,var(--background)_25%,rgba(255,255,255,0)_100%)]">
                <div className="flex items-center justify-between">
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
            </div>
        </>
    )
}
