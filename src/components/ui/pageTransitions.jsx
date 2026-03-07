"use client"

import { cn } from "@/lib/utils";
import { usePathname } from "@/i18n/navigation";
import { useEffect } from "react";
import { Link } from 'next-view-transitions';
import { useParams } from 'next/navigation';
import { useTransitionRouter as useNextViewTransitionRouter } from 'next-view-transitions';
import { useWebHaptics } from "web-haptics/react";

// Check if a route is in the transitions group (no nav)
export function isTransitionRoute(pathname) {
  // Routes that don't have nav: login, signup, products/[id], checkout, account sub-pages
  // Note: /account itself has nav, but /account/orders, /account/settings, etc. don't
  const transitionRoutes = [
    '/login', 
    '/signup', 
    // '/products/', // product detail pages
    '/checkout',
    '/account/orders',
    '/account/settings',
    '/account/inbox',
    '/account/membership'
  ];
  return transitionRoutes.some(route => pathname.startsWith(route));
}

// Check if a URL is external
function isExternalUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    // If it starts with http:// or https://, it's external
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return true;
    }
    // If it starts with //, it's a protocol-relative external URL
    if (url.startsWith('//')) {
      return true;
    }
    // If it starts with mailto:, tel:, etc., it's external (but not internal routes)
    const protocolPattern = /^[a-z][a-z0-9+.-]*:/i;
    if (protocolPattern.test(url) && !url.startsWith('/')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Unified TransitionLink component - replaces all Link variants
// SEO-friendly features:
// - Automatically detects external links and adds proper rel="noopener noreferrer" attributes
// - Uses Next.js Link prefetching for better performance and SEO
// - Maintains href attribute for search engine crawlers
// - Supports aria-disabled for accessibility (which helps SEO)
// - Proper semantic HTML with anchor tags
export function TransitionLink({
  href = "",
  children,
  disabled = false,
  prefetch = true, // SEO: Enable prefetching by default for better performance
  className,
  ...props
}) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale;
  const { trigger } = useWebHaptics();

  // Add locale prefix to href if needed
  const localizedHref = typeof href === 'string' && locale && !href.startsWith(`/${locale}`) && !href.startsWith('http')
    ? `/${locale}${href.startsWith('/') ? '' : '/'}${href}`
    : href;

  useEffect(() => {
    // Add data attribute to body based on route group
    const isTransition = isTransitionRoute(pathname);
    document.body.setAttribute('data-route-group', isTransition ? 'transitions' : 'nav');
  }, [pathname]);

  // Determine if this is an external link
  const isExternal = isExternalUrl(href);
  
  // For external links, use regular anchor tag with proper rel attributes
  // For internal links, use Next.js Link with transition handling
  if (isExternal) {
    return (
      <a
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        className={cn(disabled ? "cursor-not-allowed" : "cursor-pointer", className)}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </a>
    );
  }

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    trigger([
      { duration: 35 },
    ], { intensity: 1 })

    // Call custom onClick handler if provided (for mobile nav state updates, etc.)
    if (props.onClick) {
      props.onClick(e);
    }

    // Set transition type before navigation
    // The Link from next-view-transitions will handle the actual transition
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

    // Don't prevent default - let the Link handle navigation with transitions
  };

  // Extract onClick, onMouseDown, onMouseUp, onTouchStart, onTouchEnd from props to avoid conflicts
  const { onClick, ...restProps } = props;

  return (
    <Link
      href={localizedHref}
      prefetch={prefetch}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onDrag={(e) => e.preventDefault()}
      draggable={false}
      className={cn(disabled ? "cursor-not-allowed" : "cursor-pointer", className)}
      aria-disabled={disabled}
      {...restProps}
    >
      {children}
    </Link>
  );
}

// Export useTransitionRouter from next-view-transitions
export const useTransitionRouter = useNextViewTransitionRouter;
