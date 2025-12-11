"use client"
import { SafeArea } from 'capacitor-plugin-safe-area';
import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';


// Hook to get safe area insets
export function useSafeArea() {
    const [safeArea, setSafeArea] = useState({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    });

    useEffect(() => {
        const getSafeAreaInsets = async () => {
            try {
                if (Capacitor.isNativePlatform()) {
                    const result = await SafeArea.getSafeAreaInsets();
                    setSafeArea(result.insets);
                    
                    // Listen for safe area changes (e.g., device rotation)
                    const listener = await SafeArea.addListener('safeAreaChanged', (data) => {
                        setSafeArea(data.insets);
                    });

                    return () => {
                        listener.remove();
                    };
                }
            } catch (error) {
                console.error('Error getting safe area insets:', error);
            }
        };

        getSafeAreaInsets();
    }, []);

    return safeArea;
}

export function TopSafeArea(){
    const area = useSafeArea().top
    const height = area === 0 ? 0 : area + 16

    return (
        <div 
            className="w-full p-2 sm:h-0 sm:p-0"
            style={{ height: `${height}px` }}
        ></div>
    )
}

export function BottomSafeArea(){
    const area = useSafeArea().bottom
    const height = area === 0 ? 0 : area + 16

    return (
        <div 
            className="w-full p-2 sm:h-0 sm:p-0"
            style={{ height: `${height}px` }}
        />
    )
}