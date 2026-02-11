export const isPWA = () => {
    if (typeof window === 'undefined') return false;
    
    // Check for standalone display mode (works on most platforms)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // iOS-specific check: navigator.standalone is true when added to home screen
    const isIOSStandalone = typeof navigator !== 'undefined' && navigator.standalone === true;
    
    return isStandalone || isIOSStandalone;
}

// Check specifically if running on iOS
export const isIOS = () => {
    if (typeof window === 'undefined') return false;
    
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Check specifically if running as PWA on iOS
export const isIOSPWA = () => {
    if (typeof window === 'undefined') return false;
    
    return isIOS() && (navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches);
}