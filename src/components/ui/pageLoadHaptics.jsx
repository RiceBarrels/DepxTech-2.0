"use client"

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { heavyHapticsImpact } from "@/lib/haptics";

export function PageLoadHaptics() {
  const pathname = usePathname();

  useEffect(() => {
    // Trigger haptic feedback when page loads/changes
    const timer = setTimeout(() => {
      heavyHapticsImpact();
    }, 550); // Small delay to ensure page is loaded

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
