// "use client"

import { TopSafeArea, BottomSafeArea } from "@/components/safe-area";
import { ConditionalFooter } from "@/components/ui/conditional-footer";
import Nav from "@/components/ui/nav";
import { PageLoadHaptics } from "@/components/ui/pageLoadHaptics";

export default function NavLayout({ children }) {
  return (
    <div className="w-screen h-[100dvh] flex flex-col items-center justify-center">
      <PageLoadHaptics />
      <div 
        className="flex-1 overflow-y-auto w-full overflow-x-hidden bg-background z-0"
        style={{ viewTransitionName: 'main-content' }}
      >
        <TopSafeArea/>
        <div className="h-30 hidden sm:block"/>
        <div className="min-h-screen">
          {children}
        </div>
        <ConditionalFooter />
        <BottomSafeArea/>
      </div>
      <Nav />
    </div>
  )
}