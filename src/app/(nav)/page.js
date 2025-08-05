'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Recommends from '@/components/ui/recommends'

export default function HomePage() {
  const { user, loading, signOut } = useAuth()

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to DepxTech 2.0
          </h1>
          <p className="text-xl text-accent-foreground">
            Next generation platform for modern applications
          </p>
        </div>

        {user ? (
          // Authenticated user view
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back!</CardTitle>
                <CardDescription>
                  You are signed in as {user.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/admin">
                    <Button className="w-full sm:w-auto">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={signOut}
                    className="w-full sm:w-auto"
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feature 1</CardTitle>
                  <CardDescription>
                    Access to advanced features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-accent-foreground">
                    Explore the full potential of our platform with authenticated access.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature 2</CardTitle>
                  <CardDescription>
                    Personalized experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-accent-foreground">
                    Get personalized content and recommendations based on your preferences.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature 3</CardTitle>
                  <CardDescription>
                    Secure data management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-accent-foreground">
                    Your data is securely stored and managed with enterprise-grade security.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Unauthenticated user view
          <div className="space-y-6">
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Get Started Today</CardTitle>
                <CardDescription>
                  Sign up or sign in to access all features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button className="w-full sm:w-auto">
                      Create Account
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Easy Setup</CardTitle>
                  <CardDescription>
                    Get started in minutes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-accent-foreground">
                    Quick and easy registration process to get you up and running.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Secure Platform</CardTitle>
                  <CardDescription>
                    Enterprise-grade security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-accent-foreground">
                    Built with security in mind using industry best practices.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Modern Tech</CardTitle>
                  <CardDescription>
                    Latest technologies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-accent-foreground">
                    Powered by Next.js, Supabase, and modern web technologies.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        <Recommends 
          title="Recommended for You"
          limit={8}
          className="mt-8"
        />
      </div>
    </div>
  )
}
