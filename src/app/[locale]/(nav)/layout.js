import Nav from "@/components/ui/nav";
import { BackToTop } from "@/components/ui/back-to-top";
import { FloatingChat } from "@/components/ui/floating-chat";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Footer } from "@/components/ui/footer";
import { ConditionalFooter } from "@/components/ui/conditional-footer";
import MobileSidebarShell from "@/components/ui/mobile-sidebar-shell";

export default function NavLayout({ children }) {
  return (
    <>
      <ScrollProgress />
      <MobileSidebarShell header={<Nav />}>
        <div
          className="flex-1 overflow-y-auto w-full overflow-x-hidden"
          id="scrollable-content"
        >
          <div className="min-h-screen bg-background" style={{ viewTransitionName: 'transition-page' }}>
            {children}
            <ConditionalFooter>
              <Footer />
            </ConditionalFooter>
          </div>
        </div>
      </MobileSidebarShell>
      <BackToTop />
      <FloatingChat />
    </>
  )
}
