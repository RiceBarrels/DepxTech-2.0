"use client"

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { RefreshCwIcon, WifiIcon, WifiOffIcon, DownloadIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ServiceWorkerRegistration() {
  const [waitingWorker, setWaitingWorker] = useState(null)
  const [isOnline, setIsOnline] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  // Handle SW update
  const handleUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage('skipWaiting')
      setWaitingWorker(null)
      window.location.reload()
    }
  }, [waitingWorker])

  // Handle PWA install
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      toast.success('App installed successfully!')
    }

    setDeferredPrompt(null)
    setShowInstallBanner(false)
  }, [deferredPrompt])

  // Dismiss install banner
  const dismissInstallBanner = useCallback(() => {
    setShowInstallBanner(false)
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }, [])

  // Add 'pwa-standalone' class to <html> when running as installed PWA
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true
    if (isStandalone) {
      document.documentElement.classList.add('pwa-standalone')
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check initial online status
    setIsOnline(navigator.onLine)

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration.scope)

            // Check for updates periodically
            setInterval(() => {
              registration.update()
            }, 60 * 60 * 1000) // Check every hour

            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content available
                    setWaitingWorker(newWorker)
                    toast('New version available!', {
                      description: 'Refresh to get the latest updates.',
                      duration: 10000,
                      action: {
                        label: 'Refresh',
                        onClick: () => {
                          newWorker.postMessage('skipWaiting')
                          window.location.reload()
                        },
                      },
                    })
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error)
          })
      })

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New service worker activated')
      })
    }

    // Online/Offline status handlers
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('You\'re back online!', {
        icon: <WifiIcon className="w-4 h-4" />,
        duration: 3000,
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('You\'re offline', {
        icon: <WifiOffIcon className="w-4 h-4" />,
        description: 'Some features may be limited.',
        duration: 5000,
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // PWA Install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Check if user dismissed recently
      const dismissedAt = localStorage.getItem('pwa-install-dismissed')
      if (dismissedAt) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24)
        if (daysSinceDismissed < 7) {
          return
        }
      }

      // Show install banner after a delay
      setTimeout(() => {
        setShowInstallBanner(true)
      }, 30000) // Show after 30 seconds
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Handle app installed
    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setShowInstallBanner(false)
      console.log('[PWA] App was installed')
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Show update notification toast when waiting worker is set
  useEffect(() => {
    if (waitingWorker) {
      toast('Update available!', {
        description: 'A new version is ready to install.',
        duration: Infinity,
        action: {
          label: 'Update Now',
          onClick: handleUpdate,
        },
      })
    }
  }, [waitingWorker, handleUpdate])

  // Install banner component
  if (showInstallBanner && deferredPrompt) {
    return (
      <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="bg-background border-2 border-primary/20 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <DownloadIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Install DepxTech</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add to your home screen for quick access
              </p>
            </div>
            <button
              onClick={dismissInstallBanner}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleInstall}
              className="flex-1"
            >
              Install
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={dismissInstallBanner}
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
