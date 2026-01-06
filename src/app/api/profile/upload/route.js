/**
 * Profile Image Upload API Route
 * 
 * This route handles profile image uploads to Supabase Storage for regular users.
 * Files are stored in the "avatars" folder within the "images" bucket.
 * 
 * Uses service role client to bypass RLS, but validates user authentication first.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Create Supabase client with service role for storage operations
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request) {
  try {
    // First verify user is authenticated using regular client
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    // Now use service role client for storage operations (bypasses RLS)
    const serviceClient = createServiceRoleClient()

    // Get the form data
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' }, 
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' }, 
        { status: 400 }
      )
    }

    // Validate file size (max 5MB for profile images)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' }, 
        { status: 400 }
      )
    }

    // Generate unique filename using user ID
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage using service role client
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true // Allow overwriting existing files
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file: ' + uploadError.message }, 
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = serviceClient.storage
      .from('images')
      .getPublicUrl(filePath)

    // Update user profile with new avatar URL using authenticated client
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar: urlData.publicUrl })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Still return the URL even if profile update fails
      // The user can manually update it
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath
    })

  } catch (error) {
    console.error('Error in profile upload route:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message }, 
      { status: 500 }
    )
  }
}

