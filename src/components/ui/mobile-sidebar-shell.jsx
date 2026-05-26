"use client"

import { useState, useEffect, useRef, createContext, useContext } from "react"
import { usePathname } from "@/i18n/navigation"
import { TransitionLink } from "./pageTransitions"
import { cn } from "@/lib/utils"
import { useSafeArea } from "../safe-area"
import { AnimatePresence, motion } from "motion/react"
import {
  HomeIcon, ArrowRightLeftIcon, BookOpen, ListOrderedIcon, CircleHelpIcon,
  MessageCircleQuestionIcon, TicketPercentIcon, SmartphoneIcon, LaptopIcon,
  TabletIcon, GamepadIcon, HeadphonesIcon, WatchIcon, ShieldCheckIcon,
  TruckIcon, LeafIcon, Menu, X,
} from "lucide-react"
import { ModeToggle } from "./modeToggle"
import { LanguageSwitcher } from "./language-switcher"
import { useTranslations } from "next-intl"

const SIDEBAR_WIDTH = 280
const SNAP_THRESHOLD = 0.4
const VELOCITY_THRESHOLD = 0.3
// Only open sidebar via edge swipe starting within this many px of the left edge
const EDGE_SWIPE_ZONE = 28

const SidebarContext = createContext(null)

export function useSidebarOpen() {
  return useContext(SidebarContext)?.toggle ?? (() => {})
}

export function useSidebar() {
  return useContext(SidebarContext) ?? { isOpen: false, toggle: () => {}, progress: 0, menuOpacity: 1, xOpacity: 0, transitionStyle: "none", dragging: false }
}

