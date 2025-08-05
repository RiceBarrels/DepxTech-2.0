"use client"

import { LoadingUI } from '@/components/ui/loadingUI'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

export default function AdminChecker() {

    const { user, loading } = useAuth()
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState(false)
    const [adminLoading, setAdminLoading] = useState(true)
    const [adminCheckDone, setAdminCheckDone] = useState(false)
    const abortControllerRef = useRef(null)

    useEffect(() => {
        const checkAdminAccess = async () => {
            if (!loading && !user) {
                console.log('AdminChecker: No user found, redirecting to login')
                router.push('/login')
                return
            }

            if (!user || loading || adminCheckDone) {
                return
            }

            try {
                console.log('AdminChecker: Starting targeted admin role check for user:', user.id)
                
                // Cancel any existing request
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort()
                }
                
                // Create new abort controller
                abortControllerRef.current = new AbortController()
                
                // Make a targeted query only for admin role checking
                const { createClient } = await import('@/utils/supabase/client')
                const supabase = createClient()
                
                // Add shorter timeout for admin check
                const adminQueryPromise = supabase
                    .from('profile_customer_readonly')
                    .select('role')
                    .eq('id', user.id)
                    .abortSignal(abortControllerRef.current.signal)
                
                const timeoutPromise = new Promise((resolve) => {
                    setTimeout(() => {
                        console.warn('AdminChecker: Admin role check timed out, redirecting to home')
                        resolve({ data: null, error: { message: 'timeout' } })
                    }, 6000) // 6 second timeout for admin checker
                })
                
                const { data: roleData, error } = await Promise.race([
                    adminQueryPromise,
                    timeoutPromise
                ])
                
                // Check if request was cancelled
                if (abortControllerRef.current?.signal.aborted) {
                    console.log('AdminChecker: Admin check was cancelled')
                    return
                }
                
                if (error) {
                    if (error.message === 'timeout') {
                        console.error('AdminChecker: Admin check timed out, redirecting to home')
                    } else {
                        console.error('AdminChecker: Error checking admin role:', error)
                    }
                    router.push('/')
                    return
                }
                
                if (roleData) {
                    // Check if user has admin role
                    const hasAdminRole = roleData.some(profile => profile.role === 'admin')
                    
                    if (hasAdminRole) {
                        console.log('AdminChecker: User has admin role, granting access')
                        setIsAdmin(true)
                    } else {
                        console.log('AdminChecker: User does not have admin role, redirecting...')
                        router.push('/')
                        return
                    }
                } else {
                    console.log('AdminChecker: No role data found, redirecting to home')
                    router.push('/')
                    return
                }
                
                setAdminCheckDone(true)
                
            } catch (error) {
                // Check if error is due to abort
                if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
                    console.log('AdminChecker: Admin check was aborted')
                    return
                }
                
                console.error('AdminChecker: Error in admin access check:', error)
                router.push('/')
                return
            } finally {
                // Only set loading to false if request wasn't cancelled
                if (!abortControllerRef.current?.signal.aborted) {
                    setAdminLoading(false)
                }
            }
        }

        // Only run admin check after auth loading is complete
        if (!loading) {
            checkAdminAccess()
        }
        
        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [user, loading, router])

    if (loading || adminLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-50">
                <LoadingUI text="checking admin access"/>
            </div>
        )
    }
    return null;
}