// "use client"

import { BottomSafeArea } from "@/components/safe-area";
import { ConditionalFooter } from "@/components/ui/conditional-footer";
import Nav from "@/components/ui/nav";
// import { useEffect } from "react";
// import { usePathname } from "next/navigation";
import { PageLoadHaptics } from "@/components/ui/pageLoadHaptics";

export default function transitionLayout({ children }) {

    return (
        <div 
            className="h-screen w-full relative bg-background flex flex-col"
        >
            <Nav layers={1}/>
            <PageLoadHaptics />
            <div className="rounded-t-3xl border border-b-0 border-border bg-background overflow-y-auto flex-1" style={{ viewTransitionName: 'transition-page' }}>
                <div className="min-h-screen">
                    {children}
                </div>
                <ConditionalFooter />
                <BottomSafeArea />
            </div>
        </div>
    )
}