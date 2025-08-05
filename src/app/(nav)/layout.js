
import { Footer } from "@/components/ui/footer";
import Nav from "@/components/ui/nav";

export default function NavLayout({ children }) {
  return (
    <div className="w-screen h-[100dvh] flex flex-col items-center justify-center">
        <div className="flex-1 overflow-y-auto w-full overflow-x-hidden">
            <div className="h-16 hidden sm:block"/>
            {children}
            <Footer />
        </div>
        <Nav />
    </div>
  )
}