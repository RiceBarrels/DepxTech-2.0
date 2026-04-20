"use client"

import { ChevronLeftIcon, ShareIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransitionLink } from "./pageTransitions"
import { TopSafeArea } from "../safe-area"
import { useWebHaptics } from 'web-haptics/react'

export default function TopNav(backURL="") {
    const { trigger } = useWebHaptics()
    console.log("backURL", backURL)
    return (
        <>
            <TopSafeArea />
            {/* placeholder */}
            <div className="h-16 w-full"/>
            <div className="flex items-center justify-between fixed top-0 left-0 right-0 z-50 p-5">
                <TransitionLink href={backURL.backURL}>
                    <Button className="bg-background/50 backdrop-blur-sm" variant="outline" size="icon"><ChevronLeftIcon className="size-4.5" alt="Back" /></Button>
                </TransitionLink>
                <Button className="bg-background/50 backdrop-blur-sm" variant="outline" size="icon" onClick={() => { trigger('light'); navigator.share({
                    title: "Share",
                    text: "Share",
                    url: window.location.href
                })}}><ShareIcon className="size-4.5" alt="Share" /></Button>
            </div>
        </>
    )
}