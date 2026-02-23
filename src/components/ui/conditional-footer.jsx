"use client"

import { Footer } from './footer';
import { isPWA } from '@/lib/isPWA';

export function ConditionalFooter() {
    // Only render footer when NOT in PWA
    if (isPWA()) {
        return null;
    }

    return <Footer />;
}


