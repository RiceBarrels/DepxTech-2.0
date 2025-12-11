
import BackNav from "@/components/ui/backNav";

export default function transitionLayout({ children }) {

    return (
        <>
            <BackNav />
            {children}
        </>
    )
}