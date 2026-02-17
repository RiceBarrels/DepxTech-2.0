// "use client"

import { BottomSafeArea } from "@/components/safe-area";
import { ConditionalFooter } from "@/components/ui/conditional-footer";
import Nav from "@/components/ui/nav";
// import { useEffect } from "react";
// import { usePathname } from "next/navigation";
import { PageLoadHaptics } from "@/components/ui/pageLoadHaptics";
import Link from "next/link";

export default function transitionLayout({ children }) {

    return (
        <div 
            className="min-h-screen w-full relative z-20 bg-background"
        >
            <Nav layers={1}/>
            <PageLoadHaptics />
            <div className="min-h-screen rounded-t-3xl border-t border-border bg-background" style={{ viewTransitionName: 'transition-page' }}>
              {children}
            </div>
            <ConditionalFooter />
            <BottomSafeArea />
        </div>
    )
}