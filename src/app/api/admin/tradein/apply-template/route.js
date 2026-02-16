import { NextResponse } from 'next/server'
import { verifyAdminAccess } from '@/lib/serverAuth'
import { createClient } from '@supabase/supabase-js'

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
    const adminVerification = await verifyAdminAccess(request)
    if (!adminVerification.authorized) {
      return NextResponse.json(
        { error: adminVerification.error },
        { status: adminVerification.status }
      )
    }

    const { templateId, productIds } = await request.json()

    if (!templateId || !productIds?.length) {
      return NextResponse.json(
        { error: 'Template ID and product IDs are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Fetch the template
    const { data: template, error: templateError } = await supabase
      .from('trade_question_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Apply template to all selected products
    const { data, error } = await supabase
      .from('tradable_products')
      .update({
        question_template_id: templateId,
        questions: template.questions || []
      })
      .in('id', productIds)
      .select('id')

    if (error) {
      console.error('Error applying template:', error)
      return NextResponse.json(
        { error: 'Failed to apply template: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      updatedCount: data?.length || 0,
      templateName: template.name
    })
  } catch (error) {
    console.error('Error in apply-template route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
