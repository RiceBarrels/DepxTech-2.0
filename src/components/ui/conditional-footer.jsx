"use client"

import { isPWA } from '@/lib/isPWA';

export function ConditionalFooter({ children }) {
    if (isPWA()) {
        return null;
    }
    return children;
}
