// "use client"

import { BottomSafeArea } from "@/components/safe-area";
import { ConditionalFooter } from "@/components/ui/conditional-footer";
// import { useEffect } from "react";
// import { usePathname } from "next/navigation";
import { PageLoadHaptics } from "@/components/ui/pageLoadHaptics";
import Nav from "@/components/ui/nav";

export default function transitionLayout({ children }) {

    return (
        <div 
            className="min-h-screen w-full relative z-20 bg-background"
        >
            <PageLoadHaptics />
            <div className="min-h-screen" style={{ viewTransitionName: 'transition-page' }}>
              <Nav />
              {children}
            </div>
            <ConditionalFooter />
            <BottomSafeArea />
        </div>
    )
}