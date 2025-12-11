"use client"

import { cn } from "@/lib/utils";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { doubleHapticsImpact, lightHapticsImpact } from "@/lib/haptics";

// Check if a route is in the transitions group (no nav)
export function isTransitionRoute(pathname) {
  // Routes that don't have nav: login, signup, products/[id], checkout, account sub-pages
  // Note: /account itself has nav, but /account/orders, /account/settings, etc. don't
  const transitionRoutes = [
    '/login', 
    '/signup', 
    '/products/', // product detail pages
    '/checkout',
    '/account/orders',
    '/account/settings',
    '/account/inbox',
    '/account/membership'
  ];
  return transitionRoutes.some(route => pathname.startsWith(route));
}

// Unified TransitionLink component - replaces all Link variants
export function TransitionLink({ 
  href = "", 
  children, 
  haptics = true, 
  hapticsOnPressRelease = false, // New prop: if true, haptics only on press/release, not on click
  disabled = false, 
  className, 
  ...props 
}) {
  const router = useTransitionRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Add data attribute to body based on route group
    const isTransition = isTransitionRoute(pathname);
    document.body.setAttribute('data-route-group', isTransition ? 'transitions' : 'nav');
  }, [pathname]);

  const handlePress = () => {
    if (haptics && hapticsOnPressRelease && !disabled) {
      lightHapticsImpact();
    }
  };

  const handleRelease = () => {
    if (haptics && hapticsOnPressRelease && !disabled) {
      lightHapticsImpact();
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (!disabled) {
      // Call custom onClick handler if provided (for mobile nav state updates, etc.)
      if (props.onClick) {
        props.onClick(e);
      }
      
      // Only trigger haptics on click if NOT using press/release mode
      if (haptics && !hapticsOnPressRelease) {
        doubleHapticsImpact();
      }
      
      // Set transition type before navigation
      const isTransition = isTransitionRoute(href);
      const isCurrentTransition = isTransitionRoute(pathname);
      
      // If navigating to/from transition route, use slide transition
      if (isTransition || isCurrentTransition) {
        document.documentElement.classList.add('transition-slide');
        document.documentElement.classList.remove('transition-fade');
      } else {
        document.documentElement.classList.add('transition-fade');
        document.documentElement.classList.remove('transition-slide');
      }
      
      // Use transition router which handles view transitions
      await router.push(href);
    }
  };

  // Extract onClick, onMouseDown, onMouseUp, onTouchStart, onTouchEnd from props to avoid conflicts
  const { onClick, onMouseDown, onMouseUp, onTouchStart, onTouchEnd, ...restProps } = props;

  return (
    <Link 
      href={href}
      disabled={disabled}
      onClick={handleClick}
      onMouseDown={(e) => {
        handlePress();
        onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        handleRelease();
        onMouseUp?.(e);
      }}
      onTouchStart={(e) => {
        handlePress();
        onTouchStart?.(e);
      }}
      onTouchEnd={(e) => {
        handleRelease();
        onTouchEnd?.(e);
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onDrag={(e) => e.preventDefault()}
      draggable={false}
      className={cn(disabled ? "cursor-not-allowed" : "cursor-pointer", className)}
      {...restProps}
    >
      {children}
    </Link>
  );
}

// Re-export useTransitionRouter for convenience
export { useTransitionRouter };