function SidebarContent({ onClose }) {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const tCommon = useTranslations("common")

  const isActive = (path) => {
    if (path === "/") return pathname === "/"
    if (path.includes("?")) return false
    return pathname.startsWith(path)
  }

  const handleNavClick = () => {
    onClose?.()
  }

  const mainLinks = [
    { href: "/", icon: HomeIcon, label: t("home") },
    { href: "/trade", icon: ArrowRightLeftIcon, label: t("tradeIn") },
    { href: "/blog", icon: BookOpen, label: t("blog") },
    { href: "/offers", icon: TicketPercentIcon, label: tCommon("offers") || "Offers" },
  ]

  const tradeLinks = [
    { href: "/trade/process", icon: ListOrderedIcon, label: t("process") },
    { href: "/trade/how-it-works", icon: CircleHelpIcon, label: t("howItWorks") },
    { href: "/trade/faq", icon: MessageCircleQuestionIcon, label: t("faq") },
    { href: "/trade/sustainability", icon: LeafIcon, label: t("sustainability") },
  ]

  const categoryLinks = [
    { href: "/trade?category=smartphones", icon: SmartphoneIcon, label: t("categories.smartphones") },
    { href: "/trade?category=laptops", icon: LaptopIcon, label: t("categories.laptops") },
    { href: "/trade?category=tablets", icon: TabletIcon, label: t("categories.tablets") },
    { href: "/trade?category=gaming", icon: GamepadIcon, label: t("categories.gamingConsoles") },
    { href: "/trade?category=audio", icon: HeadphonesIcon, label: t("categories.audioDevices") },
    { href: "/trade?category=wearables", icon: WatchIcon, label: t("categories.wearables") },
  ]

  return (
    <aside className="flex h-full w-full flex-col bg-background overflow-hidden">
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center px-5 border-b border-border">
        <h1 className="font-black text-xl tracking-tight">DepxTech</h1>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">

        {/* Primary links */}
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Menu
          </p>
          <div className="space-y-0.5">
            {mainLinks.map(({ href, icon: Icon, label }) => (
              <TransitionLink
                key={href}
                href={href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3.5 text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{label}</span>
              </TransitionLink>
            ))}
          </div>
        </div>

        {/* Trade-in guides */}
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {t("tradeIn")}
          </p>
          <div className="space-y-0.5">
            {tradeLinks.map(({ href, icon: Icon, label }) => (
              <TransitionLink
                key={href}
                href={href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors",
                  isActive(href)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </TransitionLink>
            ))}
          </div>
        </div>

        {/* Device categories */}
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Categories
          </p>
          <div className="space-y-0.5">
            {categoryLinks.map(({ href, icon: Icon, label }) => (
              <TransitionLink
                key={href}
                href={href}
                onClick={handleNavClick}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Icon className="h-4 w-4 shrink-0 opacity-70" />
                <span>{label}</span>
              </TransitionLink>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Info
          </p>
          <div className="space-y-0.5">
            <TransitionLink href="/warranty" onClick={handleNavClick}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <ShieldCheckIcon className="h-4 w-4 shrink-0 opacity-70" />
              {t("warranty")}
            </TransitionLink>
            <TransitionLink href="/shipping" onClick={handleNavClick}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <TruckIcon className="h-4 w-4 shrink-0 opacity-70" />
              {t("freeShipping")}
            </TransitionLink>
          </div>
        </div>

      </nav>

      {/* Bottom utilities */}
      <div className="shrink-0 px-5 py-4 border-t border-border flex items-center justify-between">
        <LanguageSwitcher variant="compact" />
        <ModeToggle />
      </div>
    </aside>
  )
}

export default function MobileSidebarShell({ children, header }) {
  const pathname = usePathname()
  const safeArea = useSafeArea()
  const [isOpen, setIsOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isMobile, setIsMobile] = useState(null)

  const touchRef = useRef(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const startTime = useRef(0)
  const lastX = useRef(0)
  const isHoriz = useRef(null)
  const isOpenRef = useRef(false)
  const draggingRef = useRef(false)

  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0
    const mobileUA = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isIPad = navigator.userAgent.includes("Mac") && isTouch
    setIsMobile(isTouch && (mobileUA || isIPad))
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  isOpenRef.current = isOpen
  draggingRef.current = dragging

  useEffect(() => {
    const el = touchRef.current
    if (!el) return

    function onTouchStart(e) {
      const t = e.touches[0]
      startX.current = t.clientX
      startY.current = t.clientY
      startTime.current = Date.now()
      lastX.current = t.clientX
      isHoriz.current = null
    }

    function onTouchMove(e) {
      const t = e.touches[0]
      const dx = t.clientX - startX.current
      const dy = t.clientY - startY.current

      if (isHoriz.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        // Require clearly horizontal movement (2× horizontal vs vertical) to avoid
        // vertical scrolls from ever being detected as horizontal gestures
        isHoriz.current = Math.abs(dx) > Math.abs(dy) * 2
      }
      if (isHoriz.current === false) return

      // When sidebar is closed, only respond to swipes starting from the left edge
      // so carousel/banner horizontal scrolls aren't intercepted
      if (!isOpenRef.current && startX.current > EDGE_SWIPE_ZONE) return

      // Require minimum drag distance before activating — prevents browser back-swipe
      // from briefly triggering sidebar animation before iOS commits the navigation
      if (!draggingRef.current && Math.abs(dx) < 12) return

      e.preventDefault()
      lastX.current = t.clientX

      let offset
      if (isOpenRef.current) {
        offset = Math.max(0, Math.min(SIDEBAR_WIDTH, SIDEBAR_WIDTH + dx))
      } else {
        offset = Math.max(0, Math.min(SIDEBAR_WIDTH, dx))
      }

      setDragging(true)
      setDragOffset(offset)
    }

    function onTouchEnd() {
      if (!draggingRef.current) {
        isHoriz.current = null
        return
      }

      const dx = lastX.current - startX.current
      const dt = Math.max(1, Date.now() - startTime.current)
      const velocity = dx / dt

      let currentOffset
      if (isOpenRef.current) {
        currentOffset = Math.max(0, Math.min(SIDEBAR_WIDTH, SIDEBAR_WIDTH + dx))
      } else {
        currentOffset = Math.max(0, Math.min(SIDEBAR_WIDTH, dx))
      }

      let shouldOpen
      if (isOpenRef.current) {
        shouldOpen = !(
          currentOffset < SIDEBAR_WIDTH * (1 - SNAP_THRESHOLD) ||
          velocity < -VELOCITY_THRESHOLD
        )
      } else {
        shouldOpen =
          currentOffset > SIDEBAR_WIDTH * SNAP_THRESHOLD ||
          velocity > VELOCITY_THRESHOLD
      }

      setIsOpen(shouldOpen)
      setDragging(false)
      setDragOffset(0)
      isHoriz.current = null
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
    }
  }, [])

  const translateX = dragging ? dragOffset : isOpen ? SIDEBAR_WIDTH : 0
  const progress = Math.min(1, Math.max(0, translateX / SIDEBAR_WIDTH))
  const iconFadeStart = 20 / 180
  const menuOpacity =
    progress < iconFadeStart
      ? 1
      : progress >= 0.5
      ? 0
      : Math.max(0, 1 - (progress - iconFadeStart) / (0.5 - iconFadeStart))
  const xOpacity =
    progress < 0.5 ? 0 : Math.min(1, (progress - 0.5) / (0.5 - iconFadeStart))
  const sidebarScale = 0.92 + progress * 0.08
  const sidebarTranslateX = -30 + progress * 30
  const sidebarOpacity = progress
  const transitionStyle = dragging
    ? "none"
    : "all 220ms cubic-bezier(0.4, 0, 0.2, 1)"

  const contextValue = {
    isOpen,
    toggle: () => setIsOpen((v) => !v),
    progress,
    menuOpacity,
    xOpacity,
    transitionStyle,
    dragging,
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      {/* ── Mobile layout ── */}
      <div
        className={cn(
          "relative w-screen h-[100dvh] overflow-hidden bg-background",
          isMobile !== false ? "flex" : "hidden"
        )}
      >
        {/* Sidebar: when open, raised to z-30 (above touch-capture z-20) so links are clickable */}
        <div
          className="fixed inset-y-0 left-0 w-[280px]"
          style={{
            zIndex: isOpen ? 30 : 10,
            transform: `translateX(${sidebarTranslateX}px) scale(${sidebarScale})`,
            opacity: sidebarOpacity,
            transformOrigin: "left center",
            paddingTop: safeArea.top,
            transition: transitionStyle,
          }}
        >
          <SidebarContent onClose={() => setIsOpen(false)} />
        </div>

        {/* Full-screen touch-capture — transparent so sidebar shows through */}
        <div
          ref={touchRef}
          className="absolute inset-0 z-20"
        >
          {/* Header + content slide together as one panel */}
          <div
            className="absolute inset-0 flex flex-col bg-background overflow-hidden"
            style={{
              transform: `translateX(${translateX}px)`,
              transition: transitionStyle,
              ...(translateX > 0 && {
                boxShadow: "-4px 0 16px rgba(0,0,0,0.15)",
                borderRadius: "38px 0 0 38px",
              }),
            }}
          >
            {header}

            <div className="flex-1 relative overflow-hidden">
              {/* Tap-to-close overlay */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="absolute inset-0 z-[110] backdrop-blur-sm bg-foreground/20 touch-none"
                    onClick={() => setIsOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: translateX / SIDEBAR_WIDTH }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              <div className={cn("h-full flex flex-col overflow-hidden", (isOpen || (dragging && dragOffset > 10)) && "touch-none")}>
                {(isMobile === null || isMobile) && children}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div
        className={cn(
          "w-screen h-[100dvh] flex flex-col",
          isMobile === false ? "flex" : "hidden"
        )}
      >
        {header}
        {(isMobile === null || !isMobile) && children}
      </div>
    </SidebarContext.Provider>
  )
}
