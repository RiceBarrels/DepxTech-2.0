import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role for public operations
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function GET(request) {
  try {
    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const activeOnly = searchParams.get('active_only') === 'true'

    if (id) {
      // Fetch specific offer
      const { data: offer, error } = await supabase
        .from('offers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching offer:', error)
        return NextResponse.json(
          { error: 'Failed to fetch offer' }, 
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        offer: offer
      })
    } else {
      // Fetch all offers
      let query = supabase
        .from('offers')
        .select('*')

      // Filter active offers if requested
      if (activeOnly) {
        const now = new Date().toISOString()
        query = query
          .eq('is_active', true)
          .or(`start_date.is.null,start_date.lte.${now}`)
          .or(`end_date.is.null,end_date.gte.${now}`)
      }

      const { data: offers, error } = await query
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching offers:', error)
        return NextResponse.json(
          { error: 'Failed to fetch offers' }, 
          { status: 500 }
        )
      }

      // Filter active offers client-side if activeOnly is true
      let filteredOffers = offers || []
      if (activeOnly) {
        const now = new Date()
        filteredOffers = filteredOffers.filter(offer => {
          if (!offer.is_active) return false
          const startDate = offer.start_date ? new Date(offer.start_date) : null
          const endDate = offer.end_date ? new Date(offer.end_date) : null
          
          if (startDate && now < startDate) return false
          if (endDate && now > endDate) return false
          return true
        })
      }

      return NextResponse.json({
        success: true,
        offers: filteredOffers
      })
    }

  } catch (error) {
    console.error('Error in offers GET route:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
