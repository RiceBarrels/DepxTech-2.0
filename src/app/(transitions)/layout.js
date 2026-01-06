// "use client"

import { BottomSafeArea } from "@/components/safe-area";
import { ConditionalFooter } from "@/components/ui/conditional-footer";
// import { useEffect } from "react";
// import { usePathname } from "next/navigation";
import { PageLoadHaptics } from "@/components/ui/pageLoadHaptics";

export default function transitionLayout({ children }) {

    return (
        <div 
            className="min-h-screen w-full relative z-20 bg-background"
            style={{ viewTransitionName: 'transition-page' }}
        >
            <PageLoadHaptics />
            {children}
            <ConditionalFooter />
            <BottomSafeArea />
        </div>
    )
}