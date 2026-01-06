"use client"

import { Capacitor } from '@capacitor/core';
import { Footer } from './footer';

export function ConditionalFooter() {
    // Only render footer when NOT in native platform
    if (Capacitor.isNativePlatform()) {
        return null;
    }
    
    return <Footer />;
}


