
import BackNav from "@/components/ui/backNav";

export const metadata = {
    robots: { index: false, follow: false },
}

export default function transitionLayout({ children }) {

    return (
        <>
            <BackNav />
            {children}
        </>
    )
}