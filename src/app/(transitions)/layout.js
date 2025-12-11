"use client"

import { BottomSafeArea, TopSafeArea } from "@/components/safe-area";
import { useEffect } from "react";
import { PageLoadHaptics } from "@/components/ui/pageLoadHaptics";

export default function transitionLayout({ children }) {
    useEffect(() => {
        // Ensure transition-slide class is set for transition routes
        document.documentElement.classList.add('transition-slide');
        document.documentElement.classList.remove('transition-fade');
        
        return () => {
            // Cleanup on unmount
        };
    }, []);

    return (
        <div 
            className="min-h-screen w-full"
            style={{ viewTransitionName: 'transition-page' }}
        >
            <PageLoadHaptics />
            <TopSafeArea />
            {children}
            <BottomSafeArea />
        </div>
    )
}