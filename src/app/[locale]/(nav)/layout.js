import Nav from "@/components/ui/nav";
import { BackToTop } from "@/components/ui/back-to-top";
import { FloatingChat } from "@/components/ui/floating-chat";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Footer } from "@/components/ui/footer";

export default function NavLayout({ children }) {
  return (
    <div className="w-screen h-[100vh] flex flex-col items-center justify-center">
      <ScrollProgress />
      <div
        className="flex-1 overflow-y-auto w-full overflow-x-hidden bg-background z-0"
        style={{ viewTransitionName: 'main-content' }}
      >
        {/* <TopSafeArea extraPX={0} /> */}
        <div className="min-h-screen">
          <Nav />
          {children}
          <Footer />
        </div>
      </div>
      <BackToTop />
      <FloatingChat />
    </div>
  )
}