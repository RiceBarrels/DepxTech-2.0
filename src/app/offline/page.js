"use client"

import { WifiOffIcon, RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-8 bg-muted rounded-full flex items-center justify-center">
          <WifiOffIcon className="w-12 h-12 text-muted-foreground" />
        </div>

        <h1 className="text-3xl font-bold mb-4">You're Offline</h1>

        <p className="text-muted-foreground mb-8">
          It looks like you've lost your internet connection. Please check your network and try again.
        </p>

        <Button
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RefreshCwIcon className="w-4 h-4" />
          Try Again
        </Button>

        <p className="mt-8 text-sm text-muted-foreground">
          Some pages you've visited before may still be available offline.
        </p>
      </div>
    </div>
  )
}
