"use client"

import { cn } from "@/lib/utils";
// import { Capacitor } from "@capacitor/core";
import { useTransitionRouter } from "next-view-transitions";
import Link from "next/link";
// import { doubleHapticsImpact } from "@/lib/haptics";

export function ForwardLink({href="", children, haptics=true, disabled=false, className, ...prop}){
  const router = useTransitionRouter();
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  // const isIos = Capacitor.getPlatform() === 'ios';

  return (
    <Link 
      href={href}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        if(!disabled){
          if(haptics){
            // doubleHapticsImpact();
          }
          router.push(href, {
            onTransitionReady: () => forwardAnimation(isSafari,false),
          });
        }
      }}
      className={cn(disabled ? "cursor-not-allowed" : "cursor-pointer",className)}
      {...prop}
    >
      {children}
    </Link>
  )
}

export function useForwardRoutePush(){
  const router = useTransitionRouter();
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  return (href) => {
    router.push(href, {
      onTransitionReady: () => forwardAnimation(isSafari, false),
    });
  };
}

export function BackLink({href="", children, haptics=true, ...prop}){
  const router = useTransitionRouter();
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  // const isIos = Capacitor.getPlatform() === 'ios';

  return (
    <Link 
      href={href}
      onClick={(e) => {
        e.preventDefault();
        if(haptics){
          // doubleHapticsImpact();
        }
        router.push(href, {
          onTransitionReady: () => backAnimation(isSafari,false),
        });
      }}
      {...prop}
    >
      {children}
    </Link>
  )
}

export function useBackRoutePush(){
  const router = useTransitionRouter();
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  return (href) => {
    router.push(href, {
      onTransitionReady: () => backAnimation(isSafari, false),
    });
  };
}

function forwardAnimation(isSafari,isIos){
    document.documentElement.animate(
      [
        {
          zIndex: 1,
          opacity: 1,
          transform: "translateX(0) scale(1)",
          borderRadius: 32,
        },
        {
          zIndex: 1,
          opacity: 0.5,
          transform: "translateX(-100px) scale(0.9)",
          borderRadius: 0,
        },
      ],
      {
        duration: 300,
        easing: "ease-in-out",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );
  
    document.documentElement.animate(
      [
        {
          zIndex: 2,
          transform: `translate(calc(100%${isSafari || isIos ? " + 12px":""}), ${isSafari || isIos ? 12 : 0}px)`,
          borderRadius: 0,
        },
        {
          zIndex: 2,
          transform: `translate(${isSafari || isIos ? 12 : 0}, ${isSafari || isIos ? 12 : 0})`,
          borderRadius: 32,
        },
      ],
      {
        duration: 300,
        easing: "ease-in-out",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
};

function backAnimation(isSafari, isIos, startState = null){
    const oldViewAnimationDef = [
        {
            zIndex: 2,
            opacity: 1,
            transform: startState ? startState.transform : "translateX(0px)",
            borderRadius: "32px",
        },
        {
            zIndex: 2,
            opacity: 1,
            transform: "translateX(100%)",
            borderRadius: "32px",
        },
      ];

    const oldAnimation = document.documentElement.animate(
      oldViewAnimationDef,
      {
        duration: 450,
        easing: "ease-in-out",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );
  
    oldAnimation.onfinish = () => {
        const pageElement = document.documentElement;
        pageElement.style.transform = '';
        pageElement.style.borderRadius = '';
        pageElement.style.overflow = '';
        pageElement.style.transition = '';
    };

    document.documentElement.animate(
      [
        {
            zIndex: 1,
            transform: `translate(${isSafari || isIos ? -100+12 : -100}px,${isSafari || isIos ? 12 : 0}px) scale(0.9)`,
            borderRadius: "0px",
            opacity: 0,
        },
        {
            zIndex: 1,
            transform: `translate(${isSafari || isIos ? 12 : 0}px,${isSafari || isIos ? 12 : 0}px) scale(1)`,
            borderRadius: "32px",
            opacity: 1,
        },
      ],
      {
        duration: 450,
        easing: "ease-in-out",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
};
