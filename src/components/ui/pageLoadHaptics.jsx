"use client"

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { mediumHapticsImpact } from "@/lib/haptics";

export function PageLoadHaptics() {
  const pathname = usePathname();

  useEffect(() => {
    // Trigger haptic feedback when page loads/changes
    const timer = setTimeout(() => {
      mediumHapticsImpact();
    }, 250); // Small delay to ensure page is loaded

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
