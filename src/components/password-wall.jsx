'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useWebHaptics } from 'web-haptics/react'

export default function PasswordWall({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { trigger } = useWebHaptics()

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      if (typeof document !== 'undefined') {
        const authCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('site_password_auth='))
        
        if (authCookie && authCookie.split('=')[1] === 'true') {
          setIsAuthenticated(true)
        }
      }
      setIsChecking(false)
    }

    checkAuth()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/wall/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        trigger('success')
        // Cookie is set by the server, just update state
        setIsAuthenticated(true)
        setPassword('')
      } else {
        trigger('error')
        setError(data.error || 'Incorrect password. Please try again.')
        setPassword('')
      }
    } catch (error) {
      trigger('error')
      setError('An error occurred. Please try again.')
      setPassword('')
    }
  }

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Show password form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Site Access</CardTitle>
            <CardDescription>
              This website is password protected. Please enter the password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  className="w-full"
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Access Site
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show children if authenticated
  return <>{children}</>
}

