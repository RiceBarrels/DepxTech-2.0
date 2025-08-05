"use client"

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import RouteController from './routeController'

function AdminUI() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState(false)
    const [adminLoading, setAdminLoading] = useState(true)
    const [adminCheckDone, setAdminCheckDone] = useState(false)
    const abortControllerRef = useRef(null)

    useEffect(() => {
        const checkAdminAccess = async () => {
            // Only check admin access if we have a user and auth loading is complete
            if (!user || loading || adminCheckDone) {
                if (!user || loading) {
                    console.log('AdminUI: No user or still loading, skipping admin check')
                    setIsAdmin(false)
                    setAdminLoading(false)
                }
                return
            }

            try {
                console.log('AdminUI: Starting targeted admin role check')
                
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
                        console.warn('AdminUI: Admin role check timed out, assuming non-admin user')
                        resolve({ data: null, error: { message: 'timeout' } })
                    }, 5000) // 5 second timeout
                })
                
                const { data: roleData, error } = await Promise.race([
                    adminQueryPromise,
                    timeoutPromise
                ])
                
                // Check if request was cancelled
                if (abortControllerRef.current?.signal.aborted) {
                    console.log('AdminUI: Admin check was cancelled')
                    return
                }
                
                if (error) {
                    if (error.message !== 'timeout') {
                        console.error('AdminUI: Error checking admin role:', error)
                    }
                    setIsAdmin(false)
                } else if (roleData) {
                    // Check if user has admin role
                    const hasAdminRole = roleData.some(profile => profile.role === 'admin')
                    
                    if (hasAdminRole) {
                        console.log('AdminUI: User has admin role, enabling admin features')
                        setIsAdmin(true)
                    } else {
                        console.log('AdminUI: User does not have admin role')
                        setIsAdmin(false)
                    }
                } else {
                    console.log('AdminUI: No role data found, assuming non-admin user')
                    setIsAdmin(false)
                }
                
                setAdminCheckDone(true)
                
            } catch (error) {
                // Check if error is due to abort
                if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
                    console.log('AdminUI: Admin check was aborted')
                    return
                }
                
                console.error('AdminUI: Error in admin access check:', error)
                setIsAdmin(false)
                setAdminCheckDone(true)
            } finally {
                // Only set loading to false if request wasn't cancelled
                if (!abortControllerRef.current?.signal.aborted) {
                    setAdminLoading(false)
                }
            }
        }

        checkAdminAccess()
        
        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [user, loading])

    return (
        <>
            {isAdmin && <RouteController />}
        </>
    )
}

export default AdminUI