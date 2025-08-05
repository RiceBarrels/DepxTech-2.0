"use client"

import { LoadingUI } from "@/components/ui/loadingUI"

export default function loadingPage(){
    return (
        <div className="overflow-hidden h-[100dvh] w-screen flex justify-center items-center">
            <LoadingUI />
        </div>
    )
}