// "use client"

import { BottomSafeArea } from "@/components/safe-area";
import { ConditionalFooter } from "@/components/ui/conditional-footer";
import { Footer } from "@/components/ui/footer";
import Nav from "@/components/ui/nav";
export default function transitionLayout({ children }) {

    return (
        <div
            className="h-dvh w-full relative bg-background flex flex-col overflow-y-hidden"
        >
            <Nav layers={1}/>
            <div className="rounded-t-3xl border border-b-0 border-border bg-background overflow-y-auto flex-1" style={{ viewTransitionName: 'transition-page' }}>
                <div className="min-h-screen">
                    {children}
                </div>
                <ConditionalFooter><Footer /></ConditionalFooter>
                <BottomSafeArea />
            </div>
        </div>
    )
}