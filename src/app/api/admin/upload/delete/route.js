import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role for admin operations
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

export async function POST(request) {
  try {
    // Verify admin access
    const adminVerification = await verifyAdminAccess(request)
    
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error }, 
        { status: adminVerification.status }
      )
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' }, 
        { status: 400 }
      )
    }

    // Extract file path from URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/images/[path]
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/images\/(.+)/)
    
    if (!pathMatch) {
      return NextResponse.json(
        { error: 'Invalid URL format' }, 
        { status: 400 }
      )
    }

    const filePath = pathMatch[1]

    // Create service role client
    const supabase = createServiceRoleClient()

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('images')
      .remove([filePath])

    if (deleteError) {
      console.error('Error deleting file:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete file: ' + deleteError.message }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Error in delete route:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message }, 
      { status: 500 }
    )
  }
}
