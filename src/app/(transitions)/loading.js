"use client"

import { LoadingUI } from "@/components/ui/loadingUI"

export default function loadingPage(){
    return (
        <div className="flex items-center justify-center h-[100dvh]">
            <LoadingUI
                text="Loading..."
            />
        </div>
    )
}