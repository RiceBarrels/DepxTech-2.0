"use client"

import { cn } from "@/lib/utils";
import { useTransitionRouter } from "next-view-transitions";
import Link from "next/link";
import { doubleHapticsImpact } from "@/lib/haptics";

export function ForwardLink({href="", children, haptics=true, disabled=false, className, ...prop}){
  const router = useTransitionRouter();

  return (
    <Link 
      href={href}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        if(!disabled){
          if(haptics){
            doubleHapticsImpact();
          }
          router.push(href, {
            onTransitionReady: () => forwardAnimation(),
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
  
  return (href) => {
    router.push(href, {
      onTransitionReady: () => forwardAnimation(),
    });
  };
}

export function BackLink({href="", children, haptics=true, ...prop}){
  const router = useTransitionRouter();
  // const isIos = Capacitor.getPlatform() === 'ios';

  return (
    <Link 
      href={href}
      onClick={(e) => {
        e.preventDefault();
        if(haptics){
          doubleHapticsImpact();
        }
        router.push(href, {
          onTransitionReady: () => backAnimation(),
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
  
  return (href) => {
    router.push(href, {
      onTransitionReady: () => backAnimation(),
    });
  };
}

function forwardAnimation(){
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
          transform: `translate(100%, 0)`,
          borderRadius: 0,
        },
        {
          zIndex: 2,
          transform: `translate(0, 0)`,
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

function backAnimation(startState = null){
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
            transform: `translate(-100px, 0) scale(0.9)`,
            borderRadius: "0px",
            opacity: 0,
        },
        {
            zIndex: 1,
            transform: `translate(0, 0) scale(1)`,
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
