"use client"
import { useState, useEffect } from 'react';

// Hook to get safe area insets using CSS environment variables
// These are automatically available on iOS and modern browsers
export function useSafeArea() {
    const [safeArea, setSafeArea] = useState({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateSafeArea = () => {
            // Try to get safe area from CSS environment variables
            const computedStyle = getComputedStyle(document.documentElement);

            const top = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0');
            const bottom = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0');
            const left = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0');
            const right = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0');

            setSafeArea({ top, bottom, left, right });
        };

        updateSafeArea();

        // Listen for orientation changes
        window.addEventListener('resize', updateSafeArea);
        window.addEventListener('orientationchange', updateSafeArea);

        return () => {
            window.removeEventListener('resize', updateSafeArea);
            window.removeEventListener('orientationchange', updateSafeArea);
        };
    }, []);

    return safeArea;
}

export function TopSafeArea({ extraPX = 16 }) {
    const area = useSafeArea().top;
    const height = area === 0 ? 0 : area + extraPX;

    if (height === 0) return null;

    return (
        <div
            className="w-full sm:h-0"
            style={{ height: `${height}px` }}
        />
    );
}

export function BottomSafeArea() {
    const area = useSafeArea().bottom;
    const height = area === 0 ? 0 : area + 16;

    if (height === 0) return null;

    return (
        <div
            className="w-full sm:h-0"
            style={{ height: `${height}px` }}
        />
    );
}
