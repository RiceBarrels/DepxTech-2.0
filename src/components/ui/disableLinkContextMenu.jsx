"use client"

import { useEffect } from "react";

export function DisableLinkContextMenu() {
  useEffect(() => {
    // Prevent context menu on all links
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        e.preventDefault();
        return false;
      }
    };

    // Prevent drag and drop on links
    const handleDragStart = (e) => {
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        e.preventDefault();
        return false;
      }
    };

    const handleDrag = (e) => {
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        e.preventDefault();
        return false;
      }
    };

    // Prevent long-press on mobile
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        touchStartTime = Date.now();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);
        
        // If user moves finger, cancel the long-press
        if (deltaX > 10 || deltaY > 10) {
          touchStartTime = 0;
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        const touchDuration = Date.now() - touchStartTime;
        // If touch was held for more than 300ms, prevent default (long-press)
        if (touchDuration > 300) {
          e.preventDefault();
        }
        touchStartTime = 0;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('drag', handleDrag);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('drag', handleDrag);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return null;
}
