"use client"

import { usePathname } from "@/i18n/navigation"
import { useEffect, useRef } from "react"
import { useWebHaptics } from "web-haptics/react"

export default function HapticPageLoad() {
    const { trigger } = useWebHaptics()

    useEffect(() => {
        setTimeout(() => {
            trigger('medium')
        }, 300);
    }, [])

    return null
}
