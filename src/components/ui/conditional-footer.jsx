"use client"

import { Capacitor } from '@capacitor/core';
import { Footer } from './footer';
import { isPWA } from '@/lib/isPWA';

export function ConditionalFooter() {
    // Only render footer when NOT in native platform
    if (Capacitor.isNativePlatform() || isPWA()) {
        return null;
    }
    
    return <Footer />;
}


