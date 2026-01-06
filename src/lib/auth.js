'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Add refs to prevent overlapping requests and debounce
  const initializationRef = useRef(null)
  const profileAbortControllerRef = useRef(null)
  const debounceTimeoutRef = useRef(null)

  // Function to fetch profile data with timeout and cancellation
  const fetchProfileData = async (userId, abortSignal) => {
    if (!userId) return null
    
    try {
      console.log('fetchProfileData: Starting fetch for user:', userId)
      const supabase = createClient()
      
      // Check if request was cancelled
      if (abortSignal?.aborted) {
        console.log('fetchProfileData: Request was cancelled')
        return null
      }
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000) // 10 second timeout
      })
      
      // Fetch data from both profiles and profile_customer_readonly tables in parallel
      const queryPromise = Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
          .abortSignal(abortSignal),
        supabase
          .from('profile_customer_readonly')
          .select('*')
          .eq('id', userId)
          .abortSignal(abortSignal)
      ])

      console.log('fetchProfileData: Executing queries with timeout...')
      
      const results = await Promise.race([
        queryPromise,
        timeoutPromise
      ])

      // Check if request was cancelled after the query
      if (abortSignal?.aborted) {
        console.log('fetchProfileData: Request was cancelled after query')
        return null
      }

      const [profilesResponse, customerReadonlyResponse] = results

      console.log('fetchProfileData: Response received:', { profilesResponse, customerReadonlyResponse })

      // Handle profiles response
      if (profilesResponse.error) {
        if (profilesResponse.error.code === 'PGRST116') {
          console.log('fetchProfileData: User not found in profiles table (PGRST116)')
        } else {
          console.error('fetchProfileData: Error fetching profile:', profilesResponse.error)
        }
      }

      // Handle customer readonly response (it's optional, so we don't fail if there's an error)
      if (customerReadonlyResponse.error) {
        console.warn('fetchProfileData: Error fetching profile_customer_readonly:', customerReadonlyResponse.error)
      }

      // Combine the data from both tables
      const combinedProfile = {
        ...(profilesResponse.data || {}),
        customerReadonly: customerReadonlyResponse.data || []
      }

      console.log('fetchProfileData: Successfully fetched combined profile:', combinedProfile)
      return combinedProfile
    } catch (error) {
      // Check if error is due to abort
      if (error.name === 'AbortError' || abortSignal?.aborted) {
        console.log('fetchProfileData: Request was aborted')
        return null
      }
      
      console.error('fetchProfileData: Unexpected error:', error)
      
      // If it's a timeout, return null but don't fail the auth flow
      if (error.message === 'Profile fetch timeout') {
        console.warn('fetchProfileData: Query timed out, continuing without profile data')
        return null
      }
      
      return null
    }
  }

  // Function to initialize user and profile data with debouncing and cancellation
  const initializeUserData = async (session, isDebounced = false) => {
    try {
      // Clear any existing debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = null
      }
      
      // If not debounced, add a small debounce to prevent rapid successive calls
      if (!isDebounced) {
        debounceTimeoutRef.current = setTimeout(() => {
          initializeUserData(session, true)
        }, 100) // 100ms debounce
        return
      }
      
      // Check if an initialization is already in progress
      if (initializationRef.current) {
        console.log('initializeUserData: Initialization already in progress, skipping')
        return
      }
      
      console.log('initializeUserData: Starting initialization...')
      initializationRef.current = true
      
      // Cancel any existing profile fetch
      if (profileAbortControllerRef.current) {
        profileAbortControllerRef.current.abort()
      }
      
      // Create new abort controller for this request
      profileAbortControllerRef.current = new AbortController()
      
      // Step 1: Set user first
      const currentUser = session?.user ?? null
      console.log('initializeUserData: Setting user:', currentUser?.id || 'null')
      setUser(currentUser)
      
      // Step 2: If user exists, fetch profile data
      if (currentUser) {
        console.log('initializeUserData: User exists, fetching basic profile data for:', currentUser.id)
        
        // Use a shorter timeout for auth flow
        const profilePromise = fetchProfileData(currentUser.id, profileAbortControllerRef.current.signal)
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            console.warn('initializeUserData: Profile fetch taking too long, continuing without profile data')
            resolve(null)
          }, 3000) // Reduced to 3 second timeout for auth flow
        })
        
        const profile = await Promise.race([profilePromise, timeoutPromise])
        
        // Only set profile data if the request wasn't cancelled
        if (!profileAbortControllerRef.current?.signal.aborted) {
          console.log('initializeUserData: Profile data fetched:', profile)
          setProfileData(profile)
        }
      } else {
        console.log('initializeUserData: No user, setting profileData to null')
        setProfileData(null)
      }
      
      console.log('initializeUserData: Initialization completed successfully (user + profile)')
      
      // Set loading to false only after both user and profileData have been set
      console.log('initializeUserData: Both user and profile data fetched, setting loading to false')
      setLoading(false)
    } catch (error) {
      console.error('initializeUserData: Error during initialization:', error)
      // Reset both user and profile data on error
      setUser(null)
      setProfileData(null)
      // Set loading to false even on error so the app doesn't hang
      setLoading(false)
    } finally {
      // Clear refs if this request wasn't cancelled
      if (!profileAbortControllerRef.current?.signal.aborted) {
        console.log('initializeUserData: Cleaning up initialization refs')
      }
      initializationRef.current = null
    }
  }

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session:', session)
        
        // Initialize user and profile data
        await initializeUserData(session)
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setUser(null)
        setProfileData(null)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes with debouncing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state change:', event, session)
          
          // Initialize user and profile data
          await initializeUserData(session)
        } catch (error) {
          console.error('Error in auth state change handler:', error)
          setUser(null)
          setProfileData(null)
          setLoading(false)
        }
      }
    )

    // Cleanup function
    return () => {
      subscription?.unsubscribe()
      
      // Cancel any ongoing requests
      if (profileAbortControllerRef.current) {
        profileAbortControllerRef.current.abort()
      }
      
      // Clear any pending timeouts
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  // Cart Management Functions
  const addToCart = async (productId, amount = 1) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const supabase = createClient()

      // First get current cart data
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('cart')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        console.error('Error fetching current cart:', fetchError)
        throw fetchError
      }

      // Parse existing cart or initialize as empty array
      let currentCart = []
      if (profileData?.cart) {
        try {
          currentCart = JSON.parse(profileData.cart)
        } catch (parseError) {
          console.warn('Error parsing cart data, initializing as empty array')
          currentCart = []
        }
      }

      // Check if item already exists in cart
      const existingItemIndex = currentCart.findIndex(item => item.productId === productId)
      
      if (existingItemIndex >= 0) {
        // Update existing item amount by adding to current amount
        currentCart[existingItemIndex].amount = (parseInt(currentCart[existingItemIndex].amount) + amount).toString()
      } else {
        // Add new item to cart
        currentCart.push({
          productId: productId,
          amount: amount.toString()
        })
      }

      // Update cart in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cart: JSON.stringify(currentCart) })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating cart:', updateError)
        throw updateError
      }

      console.log('Item added to cart successfully')
      return { success: true, cart: currentCart }
    } catch (error) {
      console.error('Error in addToCart:', error)
      return { success: false, error: error.message }
    }
  }

  const getCart = async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const supabase = createClient()

      const { data, error } = await supabase
        .from('profiles')
        .select('cart')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching cart:', error)
        throw error
      }

      // Parse cart data
      let cart = []
      if (data?.cart) {
        try {
          cart = JSON.parse(data.cart)
        } catch (parseError) {
          console.warn('Error parsing cart data')
          cart = []
        }
      }

      return { success: true, cart }
    } catch (error) {
      console.error('Error in getCart:', error)
      return { success: false, error: error.message, cart: [] }
    }
  }

  const updateCartItemAmount = async (productId, newAmount) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const supabase = createClient()

      // Get current cart
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('cart')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        console.error('Error fetching current cart:', fetchError)
        throw fetchError
      }

      let currentCart = []
      if (profileData?.cart) {
        try {
          currentCart = JSON.parse(profileData.cart)
        } catch (parseError) {
          console.warn('Error parsing cart data')
          currentCart = []
        }
      }

      // Update or remove item
      if (newAmount <= 0) {
        // Remove item from cart
        currentCart = currentCart.filter(item => item.productId !== productId)
      } else {
        // Update item amount
        const itemIndex = currentCart.findIndex(item => item.productId === productId)
        if (itemIndex >= 0) {
          currentCart[itemIndex].amount = newAmount.toString()
        }
      }

      // Update cart in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cart: JSON.stringify(currentCart) })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating cart:', updateError)
        throw updateError
      }

      return { success: true, cart: currentCart }
    } catch (error) {
      console.error('Error in updateCartItemAmount:', error)
      return { success: false, error: error.message }
    }
  }

  const clearCart = async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({ cart: JSON.stringify([]) })
        .eq('id', user.id)

      if (error) {
        console.error('Error clearing cart:', error)
        throw error
      }

      return { success: true, cart: [] }
    } catch (error) {
      console.error('Error in clearCart:', error)
      return { success: false, error: error.message }
    }
  }

  // Transaction Management Functions
  const getUserTransactions = async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const supabase = createClient()

      // Fetch transactions from the main transactions table
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching transactions:', error)
        throw error
      }

      return { success: true, transactions: transactions || [] }
    } catch (error) {
      console.error('Error in getUserTransactions:', error)
      return { success: false, error: error.message, transactions: [] }
    }
  }

  // Get all transactions (admin only)
  const getAllTransactions = async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // SECURITY CHECK: This function should only be accessible to admin users
      console.log('getAllTransactions: Checking admin permissions for user:', user.id)
      
      const supabase = createClient()
      
      // Verify admin access before allowing access to all transactions
      const { data: adminCheck, error: adminError } = await supabase
        .from('profile_customer_readonly')
        .select('role')
        .eq('id', user.id)
      
      if (adminError || !adminCheck || !adminCheck.some(profile => profile.role === 'admin')) {
        console.error('getAllTransactions: Access denied - user is not admin')
        throw new Error('Access denied: Admin privileges required to access all transactions')
      }
      
      console.log('getAllTransactions: Admin access verified, proceeding with request')

      // This should only be used by admin users
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all transactions:', error)
        throw error
      }

      return { success: true, transactions: transactions || [] }
    } catch (error) {
      console.error('Error in getAllTransactions:', error)
      return { success: false, error: error.message, transactions: [] }
    }
  }

  // Create new transaction (primarily for admin use)
  const createTransaction = async (transactionData) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // SECURITY CHECK: This function should only be accessible to admin users
      console.log('createTransaction: Checking admin permissions for user:', user.id)
      
      const supabase = createClient()
      
      // Verify admin access before allowing transaction creation
      const { data: adminCheck, error: adminError } = await supabase
        .from('profile_customer_readonly')
        .select('role')
        .eq('id', user.id)
      
      if (adminError || !adminCheck || !adminCheck.some(profile => profile.role === 'admin')) {
        console.error('createTransaction: Access denied - user is not admin')
        throw new Error('Access denied: Admin privileges required to create transactions')
      }
      
      console.log('createTransaction: Admin access verified, proceeding with transaction creation')

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single()

      if (error) {
        console.error('Error creating transaction:', error)
        throw error
      }

      return { success: true, transaction: data }
    } catch (error) {
      console.error('Error in createTransaction:', error)
      return { success: false, error: error.message }
    }
  }

  // Update transaction (admin use)
  const updateTransaction = async (transactionId, updateData) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // SECURITY CHECK: This function should only be accessible to admin users
      console.log('updateTransaction: Checking admin permissions for user:', user.id)
      
      const supabase = createClient()
      
      // Verify admin access before allowing transaction updates
      const { data: adminCheck, error: adminError } = await supabase
        .from('profile_customer_readonly')
        .select('role')
        .eq('id', user.id)
      
      if (adminError || !adminCheck || !adminCheck.some(profile => profile.role === 'admin')) {
        console.error('updateTransaction: Access denied - user is not admin')
        throw new Error('Access denied: Admin privileges required to update transactions')
      }
      
      console.log('updateTransaction: Admin access verified, proceeding with transaction update')

      const { data, error } = await supabase
        .from('transactions')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single()

      if (error) {
        console.error('Error updating transaction:', error)
        throw error
      }

      return { success: true, transaction: data }
    } catch (error) {
      console.error('Error in updateTransaction:', error)
      return { success: false, error: error.message }
    }
  }

  // Get transaction by ID
  const getTransactionById = async (transactionId) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const supabase = createClient()

      // First, get the transaction to check ownership
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single()

      if (error) {
        console.error('Error fetching transaction:', error)
        throw error
      }

      // SECURITY CHECK: Verify user can access this transaction
      if (data.user_id !== user.id) {
        console.log('getTransactionById: Transaction belongs to different user, checking admin permissions...')
        
        // Check if current user is admin
        const { data: adminCheck, error: adminError } = await supabase
          .from('profile_customer_readonly')
          .select('role')
          .eq('id', user.id)
        
        if (adminError || !adminCheck || !adminCheck.some(profile => profile.role === 'admin')) {
          console.error('getTransactionById: Access denied - not transaction owner and not admin')
          throw new Error('Access denied: You can only access your own transactions')
        }
        
        console.log('getTransactionById: Admin access verified, allowing access to transaction')
      }

      return { success: true, transaction: data }
    } catch (error) {
      console.error('Error in getTransactionById:', error)
      return { success: false, error: error.message }
    }
  }

  // Legacy function - now fetches from profile_customer_readonly for backward compatibility
  const getUserTransactionsFromProfile = async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const supabase = createClient()

      const { data, error } = await supabase
        .from('profile_customer_readonly')
        .select('transactions')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching transactions from profile:', error)
        throw error
      }

      // Parse transactions data
      let transactions = []
      if (data?.transactions) {
        try {
          transactions = JSON.parse(data.transactions)
        } catch (parseError) {
          console.warn('Error parsing transactions data from profile')
          transactions = []
        }
      }

      return { success: true, transactions }
    } catch (error) {
      console.error('Error in getUserTransactionsFromProfile:', error)
      return { success: false, error: error.message, transactions: [] }
    }
  }

  const getProfileData = async (userId = null) => {
    try {
      console.log('Starting getProfileData...')
      
      const supabase = createClient()
      
      // Use the provided userId or fall back to current user's ID
      const targetUserId = userId || user?.id
      
      if (!targetUserId) {
        throw new Error('No user ID available')
      }

      // SECURITY CHECK: If requesting another user's data, verify admin access
      if (userId && userId !== user?.id) {
        console.log('getProfileData: Attempting to access another user\'s data, checking admin permissions...')
        
        // First check if current user has admin role by querying their own profile_customer_readonly
        const { data: adminCheck, error: adminError } = await supabase
          .from('profile_customer_readonly')
          .select('role')
          .eq('id', user.id)
        
        if (adminError || !adminCheck || !adminCheck.some(profile => profile.role === 'admin')) {
          console.error('getProfileData: Access denied - user is not admin')
          throw new Error('Access denied: Admin privileges required to access other users\' data')
        }
        
        console.log('getProfileData: Admin access verified, proceeding with request')
      }

      console.log('Fetching data for user ID:', targetUserId)
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('getProfileData timeout')), 15000) // 15 second timeout
      })
      
      // Fetch data from both tables in parallel, filtered by user ID
      const queryPromise = Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId),
        supabase
          .from('profile_customer_readonly')
          .select('*')
          .eq('id', targetUserId) // Assuming this table has a id column
      ])

      console.log('getProfileData: Executing queries with timeout...')
      
      const [profilesResponse, customerReadonlyResponse] = await Promise.race([
        queryPromise,
        timeoutPromise
      ])

      console.log('Profiles response:', profilesResponse)
      console.log('Customer readonly response:', customerReadonlyResponse)  

      // Check for errors
      if (profilesResponse.error) {
        console.error('Error fetching profiles:', profilesResponse.error)
        throw profilesResponse.error
      }

      if (customerReadonlyResponse.error) {
        console.error('Error fetching profile_customer_readonly:', customerReadonlyResponse.error)
        // Don't throw on readonly table error - make it optional
        console.warn('profile_customer_readonly table query failed, continuing without it')
      }

      const result = {
        profiles: profilesResponse.data || [],
        profileCustomerReadonly: customerReadonlyResponse?.error ? [] : (customerReadonlyResponse.data || []),
        success: true,
        userId: targetUserId
      }
      
      console.log('Final result:', result)
      return result
    } catch (error) {
      console.error('Error in getProfileData:', error)
      
      // If it's a timeout error, provide a more helpful message
      if (error.message === 'getProfileData timeout') {
        console.warn('getProfileData: Queries timed out, this might indicate database connectivity issues')
      }
      
      return {
        profiles: [],
        profileCustomerReadonly: [],
        success: false,
        error: error.message
      }
    }
  }

  const getAllProfileData = async () => {
    try {
      console.log('Starting getAllProfileData...')
      
      const supabase = createClient()
      
      // SECURITY CHECK: This function should only be accessible to admin users
      if (!user?.id) {
        throw new Error('Authentication required')
      }
      
      console.log('getAllProfileData: Checking admin permissions for user:', user.id)
      
      // Verify admin access before allowing access to all user data
      const { data: adminCheck, error: adminError } = await supabase
        .from('profile_customer_readonly')
        .select('role')
        .eq('id', user.id)
      
      if (adminError || !adminCheck || !adminCheck.some(profile => profile.role === 'admin')) {
        console.error('getAllProfileData: Access denied - user is not admin')
        throw new Error('Access denied: Admin privileges required to access all users\' data')
      }
      
      console.log('getAllProfileData: Admin access verified, proceeding with request')
      
      // Fetch data from both tables in parallel (all records)
      const [profilesResponse, customerReadonlyResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('*'),
        supabase
          .from('profile_customer_readonly')
          .select('*')
      ])

      console.log('All profiles response:', profilesResponse)
      console.log('All customer readonly response:', customerReadonlyResponse)  

      // Check for errors
      if (profilesResponse.error) {
        console.error('Error fetching all profiles:', profilesResponse.error)
        throw profilesResponse.error
      }

      if (customerReadonlyResponse.error) {
        console.error('Error fetching all profile_customer_readonly:', customerReadonlyResponse.error)
        throw customerReadonlyResponse.error
      }

      const result = {
        profiles: profilesResponse.data || [],
        profileCustomerReadonly: customerReadonlyResponse.data || [],
        joinedProfiles: [],
        success: true
      }
      
      console.log('All profiles final result:', result)
      return result
    } catch (error) {
      console.error('Error in getAllProfileData:', error)
      return {
        profiles: [],
        profileCustomerReadonly: [],
        success: false,
        error: error.message
      }
    }
  }

  const getUserDataById = async (userId) => {
    try {
      console.log('Getting user data for ID:', userId)
      
      if (!userId) {
        throw new Error('User ID is required')
      }
      
      // SECURITY CHECK: This function should only be accessible to admin users
      if (!user?.id) {
        throw new Error('Authentication required')
      }
      
      // If requesting another user's data, verify admin access
      if (userId !== user.id) {
        console.log('getUserDataById: Attempting to access another user\'s data, checking admin permissions...')
        
        const supabase = createClient()
        
        // Verify admin access before allowing access to other user's data
        const { data: adminCheck, error: adminError } = await supabase
          .from('profile_customer_readonly')
          .select('role')
          .eq('id', user.id)
        
        if (adminError || !adminCheck || !adminCheck.some(profile => profile.role === 'admin')) {
          console.error('getUserDataById: Access denied - user is not admin')
          throw new Error('Access denied: Admin privileges required to access other users\' data')
        }
        
        console.log('getUserDataById: Admin access verified, proceeding with request')
      }

      const supabase = createClient()

      // Fetch data from both tables for the specific user ID
      const [profilesResponse, customerReadonlyResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(), // Use single() to get one record
        supabase
          .from('profile_customer_readonly')
          .select('*')
          .eq('id', userId) // Assuming this table has a id column
      ])

      console.log('User profile response:', profilesResponse)
      console.log('User customer readonly response:', customerReadonlyResponse)

      // Handle profile response (single record)
      if (profilesResponse.error && profilesResponse.error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is okay
        console.error('Error fetching user profile:', profilesResponse.error)
        throw profilesResponse.error
      }

      // Handle customer readonly response (could be multiple records)
      if (customerReadonlyResponse.error) {
        console.error('Error fetching user customer readonly:', customerReadonlyResponse.error)
        throw customerReadonlyResponse.error
      }

      const result = {
        profile: profilesResponse.data || null,
        profileCustomerReadonly: customerReadonlyResponse.data || [],
        success: true,
        userId: userId
      }

      console.log('User data result:', result)
      return result
    } catch (error) {
      console.error('Error in getUserDataById:', error)
      return {
        profile: null,
        profileCustomerReadonly: [],
        success: false,
        error: error.message,
        userId: userId
      }
    }
  }

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const supabase = createClient()

      // Update profile in database
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      // Update local profile data
      if (data) {
        setProfileData(prev => ({
          ...prev,
          ...data
        }))
      }

      // Refresh profile data to ensure consistency
      await fetchProfileData(user.id, null)

      return { success: true, data }
    } catch (error) {
      console.error('Error in updateProfile:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    profileData,
    loading,
    signOut,
    getProfileData,
    getAllProfileData,
    getUserDataById,
    addToCart,
    getCart,
    updateCartItemAmount,
    clearCart,
    getUserTransactions,
    getAllTransactions,
    createTransaction,
    updateTransaction,
    getTransactionById,
    getUserTransactionsFromProfile,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 