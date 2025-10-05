import { BottomSafeArea, TopSafeArea } from "@/components/safe-area";

export default function transitionLayout({ children }) {
    return (
        <>
            <TopSafeArea />
            {children}
            <BottomSafeArea />
        </>
    )
}