import { TopSafeArea, BottomSafeArea } from "@/components/safe-area";
import { ConditionalFooter } from "@/components/ui/conditional-footer";
import Nav from "@/components/ui/nav";
import { PageLoadHaptics } from "@/components/ui/pageLoadHaptics";
import { BackToTop } from "@/components/ui/back-to-top";
import { FloatingChat } from "@/components/ui/floating-chat";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export default function NavLayout({ children }) {
  return (
    <div className="w-screen h-[100dvh] flex flex-col items-center justify-center">
      <PageLoadHaptics />
      <ScrollProgress />
      <div
        className="flex-1 overflow-y-auto w-full overflow-x-hidden bg-background z-0"
        style={{ viewTransitionName: 'main-content' }}
      >
        {/* <TopSafeArea extraPX={0} /> */}
        <div className="min-h-screen">
          <Nav />
          {children}
        </div>
        <ConditionalFooter />
      </div>
      <BackToTop />
      <FloatingChat />
    </div>
  )
}