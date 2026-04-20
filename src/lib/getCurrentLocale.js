"use client"

import { usePathname } from "next/navigation";

export function getCurrentLocale() {
    const pathname = usePathname();
    const locale = pathname.split('/')[1];
    return locale;
}