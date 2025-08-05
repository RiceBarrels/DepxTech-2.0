"use client"

import { ChevronLeftIcon, ShareIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackLink } from "./pageTransitions"

export default function TopNav(backURL="") {
    console.log("backURL", backURL)
    return (
        <>
            {/* placeholder */}
            <div className="h-16 w-full"/>
            <div className="flex items-center justify-between fixed top-0 left-0 right-0 z-50 p-5">
                <BackLink href={backURL.backURL}>
                    <Button className="bg-background/50 backdrop-blur-sm" variant="outline" size="icon"><ChevronLeftIcon className="size-4.5" alt="Back" /></Button>
                </BackLink>
                <Button className="bg-background/50 backdrop-blur-sm" variant="outline" size="icon" onClick={() => navigator.share({
                    title: "Share",
                    text: "Share",
                    url: window.location.href
                })}><ShareIcon className="size-4.5" alt="Share" /></Button>
            </div>
        </>
    )
}