"use client"

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { lightHapticsImpact } from "@/lib/haptics";

export function PageLoadHaptics() {
  const pathname = usePathname();

  useEffect(() => {
    // Trigger haptic feedback when page loads/changes
    const timer = setTimeout(() => {
      lightHapticsImpact();
    }, 500); // Small delay to ensure page is loaded

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
