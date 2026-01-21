/**
 * Image Upload API Route for Admin
 * 
 * This route handles image uploads to Supabase Storage.
 * 
 * SETUP REQUIRED:
 * 1. Create a storage bucket named "images" in your Supabase project
 * 2. Set the bucket to be public (or configure RLS policies as needed)
 * 3. Ensure the service role key has permissions to upload files
 * 
 * To create the bucket:
 * - Go to Supabase Dashboard > Storage
 * - Click "New bucket"
 * - Name: "images"
 * - Public bucket: Yes (or configure RLS policies)
 * - Click "Create bucket"
 * 
 * The upload route organizes files into folders:
 * - products/ - Product images
 * - offers/ - Offer images
 * - tradein/brands/ - Brand logos
 * - tradein/products/ - Trade-in product images
 */

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
      console.log('Upload denied - admin verification failed:', adminVerification.error)
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    // Get the form data
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') || 'uploads' // Default folder

    console.log('Upload request - file:', file?.name, 'type:', file?.type, 'size:', file?.size, 'folder:', folder)

    if (!file) {
      console.log('Upload error: No file provided')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml','image/avif','image/heic','image/heif']
    if (!allowedTypes.includes(file.type)) {
      console.log('Upload error: Invalid file type:', file.type)
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only images are allowed (jpeg, png, gif, webp, svg).` },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.log('Upload error: File too large:', file.size)
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Create service role client
    const supabase = createServiceRoleClient()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file: ' + uploadError.message }, 
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath
    })

  } catch (error) {
    console.error('Error in upload route:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message }, 
      { status: 500 }
    )
  }
}

