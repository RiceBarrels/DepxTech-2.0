"use client"

import BackNav from "@/components/ui/backNav";

export default function WithShareLayout({ children }) {
    return (
        <>
            <BackNav isShareButton={true} />
            {children}
        </>
    )
}
